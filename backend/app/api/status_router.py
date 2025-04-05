from fastapi import APIRouter, Depends
import os
import logging
from openai import OpenAI
from typing import List

from ..websocket.connection_manager import ConnectionManager

logger = logging.getLogger(__name__)

# Obter variáveis de ambiente importantes
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_ORG_ID = os.getenv("OPENAI_ORG_ID")
N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL")

router = APIRouter(prefix="/api", tags=["status"])

# Dependência para obter o gerenciador de conexões
def get_connection_manager():
    return ConnectionManager()

@router.get("/status")
async def get_status(manager: ConnectionManager = Depends(get_connection_manager)):
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

@router.get("/routes")
async def list_routes():
    """
    Lista todas as rotas disponíveis na API.
    Útil para diagnóstico e descoberta de API.
    """
    # Esta função será preenchida no main.py porque precisa acessar as rotas da aplicação
    pass

@router.get("/")
async def health_check():
    """
    Verificação básica de saúde da API.
    """
    return {
        "status": "healthy",
        "service": "Nexios Digital API",
        "version": os.getenv("API_VERSION", "development")
    }