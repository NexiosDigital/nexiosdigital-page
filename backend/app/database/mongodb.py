import os
import motor.motor_asyncio
from typing import Optional
import logging

logger = logging.getLogger(__name__)

_MONGO_CLIENT = None
_DB = None

async def get_database():
    global _MONGO_CLIENT, _DB
    
    if _DB is None:
        mongo_url = os.getenv("MONGODB_URL", "mongodb://mongo:27017")
        db_name = os.getenv("MONGODB_DB", "nexios")
        
        try:
            # Criar cliente MongoDB
            _MONGO_CLIENT = motor.motor_asyncio.AsyncIOMotorClient(mongo_url)
            _DB = _MONGO_CLIENT[db_name]
            
            logger.info(f"Connected to MongoDB at {mongo_url}, database: {db_name}")
            
            # Verificar se a conexão está ativa
            await _MONGO_CLIENT.admin.command('ping')
            
            # Criar índices se necessário
            await _DB.conversations.create_index("conversation_id", unique=True)
            
        except Exception as e:
            logger.error(f"Error connecting to MongoDB: {str(e)}")
            # Em desenvolvimento, podemos prosseguir mesmo sem o banco
            if os.getenv("ENVIRONMENT", "development") == "production":
                raise e
    
    return _DB