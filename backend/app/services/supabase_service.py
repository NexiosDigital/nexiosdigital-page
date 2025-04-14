from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import os
import uuid
import logging

from ..models.user import TokenData, User, UserRole
from ..repositories.user_repository import UserRepository

# Configurações
SECRET_KEY = os.getenv("SECRET_KEY", "seu_secret_key_deve_ser_alterado_em_producao")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 horas

# Inicialização de helpers
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")
logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self, user_repository: UserRepository = None):
        self.user_repository = user_repository or UserRepository()
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verifica se a senha em texto plano corresponde ao hash."""
        return pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """Gera um hash da senha em texto plano."""
        return pwd_context.hash(password)
    
    async def authenticate_user(self, username: str, password: str) -> Optional[User]:
        """Autentica um usuário verificando suas credenciais."""
        user = await self.user_repository.get_by_username(username)
        if not user:
            return None
        if not self.verify_password(password, user.hashed_password):
            return None
        return user
    
    def create_access_token(self, user_id: uuid.UUID, role: UserRole) -> str:
        """Cria um token JWT com os dados do usuário."""
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode = {"sub": str(user_id), "role": role, "exp": expire}
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    async def get_current_user(self, token: str = Depends(oauth2_scheme)) -> User:
        """Obtém o usuário atual a partir do token JWT."""
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id: str = payload.get("sub")
            role: str = payload.get("role")
            exp: datetime = datetime.fromtimestamp(payload.get("exp"))
            
            if user_id is None or role is None or exp < datetime.utcnow():
                raise credentials_exception
                
            token_data = TokenData(user_id=uuid.UUID(user_id), role=role, exp=exp)
        except JWTError:
            logger.exception("Erro ao decodificar token JWT")
            raise credentials_exception
            
        user = await self.user_repository.get_by_id(token_data.user_id)
        if user is None:
            raise credentials_exception
            
        return user
    
    async def get_current_active_user(self, current_user: User = Depends(get_current_user)) -> User:
        """Verifica se o usuário atual está ativo."""
        if current_user.status != "active":
            raise HTTPException(status_code=400, detail="Usuário inativo")
        return current_user