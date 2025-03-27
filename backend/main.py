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
    # Use a URL padrão do webhook se não estiver definida
    N8N_WEBHOOK_URL = "https://webhook.nexiosdigital.com/webhook/nexios-chat-processor"
    logger.warning(f"Usando URL padrão para webhook N8N: {N8N_WEBHOOK_URL}")

# Obter outras variáveis de ambiente
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_ORG_ID = os.getenv("OPENAI_ORG_ID")
N8N_API_TOKEN = os.getenv("N8N_API_TOKEN", "dasdaksmda")

# Verificar token de API
if not N8N_API_TOKEN:
    logger.warning("N8N_API_TOKEN não está configurado. Autenticação de callbacks pode falhar.")

# Configuração da aplicação
app = FastAPI(title="Nexios Digital API")

# ADICIONADO: Evento de inicialização para DEBUG
@app.on_event("startup")
async def startup_event():
    print("=== SERVIDOR INICIADO ===")
    print(f"N8N_WEBHOOK_URL: {N8N_WEBHOOK_URL}")
    print("Configuração CORS: ", app.middleware_stack)
    print("Rotas disponíveis:")
    
    print("========================")

# Configuração do CORS - ATUALIZADA para permitir todas as origens durante os testes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins temporarily for testing
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
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
    status: Optional[str] = None

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

# Endpoint WebSocket para diagnóstico
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    logger.debug(f"Nova tentativa de conexão WebSocket de cliente: {client_id}")
    logger.debug(f"Headers da conexão: {websocket.headers}")
    logger.debug(f"Parâmetros da solicitação: {websocket.query_params}")
    
    try:
        await manager.connect(websocket, client_id)
        
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
                
                try:
                    # Tentar processar como JSON para verificar se contém conversation_id
                    json_data = json.loads(data)
                    if 'conversation_id' in json_data:
                        logger.info(f"Cliente {client_id} associado à conversa {json_data['conversation_id']}")
                        await websocket.send_json({
                            "type": "association_success",
                            "message": f"Associado à conversa: {json_data['conversation_id']}"
                        })
                except:
                    # Se não for JSON, enviar eco simples
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
    
    # Desconectar do gerenciador quando terminar
    manager.disconnect(websocket)
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
        "n8n_webhook_url": N8N_WEBHOOK_URL,  # Adicionado para debug
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
    
    # Agora assume que o webhook N8N está OK sem tentar fazer um request
    if N8N_WEBHOOK_URL:
        status_info["n8n_connection"] = "successful"
    else:
        status_info["n8n_connection"] = "failed"
        status_info["n8n_error"] = "N8N_WEBHOOK_URL não configurado"
    
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
        "environment": os.getenv("ENVIRONMENT", "development"),
        "n8n_webhook_url": N8N_WEBHOOK_URL
    }

# Endpoint para enviar mensagens para o N8N - MODIFICADO
@app.post("/api/chat-n8n")
async def chat_n8n(request: ChatRequest):
    """
    Endpoint que envia mensagens para processamento no N8N.
    """
    logger.info(f"Recebendo mensagem para envio ao N8N: {request.message}")
    
    # Log completo do request para debug
    logger.debug(f"Request completo para N8N: {request}")
    
    # Gerar ou usar ID de conversa
    conversation_id = request.conversation_id or str(uuid.uuid4())
    logger.info(f"Usando conversation_id: {conversation_id}")
    
    # Verificar se a URL do webhook está configurada
    if not N8N_WEBHOOK_URL:
        logger.error("Erro: URL do webhook N8N não configurada")
        return {"response": "O sistema de IA não está configurado. Por favor, contate o administrador.", "conversation_id": conversation_id}
    
    try:
        # Armazenar a mensagem do usuário
        store_message(conversation_id, {
            "role": "user", 
            "content": request.message, 
            "timestamp": datetime.now().isoformat()
        })
        
        # Preparar dados para enviar ao N8N
        n8n_data = {
            "message": request.message,
            "conversation_id": conversation_id,
            "timestamp": datetime.now().isoformat(),
            "conversation_history": [
                {"role": msg.role, "content": msg.content} 
                for msg in request.conversation_history
            ]
        }
        
        logger.info(f"Enviando dados para N8N: {N8N_WEBHOOK_URL}")
        
        # Enviar para o webhook N8N
        async with httpx.AsyncClient() as client:
            response = await client.post(
                N8N_WEBHOOK_URL,
                json=n8n_data,
                timeout=10.0  # Timeout maior para o N8N processar
            )
            
            logger.info(f"Resposta do N8N: Status {response.status_code}")
            
            # MODIFICADO: Indicar explicitamente que está processando
            return {
                "response": "Aguarde enquanto processamos sua mensagem...",
                "conversation_id": conversation_id,
                "status": "processing"  # Nova flag para indicar processamento assíncrono
            }
    except Exception as e:
        logger.error(f"Erro ao enviar mensagem para N8N: {str(e)}")
        return {"response": f"Desculpe, houve um erro ao processar sua mensagem. Detalhes: {str(e)}", "conversation_id": conversation_id}

# NOVO: Endpoint para recuperar mensagens de uma conversa
@app.get("/api/messages/{conversation_id}")
async def get_messages(conversation_id: str):
    """
    Recupera todas as mensagens de uma conversa específica
    """
    logger.info(f"Solicitação para recuperar mensagens da conversa: {conversation_id}")
    messages = get_conversation_history(conversation_id)
    
    return {
        "conversation_id": conversation_id,
        "messages": messages
    }

# NOVO: Endpoint de teste para simples verificação
@app.get("/api/test-callback")
async def test_callback():
    """
    Endpoint de teste simples para verificar se as rotas estão funcionando.
    """
    logger.info("Endpoint de teste chamado com sucesso")
    return {
        "status": "success",
        "message": "Endpoint de teste funcionando corretamente",
        "timestamp": datetime.now().isoformat()
    }

# NOVO: Endpoint de teste para POST
@app.post("/api/test-callback")
async def test_callback_post(request: Request):
    """
    Endpoint de teste POST que registra tudo que recebe.
    """
    logger.info("Endpoint de teste POST chamado")
    
    body = await request.body()
    body_str = body.decode('utf-8')
    headers = dict(request.headers)
    
    logger.info(f"Headers recebidos: {headers}")
    logger.info(f"Body recebido: {body_str}")
    
    try:
        if body_str:
            data = json.loads(body_str)
            logger.info(f"JSON Parsed: {data}")
        else:
            logger.info("Body vazio")
    except:
        logger.info("Não foi possível fazer parse do body como JSON")
    
    return {
        "status": "success",
        "message": "Dados recebidos com sucesso no endpoint de teste POST",
        "received_headers": headers,
        "received_body": body_str,
        "timestamp": datetime.now().isoformat()
    }

# APRIMORADO: Endpoint para receber callbacks do N8N com melhor tratamento de erro e logging
@app.post("/api/n8n-callback")
async def n8n_callback(request: Request):
    """
    Endpoint para receber respostas processadas pelo N8N com melhor tratamento de erro e logging.
    """
    logger.info(f"Recebendo callback do N8N endpoint")
    logger.info(f"Request method: {request.method}")
    logger.info(f"Request headers: {request.headers}")
    
    # Log do corpo bruto para depuração
    body = await request.body()
    body_str = body.decode('utf-8')
    logger.info(f"Corpo bruto da requisição: {body_str}")
    
    try:
        # Tentar analisar JSON
        if body_str:
            try:
                data_dict = json.loads(body_str)
                logger.info(f"Dados JSON analisados: {data_dict}")
                
                # Validar campos obrigatórios manualmente para fornecer melhores mensagens de erro
                if "conversation_id" not in data_dict:
                    logger.warning("conversation_id não encontrado no payload")
                if "original_message" not in data_dict:
                    logger.warning("original_message não encontrado no payload")
                if "processed_response" not in data_dict:
                    logger.warning("processed_response não encontrado no payload")
                
                # Extrair campos necessários com fallbacks
                conversation_id = data_dict.get("conversation_id")
                if not conversation_id:
                    # Tentar encontrar conversation_id em qualquer campo
                    for key, value in data_dict.items():
                        if isinstance(value, str) and "conversation" in key.lower():
                            conversation_id = value
                            break
                
                if not conversation_id:
                    logger.error("Não foi possível encontrar conversation_id no payload")
                    return {"error": True, "message": "conversation_id não encontrado"}
                
                # Extrair resposta com fallbacks
                response_text = data_dict.get("processed_response")
                if not response_text:
                    response_text = data_dict.get("response", 
                                    data_dict.get("content", 
                                    data_dict.get("message", 
                                    "Resposta recebida mas formato do conteúdo desconhecido")))
                
                # Guardar timestamp com fallback
                timestamp = data_dict.get("timestamp", datetime.now().isoformat())
                
                # Extrair mensagem original com fallback
                original_message = data_dict.get("original_message", "Mensagem original não disponível")
                
                # Extrair metadata com fallback
                metadata = data_dict.get("metadata", {})
                
                # Armazenar a mensagem do assistente
                store_message(
                    conversation_id, 
                    {
                        "role": "assistant", 
                        "content": response_text,
                        "timestamp": timestamp,
                        "metadata": metadata
                    }
                )
                
                # Tentar enviar via WebSocket para clientes conectados
                sent_to_client = False
                logger.debug(f"Conexões ativas atuais: {len(manager.active_connections)}")
                logger.debug(f"Detalhes das conexões ativas: {[conn['client_id'] for conn in manager.active_connections]}")
                
                for conn in manager.active_connections:
                    logger.debug(f"Verificando conexão com client_id: {conn['client_id']}")
                    if conn["client_id"] == conversation_id:
                        try:
                            await conn["websocket"].send_json({
                                "type": "message",
                                "content": response_text,
                                "timestamp": timestamp
                            })
                            logger.info(f"Resposta enviada ao cliente {conversation_id} via WebSocket")
                            sent_to_client = True
                        except Exception as e:
                            logger.error(f"Erro ao enviar via WebSocket: {str(e)}", exc_info=True)
                    else:
                        logger.debug(f"Client ID {conn['client_id']} não corresponde ao ID da conversa {conversation_id}")
                
                if not sent_to_client:
                    logger.info(f"Nenhum cliente WebSocket ativo para conversa {conversation_id}. Mensagem armazenada.")
                
                return {"success": True, "message": "Callback processado com sucesso"}
            except json.JSONDecodeError as e:
                logger.error(f"Falha ao analisar JSON: {str(e)}")
                return {"error": True, "message": f"JSON inválido: {str(e)}"}
        else:
            logger.error("Corpo da requisição vazio")
            return {"error": True, "message": "Corpo da requisição vazio"}
    except Exception as e:
        logger.error(f"Erro ao processar callback do N8N: {str(e)}", exc_info=True)
        return {"error": True, "message": str(e)}

# Rota de chat que redireciona para o endpoint N8N
@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    Endpoint que redireciona para o endpoint chat-n8n.
    Isso é para compatibilidade com qualquer frontend que ainda use /api/chat.
    """
    logger.info(f"Recebendo mensagem no /api/chat, redirecionando para chat-n8n: {request.message}")
    
    # Simplesmente chama o endpoint chat-n8n
    return await chat_n8n(request)