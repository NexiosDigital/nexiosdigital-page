from fastapi import FastAPI, Request, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import logging
import time
from typing import List, Dict, Any, Callable
import importlib
from pathlib import Path

# Configuração de logging
logging.basicConfig(
    level=logging.INFO if os.getenv("ENVIRONMENT") != "development" else logging.DEBUG, 
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Importação dos módulos refatorados
from app.core.security import get_allowed_origins
from app.api import chat_router, n8n_router, conversation_router, websocket_router, status_router

# Configuração opcional de rate limiting
try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address
    from slowapi.middleware import SlowAPIMiddleware
    from slowapi.errors import RateLimitExceeded
    
    limiter = Limiter(key_func=get_remote_address)
    RATE_LIMITING_ENABLED = True
    logger.info("Rate limiting ativado com sucesso")
except ImportError:
    RATE_LIMITING_ENABLED = False
    logger.warning("Rate limiting não disponível. Instale o pacote 'slowapi' para habilitar.")

# Configuração da aplicação
app = FastAPI(
    title="Nexios Digital API",
    description="API da plataforma Nexios Digital para assistente virtual e integração com N8N",
    version="1.0.0"
)

# Adicionar middleware de CORS com base no ambiente
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Adicionar middleware de rate limiting se habilitado
if RATE_LIMITING_ENABLED:
    app.state.limiter = limiter
    app.add_middleware(SlowAPIMiddleware)
    
    @app.exception_handler(RateLimitExceeded)
    async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
        return JSONResponse(
            status_code=429,
            content={
                "error": "Too many requests",
                "detail": "Limite de requisições excedido. Tente novamente mais tarde."
            }
        )

# Middleware para monitoramento de performance
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    
    # Tratamento de erros global para aumentar a robustez
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        
        # Registrar tempo de processamento apenas para requisições lentas ou em modo debug
        if process_time > 1.0 or os.getenv("ENVIRONMENT") == "development":
            logger.info(f"Processamento: {request.method} {request.url.path} - {process_time:.4f}s")
        
        return response
        
    except Exception as e:
        logger.error(f"Erro não tratado em requisição {request.method} {request.url.path}: {str(e)}", exc_info=True)
        process_time = time.time() - start_time
        
        # Retornar resposta de erro limpa
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal Server Error",
                "detail": str(e) if os.getenv("ENVIRONMENT") == "development" else "Ocorreu um erro interno no servidor."
            },
            headers={"X-Process-Time": str(process_time)}
        )

# Evento de inicialização
@app.on_event("startup")
async def startup_event():
    logger.info("=== SERVIDOR INICIADO ===")
    logger.info(f"Ambiente: {os.getenv('ENVIRONMENT', 'development')}")
    logger.info(f"Rate limiting: {'Ativado' if RATE_LIMITING_ENABLED else 'Desativado'}")
    logger.info(f"WebSocket ativo: Sim")
    logger.info("========================")

# Evento de encerramento
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("=== SERVIDOR ENCERRADO ===")
    # Adicionar limpeza de recursos aqui se necessário

# Completar a função de listar rotas no router de status
async def list_routes_impl():
    """Implementação da listagem de rotas, acessando o objeto app"""
    routes = []
    
    for route in app.routes:
        if hasattr(route, "methods") and hasattr(route, "path"):
            route_info = {
                "path": route.path,
                "name": route.name,
                "methods": list(route.methods) if route.methods else []
            }
            routes.append(route_info)
    
    return {
        "routes": routes,
        "count": len(routes),
        "base_url": "/api"
    }

# Injetar a implementação no router de status
status_router.router.get("/routes")(list_routes_impl)

# Incluir todos os routers
app.include_router(status_router.router)
app.include_router(chat_router.router)
app.include_router(n8n_router.router)
app.include_router(conversation_router.router)
app.include_router(websocket_router.router)

# Redirecionar / para /api
@app.get("/")
async def root():
    """Redirecionamento para API root"""
    return {
        "message": "Nexios Digital API está online",
        "endpoints": {
            "status": "/api/status",
            "chat": "/api/chat-n8n",
            "websocket": "/ws/{client_id}"
        },
        "documentation": "/docs"
    }

# Se este arquivo for executado diretamente, inicie o servidor
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("ENVIRONMENT") == "development"
    )