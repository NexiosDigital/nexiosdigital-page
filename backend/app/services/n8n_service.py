import os
import aiohttp
import json
import logging
from typing import Dict, Any, Optional, List
from urllib.parse import urljoin

logger = logging.getLogger(__name__)

class N8NService:
    """
    Serviço para interação com a API do N8N
    """
    
    def __init__(self):
        # Obter configurações do ambiente
        self.n8n_api_url = os.getenv("N8N_API_URL", "http://n8n:5678/api/v1")
        self.n8n_api_key = os.getenv("N8N_API_KEY")
        
        # Verificar se a API key está configurada
        if not self.n8n_api_key:
            logger.warning("N8N_API_KEY não configurada. O serviço N8N terá funcionalidade limitada.")
            
        # Headers padrão para autenticação
        self.headers = {
            "X-N8N-API-KEY": self.n8n_api_key,
            "Content-Type": "application/json"
        }
    
    async def _make_request(self, method: str, endpoint: str, data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Método interno para fazer requisições à API do N8N
        """
        url = urljoin(self.n8n_api_url, endpoint)
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.request(
                    method=method.upper(),
                    url=url,
                    headers=self.headers,
                    json=data,
                    ssl=None  # Ajuste conforme necessário para ambiente de produção
                ) as response:
                    # Verificar se a resposta foi bem-sucedida
                    if response.status < 200 or response.status >= 300:
                        error_text = await response.text()
                        logger.error(f"Erro na requisição N8N ({response.status}): {error_text}")
                        raise Exception(f"Erro na API do N8N: {response.status} - {error_text}")
                    
                    # Tentar retornar como JSON, mas aceitar texto se falhar
                    try:
                        return await response.json()
                    except:
                        return {"text": await response.text()}
        
        except aiohttp.ClientError as e:
            logger.error(f"Erro de conexão com N8N: {str(e)}")
            raise Exception(f"Erro de conexão com N8N: {str(e)}")
        except Exception as e:
            logger.error(f"Erro na comunicação com N8N: {str(e)}")
            raise
    
    async def get_workflows(self) -> List[Dict[str, Any]]:
        """
        Obtém a lista de todos os workflows no N8N
        """
        response = await self._make_request("GET", "/workflows")
        return response.get("data", [])
    
    async def get_workflow(self, workflow_id: str) -> Dict[str, Any]:
        """
        Obtém detalhes de um workflow específico
        """
        response = await self._make_request("GET", f"/workflows/{workflow_id}")
        return response
    
    async def create_workflow(self, workflow_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Cria um novo workflow no N8N
        """
        response = await self._make_request("POST", "/workflows", workflow_data)
        return response
    
    async def update_workflow(self, workflow_id: str, workflow_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Atualiza um workflow existente
        """
        response = await self._make_request("PUT", f"/workflows/{workflow_id}", workflow_data)
        return response
    
    async def delete_workflow(self, workflow_id: str) -> Dict[str, Any]:
        """
        Exclui um workflow
        """
        response = await self._make_request("DELETE", f"/workflows/{workflow_id}")
        return response
    
    async def execute_workflow(self, workflow_id: str, payload: Dict[str, Any] = {}) -> str:
        """
        Executa um workflow com dados específicos
        
        Args:
            workflow_id: ID do workflow no N8N
            payload: Dados para execução do workflow
            
        Returns:
            str: ID da execução
        """
        response = await self._make_request(
            "POST", 
            f"/workflows/{workflow_id}/execute",
            {
                "data": payload,
                "executionMode": "manual"
            }
        )
        
        # Extrair e retornar o ID da execução
        execution_id = response.get("executionId", "unknown")
        return execution_id
    
    async def get_execution(self, execution_id: str) -> Dict[str, Any]:
        """
        Obtém detalhes de uma execução específica
        """
        response = await self._make_request("GET", f"/executions/{execution_id}")
        return response
    
    async def get_workflow_executions(self, workflow_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Obtém histórico de execuções de um workflow
        """
        response = await self._make_request(
            "GET", 
            f"/workflows/{workflow_id}/executions?limit={limit}"
        )
        return response.get("data", [])
    
    async def get_templates(self) -> List[Dict[str, Any]]:
        """
        Obtém a lista de templates disponíveis
        """
        response = await self._make_request("GET", "/templates")
        return response.get("data", [])
    
    async def get_template(self, template_id: str) -> Dict[str, Any]:
        """
        Obtém detalhes de um template específico
        """
        response = await self._make_request("GET", f"/templates/{template_id}")
        return response
    
    async def create_workflow_from_template(
        self,
        template_id: str,
        name: str,
        client_id: str,
        config: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Cria um novo workflow a partir de um template
        
        Args:
            template_id: ID do template
            name: Nome para o novo workflow
            client_id: ID do cliente (usado para identificação)
            config: Configurações específicas para o workflow
            
        Returns:
            str: ID do workflow criado
        """
        # Primeiro, obtém o template
        template = await self.get_template(template_id)
        
        # Preparar o novo workflow a partir do template
        workflow_data = {
            "name": name,
            "nodes": template.get("workflow", {}).get("nodes", []),
            "connections": template.get("workflow", {}).get("connections", {}),
            "active": True,
            "settings": {
                "saveExecutionProgress": True,
                "saveManualExecutions": True,
                "saveDataErrorExecution": "all",
                "saveDataSuccessExecution": "all",
                "executionTimeout": 3600,
                "timezone": "America/Sao_Paulo"
            },
            "tags": [f"client-{client_id}", "template-based"]
        }
        
        # Aplicar configurações personalizadas aos nós, se fornecidas
        if config and isinstance(config, dict):
            # Atualizar nós com base nas configurações
            self._apply_config_to_nodes(workflow_data["nodes"], config)
        
        # Criar o workflow
        created_workflow = await self.create_workflow(workflow_data)
        
        # Retornar o ID do workflow criado
        return str(created_workflow.get("id"))
    
    async def update_workflow_config(self, workflow_id: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Atualiza a configuração dos nós de um workflow
        
        Args:
            workflow_id: ID do workflow
            config: Novas configurações para os nós
            
        Returns:
            Dict: Detalhes do workflow atualizado
        """
        # Obter o workflow atual
        workflow = await self.get_workflow(workflow_id)
        
        # Aplicar novas configurações
        self._apply_config_to_nodes(workflow["nodes"], config)
        
        # Atualizar o workflow
        updated_workflow = await self.update_workflow(workflow_id, workflow)
        
        return updated_workflow
    
    def _apply_config_to_nodes(self, nodes: List[Dict[str, Any]], config: Dict[str, Any]) -> None:
        """
        Aplica configurações personalizadas aos nós de um workflow
        
        Este método modifica diretamente a lista de nós!
        
        Args:
            nodes: Lista de nós do workflow
            config: Configurações a serem aplicadas
        """
        # Iterar por cada nó
        for node in nodes:
            node_name = node.get("name", "").lower().replace(" ", "_")
            node_type = node.get("type", "").lower()
            
            # Verificar configurações para este nó específico
            node_config = config.get(node_name) or config.get(node_type)
            
            if node_config and isinstance(node_config, dict):
                # Atualizar parâmetros do nó
                if "parameters" in node and "parameters" in node_config:
                    node["parameters"].update(node_config["parameters"])
                
                # Atualizar credenciais do nó
                if "credentials" in node and "credentials" in node_config:
                    for cred_name, cred_value in node_config["credentials"].items():
                        if cred_name in node["credentials"]:
                            node["credentials"][cred_name] = cred_value