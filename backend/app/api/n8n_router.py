from fastapi import APIRouter, Request, Depends, BackgroundTasks
from typing import Optional, Dict, Any
import os
import json
import logging
import httpx
import uuid
from datetime import datetime

from ..models.chat import ChatRequest, ChatResponse
from ..repositories.conversation_repository import ConversationRepository
from ..websocket.connection_manager import ConnectionManager
from ..core.security import verify_n8n_token

logger = logging.getLogger(__name__)

# Obter as variáveis de ambiente
N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL")
if not N8N_WEBHOOK_URL:
    logger.warning("N8N_WEBHOOK_URL não está configurada no ambiente")
    # Use a URL padrão do webhook se não estiver definida
    N8N_WEBHOOK_URL = "https://webhook.nexiosdigital.com/webhook/nexios-chat-processor"
    logger.warning(f"Usando URL padrão para webhook N8N: {N8N_WEBHOOK_URL}")

# Criar o router
router = APIRouter(prefix="/api", tags=["n8n"])

# Dependências
def get_connection_manager():
    return ConnectionManager()

def get_conversation_repository():
    return ConversationRepository()

# Endpoint para enviar mensagens para o N8N
@router.post("/chat-n8n", response_model=ChatResponse)
async def chat_n8n(
    request: ChatRequest,
    repo: ConversationRepository = Depends(get_conversation_repository)
):
    """
    Endpoint que envia mensagens para processamento no N8N.
    """
    logger.info(f"Recebendo mensagem para envio ao N8N: {request.message}")
    
    # Gerar ou usar ID de conversa
    conversation_id = request.conversation_id or str(uuid.uuid4())
    logger.info(f"Usando conversation_id: {conversation_id}")
    
    # Verificar se a URL do webhook está configurada
    if not N8N_WEBHOOK_URL:
        logger.error("Erro: URL do webhook N8N não configurada")
        return ChatResponse(
            response="O sistema de IA não está configurado. Por favor, contate o administrador.", 
            conversation_id=conversation_id
        )
    
    try:
        # Armazenar a mensagem do usuário
        message_data = {
            "role": "user", 
            "content": request.message, 
            "timestamp": datetime.now().isoformat()
        }
        await repo.store_message(conversation_id, message_data)
        
        # Preparar dados para enviar ao N8N
        n8n_data = {
            "message": request.message,
            "conversation_id": conversation_id,
            "timestamp": datetime.now().isoformat(),
            "conversation_history": [
                {"role": msg.role, "content": msg.content} 
                for msg in request.conversation_history
            ] if request.conversation_history else []
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
            return ChatResponse(
                response="Aguarde enquanto processamos sua mensagem...",
                conversation_id=conversation_id,
                status="processing"  # Flag para indicar processamento assíncrono
            )
    except Exception as e:
        logger.error(f"Erro ao enviar mensagem para N8N: {str(e)}")
        return ChatResponse(
            response=f"Desculpe, houve um erro ao processar sua mensagem. Detalhes: {str(e)}", 
            conversation_id=conversation_id
        )

# Endpoint para receber callbacks do N8N
@router.post("/n8n-callback")
async def n8n_callback(
    request: Request,
    background_tasks: BackgroundTasks,
    token: str = Depends(verify_n8n_token),
    repo: ConversationRepository = Depends(get_conversation_repository),
    manager: ConnectionManager = Depends(get_connection_manager)
):
    """
    Endpoint para receber respostas processadas pelo N8N com envio direto via WebSocket.
    """
    logger.info(f"Recebendo callback do N8N")
    
    # Log detalhado de headers para diagnóstico
    logger.debug(f"Request headers:")
    for name, value in request.headers.items():
        logger.debug(f"  {name}: {value}")
    
    # Log do corpo bruto para depuração
    body = await request.body()
    body_str = body.decode('utf-8')
    logger.debug(f"CORPO COMPLETO DA REQUISIÇÃO: {body_str}")
    
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
            
            # Usar background task para armazenamento assíncrono
            background_tasks.add_task(repo.store_message, conversation_id, message_data)
            
            # Preparar mensagem para envio via WebSocket
            ws_message = {
                "type": "message",
                "content": response_text,
                "timestamp": timestamp,
                "conversation_id": conversation_id
            }
            
            # Tentar enviar mensagem via WebSocket para todos os clientes da conversa
            logger.info(f"Tentando enviar mensagem via WebSocket para a conversa {conversation_id}")
            
            # Primeiro, tente enviar diretamente para clientes associados
            # Usando background_tasks para não bloquear a resposta HTTP
            async def send_ws_message():
                send_success = await manager.send_to_conversation(conversation_id, ws_message)
                
                # Se falhar, tente broadcast como último recurso
                if not send_success:
                    logger.info(f"Nenhum cliente associado ou falha no envio. Usando broadcast para todos os clientes.")
                    await manager.broadcast(ws_message)
            
            background_tasks.add_task(send_ws_message)
            
            logger.info(f"=== EVENTO N8N PROCESSADO COM SUCESSO ===")
            logger.info(f"Conversa: {conversation_id}")
            logger.info(f"Mensagem: {response_text[:50]}...")
            
            return {
                "success": True, 
                "message": "Callback processado com sucesso",
                "sent_via_websocket": True,
                "stored": True,
                "conversation_id": conversation_id
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"Falha ao analisar JSON: {str(e)}")
            return {"error": True, "message": f"JSON inválido: {str(e)}"}
            
    except Exception as e:
        logger.error(f"Erro ao processar callback do N8N: {str(e)}", exc_info=True)
        return {"error": True, "message": str(e)}

# Endpoint de teste para simular uma mensagem N8N (útil para desenvolvimento)
@router.get("/test-n8n/{conversation_id}")
async def test_n8n(
    conversation_id: str, 
    message: Optional[str] = None,
    repo: ConversationRepository = Depends(get_conversation_repository),
    manager: ConnectionManager = Depends(get_connection_manager)
):
    """
    Endpoint para simular manualmente um callback do N8N
    """
    if os.getenv("ENVIRONMENT") == "production":
        return {"error": True, "message": "Endpoint de teste desativado em produção"}
    
    logger.info(f"Teste manual de resposta N8N para conversa {conversation_id}")
    
    # Criar uma mensagem teste
    test_content = message or f"Esta é uma mensagem de teste gerada em {datetime.now().isoformat()}. Se você está vendo isto, o fluxo está funcionando!"
    
    test_message = {
        "role": "assistant", 
        "content": test_content,
        "timestamp": datetime.now().isoformat()
    }
    
    # Armazenar a mensagem
    await repo.store_message(conversation_id, test_message)
    
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
        send_success = True
    
    return {
        "stored": True,
        "sent_via_websocket": send_success,
        "message": test_message["content"],
        "conversation_id": conversation_id
    }