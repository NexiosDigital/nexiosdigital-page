from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import Optional, List
import uuid
from datetime import datetime
import logging

from ..models.chat import ChatRequest, ChatResponse, AdvancedChatRequest, ChatMessage
from ..services.openai_service import OpenAIService
from ..database.mongodb import get_database

router = APIRouter(prefix="/api", tags=["chat"])
logger = logging.getLogger(__name__)

# Dependência para obter o serviço OpenAI
def get_openai_service():
    return OpenAIService()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, openai_service: OpenAIService = Depends(get_openai_service)):
    """
    Endpoint simples de chat que usa a API OpenAI diretamente.
    """
    logger.info(f"Receiving message: {request.message}")
    
    # Preparar mensagens para a API
    messages = []
    
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
    
    # Obter resposta do modelo
    ai_response = openai_service.get_completion(messages)
    
    return ChatResponse(response=ai_response)

@router.post("/advanced-chat", response_model=ChatResponse)
async def advanced_chat(
    request: AdvancedChatRequest, 
    background_tasks: BackgroundTasks,
    openai_service: OpenAIService = Depends(get_openai_service),
    db = Depends(get_database)
):
    """
    Endpoint avançado de chat com personalização e persistência
    """
    try:
        # Verificar se existe uma conversa
        conversation_id = request.conversation_id
        conversation = None
        
        if conversation_id:
            # Buscar conversa existente
            conversation = await db.conversations.find_one({"conversation_id": conversation_id})
            
            if not conversation:
                # Se o ID não for encontrado, criamos uma nova conversa
                conversation_id = str(uuid.uuid4())
                logger.info(f"Creating new conversation with ID: {conversation_id}")
                conversation = {
                    "conversation_id": conversation_id,
                    "created_at": datetime.now(),
                    "messages": []
                }
        else:
            # Criar nova conversa
            conversation_id = str(uuid.uuid4())
            logger.info(f"Creating new conversation with ID: {conversation_id}")
            conversation = {
                "conversation_id": conversation_id,
                "created_at": datetime.now(),
                "messages": []
            }
        
        # Preparar mensagens para a API
        messages = []
        
        # Sistema personalizado baseado no contexto (se fornecido)
        custom_system_message = None
        if request.context:
            custom_system_message = f"{openai_service.default_system_context}\n\nContexto adicional: {request.context}"
        
        # Processar histórico da conversa
        if conversation and "messages" in conversation:
            for msg in conversation["messages"]:
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
        elif request.conversation_history:
            for message in request.conversation_history:
                messages.append({
                    "role": message.role,
                    "content": message.content
                })
        
        # Adicionar a mensagem atual do usuário
        user_message = {
            "role": "user",
            "content": request.message
        }
        messages.append(user_message)
        
        # Obter resposta do modelo
        ai_response = openai_service.get_completion(
            messages, 
            custom_system_message=custom_system_message
        )
        
        # Preparar mensagens para salvar no banco
        user_message_db = {
            "role": "user",
            "content": request.message,
            "timestamp": datetime.now()
        }
        
        ai_message_db = {
            "role": "assistant",
            "content": ai_response,
            "timestamp": datetime.now()
        }
        
        # Atualizar a conversa no banco de dados em background
        async def update_conversation():
            if conversation:
                # Atualizar mensagens
                if "messages" not in conversation:
                    conversation["messages"] = []
                    
                conversation["messages"].append(user_message_db)
                conversation["messages"].append(ai_message_db)
                conversation["updated_at"] = datetime.now()
                
                # Salvar ou atualizar no banco
                if "_id" in conversation:
                    await db.conversations.update_one(
                        {"_id": conversation["_id"]},
                        {"$set": {
                            "messages": conversation["messages"],
                            "updated_at": conversation["updated_at"]
                        }}
                    )
                else:
                    await db.conversations.insert_one(conversation)
        
        background_tasks.add_task(update_conversation)
        
        return ChatResponse(
            response=ai_response,
            conversation_id=conversation_id
        )
    
    except Exception as e:
        logger.error(f"Error in advanced chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str, db = Depends(get_database)):
    """
    Recupera uma conversa completa pelo ID
    """
    conversation = await db.conversations.find_one({"conversation_id": conversation_id})
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Converter ObjectId para string para serialização
    conversation["_id"] = str(conversation["_id"])
    return conversation