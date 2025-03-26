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
from collections import deque

# Configurar nível de log para DEBUG
logging.basicConfig(level=logging.DEBUG, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configurações de ambiente
N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL", "https://webhook.nexiosdigital.com/webhook/nexios-chat-processor")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_ORG_ID = os.getenv("OPENAI_ORG_ID")
N8N_API_TOKEN = os.getenv("N8N_API_TOKEN", "dasdaksmda")

# Aviso se token não estiver configurado
if not N8N_API_TOKEN:
    logger.warning("N8N_API_TOKEN não está configurado. Autenticação de callbacks pode falhar.")

# Inicialização da aplicação
app = FastAPI(title="Nexios Digital API")

# Evento de inicialização
@app.on_event("startup")
async def startup_event():
    logger.info("=== SERVIDOR INICIADO ===")
    logger.info(f"N8N_WEBHOOK_URL: {N8N_WEBHOOK_URL}")
    logger.info("========================")

# Configuração CORS
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

# Modelos de dados
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

class N8nResponse(BaseModel):
    conversation_id: Optional[str] = None
    original_message: str
    processed_response: str
    timestamp: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

# Nova classe para gerenciar mensagens pendentes e conexões WebSocket
class ChatManager:
    def __init__(self):
        # Conexões WebSocket ativas - {client_id: WebSocket}
        self.connections = {}
        
        # Histórico de conversas - {conversation_id: [mensagens]}
        self.conversation_history = {}
        
        # Mensagens pendentes para entrega - {conversation_id: [mensagens]}
        self.pending_messages = {}
        
        # Informação sobre a última atividade (timestamp) - {client_id: timestamp}
        self.last_activity = {}
        
        # Mapeamento entre client_id e conversation_id (pode ser diferente) - {client_id: conversation_id}
        self.client_conversation_map = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        """Registra uma nova conexão WebSocket"""
        await websocket.accept()
        self.connections[client_id] = websocket
        self.last_activity[client_id] = datetime.now()
        logger.info(f"WebSocket conectado para cliente {client_id}. Total: {len(self.connections)}")
        
        # Enviar confirmação de conexão
        await websocket.send_json({
            "type": "connection_status",
            "status": "connected",
            "message": f"Conexão WebSocket estabelecida. ID: {client_id}"
        })
        
        # Verificar se há mensagens pendentes para este cliente
        await self.deliver_pending_messages(client_id)

    def disconnect(self, client_id: str):
        """Remove uma conexão WebSocket"""
        if client_id in self.connections:
            del self.connections[client_id]
            logger.info(f"Cliente {client_id} desconectado. Total restante: {len(self.connections)}")
            
            # Manter o mapeamento client_id -> conversation_id para reconexões futuras
            # Não removemos do client_conversation_map propositalmente

    def associate_conversation(self, client_id: str, conversation_id: str):
        """Associa um client_id a um conversation_id"""
        logger.info(f"Associando client_id {client_id} com conversation_id {conversation_id}")
        self.client_conversation_map[client_id] = conversation_id
        
        # Se este cliente já estiver conectado, verificar mensagens pendentes
        if client_id in self.connections:
            asyncio.create_task(self.deliver_pending_messages(client_id))

    def add_message(self, conversation_id: str, message: Dict[str, Any]):
        """Adiciona uma mensagem ao histórico e à fila de pendentes"""
        # Adicionar ao histórico
        if conversation_id not in self.conversation_history:
            self.conversation_history[conversation_id] = []
        self.conversation_history[conversation_id].append(message)
        
        # Limitar o tamanho do histórico
        if len(self.conversation_history[conversation_id]) > 50:
            self.conversation_history[conversation_id] = self.conversation_history[conversation_id][-50:]
        
        # Adicionar à fila de pendentes
        if conversation_id not in self.pending_messages:
            self.pending_messages[conversation_id] = []
        self.pending_messages[conversation_id].append(message)
        
        # Tentar entregar a todos os clientes associados a esta conversa
        clients_to_deliver = []
        for client_id, conv_id in self.client_conversation_map.items():
            if conv_id == conversation_id and client_id in self.connections:
                clients_to_deliver.append(client_id)
        
        # Criar tarefas assíncronas para entrega
        for client_id in clients_to_deliver:
            asyncio.create_task(self.deliver_pending_messages(client_id))

    async def deliver_pending_messages(self, client_id: str):
        """Tenta entregar mensagens pendentes para um cliente específico"""
        # Verificar se o cliente tem um conversation_id associado
        if client_id not in self.client_conversation_map:
            logger.warning(f"Cliente {client_id} não tem conversation_id associado")
            return
        
        conversation_id = self.client_conversation_map[client_id]
        
        # Verificar se há mensagens pendentes para esta conversa
        if conversation_id not in self.pending_messages or not self.pending_messages[conversation_id]:
            logger.debug(f"Nenhuma mensagem pendente para conversa {conversation_id}")
            return
        
        # Verificar se o cliente está conectado
        if client_id not in self.connections:
            logger.warning(f"Cliente {client_id} não está conectado, não é possível entregar mensagens")
            return
        
        websocket = self.connections[client_id]
        messages_delivered = 0
        
        try:
            # Entregar todas as mensagens pendentes
            for message in list(self.pending_messages[conversation_id]):
                await websocket.send_json({
                    "type": "message",
                    "content": message["content"],
                    "role": message.get("role", "assistant"),
                    "timestamp": message.get("timestamp", datetime.now().isoformat())
                })
                messages_delivered += 1
                
                # Remover esta mensagem da fila pendente
                self.pending_messages[conversation_id].remove(message)
            
            logger.info(f"Entregues {messages_delivered} mensagens pendentes para cliente {client_id}")
        except Exception as e:
            logger.error(f"Erro ao entregar mensagens pendentes para {client_id}: {str(e)}")
            self.disconnect(client_id)
    
    def get_history(self, conversation_id: str) -> List[Dict[str, Any]]:
        """Retorna o histórico de mensagens para uma conversa"""
        return self.conversation_history.get(conversation_id, [])

    def get_client_by_conversation(self, conversation_id: str) -> Optional[str]:
        """Encontra o client_id associado a uma conversation_id"""
        for client_id, conv_id in self.client_conversation_map.items():
            if conv_id == conversation_id:
                return client_id
        return None

    def list_active_connections(self):
        """Lista todas as conexões ativas para depuração"""
        return {
            "active_connections": len(self.connections),
            "client_ids": list(self.connections.keys()),
            "conversation_mappings": self.client_conversation_map,
            "pending_message_counts": {conv_id: len(msgs) for conv_id, msgs in self.pending_messages.items()}
        }

# Instanciar o gerenciador de chat
chat_manager = ChatManager()

# Função para verificar autenticação para o endpoint N8N
async def verify_token(authorization: Optional[str] = Header(None)):
    if not authorization:
        logger.error("Token de autorização ausente")
        raise HTTPException(status_code=401, detail="Token de autorização ausente")
    
    try:
        scheme, token = authorization.split()
        
        if scheme.lower() != "bearer":
            logger.error("Formato de autorização inválido")
            raise HTTPException(status_code=401, detail="Formato de autorização inválido")
        
        if token != N8N_API_TOKEN:
            logger.error("Token inválido")
            raise HTTPException(status_code=401, detail="Token inválido")
        
        return token
    except ValueError:
        logger.error("Formato de autorização inválido (não conseguiu separar)")
        raise HTTPException(status_code=401, detail="Formato de autorização inválido")

# Endpoint WebSocket melhorado
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    try:
        # Registrar no gerenciador de chat
        await chat_manager.connect(websocket, client_id)
        
        # Manter a conexão aberta para receber mensagens
        while True:
            try:
                # Esperar mensagens do cliente
                data = await websocket.receive_text()
                
                try:
                    # Tentar processar o JSON recebido
                    data_json = json.loads(data)
                    
                    # Se a mensagem contém um conversation_id, fazer a associação
                    if "conversation_id" in data_json:
                        chat_manager.associate_conversation(client_id, data_json["conversation_id"])
                        await websocket.send_json({
                            "type": "association_success", 
                            "message": f"ID de conversa registrado: {data_json['conversation_id']}"
                        })
                except json.JSONDecodeError:
                    # Se não for um JSON válido, apenas responder com eco
                    await websocket.send_json({
                        "type": "echo",
                        "message": data,
                        "timestamp": datetime.now().isoformat()
                    })
                
            except WebSocketDisconnect:
                logger.info(f"Cliente {client_id} desconectou normalmente")
                break
            except Exception as e:
                logger.error(f"Erro ao processar mensagem do cliente {client_id}: {str(e)}")
                break
    
    except Exception as e:
        logger.error(f"Erro ao configurar WebSocket para cliente {client_id}: {str(e)}")
    
    # Desconectar o cliente no final
    chat_manager.disconnect(client_id)

# Rota para verificar status da API
@app.get("/api/status")
async def get_status():
    status_info = {
        "server": "online",
        "openai_api_key_configured": bool(OPENAI_API_KEY),
        "n8n_webhook_configured": bool(N8N_WEBHOOK_URL),
        "websocket_status": chat_manager.list_active_connections()
    }
    
    if OPENAI_API_KEY:
        try:
            client = OpenAI(api_key=OPENAI_API_KEY, organization=OPENAI_ORG_ID)
            models = client.models.list()
            status_info["openai_connection"] = "successful"
            status_info["available_models"] = [model.id for model in models.data[:3]]
        except Exception as e:
            status_info["openai_connection"] = "failed"
            status_info["openai_error"] = str(e)
    
    return status_info

# Endpoint para enviar mensagens para o N8N
@app.post("/api/chat-n8n")
async def chat_n8n(request: ChatRequest):
    logger.info(f"Recebendo mensagem para envio ao N8N: {request.message}")
    
    # Gerar ou usar ID de conversa existente
    conversation_id = request.conversation_id or str(uuid.uuid4())
    logger.info(f"Usando ID de conversa: {conversation_id}")
    
    # Verificar se a URL do webhook está configurada
    if not N8N_WEBHOOK_URL:
        logger.error("URL do webhook N8N não configurada")
        return {"response": "O sistema de IA não está configurado. Por favor, contate o administrador.", "conversation_id": conversation_id}
    
    try:
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
        
        # Adicionar mensagem do usuário ao histórico
        chat_manager.add_message(
            conversation_id=conversation_id,
            message={
                "role": "user",
                "content": request.message,
                "timestamp": datetime.now().isoformat()
            }
        )
        
        # Enviar para o webhook N8N
        async with httpx.AsyncClient() as client:
            response = await client.post(
                N8N_WEBHOOK_URL,
                json=n8n_data,
                timeout=10.0
            )
            
            logger.info(f"Resposta do N8N: Status {response.status_code}")
            
            # Verificar resposta
            if response.status_code < 400:
                try:
                    # Tentar extrair a resposta do JSON
                    response_data = response.json()
                    
                    # Verificar formato da resposta
                    if isinstance(response_data, dict) and "data" in response_data:
                        n8n_response = response_data["data"].get("response", "")
                    else:
                        n8n_response = response_data.get("response", response.text)
                    
                    logger.info(f"Resposta processada do N8N: {n8n_response[:50]}...")
                    
                    # Adicionar resposta ao histórico se não for uma confirmação de workflow
                    # Respostas reais virão pelo callback
                    if "processando" not in n8n_response.lower() and "iniciando" not in n8n_response.lower():
                        chat_manager.add_message(
                            conversation_id=conversation_id,
                            message={
                                "role": "assistant",
                                "content": n8n_response,
                                "timestamp": datetime.now().isoformat()
                            }
                        )
                    
                    return {"response": n8n_response, "conversation_id": conversation_id}
                except Exception as e:
                    logger.error(f"Erro ao processar JSON da resposta do N8N: {str(e)}")
                    return {
                        "response": "Desculpe, houve um erro ao processar a resposta do sistema. Por favor, tente novamente.",
                        "conversation_id": conversation_id
                    }
            else:
                logger.error(f"Erro na resposta do N8N: {response.status_code} - {response.text}")
                return {
                    "response": f"Erro ao processar mensagem: Código de status {response.status_code}",
                    "conversation_id": conversation_id
                }
    except Exception as e:
        logger.error(f"Erro ao enviar mensagem para N8N: {str(e)}")
        return {"response": f"Desculpe, houve um erro ao processar sua mensagem. Detalhes: {str(e)}", "conversation_id": conversation_id}

# Endpoint para receber callbacks do N8N - refatorado completamente
@app.post("/api/n8n-callback")
async def n8n_callback(data: N8nResponse):
    """
    Endpoint para receber respostas processadas pelo N8N.
    """
    logger.info(f"[CALLBACK] Recebendo callback do N8N para conversa: {data.conversation_id}")
    
    try:
        # Verificar se temos um ID de conversa
        if not data.conversation_id:
            logger.error("[CALLBACK] ID de conversa não fornecido no callback do N8N")
            return {"error": True, "message": "ID de conversa não fornecido"}
        
        # Adicionar a resposta processada ao histórico
        chat_manager.add_message(
            conversation_id=data.conversation_id,
            message={
                "role": "assistant",
                "content": data.processed_response,
                "timestamp": data.timestamp or datetime.now().isoformat(),
                "metadata": data.metadata or {}
            }
        )
        
        # Verificar se há cliente associado a esta conversa
        client_id = chat_manager.get_client_by_conversation(data.conversation_id)
        
        if client_id:
            logger.info(f"[CALLBACK] Encontrado cliente {client_id} para conversa {data.conversation_id}")
            
            # A entrega será feita automaticamente pelo mecanismo de mensagens pendentes
            # Se o cliente estiver online, a mensagem será entregue imediatamente
            # Se estiver offline, será entregue quando reconectar
        else:
            logger.warning(f"[CALLBACK] Nenhum cliente encontrado para conversa {data.conversation_id}")
        
        # Novo endpoint para clientes recuperarem mensagens perdidas
        logger.info(f"[CALLBACK] Mensagem do N8N armazenada com sucesso para conversa {data.conversation_id}")
        
        return {"success": True, "message": "Callback processado com sucesso"}
    except Exception as e:
        logger.error(f"[CALLBACK] Erro ao processar callback do N8N: {str(e)}", exc_info=True)
        return {"error": True, "message": str(e)}

# Endpoint para recuperar mensagens pendentes (alternativa ao WebSocket)
@app.get("/api/messages/{conversation_id}")
async def get_messages(conversation_id: str, since: Optional[str] = None):
    """
    Recupera mensagens de uma conversa, opcionalmente filtrando por timestamp
    """
    try:
        messages = chat_manager.get_history(conversation_id)
        
        # Filtrar por timestamp se fornecido
        if since:
            since_dt = datetime.fromisoformat(since)
            messages = [msg for msg in messages if datetime.fromisoformat(msg.get("timestamp", "")) > since_dt]
        
        return {
            "conversation_id": conversation_id,
            "messages": messages
        }
    except Exception as e:
        logger.error(f"Erro ao recuperar mensagens: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint para associar explicitamente um cliente a uma conversa
@app.post("/api/associate-client")
async def associate_client(request: Dict[str, str]):
    """
    Associa um client_id a um conversation_id explicitamente
    """
    try:
        client_id = request.get("client_id")
        conversation_id = request.get("conversation_id")
        
        if not client_id or not conversation_id:
            return {"success": False, "message": "client_id e conversation_id são obrigatórios"}
        
        chat_manager.associate_conversation(client_id, conversation_id)
        return {"success": True, "message": f"Cliente {client_id} associado à conversa {conversation_id}"}
    except Exception as e:
        logger.error(f"Erro ao associar cliente: {str(e)}")
        return {"success": False, "message": str(e)}

# Rota de chat que redireciona para o endpoint N8N
@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    Endpoint legado que redireciona para chat-n8n
    """
    logger.info(f"Redirecionando chamada de /api/chat para /api/chat-n8n")
    return await chat_n8n(request)

# Rota raiz para verificação de status
@app.get("/")
async def root():
    routes = [{"path": route.path, "name": route.name, "methods": list(route.methods)} 
             for route in app.routes]
    
    connections_info = chat_manager.list_active_connections()
    
    return {
        "status": "online",
        "message": "Nexios Digital API está online",
        "available_routes": routes,
        "websocket_connections": connections_info,
        "environment": os.getenv("ENVIRONMENT", "development")
    }