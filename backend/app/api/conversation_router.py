from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
import logging
from datetime import datetime

from ..repositories.conversation_repository import ConversationRepository

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["conversations"])

# Dependência para obter o repositório
def get_conversation_repository():
    return ConversationRepository()

@router.get("/messages/{conversation_id}")
async def get_messages(
    conversation_id: str, 
    after: Optional[str] = None, 
    cachebuster: Optional[str] = None,
    repo: ConversationRepository = Depends(get_conversation_repository)
):
    """
    Recupera todas as mensagens de uma conversa específica
    Opcionalmente pode filtrar mensagens após um determinado timestamp
    """
    logger.info(f"Solicitação para recuperar mensagens da conversa: {conversation_id}")
    
    # Obter mensagens do repositório
    messages = await repo.get_messages(conversation_id, after)
    
    # Log detalhado para debug
    if messages:
        logger.info(f"Total de {len(messages)} mensagens encontradas para conversa {conversation_id}")
        for i, msg in enumerate(messages):
            logger.debug(f"Mensagem {i+1}: {msg.get('role')} - {msg.get('timestamp')} - {msg.get('content', '')[:30]}...")
    else:
        logger.info(f"Nenhuma mensagem encontrada para conversa {conversation_id}")
    
    return {
        "conversation_id": conversation_id,
        "messages": messages,
        "count": len(messages),
        "timestamp": datetime.now().isoformat()
    }

@router.get("/debug/conversations")
async def debug_conversations(
    repo: ConversationRepository = Depends(get_conversation_repository)
):
    """Endpoint de debug para listar todas as conversas e o número de mensagens"""
    return await repo.get_all_conversations()

@router.get("/debug/conversation/{conversation_id}")
async def debug_conversation(
    conversation_id: str,
    repo: ConversationRepository = Depends(get_conversation_repository)
):
    """Endpoint de debug para ver as mensagens de uma conversa específica"""
    messages = await repo.get_messages(conversation_id)
    if messages:
        return {
            "conversation_id": conversation_id,
            "message_count": len(messages),
            "messages": messages
        }
    return {"error": "Conversa não encontrada"}

@router.delete("/conversation/{conversation_id}")
async def clear_conversation(
    conversation_id: str,
    repo: ConversationRepository = Depends(get_conversation_repository)
):
    """
    Limpa todas as mensagens de uma conversa específica
    """
    success = await repo.clear_conversation(conversation_id)
    if success:
        return {"status": "success", "message": f"Conversa {conversation_id} limpa com sucesso"}
    else:
        raise HTTPException(status_code=404, detail=f"Conversa {conversation_id} não encontrada")