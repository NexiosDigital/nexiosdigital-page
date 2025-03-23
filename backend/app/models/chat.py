from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID, uuid4

class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: Optional[datetime] = Field(default_factory=datetime.now)

class Conversation(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    messages: List[ChatMessage] = []
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    metadata: Optional[Dict[str, Any]] = {}

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    conversation_history: Optional[List[ChatMessage]] = []

class AdvancedChatRequest(ChatRequest):
    context: Optional[str] = None
    user_info: Optional[Dict[str, Any]] = {}

class ChatResponse(BaseModel):
    response: str
    conversation_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}