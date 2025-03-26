from fastapi import FastAPI, HTTPException, status, WebSocket, WebSocketDisconnect, Depends, Header, Request, BackgroundTasks
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

# Configurar nível de log para DEBUG
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

# Configuração da aplicação
app = FastAPI(title="Nexios Digital API")

# Evento de inicialização
@app.on_event("startup")
async def startup_event():
    print("=== SERVIDOR INICIADO ===")
    print(f"N8N_WEBHOOK_URL: {N8N_WEBHOOK_URL}")
    print("========================")

# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://nexiosdigital.com",
        "https://www.nexiosdigital.com", 
        "http://nexiosdigital.com",
        "http://www.nexiosdigital.com",
        "http://localhost:3000",
        "http://localhost:8000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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

# Armazenamento para solicitações pendentes
pending_requests = {}

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
        "pending_requests": len(pending_requests)
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
    
    return status_info

# Endpoint para enviar mensagens para o N8N - VERSÃO SIMPLIFICADA QUE AGUARDA N8N
@app.post("/api/chat-n8n")
async def chat_n8n(request: ChatRequest, background_tasks: BackgroundTasks):
    """
    Endpoint que envia mensagens para o N8N e aguarda resposta via callback.
    """
    logger.info(f"Recebendo mensagem para envio ao N8N: {request.message}")
    
    # Gerar ou usar ID de conversa
    conversation_id = request.conversation_id or str(uuid.uuid4())
    logger.info(f"ID de conversa: {conversation_id}")
    
    # Verificar se a URL do webhook está configurada
    if not N8N_WEBHOOK_URL:
        logger.error("URL do webhook N8N não configurada")
        return {"response": "O sistema de IA não está configurado. Por favor, contate o administrador.", "conversation_id": conversation_id}
    
    # Criar um evento futuro que será resolvido quando o N8N responder
    response_future = asyncio.Future()
    
    # Armazenar a solicitação pendente
    pending_requests[conversation_id] = response_future
    
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
    
    # Enviar dados para o N8N em background
    background_tasks.add_task(send_to_n8n, N8N_WEBHOOK_URL, n8n_data)
    
    try:
        # Aguardar resposta do N8N (através do endpoint de callback)
        # Timeout de 30 segundos (ajuste conforme necessário)
        logger.info(f"Aguardando resposta do N8N para conversa {conversation_id}...")
        response_data = await asyncio.wait_for(response_future, timeout=30.0)
        
        logger.info(f"Resposta recebida para conversa {conversation_id}: {response_data}")
        
        # Retornar a resposta para o cliente
        return {
            "response": response_data["processed_response"],
            "conversation_id": conversation_id
        }
    except asyncio.TimeoutError:
        # Se não receber resposta em tempo hábil
        logger.warning(f"Timeout ao aguardar resposta do N8N para conversa {conversation_id}")
        
        # Remover a solicitação pendente
        if conversation_id in pending_requests:
            del pending_requests[conversation_id]
            
        return {
            "response": "Desculpe, não foi possível obter uma resposta em tempo hábil. Por favor, tente novamente.",
            "conversation_id": conversation_id
        }
    except Exception as e:
        logger.error(f"Erro ao aguardar resposta do N8N: {str(e)}")
        
        # Remover a solicitação pendente
        if conversation_id in pending_requests:
            del pending_requests[conversation_id]
            
        return {
            "response": f"Desculpe, ocorreu um erro: {str(e)}",
            "conversation_id": conversation_id
        }

# Função para enviar dados ao N8N
async def send_to_n8n(webhook_url, data):
    try:
        logger.info(f"Enviando dados para N8N: {webhook_url}")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                webhook_url,
                json=data,
                timeout=10.0
            )
            
        logger.info(f"Resposta do N8N: Status {response.status_code}")
        if response.status_code >= 400:
            logger.error(f"Erro na resposta do N8N: {response.text}")
    except Exception as e:
        logger.error(f"Erro ao enviar para N8N: {str(e)}")

# Endpoint para receber callbacks do N8N - SIMPLIFICADO
@app.post("/api/n8n-callback")
async def n8n_callback(data: N8nResponse):
    """
    Endpoint para receber respostas processadas pelo N8N.
    """
    logger.info(f"Recebendo callback do N8N para conversa: {data.conversation_id}")
    
    try:
        # Verificar se temos um ID de conversa
        if not data.conversation_id:
            logger.error("ID de conversa não fornecido no callback")
            return {"error": True, "message": "ID de conversa não fornecido"}
        
        # Verificar se existe uma solicitação pendente para este ID
        if data.conversation_id in pending_requests:
            logger.info(f"Encontrada solicitação pendente para conversa {data.conversation_id}")
            
            # Resolver o future com a resposta
            pending_requests[data.conversation_id].set_result({
                "processed_response": data.processed_response,
                "timestamp": data.timestamp
            })
            
            # Remover da lista de pendentes
            del pending_requests[data.conversation_id]
            
            logger.info(f"Resposta enviada ao cliente para conversa {data.conversation_id}")
            return {"success": True, "message": "Callback processado com sucesso"}
        else:
            logger.warning(f"Nenhuma solicitação pendente encontrada para conversa {data.conversation_id}")
            return {"warning": True, "message": "Nenhuma solicitação pendente encontrada para este ID"}
        
    except Exception as e:
        logger.error(f"Erro ao processar callback do N8N: {str(e)}")
        return {"error": True, "message": str(e)}

# Rota de chat legada (compatibilidade)
@app.post("/api/chat")
async def chat(request: ChatRequest, background_tasks: BackgroundTasks):
    """
    Endpoint que redireciona para o endpoint chat-n8n.
    """
    logger.info(f"Recebendo mensagem no /api/chat, redirecionando para chat-n8n")
    return await chat_n8n(request, background_tasks)

# Rota raiz para verificação de status
@app.get("/")
async def root():
    routes = [{"path": route.path, "name": route.name, "methods": list(route.methods)} 
             for route in app.routes]
    
    return {
        "message": "Nexios Digital API está online",
        "available_routes": routes,
        "pending_requests": len(pending_requests)
    }