from typing import List, Dict, Any, Optional
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class ConversationRepository:
    """
    Repositório responsável pelo armazenamento e recuperação de conversas.
    Implementação atual usa armazenamento em memória, mas pode ser substituída por
    qualquer outra implementação (Supabase, MongoDB, etc.)
    """
    
    _instance = None
    
    # Implementação de Singleton para garantir um único armazenamento
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ConversationRepository, cls).__new__(cls)
            cls._instance._store = {}
        return cls._instance
    
    async def store_message(self, conversation_id: str, message: Dict[str, Any]) -> bool:
        """
        Armazena uma mensagem em uma conversa
        
        Args:
            conversation_id: ID da conversa
            message: Mensagem a ser armazenada (dict com role, content, etc.)
            
        Returns:
            bool: Indica se a operação foi bem-sucedida
        """
        logger.info(f"Armazenando mensagem para conversa: {conversation_id}")
        
        # Garantir que a conversa existe no armazenamento
        if conversation_id not in self._store:
            self._store[conversation_id] = []
            logger.info(f"Criando nova entrada para conversa {conversation_id}")
        
        # Adicionar timestamp se não existir
        if "timestamp" not in message:
            message["timestamp"] = datetime.now().isoformat()
        
        # Verificar se a mensagem já existe para evitar duplicação
        message_exists = False
        for existing_msg in self._store[conversation_id]:
            if (existing_msg.get("role") == message.get("role") and 
                existing_msg.get("content") == message.get("content")):
                message_exists = True
                logger.info(f"Mensagem duplicada detectada, ignorando")
                break
        
        # Armazenar apenas se não for duplicada
        if not message_exists:
            self._store[conversation_id].append(message)
            # Limitar o tamanho do histórico, se necessário
            if len(self._store[conversation_id]) > 50:
                self._store[conversation_id] = self._store[conversation_id][-50:]
            
            logger.info(f"Mensagem armazenada com sucesso. Total na conversa: {len(self._store[conversation_id])}")
            return True
        
        return False
    
    async def get_messages(self, conversation_id: str, after_timestamp: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Recupera mensagens de uma conversa
        
        Args:
            conversation_id: ID da conversa
            after_timestamp: Se fornecido, retorna apenas mensagens posteriores a este timestamp
            
        Returns:
            List[Dict]: Lista de mensagens
        """
        messages = self._store.get(conversation_id, [])
        
        # Filtrar por timestamp se o parâmetro 'after_timestamp' estiver presente
        if after_timestamp:
            try:
                after_date = datetime.fromisoformat(after_timestamp.replace('Z', '+00:00'))
                filtered_messages = []
                
                for msg in messages:
                    # Extrair o timestamp da mensagem com tratamento para diferentes formatos
                    msg_timestamp = msg.get("timestamp")
                    if msg_timestamp:
                        # Converter para datetime para comparação
                        try:
                            # Tentar o formato ISO
                            msg_date = datetime.fromisoformat(msg_timestamp.replace('Z', '+00:00'))
                        except (ValueError, TypeError):
                            # Fallback para o formato datetime padrão
                            try:
                                msg_date = datetime.strptime(msg_timestamp, "%Y-%m-%d %H:%M:%S.%f")
                            except (ValueError, TypeError):
                                # Se falhar, usar o timestamp atual
                                msg_date = datetime.now()
                        
                        # Adicionar apenas mensagens mais recentes que o timestamp fornecido
                        if msg_date > after_date:
                            filtered_messages.append(msg)
                    else:
                        # Se não tiver timestamp, incluir por precaução
                        filtered_messages.append(msg)
                
                return filtered_messages
            except ValueError:
                logger.warning(f"Formato de timestamp inválido: {after_timestamp}")
        
        return messages
    
    async def get_all_conversations(self) -> Dict[str, int]:
        """
        Retorna todas as conversas e o número de mensagens em cada uma
        
        Returns:
            Dict[str, int]: Dicionário com IDs de conversa e contagem de mensagens
        """
        result = {}
        for conv_id, messages in self._store.items():
            result[conv_id] = len(messages)
        return result
        
    async def clear_conversation(self, conversation_id: str) -> bool:
        """
        Limpa todas as mensagens de uma conversa
        
        Args:
            conversation_id: ID da conversa
            
        Returns:
            bool: Indica se a operação foi bem-sucedida
        """
        if conversation_id in self._store:
            self._store[conversation_id] = []
            logger.info(f"Conversa {conversation_id} limpa com sucesso")
            return True
        return False