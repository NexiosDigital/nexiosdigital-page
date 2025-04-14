from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime
from uuid import UUID, uuid4
import hashlib
import secrets

# Tipos de planos disponíveis para clientes
class PlanType(str, Enum):
    FREE = "free"
    BASIC = "basic"
    STANDARD = "standard"
    PREMIUM = "premium"

# Níveis de permissão para usuários
class UserRole(str, Enum):
    ADMIN = "admin"           # Acesso total
    MANAGER = "manager"       # Gerente de conta (visualização e edição parcial)
    USER = "user"             # Usuário regular (apenas visualização)
    VIEWER = "viewer"         # Visualizador (acesso limitado)

# Modelo para representar um cliente (empresa)
class Client(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str
    logo_url: Optional[str] = None
    plan: PlanType = PlanType.BASIC
    active: bool = True
    max_users: int = 5
    max_automations: int = 10
    features: Dict[str, bool] = {}
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    metadata: Dict[str, Any] = {}

    class Config:
        schema_extra = {
            "example": {
                "name": "Acme Inc.",
                "logo_url": "https://example.com/logo.png",
                "plan": "standard",
                "active": True,
                "max_users": 10,
                "max_automations": 25,
                "features": {
                    "webhooks": True,
                    "advanced_reporting": True,
                    "custom_branding": False
                }
            }
        }

# Modelo para cadastro de usuário
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    client_id: UUID
    role: UserRole = UserRole.USER

    class Config:
        schema_extra = {
            "example": {
                "email": "usuario@empresa.com",
                "password": "senha_segura_123",
                "name": "João Silva",
                "client_id": "123e4567-e89b-12d3-a456-426614174000",
                "role": "user"
            }
        }

# Modelo de usuário armazenado no banco
class UserInDB(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    email: EmailStr
    hashed_password: str
    name: str
    client_id: UUID
    role: UserRole
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    last_login: Optional[datetime] = None
    preferences: Dict[str, Any] = {}

    @classmethod
    def from_user_create(cls, user_create: UserCreate, hashed_password: str):
        return cls(
            email=user_create.email,
            hashed_password=hashed_password,
            name=user_create.name,
            client_id=user_create.client_id,
            role=user_create.role
        )

# Modelo de usuário retornado pela API (sem senha)
class User(BaseModel):
    id: UUID
    email: EmailStr
    name: str
    client_id: UUID
    role: UserRole
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    preferences: Dict[str, Any] = {}

    @classmethod
    def from_user_in_db(cls, user_db: UserInDB):
        return cls(
            id=user_db.id,
            email=user_db.email,
            name=user_db.name,
            client_id=user_db.client_id,
            role=user_db.role,
            is_active=user_db.is_active,
            created_at=user_db.created_at,
            last_login=user_db.last_login,
            preferences=user_db.preferences
        )

# Modelo para login de usuário
class UserLogin(BaseModel):
    email: EmailStr
    password: str

    class Config:
        schema_extra = {
            "example": {
                "email": "usuario@empresa.com",
                "password": "senha_segura_123"
            }
        }

# Modelo para resposta de token
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 3600  # 1 hora em segundos
    refresh_token: Optional[str] = None
    user: User

# Modelo para dados contidos no token JWT
class TokenData(BaseModel):
    sub: str  # email do usuário
    exp: int  # timestamp de expiração
    client_id: str
    role: str
    jti: str  # identificador único do token

# Modelo para atualização de usuário
class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    preferences: Optional[Dict[str, Any]] = None

# Modelo para atualização de cliente
class ClientUpdate(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[str] = None
    plan: Optional[PlanType] = None
    active: Optional[bool] = None
    max_users: Optional[int] = None
    max_automations: Optional[int] = None
    features: Optional[Dict[str, bool]] = None
    metadata: Optional[Dict[str, Any]] = None

# Utilidades para hash de senha
class PasswordUtils:
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Gera um hash seguro para a senha usando algoritmo atual (SHA-256)"""
        salt = secrets.token_hex(16)
        hash_obj = hashlib.sha256((password + salt).encode())
        return f"{salt}${hash_obj.hexdigest()}"
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verifica se a senha corresponde ao hash armazenado"""
        if "$" not in hashed_password:
            return False
        
        salt, hash_value = hashed_password.split("$", 1)
        hash_obj = hashlib.sha256((plain_password + salt).encode())
        return hash_obj.hexdigest() == hash_value