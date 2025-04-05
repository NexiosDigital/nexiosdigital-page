import os
import secrets
from typing import Optional, List
import logging
from fastapi import Header, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

logger = logging.getLogger(__name__)

# Recuperar e validar variáveis de ambiente importantes
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    if ENVIRONMENT == "production":
        logger.error("SECRET_KEY não está configurada em ambiente de produção!")
    else:
        # Gerar uma chave secreta aleatória para desenvolvimento
        SECRET_KEY = secrets.token_hex(32)
        logger.warning(f"SECRET_KEY não configurada; usando uma chave gerada aleatoriamente para desenvolvimento: {SECRET_KEY[:10]}...")

# Token para autenticação do N8N
N8N_API_TOKEN = os.getenv("N8N_API_TOKEN")
if not N8N_API_TOKEN:
    if ENVIRONMENT == "production":
        logger.error("N8N_API_TOKEN não está configurado em ambiente de produção!")
    else:
        # Usar um token padrão para desenvolvimento, mas avisar que isto é inseguro
        N8N_API_TOKEN = "dev_token_insecure"
        logger.warning(f"N8N_API_TOKEN não configurado; usando um token de desenvolvimento inseguro. Não use em produção!")

# Configuração de CORS
def get_allowed_origins() -> List[str]:
    """Retorna a lista de origens permitidas para CORS com base no ambiente"""
    # Em produção, restringir as origens
    if ENVIRONMENT == "production":
        origins = [
            "https://nexiosdigital.com",
            "https://www.nexiosdigital.com",
            "https://app.nexiosdigital.com"
        ]
        # Adicionar origens personalizadas da variável de ambiente se definida
        custom_origins = os.getenv("ALLOWED_ORIGINS")
        if custom_origins:
            origins.extend([origin.strip() for origin in custom_origins.split(",")])
        return origins
    
    # Em desenvolvimento, permitir todas as origens
    return ["*"]

# Esquema de autenticação Bearer
security = HTTPBearer(auto_error=False)

async def verify_n8n_token(
    authorization: Optional[str] = Header(None), 
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> str:
    """
    Verifica o token de autorização para endpoints de callback do N8N
    
    Args:
        authorization: Header Authorization direto
        credentials: Credenciais extraídas do esquema HTTPBearer
        
    Returns:
        str: Token validado
        
    Raises:
        HTTPException: Se o token for inválido ou ausente
    """
    logger.debug(f"Verificando token de autorização: {authorization}")
    
    # Extrair token de diferentes fontes possíveis
    token = None
    
    # Tentar extrair do esquema bearer primeiro
    if credentials:
        token = credentials.credentials
    
    # Se não encontrado, tentar extrair do header diretamente
    elif authorization:
        if authorization.lower().startswith("bearer "):
            token = authorization.split(" ")[1]
        else:
            # Se não estiver no formato Bearer, usar o header completo
            token = authorization
    
    # Verificar se o token está presente
    if not token:
        logger.error("Token de autorização ausente")
        if ENVIRONMENT == "production":
            raise HTTPException(status_code=401, detail="Token de autorização ausente")
        else:
            logger.warning("Autenticação falhou, mas permitindo em ambiente de desenvolvimento")
            return "dev_mode"
    
    # Verificar se o token é válido
    if token == N8N_API_TOKEN:
        return token
    
    # Em desenvolvimento, ser mais permissivo
    if ENVIRONMENT != "production" and (token == "dev_mode" or token == "dev_token_insecure"):
        logger.warning("Usando token de desenvolvimento. Isso é inseguro para produção!")
        return token
        
    # Token inválido
    logger.error(f"Token inválido: '{token}'")
    raise HTTPException(status_code=401, detail="Token de autorização inválido")

# Função para verificar limites de taxa
def get_rate_limit_key(request: Request) -> str:
    """
    Determina a chave para o limite de taxa
    Por padrão usa o endereço IP, mas pode ser estendido para usar tokens de API ou outros identificadores
    """
    # Se tivermos autenticação de usuário no futuro, podemos usar o ID do usuário
    # Por enquanto, usamos o IP
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        # Pegar o primeiro IP em caso de proxy chain
        ip = forwarded.split(",")[0].strip()
    else:
        ip = request.client.host
    return ip