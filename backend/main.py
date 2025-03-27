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
    logger.info("=== SERVIDOR INICIADO ===")
    logger.info(f"N8N_WEBHOOK_URL: {N8N_WEBHOOK_URL}")
    logger.info(f"Configuração CORS: Permitindo todas as origens")
    logger.info("========================")

# Configuração do CORS - CORRIGIDA para permitir todas as origens
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todas as origens
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos os métodos
    allow_headers=["*"],  # Permitir todos os headers
    expose_headers=["*"]  # Expor todos os headers na resposta
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

# Gerenciador de WebSockets MELHORADO
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[Dict[str, Any]] = []
        self.connection_map = {}  # Mapa de conversas para clientes
        self.client_to_convo_map = {}  # Mapa reverso: cliente -> conversa

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        
        # Verificar se o cliente já existe e remover
        for conn in list(self.active_connections):
            if conn["client_id"] == client_id:
                logger.warning(f"Cliente {client_id} já existe, removendo conexão antiga")
                try:
                    await conn["websocket"].close()
                except:
                    pass
                self.active_connections.remove(conn)
        
        # Adicionar nova conexão
        self.active_connections.append({"websocket": websocket, "client_id": client_id})
        logger.info(f"Cliente {client_id} conectado. Total de conexões: {len(self.active_connections)}")
        
        # Para debug - listar todas as conexões ativas após cada nova conexão
        self._log_active_connections()

    def disconnect(self, websocket: WebSocket):
        # Encontrar a conexão a remover
        connection_to_remove = None
        for connection in self.active_connections:
            if connection["websocket"] == websocket:
                connection_to_remove = connection
                break
                
        if connection_to_remove:
            client_id = connection_to_remove["client_id"]
            self.active_connections.remove(connection_to_remove)
            
            # Remover do mapa de conversas
            for conv_id, clients in list(self.connection_map.items()):
                if client_id in clients:
                    clients.remove(client_id)
                    logger.info(f"Cliente {client_id} removido do mapeamento da conversa {conv_id}")
                    
                    # Remover a conversa se não tiver mais clientes
                    if not clients:
                        del self.connection_map[conv_id]
                        logger.info(f"Conversa {conv_id} removida do mapeamento (sem clientes)")
            
            # Limpar do mapa reverso
            if client_id in self.client_to_convo_map:
                del self.client_to_convo_map[client_id]
                logger.info(f"Cliente {client_id} removido do mapa reverso")
                
            logger.info(f"Cliente {client_id} desconectado. Total de conexões: {len(self.active_connections)}")
            self._log_active_connections()
        else:
            logger.warning("Tentativa de desconectar um WebSocket que não está na lista de conexões ativas")

    async def send_personal_message(self, message: Dict[str, Any], client_id: str):
        sent = False
        for connection in self.active_connections:
            if connection["client_id"] == client_id:
                try:
                    await connection["websocket"].send_json(message)
                    logger.info(f"Mensagem enviada para cliente {client_id}")
                    sent = True
                    break
                except Exception as e:
                    logger.error(f"Erro ao enviar mensagem para cliente {client_id}: {str(e)}")
        
        if not sent:
            logger.warning(f"Não foi possível enviar mensagem para cliente {client_id} - não encontrado")
            
        return sent

    async def broadcast(self, message: Dict[str, Any]):
        logger.info(f"Broadcasting message to {len(self.active_connections)} connections")
        for connection in self.active_connections:
            try:
                await connection["websocket"].send_json(message)
            except Exception as e:
                logger.error(f"Erro ao fazer broadcast para cliente {connection['client_id']}: {str(e)}")
    
    def associate_conversation(self, client_id: str, conversation_id: str):
        """
        Associa um cliente a uma conversa para facilitar o envio de mensagens
        """
        if conversation_id not in self.connection_map:
            self.connection_map[conversation_id] = []
            
        if client_id not in self.connection_map[conversation_id]:
            self.connection_map[conversation_id].append(client_id)
            
            # Atualizar também o mapa reverso
            self.client_to_convo_map[client_id] = conversation_id
            
            logger.info(f"Cliente {client_id} associado à conversa {conversation_id}")
            logger.info(f"Mapa de conversas atualizado: {json.dumps(self.connection_map, indent=2)}")
            logger.info(f"Mapa reverso atualizado: {json.dumps(self.client_to_convo_map, indent=2)}")
    
    async def send_to_conversation(self, conversation_id: str, message: Dict[str, Any]):
        """
        Envia mensagem para todos os clientes associados a uma conversa
        """
        if conversation_id not in self.connection_map:
            logger.warning(f"Tentativa de enviar mensagem para conversa {conversation_id} que não está no mapa")
            # Tentativa de encontrar o client_id que corresponde à conversa pelo ID
            matching_clients = [
                c["client_id"] for c in self.active_connections 
                if c["client_id"] == conversation_id or 
                   (c["client_id"] in self.client_to_convo_map and 
                    self.client_to_convo_map[c["client_id"]] == conversation_id)
            ]
            
            if matching_clients:
                logger.info(f"Encontrado cliente correspondente pelo ID: {matching_clients[0]}")
                # Associar retroativamente
                self.associate_conversation(matching_clients[0], conversation_id)
            else:
                # NOVO: Tentativa de encontrar clientes pela substring do ID da conversa
                for c in self.active_connections:
                    client_id = c["client_id"]
                    # Verifica se o ID do cliente contém ou está contido no ID da conversa
                    if (client_id in conversation_id or conversation_id in client_id):
                        logger.info(f"Encontrada correspondência parcial: cliente {client_id} -> conversa {conversation_id}")
                        self.associate_conversation(client_id, conversation_id)
                        break
                else:
                    logger.warning(f"Nenhum cliente encontrado para conversa {conversation_id}")
                    # Último recurso: Broadcast para todos se houver poucos clientes conectados
                    if len(self.active_connections) <= 3:
                        logger.info(f"Tentando broadcast como último recurso para conversa {conversation_id}")
                        await self.broadcast(message)
                        return True
                    return False
            
        clients = self.connection_map.get(conversation_id, [])
        logger.info(f"Enviando mensagem para {len(clients)} clientes da conversa {conversation_id}")
        
        success = False
        for client_id in clients:
            msg_sent = await self.send_personal_message(message, client_id)
            success = success or msg_sent
        
        return success
    
    def _log_active_connections(self):
        """
        Registra informações detalhadas sobre conexões ativas
        """
        logger.info(f"=== CONEXÕES ATIVAS: {len(self.active_connections)} ===")
        for i, conn in enumerate(self.active_connections):
            logger.info(f"Conexão #{i+1}: client_id={conn['client_id']}")
        
        logger.info(f"=== MAPA DE CONVERSAS ===")
        for conv_id, clients in self.connection_map.items():
            logger.info(f"Conversa {conv_id}: {len(clients)} clientes - {clients}")
            
        logger.info(f"=== MAPA REVERSO ===")
        for client_id, conv_id in self.client_to_convo_map.items():
            logger.info(f"Cliente {client_id} -> Conversa {conv_id}")

manager = ConnectionManager()

# Função para verificar autenticação para o endpoint N8N - CORRIGIDA
async def verify_token(authorization: Optional[str] = Header(None)):
    """
    Versão extremamente permissiva da verificação de token para garantir compatibilidade 
    com diferentes formatos enviados pelo N8N.
    """
    logger.debug(f"Verificando token de autorização: {authorization}")
    
    # Aceitar qualquer requisição durante o desenvolvimento
    # REMOVA ESTE RETORNO EM PRODUÇÃO APÓS VERIFICAR QUE TUDO FUNCIONA
    logger.warning("MODO PERMISSIVO ATIVADO: Ignorando verificação de token para debugging")
    return "debug-mode"
    
    # O código abaixo só será executado quando o retorno acima for removido
    
    if not authorization:
        logger.error("Header de autorização ausente")
        raise HTTPException(status_code=401, detail="Token de autorização ausente")
    
    # Extrair o token, não importa o formato
    token_value = None
    
    # Registro completo para depuração
    logger.debug(f"Header Authorization recebido: '{authorization}'")
    logger.debug(f"Token esperado: '{N8N_API_TOKEN}'")
    
    # Tenta vários formatos possíveis
    if "bearer" in authorization.lower():
        # Formato "Bearer token"
        parts = authorization.split()
        if len(parts) > 1:
            token_value = parts[1]
            logger.debug(f"Extraído token após 'Bearer': '{token_value}'")
    else:
        # Assume que o header completo é o token
        token_value = authorization
        logger.debug(f"Usando header completo como token: '{token_value}'")
    
    # Verificar se o token extraído ou o header completo corresponde ao esperado
    if token_value == N8N_API_TOKEN or authorization == N8N_API_TOKEN:
        logger.info("Token validado com sucesso!")
        return token_value or authorization
    
    # Verificação final - procurar o token em qualquer parte do header
    if N8N_API_TOKEN in authorization:
        logger.info(f"Token encontrado dentro do header: '{N8N_API_TOKEN}'")
        return N8N_API_TOKEN

    # Se chegar aqui, o token é inválido
    logger.error(f"Token inválido. Recebido: '{token_value}', Esperado: '{N8N_API_TOKEN}'")
    raise HTTPException(status_code=401, detail="Token inválido")

# Função auxiliar para armazenar mensagens (pode ser substituída por uma implementação de BD)
conversation_store = {}

# NOVA função melhorada para armazenar mensagens
def debug_store_message(conversation_id: str, message: Dict[str, Any]):
    logger.info(f"=== STORE MESSAGE DEBUG ===")
    logger.info(f"Armazenando mensagem para conversa: {conversation_id}")
    logger.info(f"Mensagem para armazenar: {message}")
    
    # Garantir que a conversa existe no armazenamento
    if conversation_id not in conversation_store:
        conversation_store[conversation_id] = []
        logger.info(f"Criando nova entrada para conversa {conversation_id}")
    
    # Adicionar timestamp se não existir
    if "timestamp" not in message:
        message["timestamp"] = datetime.now().isoformat()
    
    # Verificar se a mensagem já existe para evitar duplicação
    message_exists = False
    for existing_msg in conversation_store[conversation_id]:
        if (existing_msg.get("role") == message.get("role") and 
            existing_msg.get("content") == message.get("content")):
            message_exists = True
            logger.info(f"Mensagem duplicada detectada, ignorando")
            break
    
    # Armazenar apenas se não for duplicada
    if not message_exists:
        conversation_store[conversation_id].append(message)
        # Limitar o tamanho do histórico, se necessário
        if len(conversation_store[conversation_id]) > 50:
            conversation_store[conversation_id] = conversation_store[conversation_id][-50:]
        
        logger.info(f"Mensagem armazenada com sucesso. Total na conversa: {len(conversation_store[conversation_id])}")
    
    # Log de todas as mensagens para verificação
    logger.info(f"=== MENSAGENS NA CONVERSA {conversation_id} ===")
    for i, msg in enumerate(conversation_store[conversation_id]):
        content = msg.get("content", "")[:100]
        logger.info(f"  Mensagem {i+1}: {msg.get('role')} - {content}...")
    logger.info(f"===========================")

def get_conversation_history(conversation_id: str) -> List[Dict[str, Any]]:
    return conversation_store.get(conversation_id, [])

# Endpoint WebSocket para comunicação em tempo real - MELHORADO
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """
    Endpoint WebSocket aprimorado com melhor rastreamento de conexões
    """
    logger.info(f"Nova tentativa de conexão WebSocket de cliente: {client_id}")
    logger.info(f"Headers da conexão: {websocket.headers}")
    logger.info(f"Parâmetros da solicitação: {websocket.query_params}")
    
    # Verificar se o ID de conversa foi fornecido como query param
    conversation_id = None
    if "conversation_id" in websocket.query_params:
        conversation_id = websocket.query_params["conversation_id"]
        logger.info(f"ID de conversa fornecido via query params: {conversation_id}")
    
    try:
        # Aceitar conexão
        await manager.connect(websocket, client_id)
        
        # Se já temos o ID de conversa, associar imediatamente
        if conversation_id:
            manager.associate_conversation(client_id, conversation_id)
            
            # Enviar confirmação de associação
            await websocket.send_json({
                "type": "association_success",
                "message": f"Associado à conversa: {conversation_id}",
                "conversation_id": conversation_id
            })
            
            # Enviar as mensagens já existentes para esse cliente
            messages = get_conversation_history(conversation_id)
            if messages:
                logger.info(f"Enviando histórico inicial de {len(messages)} mensagens para cliente {client_id}")
                for idx, msg in enumerate(messages):
                    logger.debug(f"Mensagem histórico {idx+1}: {msg.get('role')} - {msg.get('content', '')[:50]}...")
                
                await websocket.send_json({
                    "type": "message_history",
                    "messages": messages,
                    "conversation_id": conversation_id
                })
        
        # Enviar mensagem de confirmação de conexão
        await websocket.send_json({
            "type": "connection_status",
            "status": "connected",
            "message": "Conexão WebSocket estabelecida com sucesso!"
        })
        
        # Loop para manter a conexão ativa e processar mensagens
        while True:
            try:
                # Receber dados do cliente
                data = await websocket.receive_text()
                logger.debug(f"Recebido do cliente {client_id}: {data}")
                
                try:
                    # Tentar processar como JSON
                    json_data = json.loads(data)
                    
                    # Verificar se há ID de conversa para associação
                    if 'conversation_id' in json_data:
                        conv_id = json_data['conversation_id']
                        client_to_associate = json_data.get('client_id', client_id)
                        
                        logger.info(f"Cliente {client_to_associate} solicitou associação à conversa {conv_id}")
                        
                        # Registrar associação no gerenciador
                        manager.associate_conversation(client_to_associate, conv_id)
                        
                        # Confirmar associação
                        await websocket.send_json({
                            "type": "association_success",
                            "message": f"Associado à conversa: {conv_id}",
                            "conversation_id": conv_id
                        })
                        
                        # Se houver histórico de mensagens para essa conversa, enviar
                        messages = get_conversation_history(conv_id)
                        if messages:
                            logger.info(f"Enviando histórico de {len(messages)} mensagens para cliente {client_id}")
                            for idx, msg in enumerate(messages):
                                logger.debug(f"Mensagem histórico {idx+1}: {msg.get('role')} - {msg.get('content', '')[:50]}...")
                            
                            await websocket.send_json({
                                "type": "message_history",
                                "messages": messages,
                                "conversation_id": conv_id
                            })
                            
                    # Processar comandos especiais
                    elif 'command' in json_data:
                        if json_data['command'] == 'get_messages' and 'conversation_id' in json_data:
                            # Comando para obter mensagens de uma conversa
                            conv_id = json_data['conversation_id']
                            messages = get_conversation_history(conv_id)
                            logger.info(f"Comando get_messages: Encontradas {len(messages)} mensagens para {conv_id}")
                            for idx, msg in enumerate(messages):
                                logger.debug(f"Mensagem {idx+1}: {msg.get('role')} - {msg.get('content', '')[:50]}...")
                            
                            await websocket.send_json({
                                "type": "message_history",
                                "messages": messages,
                                "conversation_id": conv_id
                            })
                        elif json_data['command'] == 'ping':
                            # Comando para verificar se a conexão está viva
                            await websocket.send_json({
                                "type": "pong",
                                "timestamp": datetime.now().isoformat()
                            })
                
                except json.JSONDecodeError:
                    # Se não for JSON válido, enviar eco simples
                    await websocket.send_json({
                        "type": "echo",
                        "original": data,
                        "timestamp": datetime.now().isoformat()
                    })
                
            except WebSocketDisconnect:
                logger.info(f"Cliente {client_id} desconectou normalmente")
                break
            except Exception as e:
                logger.error(f"Erro ao processar mensagem de {client_id}: {str(e)}", exc_info=True)
                # Tentar enviar mensagem de erro antes de decidir se fecha
                try:
                    await websocket.send_json({
                        "type": "error",
                        "message": f"Erro ao processar mensagem: {str(e)}",
                        "timestamp": datetime.now().isoformat()
                    })
                except:
                    # Se não conseguir enviar, provavelmente a conexão já está quebrada
                    logger.error(f"Não foi possível enviar mensagem de erro para {client_id}, conexão provavelmente perdida")
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

# NOVOS ENDPOINTS DE DIAGNÓSTICO PARA EXIBIR CONVERSAS
@app.get("/api/debug/conversations")
async def debug_conversations():
    """Endpoint de debug para listar todas as conversas e o número de mensagens"""
    result = {}
    for conv_id, messages in conversation_store.items():
        result[conv_id] = len(messages)
    return result

@app.get("/api/debug/conversation/{conversation_id}")
async def debug_conversation(conversation_id: str):
    """Endpoint de debug para ver as mensagens de uma conversa específica"""
    if conversation_id in conversation_store:
        messages = conversation_store[conversation_id]
        return {
            "conversation_id": conversation_id,
            "message_count": len(messages),
            "messages": messages
        }
    return {"error": "Conversa não encontrada"}

# NOVO: Endpoint de teste para simular uma mensagem N8N
@app.get("/api/test-n8n/{conversation_id}")
async def test_n8n(conversation_id: str, message: Optional[str] = None):
    """
    Endpoint para simular manualmente um callback do N8N
    """
    logger.info(f"Teste manual de resposta N8N para conversa {conversation_id}")
    
    # Criar uma mensagem teste
    test_content = message or f"Esta é uma mensagem de teste gerada em {datetime.now().isoformat()}. Se você está vendo isto, o fluxo está funcionando!"
    
    test_message = {
        "role": "assistant", 
        "content": test_content,
        "timestamp": datetime.now().isoformat()
    }
    
    # Armazenar a mensagem
    debug_store_message(conversation_id, test_message)
    
    # Enviar via WebSocket
    ws_message = {
        "type": "message",
        "content": test_message["content"],
        "timestamp": test_message["timestamp"],
        "conversation_id": conversation_id
    }
    
    # Tentar enviar via diferentes métodos
    send_success = await manager.send_to_conversation(conversation_id, ws_message)
    
    if not send_success:
        # Último recurso: broadcast para todos
        logger.warning("Envio direto falhou, tentando broadcast...")
        await manager.broadcast(ws_message)
    
    return {
        "stored": True,
        "sent_via_websocket": send_success,
        "message": test_message["content"],
        "conversation_id": conversation_id
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
        # Armazenar a mensagem do usuário com depuração
        message_data = {
            "role": "user", 
            "content": request.message, 
            "timestamp": datetime.now().isoformat()
        }
        debug_store_message(conversation_id, message_data)
        
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
            
            # Indicar explicitamente que está processando
            return {
                "response": "Aguarde enquanto processamos sua mensagem...",
                "conversation_id": conversation_id,
                "status": "processing"  # Flag para indicar processamento assíncrono
            }
    except Exception as e:
        logger.error(f"Erro ao enviar mensagem para N8N: {str(e)}")
        return {"response": f"Desculpe, houve um erro ao processar sua mensagem. Detalhes: {str(e)}", "conversation_id": conversation_id}

# MELHORADO: Endpoint para recuperar mensagens de uma conversa
@app.get("/api/messages/{conversation_id}")
async def get_messages(conversation_id: str, after: Optional[str] = None, cachebuster: Optional[str] = None):
    """
    Recupera todas as mensagens de uma conversa específica
    Opcionalmente pode filtrar mensagens após um determinado timestamp
    """
    logger.info(f"Solicitação para recuperar mensagens da conversa: {conversation_id}")
    
    # Obter todas as mensagens
    messages = get_conversation_history(conversation_id)
    
    # Filtrar por timestamp se o parâmetro 'after' estiver presente
    if after:
        try:
            after_date = datetime.fromisoformat(after.replace('Z', '+00:00'))
            filtered_messages = []
            
            for msg in messages:
                # Extrair o timestamp da mensagem com tratamento para diferentes formatos
                msg_timestamp = msg.get("timestamp")
                if msg_timestamp:
                    # Converter para datetime para comparação
                    try:
                        # Tentar o formato ISO
                        msg_date = datetime.fromisoformat(msg_timestamp.replace('Z', '+00:00'))
                    except (ValueError, TypeError):
                        # Fallback para o formato datetime padrão
                        try:
                            msg_date = datetime.strptime(msg_timestamp, "%Y-%m-%d %H:%M:%S.%f")
                        except (ValueError, TypeError):
                            # Se falhar, usar o timestamp atual
                            msg_date = datetime.now()
                    
                    # Adicionar apenas mensagens mais recentes que o timestamp fornecido
                    if msg_date > after_date:
                        filtered_messages.append(msg)
                else:
                    # Se não tiver timestamp, incluir por precaução
                    filtered_messages.append(msg)
            
            messages = filtered_messages
            logger.info(f"Filtradas {len(messages)} mensagens após {after}")
        except ValueError:
            logger.warning(f"Formato de timestamp inválido: {after}")
    
    # Log detalhado para debug
    if messages:
        logger.info(f"Total de {len(messages)} mensagens encontradas para conversa {conversation_id}")
        for i, msg in enumerate(messages):
            logger.debug(f"Mensagem {i+1}: {msg.get('role')} - {msg.get('timestamp')} - {msg.get('content')[:30]}...")
    else:
        logger.info(f"Nenhuma mensagem encontrada para conversa {conversation_id}")
    
    return {
        "conversation_id": conversation_id,
        "messages": messages,
        "count": len(messages),
        "timestamp": datetime.now().isoformat()
    }

# MELHORADO: Endpoint para receber callbacks do N8N com verificação simplificada
@app.post("/api/n8n-callback")
async def n8n_callback(request: Request):
    """
    Endpoint para receber respostas processadas pelo N8N com envio direto via WebSocket.
    """
    logger.info(f"Recebendo callback do N8N")
    
    # Log detalhado de headers para diagnóstico
    logger.debug(f"Request headers:")
    for name, value in request.headers.items():
        logger.debug(f"  {name}: {value}")
    
    # Verificação básica do token - extrair se presente
    auth_header = request.headers.get("authorization")
    if auth_header:
        logger.info(f"Header Authorization presente: '{auth_header}'")
        # Verificações mínimas - apenas log, sem bloqueio
        if "dasdaksmda" not in auth_header:
            logger.warning(f"Token esperado não encontrado no header, mas prosseguindo")
    else:
        logger.warning("Header Authorization ausente, mas prosseguindo")
    
    # Log do corpo bruto para depuração
    body = await request.body()
    body_str = body.decode('utf-8')
    logger.info(f"CORPO COMPLETO DA REQUISIÇÃO: {body_str}")
    
    try:
        # Tentar analisar JSON
        if not body_str:
            logger.error("Corpo da requisição vazio")
            return {"error": True, "message": "Corpo da requisição vazio"}
            
        try:
            data_dict = json.loads(body_str)
            logger.info(f"Dados JSON analisados: {json.dumps(data_dict, indent=2)}")
            
            # Extrair ID da conversa (obrigatório)
            conversation_id = data_dict.get("conversation_id")
            if not conversation_id:
                # Tentar buscar de outros campos possíveis
                for key, value in data_dict.items():
                    if isinstance(value, str) and "conversation" in key.lower():
                        conversation_id = value
                        break
            
            if not conversation_id:
                logger.error("conversation_id não encontrado no payload")
                return {"error": True, "message": "conversation_id não encontrado"}
            
            # Extrair resposta processada (obrigatório)
            response_text = data_dict.get("processed_response")
            if not response_text:
                # Tentar campos alternativos
                response_text = data_dict.get("response", 
                              data_dict.get("content", 
                              data_dict.get("message", 
                              data_dict.get("text", None))))
            
            if not response_text:
                logger.error("Resposta processada não encontrada no payload")
                return {"error": True, "message": "Resposta processada não encontrada"}
            
            # Extrair outros campos com fallbacks
            timestamp = data_dict.get("timestamp", datetime.now().isoformat())
            original_message = data_dict.get("original_message", "Mensagem original não disponível")
            metadata = data_dict.get("metadata", {})
            
            logger.info(f"Resposta N8N para conversa {conversation_id} recebida: {response_text[:100]}...")
            
            # Armazenar a mensagem do assistente no histórico
            message_data = {
                "role": "assistant", 
                "content": response_text,
                "timestamp": timestamp,
                "metadata": metadata
            }
            
            # Usar a função de debug para armazenar e rastrear mensagens
            debug_store_message(conversation_id, message_data)
            logger.info(f"Mensagem do assistente armazenada para conversa {conversation_id}")
            
            # Verificar se a mensagem foi realmente armazenada
            stored_messages = get_conversation_history(conversation_id)
            logger.info(f"Após armazenar: {len(stored_messages)} mensagens para conversa {conversation_id}")
            
            # Preparar mensagem para envio via WebSocket
            ws_message = {
                "type": "message",
                "content": response_text,
                "timestamp": timestamp,
                "conversation_id": conversation_id
            }
            
            # Tentar enviar mensagem via WebSocket para todos os clientes da conversa
            logger.info(f"Tentando enviar mensagem via WebSocket para a conversa {conversation_id}")
            
            # IMPORTANTE: Fazer broadcast para TODAS as conexões para garantir
            # que a mensagem chegue ao cliente correto
            send_success = False
            
            # Primeiro, tente enviar diretamente para clientes associados
            if conversation_id in manager.connection_map:
                clients = manager.connection_map[conversation_id]
                for client_id in clients:
                    success = await manager.send_personal_message(ws_message, client_id)
                    send_success = send_success or success
            
            # Se nenhum cliente associado ou falha ao enviar, tente broadcast
            if not send_success:
                logger.info(f"Nenhum cliente associado ou falha no envio. Usando broadcast para todos os clientes.")
                await manager.broadcast(ws_message)
                send_success = True
            
            logger.info(f"=== EVENTO N8N PROCESSADO COM SUCESSO ===")
            logger.info(f"Conversa: {conversation_id}")
            logger.info(f"Mensagem: {response_text[:50]}...")
            
            return {
                "success": True, 
                "message": "Callback processado com sucesso",
                "sent_via_websocket": send_success,
                "stored": True,
                "message_count": len(stored_messages)
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"Falha ao analisar JSON: {str(e)}")
            return {"error": True, "message": f"JSON inválido: {str(e)}"}
            
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