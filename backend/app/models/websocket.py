from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime

class WebSocketMessage(BaseModel):
    """Modelo para mensagens trocadas via WebSocket"""
    type: str
    content: Optional[str] = None
    conversation_id: Optional[str] = None
    timestamp: Optional[str] = None
    messages: Optional[List[Dict[str, Any]]] = None
    status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class WebSocketCommand(BaseModel):
    """Modelo para comandos enviados pelo cliente via WebSocket"""
    command: str
    conversation_id: Optional[str] = None
    client_id: Optional[str] = None
    data: Optional[Dict[str, Any]] = None