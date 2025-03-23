from fastapi import FastAPI, HTTPException, status, WebSocket, WebSocketDisconnect, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import httpx
from openai import OpenAI
import json
import uuid
import asyncio
from datetime import datetime

# Configuração da aplicação
app = FastAPI(title="Nexios Digital API")

# Configuração do CORS - aceita requisições de qualquer origem
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Obter chave API do ambiente
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_ORG_ID = os.getenv("OPENAI_ORG_ID", None)
N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL", "")
N8N_API_TOKEN = os.getenv("N8N_API_TOKEN", "seu_token_secreto_aqui")  # Token para autenticação

# Modelos para o chat
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = []
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: Optional[str] = None

# Modelo para receber respostas do N8N
class N8nResponse(BaseModel):
    conversation_id: Optional[str] = None
    original_message: str
    processed_response: str
    timestamp: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

# Gerenciador de WebSockets
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[Dict[str, Any]] = []

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections.append({"websocket": websocket, "client_id": client_id})
        print(f"Cliente {client_id} conectado. Total de conexões: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        for connection in self.active_connections:
            if connection["websocket"] == websocket:
                self.active_connections.remove(connection)
                print(f"Cliente {connection['client_id']} desconectado. Total de conexões: {len(self.active_connections)}")
                break

    async def send_personal_message(self, message: Dict[str, Any], client_id: str):
        for connection in self.active_connections:
            if connection["client_id"] == client_id:
                await connection["websocket"].send_json(message)
                break

    async def broadcast(self, message: Dict[str, Any]):
        for connection in self.active_connections:
            await connection["websocket"].send_json(message)

manager = ConnectionManager()

# Função para verificar autenticação para o endpoint N8N
async def verify_token(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token de autorização ausente")
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Formato de autorização inválido")
        if token != N8N_API_TOKEN:
            raise HTTPException(status_code=401, detail="Token inválido")
        return token
    except ValueError:
        raise HTTPException(status_code=401, detail="Formato de autorização inválido")

# Função auxiliar para armazenar mensagens (pode ser substituída por uma implementação de BD)
conversation_store = {}

def store_message(conversation_id: str, message: Dict[str, Any]):
    if conversation_id not in conversation_store:
        conversation_store[conversation_id] = []
    conversation_store[conversation_id].append(message)
    # Limitar o tamanho do histórico, se necessário
    if len(conversation_store[conversation_id]) > 50:
        conversation_store[conversation_id] = conversation_store[conversation_id][-50:]

def get_conversation_history(conversation_id: str) -> List[Dict[str, Any]]:
    return conversation_store.get(conversation_id, [])

# Rota WebSocket
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            # Receber mensagem do cliente
            data = await websocket.receive_text()
            # Processar a mensagem, se necessário
            print(f"Mensagem recebida do cliente {client_id}: {data}")
            
            # Se quiser processar a mensagem via WebSocket:
            # try:
            #     request_data = json.loads(data)
            #     # Processar e responder...
            # except json.JSONDecodeError:
            #     pass
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Rota para verificar status da API
@app.get("/api/status")
async def get_status():
    """
    Verifica e retorna o status do servidor e da conexão com a API OpenAI.
    """
    status_info = {
        "server": "online",
        "openai_api_key_configured": bool(OPENAI_API_KEY),
        "n8n_webhook_configured": bool(N8N_WEBHOOK_URL),
        "websocket_available": True,
        "active_connections": len(manager.active_connections)
    }
    
    # Testar conexão com a API OpenAI se a chave estiver configurada
    if OPENAI_API_KEY:
        try:
            if OPENAI_ORG_ID:
                client = OpenAI(api_key=OPENAI_API_KEY, organization=OPENAI_ORG_ID)
            else:
                client = OpenAI(api_key=OPENAI_API_KEY)
                
            models = client.models.list()
            status_info["openai_connection"] = "successful"
            status_info["available_models"] = [model.id for model in models.data[:3]]
        except Exception as e:
            status_info["openai_connection"] = "failed"
            status_info["openai_error"] = str(e)
    
    # Testar conexão com N8N se o webhook estiver configurado
    if N8N_WEBHOOK_URL:
        try:
            async with httpx.AsyncClient() as client:
                # Apenas verificar se o webhook está acessível com um HEAD request
                response = await client.head(
                    N8N_WEBHOOK_URL,
                    timeout=5.0
                )
                status_info["n8n_connection"] = "successful" if response.status_code < 400 else "failed"
        except Exception as e:
            status_info["n8n_connection"] = "failed"
            status_info["n8n_error"] = str(e)
    
    return status_info

# Rota de chat simples usando OpenAI
@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Endpoint simples de chat que usa a API OpenAI diretamente.
    """
    print(f"Recebendo mensagem: {request.message}")
    
    # Gerar ou usar ID de conversa
    conversation_id = request.conversation_id or str(uuid.uuid4())
    
    if not OPENAI_API_KEY:
        print("Erro: Chave API não configurada")
        return {"response": "O sistema de IA não está configurado. Por favor, contate o administrador.", "conversation_id": conversation_id}
    
    try:
        # Criar cliente OpenAI
        if OPENAI_ORG_ID:
            client = OpenAI(api_key=OPENAI_API_KEY, organization=OPENAI_ORG_ID)
        else:
            client = OpenAI(api_key=OPENAI_API_KEY)
        
        # Preparar mensagens para a API
        messages = []
        
        # Adicionar mensagem de sistema (contexto para a IA)
        messages.append({
            "role": "system", 
            "content": """
            Você é o assistente virtual da Nexios Digital, uma empresa de soluções de inteligência artificial.
            Forneça informações sobre nossos serviços:
            1. Agentes de IA para atendimento ao cliente
            2. Automação de vendas e processos
            3. Consultoria em implementação de IA
            
            Seja profissional, amigável e conciso nas suas respostas.
            """
        })
        
        # Adicionar histórico de conversa (se existir)
        for message in request.conversation_history:
            messages.append({
                "role": message.role,
                "content": message.content
            })
        
        # Adicionar a mensagem atual do usuário
        messages.append({
            "role": "user",
            "content": request.message
        })
        
        print(f"Enviando {len(messages)} mensagens para OpenAI")
        
        # Fazer a chamada para a API
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # Modelo mais econômico e rápido
            messages=messages,
            temperature=0.7,
            max_tokens=800
        )
        
        # Extrair resposta
        ai_response = response.choices[0].message.content
        print(f"Resposta recebida: {ai_response[:50]}...")
        
        # Armazenar mensagens na conversa
        store_message(conversation_id, {"role": "user", "content": request.message, "timestamp": datetime.now().isoformat()})
        store_message(conversation_id, {"role": "assistant", "content": ai_response, "timestamp": datetime.now().isoformat()})
        
        return {"response": ai_response, "conversation_id": conversation_id}
    
    except Exception as e:
        print(f"Erro ao processar mensagem: {str(e)}")
        return {"response": f"Desculpe, houve um erro ao processar sua mensagem. Detalhes: {str(e)}", "conversation_id": conversation_id}

# Endpoint para chat com N8N
@app.post("/api/chat-n8n", response_model=ChatResponse)
async def chat_n8n(request: ChatRequest):
    """
    Endpoint para chat que utiliza fluxo N8N para processar mensagens.
    """
    print(f"Recebendo mensagem para N8N: {request.message}")
    
    # Gerar ou usar ID de conversa
    conversation_id = request.conversation_id or str(uuid.uuid4())
    
    if not N8N_WEBHOOK_URL:
        print("Erro: URL do webhook N8N não configurada")
        return {"response": "Webhook N8N não configurado. Por favor, configure a variável de ambiente N8N_WEBHOOK_URL.", "conversation_id": conversation_id}
    
    try:
        # Adicionar mensagem do usuário à conversa
        store_message(conversation_id, {"role": "user", "content": request.message, "timestamp": datetime.now().isoformat()})
        
        # Preparar dados para enviar ao N8N
        n8n_data = {
            "message": request.message,
            "conversation_history": [
                {"role": msg.role, "content": msg.content} 
                for msg in request.conversation_history
            ],
            "conversation_id": conversation_id,
            "timestamp": datetime.now().isoformat()
        }
        
        print(f"Enviando dados para N8N: {n8n_data}")
        
        # Enviar para o webhook do N8N
        async with httpx.AsyncClient() as client:
            response = await client.post(
                N8N_WEBHOOK_URL,
                json=n8n_data,
                timeout=30.0  # Timeout maior para dar tempo ao N8N processar
            )
            
            if response.status_code != 200:
                error_msg = f"Erro ao processar mensagem com N8N. Código: {response.status_code}"
                print(error_msg)
                return {"response": error_msg, "conversation_id": conversation_id}
            
            # Processar resposta do N8N
            n8n_response = response.json()
            print(f"Resposta recebida de N8N: {n8n_response}")
            
            # Extrair resposta do formato adequado
            if isinstance(n8n_response, dict) and "response" in n8n_response:
                ai_response = n8n_response["response"]
            elif isinstance(n8n_response, dict) and "text" in n8n_response:
                ai_response = n8n_response["text"]
            else:
                ai_response = str(n8n_response)
            
            # Armazenar resposta na conversa
            store_message(conversation_id, {"role": "assistant", "content": ai_response, "timestamp": datetime.now().isoformat()})
            
            return {"response": ai_response, "conversation_id": conversation_id}
                
    except Exception as e:
        error_msg = f"Erro ao processar mensagem com N8N: {str(e)}"
        print(error_msg)
        return {"response": f"Desculpe, houve um erro ao processar sua mensagem. Detalhes: {str(e)}", "conversation_id": conversation_id}

# Novo endpoint para receber respostas do N8N
@app.post("/api/n8n-callback")
async def receive_n8n_response(n8n_data: N8nResponse, token: str = Depends(verify_token)):
    """
    Endpoint para receber respostas processadas do N8N.
    Este endpoint é chamado pelo N8N após processar a mensagem.
    """
    print(f"Recebendo callback do N8N: {n8n_data}")
    
    try:
        conversation_id = n8n_data.conversation_id
        
        if conversation_id:
            # Armazenar a resposta do assistente na conversa
            store_message(conversation_id, {
                "role": "assistant", 
                "content": n8n_data.processed_response,
                "original_message": n8n_data.original_message,
                "timestamp": n8n_data.timestamp or datetime.now().isoformat(),
                "metadata": n8n_data.metadata
            })
            
            # Enviar a resposta via WebSocket para o cliente correto
            await manager.broadcast({
                "type": "assistant_response",
                "conversation_id": conversation_id,
                "content": n8n_data.processed_response,
                "original_message": n8n_data.original_message,
                "timestamp": n8n_data.timestamp or datetime.now().isoformat()
            })
            
            return {
                "status": "success", 
                "message": "Resposta processada e enviada via WebSocket",
                "conversation_id": conversation_id
            }
        else:
            # Se não houver ID de conversa, apenas transmitir para todos
            await manager.broadcast({
                "type": "broadcast_message",
                "content": n8n_data.processed_response,
                "original_message": n8n_data.original_message,
                "timestamp": n8n_data.timestamp or datetime.now().isoformat()
            })
            
            return {
                "status": "success", 
                "message": "Resposta transmitida para todos os clientes WebSocket"
            }
            
    except Exception as e:
        print(f"Erro ao processar callback do N8N: {str(e)}")
        return {
            "status": "error",
            "message": f"Erro ao processar resposta: {str(e)}"
        }

# Obter histórico de conversa
@app.get("/api/conversations/{conversation_id}")
async def get_conversation(conversation_id: str):
    """
    Obtém o histórico de uma conversa específica.
    """
    history = get_conversation_history(conversation_id)
    if not history:
        raise HTTPException(status_code=404, detail="Conversa não encontrada")
    
    return {"conversation_id": conversation_id, "messages": history}

# Rota simples para verificar se o servidor está online
@app.get("/")
async def root():
    return {"message": "Nexios Digital API está online"}

# Iniciar o servidor
if __name__ == "__main__":
    import uvicorn
    print("Iniciando servidor Nexios Digital...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)