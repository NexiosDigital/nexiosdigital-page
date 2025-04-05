from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
import json
import logging
from datetime import datetime

from ..websocket.connection_manager import ConnectionManager
from ..repositories.conversation_repository import ConversationRepository

logger = logging.getLogger(__name__)

router = APIRouter(tags=["websocket"])

# Dependências
def get_connection_manager():
    return ConnectionManager()

def get_conversation_repository():
    return ConversationRepository()

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    client_id: str,
    manager: ConnectionManager = Depends(get_connection_manager),
    repo: ConversationRepository = Depends(get_conversation_repository)
):
    """
    Endpoint WebSocket para comunicação em tempo real
    """
    logger.info(f"Nova tentativa de conexão WebSocket de cliente: {client_id}")
    logger.info(f"Headers da conexão: {websocket.headers}")
    logger.info(f"Parâmetros da solicitação: {websocket.query_params}")
    
    # Verificar se o ID de conversa foi fornecido como query param
    conversation_id = None
    if "conversation_id" in websocket.query_params:
        conversation_id = websocket.query_params["conversation_id"]
        logger.info(f"ID de conversa fornecido via query params: {conversation_id}")
    
    try:
        # Aceitar conexão
        await manager.connect(websocket, client_id)
        
        # Se já temos o ID de conversa, associar imediatamente
        if conversation_id:
            manager.associate_conversation(client_id, conversation_id)
            
            # Enviar confirmação de associação
            await websocket.send_json({
                "type": "association_success",
                "message": f"Associado à conversa: {conversation_id}",
                "conversation_id": conversation_id
            })
            
            # Enviar as mensagens já existentes para esse cliente
            messages = await repo.get_messages(conversation_id)
            if messages:
                logger.info(f"Enviando histórico inicial de {len(messages)} mensagens para cliente {client_id}")
                for idx, msg in enumerate(messages):
                    logger.debug(f"Mensagem histórico {idx+1}: {msg.get('role')} - {msg.get('content', '')[:50]}...")
                
                await websocket.send_json({
                    "type": "message_history",
                    "messages": messages,
                    "conversation_id": conversation_id
                })
        
        # Enviar mensagem de confirmação de conexão
        await websocket.send_json({
            "type": "connection_status",
            "status": "connected",
            "message": "Conexão WebSocket estabelecida com sucesso!"
        })
        
        # Loop para manter a conexão ativa e processar mensagens
        while True:
            try:
                # Receber dados do cliente
                data = await websocket.receive_text()
                logger.debug(f"Recebido do cliente {client_id}: {data}")
                
                try:
                    # Tentar processar como JSON
                    json_data = json.loads(data)
                    
                    # Verificar se há ID de conversa para associação
                    if 'conversation_id' in json_data:
                        conv_id = json_data['conversation_id']
                        client_to_associate = json_data.get('client_id', client_id)
                        
                        logger.info(f"Cliente {client_to_associate} solicitou associação à conversa {conv_id}")
                        
                        # Registrar associação no gerenciador
                        manager.associate_conversation(client_to_associate, conv_id)
                        
                        # Confirmar associação
                        await websocket.send_json({
                            "type": "association_success",
                            "message": f"Associado à conversa: {conv_id}",
                            "conversation_id": conv_id
                        })
                        
                        # Se houver histórico de mensagens para essa conversa, enviar
                        messages = await repo.get_messages(conv_id)
                        if messages:
                            logger.info(f"Enviando histórico de {len(messages)} mensagens para cliente {client_id}")
                            for idx, msg in enumerate(messages):
                                logger.debug(f"Mensagem histórico {idx+1}: {msg.get('role')} - {msg.get('content', '')[:50]}...")
                            
                            await websocket.send_json({
                                "type": "message_history",
                                "messages": messages,
                                "conversation_id": conv_id
                            })
                            
                    # Processar comandos especiais
                    elif 'command' in json_data:
                        if json_data['command'] == 'get_messages' and 'conversation_id' in json_data:
                            # Comando para obter mensagens de uma conversa
                            conv_id = json_data['conversation_id']
                            messages = await repo.get_messages(conv_id)
                            logger.info(f"Comando get_messages: Encontradas {len(messages)} mensagens para {conv_id}")
                            
                            await websocket.send_json({
                                "type": "message_history",
                                "messages": messages,
                                "conversation_id": conv_id
                            })
                        elif json_data['command'] == 'ping':
                            # Comando para verificar se a conexão está viva
                            await websocket.send_json({
                                "type": "pong",
                                "timestamp": datetime.now().isoformat()
                            })
                
                except json.JSONDecodeError:
                    # Se não for JSON válido, enviar eco simples
                    await websocket.send_json({
                        "type": "echo",
                        "original": data,
                        "timestamp": datetime.now().isoformat()
                    })
                
            except WebSocketDisconnect:
                logger.info(f"Cliente {client_id} desconectou normalmente")
                break
            except Exception as e:
                logger.error(f"Erro ao processar mensagem de {client_id}: {str(e)}", exc_info=True)
                # Tentar enviar mensagem de erro antes de decidir se fecha
                try:
                    await websocket.send_json({
                        "type": "error",
                        "message": f"Erro ao processar mensagem: {str(e)}",
                        "timestamp": datetime.now().isoformat()
                    })
                except:
                    # Se não conseguir enviar, provavelmente a conexão já está quebrada
                    logger.error(f"Não foi possível enviar mensagem de erro para {client_id}, conexão provavelmente perdida")
                    break
    
    except WebSocketDisconnect:
        logger.warning(f"Cliente {client_id} desconectou durante o handshake")
    except Exception as e:
        logger.error(f"Erro ao aceitar conexão de {client_id}: {str(e)}", exc_info=True)
    
    # Desconectar do gerenciador quando terminar
    manager.disconnect(websocket)
    logger.info(f"Conexão WebSocket encerrada para cliente {client_id}")