import logging
from typing import Dict, List, Set
from fastapi import WebSocket, WebSocketDisconnect
import json
from datetime import datetime

logger = logging.getLogger(__name__)

class ConnectionManager:
    """
    Gerenciador de conexões WebSocket para comunicação em tempo real.
    """
    
    def __init__(self):
        # Lista de conexões ativas
        self.active_connections: List[WebSocket] = []
        
        # Mapeamento de client_id para WebSocket
        self.client_connections: Dict[str, WebSocket] = {}
        
        # Mapeamento de conversation_id para lista de client_ids
        self.conversation_clients: Dict[str, Set[str]] = {}
        
        # Mapeamento reverso de client_id para conversation_id
        self.client_conversations: Dict[str, str] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        """
        Aceitar nova conexão WebSocket e registrar o cliente.
        
        Args:
            websocket: Conexão WebSocket
            client_id: ID único do cliente
        """
        try:
            await websocket.accept()
            self.active_connections.append(websocket)
            self.client_connections[client_id] = websocket
            
            logger.info(f"Cliente {client_id} conectado. Total de conexões: {len(self.active_connections)}")
            
        except Exception as e:
            logger.error(f"Erro ao conectar cliente {client_id}: {str(e)}")
            raise
    
    def disconnect(self, websocket: WebSocket):
        """
        Remover conexão WebSocket e limpar registros associados.
        
        Args:
            websocket: Conexão WebSocket a ser removida
        """
        try:
            # Remover da lista de conexões ativas
            if websocket in self.active_connections:
                self.active_connections.remove(websocket)
            
            # Encontrar e remover o client_id associado
            client_id_to_remove = None
            for client_id, ws in self.client_connections.items():
                if ws == websocket:
                    client_id_to_remove = client_id
                    break
            
            if client_id_to_remove:
                # Remover do mapeamento de clientes
                del self.client_connections[client_id_to_remove]
                
                # Remover das conversas
                if client_id_to_remove in self.client_conversations:
                    conversation_id = self.client_conversations[client_id_to_remove]
                    
                    if conversation_id in self.conversation_clients:
                        self.conversation_clients[conversation_id].discard(client_id_to_remove)
                        
                        # Se não há mais clientes na conversa, remover a conversa
                        if not self.conversation_clients[conversation_id]:
                            del self.conversation_clients[conversation_id]
                    
                    del self.client_conversations[client_id_to_remove]
                
                logger.info(f"Cliente {client_id_to_remove} desconectado. Total de conexões: {len(self.active_connections)}")
            
        except Exception as e:
            logger.error(f"Erro ao desconectar cliente: {str(e)}")
    
    def associate_conversation(self, client_id: str, conversation_id: str):
        """
        Associar um cliente a uma conversa específica.
        
        Args:
            client_id: ID do cliente
            conversation_id: ID da conversa
        """
        try:
            # Remover associação anterior se existir
            if client_id in self.client_conversations:
                old_conversation = self.client_conversations[client_id]
                if old_conversation in self.conversation_clients:
                    self.conversation_clients[old_conversation].discard(client_id)
                    
                    # Remover conversa se vazia
                    if not self.conversation_clients[old_conversation]:
                        del self.conversation_clients[old_conversation]
            
            # Criar nova associação
            self.client_conversations[client_id] = conversation_id
            
            if conversation_id not in self.conversation_clients:
                self.conversation_clients[conversation_id] = set()
            
            self.conversation_clients[conversation_id].add(client_id)
            
            logger.info(f"Cliente {client_id} associado à conversa {conversation_id}")
            
        except Exception as e:
            logger.error(f"Erro ao associar cliente {client_id} à conversa {conversation_id}: {str(e)}")
    
    async def send_personal_message(self, message: str, client_id: str) -> bool:
        """
        Enviar mensagem para um cliente específico.
        
        Args:
            message: Mensagem a ser enviada
            client_id: ID do cliente destinatário
            
        Returns:
            bool: True se enviado com sucesso, False caso contrário
        """
        try:
            if client_id in self.client_connections:
                websocket = self.client_connections[client_id]
                await websocket.send_text(message)
                logger.debug(f"Mensagem enviada para cliente {client_id}")
                return True
            else:
                logger.warning(f"Cliente {client_id} não encontrado nas conexões ativas")
                return False
                
        except WebSocketDisconnect:
            logger.warning(f"Cliente {client_id} desconectou durante o envio da mensagem")
            self.disconnect(self.client_connections.get(client_id))
            return False
        except Exception as e:
            logger.error(f"Erro ao enviar mensagem para cliente {client_id}: {str(e)}")
            return False
    
    async def send_to_conversation(self, conversation_id: str, message_data: dict) -> bool:
        """
        Enviar mensagem para todos os clientes de uma conversa.
        
        Args:
            conversation_id: ID da conversa
            message_data: Dados da mensagem (dict)
            
        Returns:
            bool: True se enviado para pelo menos um cliente, False caso contrário
        """
        try:
            if conversation_id not in self.conversation_clients:
                logger.warning(f"Conversa {conversation_id} não tem clientes associados")
                return False
            
            clients = self.conversation_clients[conversation_id].copy()
            sent_count = 0
            
            message_json = json.dumps(message_data)
            
            for client_id in clients:
                if await self.send_personal_message(message_json, client_id):
                    sent_count += 1
            
            logger.info(f"Mensagem enviada para {sent_count}/{len(clients)} clientes da conversa {conversation_id}")
            return sent_count > 0
            
        except Exception as e:
            logger.error(f"Erro ao enviar mensagem para conversa {conversation_id}: {str(e)}")
            return False
    
    async def broadcast(self, message_data: dict) -> int:
        """
        Enviar mensagem para todas as conexões ativas.
        
        Args:
            message_data: Dados da mensagem (dict)
            
        Returns:
            int: Número de clientes que receberam a mensagem
        """
        try:
            message_json = json.dumps(message_data)
            sent_count = 0
            
            # Criar cópia da lista para evitar modificação durante iteração
            connections_to_check = self.active_connections.copy()
            
            for websocket in connections_to_check:
                try:
                    await websocket.send_text(message_json)
                    sent_count += 1
                except WebSocketDisconnect:
                    self.disconnect(websocket)
                except Exception as e:
                    logger.error(f"Erro ao enviar broadcast para uma conexão: {str(e)}")
                    self.disconnect(websocket)
            
            logger.info(f"Broadcast enviado para {sent_count} clientes")
            return sent_count
            
        except Exception as e:
            logger.error(f"Erro durante broadcast: {str(e)}")
            return 0
    
    def get_connection_stats(self) -> dict:
        """
        Retornar estatísticas das conexões ativas.
        
        Returns:
            dict: Estatísticas das conexões
        """
        return {
            "total_connections": len(self.active_connections),
            "clients_connected": len(self.client_connections),
            "active_conversations": len(self.conversation_clients),
            "clients_in_conversations": sum(len(clients) for clients in self.conversation_clients.values())
        }
    
    async def ping_all_connections(self) -> dict:
        """
        Enviar ping para todas as conexões para verificar se estão ativas.
        
        Returns:
            dict: Resultado dos pings
        """
        ping_message = json.dumps({
            "type": "ping",
            "timestamp": datetime.now().isoformat()
        })
        
        active_count = 0
        dead_connections = []
        
        for websocket in self.active_connections.copy():
            try:
                await websocket.send_text(ping_message)
                active_count += 1
            except:
                dead_connections.append(websocket)
        
        # Remover conexões mortas
        for dead_ws in dead_connections:
            self.disconnect(dead_ws)
        
        return {
            "active_connections": active_count,
            "removed_dead_connections": len(dead_connections),
            "timestamp": datetime.now().isoformat()
        }