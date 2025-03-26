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
import logging

# Configurar nível de log para DEBUG em vez de INFO
logging.basicConfig(level=logging.DEBUG, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Verificar variáveis de ambiente críticas
N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL")
if not N8N_WEBHOOK_URL:
    logger.warning("N8N_WEBHOOK_URL não está configurada no ambiente")
    # Comentado para evitar falha na inicialização
    # raise ValueError("N8N_WEBHOOK_URL é obrigatória. Configure a variável de ambiente.")
    N8N_WEBHOOK_URL = "https://webhook.nexiosdigital.com/webhook/9862149e-e4d5-4c63-b2ce-2a4954c531f2"
    logger.warning(f"Usando URL padrão para webhook N8N: {N8N_WEBHOOK_URL}")

# Obter outras variáveis de ambiente
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_ORG_ID = os.getenv("OPENAI_ORG_ID")
N8N_API_TOKEN = os.getenv("N8N_API_TOKEN", "")

# Verificar token de API
if not N8N_API_TOKEN:
    logger.warning("N8N_API_TOKEN não está configurado. Autenticação de callbacks pode falhar.")

# Configuração da aplicação
app = FastAPI(title="Nexios Digital API")

# ADICIONADO: Evento de inicialização para DEBUG
@app.on_event("startup")
async def startup_event():
    print("=== SERVIDOR INICIADO ===")
    print("Configuração CORS: ", app.middleware_stack)
    print("Rotas disponíveis:")
    
    print("========================")

# Configuração do CORS - com domínios específicos para produção
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://nexiosdigital.com",
        "https://www.nexiosdigital.com", 
        "https://n8n.nexiosdigital.com",
        # Manter apenas para desenvolvimento
        "http://localhost:3000",
        "http://localhost:8000"
        # Remover o "*" para produção após testes
        # "*"  # TEMPORARIAMENTE permitir todas as origens para depuração
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

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
        logger.info(f"Cliente {client_id} conectado. Total de conexões: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        for connection in self.active_connections:
            if connection["websocket"] == websocket:
                self.active_connections.remove(connection)
                logger.info(f"Cliente {connection['client_id']} desconectado. Total de conexões: {len(self.active_connections)}")
                break

    async def send_personal_message(self, message: Dict[str, Any], client_id: str):
        for connection in self.active_connections:
            if connection["client_id"] == client_id:
                await connection["websocket"].send_json(message)
                break

    async def broadcast(self, message: Dict[str, Any]):
        logger.info(f"Broadcasting message to {len(self.active_connections)} connections: {message}")
        for connection in self.active_connections:
            await connection["websocket"].send_json(message)

manager = ConnectionManager()

# Função para verificar autenticação para o endpoint N8N - Com depuração
async def verify_token(authorization: Optional[str] = Header(None)):
    logger.debug(f"Token recebido: {authorization}")
    logger.debug(f"Token esperado: Bearer {N8N_API_TOKEN}")
    
    if not authorization:
        logger.error("Erro: Token de autorização ausente")
        raise HTTPException(status_code=401, detail="Token de autorização ausente")
    
    try:
        scheme, token = authorization.split()
        logger.debug(f"Esquema: {scheme}, Token: {token}")
        
        if scheme.lower() != "bearer":
            logger.error("Erro: Formato de autorização inválido")
            raise HTTPException(status_code=401, detail="Formato de autorização inválido")
        
        # Comparar os tokens diretamente
        logger.debug(f"Comparando token recebido '{token}' com token esperado '{N8N_API_TOKEN}'")
        if token != N8N_API_TOKEN:
            logger.error("Erro: Token inválido")
            raise HTTPException(status_code=401, detail="Token inválido")
        
        logger.info("Token validado com sucesso!")
        return token
    except ValueError:
        logger.error("Erro: Formato de autorização inválido (não conseguiu separar)")
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

# Modificação na rota WebSocket para diagnóstico:
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    logger.debug(f"Nova tentativa de conexão WebSocket de cliente: {client_id}")
    logger.debug(f"Headers da conexão: {websocket.headers}")
    logger.debug(f"Parâmetros da solicitação: {websocket.query_params}")
    
    try:
        await websocket.accept()
        logger.info(f"WebSocket conectado para cliente {client_id}")
        
        # Enviar mensagem de confirmação
        await websocket.send_json({
            "type": "connection_status",
            "status": "connected",
            "message": "Conexão WebSocket estabelecida com sucesso!"
        })
        
        # Loop para manter a conexão ativa
        while True:
            try:
                data = await websocket.receive_text()
                logger.debug(f"Recebido do cliente {client_id}: {data}")
                
                # Simples resposta de eco para testar
                await websocket.send_json({
                    "type": "echo",
                    "original": data,
                    "timestamp": datetime.now().isoformat()
                })
                
            except WebSocketDisconnect:
                logger.info(f"Cliente {client_id} desconectou normalmente")
                break
            except Exception as e:
                logger.error(f"Erro ao processar mensagem de {client_id}: {str(e)}")
                break
                
    except WebSocketDisconnect:
        logger.warning(f"Cliente {client_id} desconectou durante o handshake")
    except Exception as e:
        logger.error(f"Erro ao aceitar conexão de {client_id}: {str(e)}", exc_info=True)
        
    logger.info(f"Conexão WebSocket encerrada para cliente {client_id}")

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

# Nova rota para depuração - vai ajudar a encontrar erros
@app.get("/")
async def root():
    # Listar todas as rotas disponíveis
    routes = [{"path": route.path, "name": route.name, "methods": list(route.methods)} 
             for route in app.routes]
    
    return {
        "message": "Nexios Digital API está online",
        "available_routes": routes,
        "environment": os.getenv("ENVIRONMENT", "development")
    }

# Rota de chat simples usando OpenAI
@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    Endpoint simples de chat que usa a API OpenAI diretamente.
    """
    logger.info(f"Recebendo mensagem: {request.message}")
    
    # Log completo do request para debug
    logger.debug(f"Request completo: {request}")
    
    # Gerar ou usar ID de conversa
    conversation_id = request.conversation_id or str(uuid.uuid4())
    
    if not OPENAI_API_KEY:
        logger.error("Erro: Chave API não configurada")
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
        
        logger.info(f"Enviando {len(messages)} mensagens para OpenAI")
        
        # Fazer a chamada para a API
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # Modelo mais econômico e rápido
            messages=messages,
            temperature=0.7,
            max_tokens=800
        )
        
        # Extrair resposta
        ai_response = response.choices[0].message.content
        logger.info(f"Resposta recebida: {ai_response[:50]}...")
        
        # Armazenar mensagens na conversa
        store_message(conversation_id, {"role": "user", "content": request.message, "timestamp": datetime.now().isoformat()})
        store_message(conversation_id, {"role": "assistant", "content": ai_response, "timestamp": datetime.now().isoformat()})
        
        return {"response": ai_response, "conversation_id": conversation_id}
    
    except Exception as e:
        logger.error(f"Erro ao processar mensagem: {str(e)}")
        return {"response": f"Desculpe, houve um erro ao processar sua mensagem. Detalhes: {str(e)}", "conversation_id": conversation_id}

# NOVO ENDPOINT DE FALLBACK QUE USA OpenAI DIRETAMENTE SEM DEPENDER DO N8N
@app.post("/api/chat-direct")
async def chat_direct(request: ChatRequest):
    """
    Endpoint de fallback que usa a API OpenAI diretamente, sem depender do N8N.
    """
    logger.info(f"Recebendo mensagem para processamento direto: {request.message}")
    
    # Log completo do request para debug
    logger.debug(f"Request completo (direto): {request}")
    
    # Gerar ou usar ID de conversa
    conversation_id = request.conversation_id or str(uuid.uuid4())
    
    if not OPENAI_API_KEY:
        logger.error("Erro: Chave API não configurada")
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
            4. Automação com ClickUp
            
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
        
        logger.info(f"[DIRETO] Enviando {len(messages)} mensagens para OpenAI")
        
        # Fazer a chamada para a API
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # Modelo mais econômico e rápido
            messages=messages,
            temperature=0.7,
            max_tokens=800
        )
        
        # Extrair resposta
        ai_response = response.choices[0].message.content
        logger.info(f"[DIRETO] Resposta recebida: {ai_response[:50]}...")
        
        # Armazenar mensagens na conversa
        store_message(conversation_id, {"role": "user", "content": request.message, "timestamp": datetime.now().isoformat()})
        store_message(conversation_id, {"role": "assistant", "content": ai_response, "timestamp": datetime.now().isoformat()})
        
        return {"response": ai_response, "conversation_id": conversation_id}
    
    except Exception as e:
        logger.error(f"[DIRETO] Erro ao processar mensagem: {str(e)}")
        return {"response": f"Desculpe, houve um erro ao processar sua mensagem. Detalhes: {str(e)}", "conversation_id": conversation_id}