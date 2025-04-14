import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from uuid import UUID, uuid4
import json

from ..models.dashboard import (
    AutomationSummary, 
    AutomationDetail, 
    AutomationExecution, 
    ClientDashboardStats,
    TimeSeriesData,
    TimeSeriesPoint
)

logger = logging.getLogger(__name__)

class AutomationService:
    """
    Serviço para gerenciar automações e suas estatísticas.
    
    Esta classe interage com o banco de dados para fornecer
    dados sobre automações, execuções e estatísticas.
    """
    
    def __init__(self):
        # Dependências são injetadas automaticamente pelo FastAPI
        pass
    
    async def list_automations(
        self, 
        client_id: UUID, 
        status: Optional[str] = None,
        automation_type: Optional[str] = None
    ) -> List[AutomationSummary]:
        """
        Lista todas as automações de um cliente com filtros opcionais
        
        Args:
            client_id: ID do cliente
            status: Filtro opcional por status (active, inactive, error, etc)
            automation_type: Filtro opcional por tipo
            
        Returns:
            List[AutomationSummary]: Lista de resumos de automação
        """
        try:
            # Consulta ao banco de dados
            query = {
                "client_id": str(client_id)
            }
            
            # Adicionar filtros, se presentes
            if status:
                query["status"] = status
                
            if automation_type:
                query["automation_type"] = automation_type
            
            # Exemplo usando motor.motor_asyncio
            from motor.motor_asyncio import AsyncIOMotorClient
            from os import getenv
            
            # Conectar ao MongoDB
            mongo_url = getenv("MONGODB_URL", "mongodb://mongo:27017")
            client = AsyncIOMotorClient(mongo_url)
            db = client.get_database(getenv("MONGODB_DB", "nexios"))
            
            # Buscar automações
            cursor = db.automations.find(query)
            
            # Converter para AutomationSummary
            automations = []
            async for doc in cursor:
                # Converter _id para string
                doc["id"] = doc.pop("_id")
                
                # Adicionar à lista
                automations.append(AutomationSummary(**doc))
            
            return automations
            
        except Exception as e:
            logger.error(f"Erro ao listar automações: {str(e)}")
            # Em modo de desenvolvimento, podemos retornar dados simulados
            if getenv("ENVIRONMENT", "development") == "development":
                return self._get_mock_automations(client_id, status, automation_type)
            raise
    
    async def get_automation(self, automation_id: UUID) -> Optional[AutomationDetail]:
        """
        Obtém detalhes de uma automação específica
        
        Args:
            automation_id: ID da automação
            
        Returns:
            Optional[AutomationDetail]: Detalhes da automação ou None se não encontrada
        """
        try:
            # Conectar ao MongoDB
            from motor.motor_asyncio import AsyncIOMotorClient
            from os import getenv
            
            mongo_url = getenv("MONGODB_URL", "mongodb://mongo:27017")
            client = AsyncIOMotorClient(mongo_url)
            db = client.get_database(getenv("MONGODB_DB", "nexios"))
            
            # Buscar automação
            doc = await db.automations.find_one({"_id": str(automation_id)})
            
            # Se não encontrado, retorna None
            if not doc:
                return None
                
            # Converter _id para id
            doc["id"] = doc.pop("_id")
            
            # Retornar como AutomationDetail
            return AutomationDetail(**doc)
            
        except Exception as e:
            logger.error(f"Erro ao obter automação: {str(e)}")
            # Em desenvolvimento, podemos retornar dados simulados
            if getenv("ENVIRONMENT", "development") == "development":
                return self._get_mock_automation_detail(automation_id)
            raise
    
    async def get_automation_executions(
        self, 
        automation_id: UUID, 
        limit: int = 50, 
        offset: int = 0
    ) -> List[AutomationExecution]:
        """
        Obtém o histórico de execuções de uma automação
        
        Args:
            automation_id: ID da automação
            limit: Número máximo de registros
            offset: Deslocamento para paginação
            
        Returns:
            List[AutomationExecution]: Lista de execuções
        """
        try:
            # Conectar ao MongoDB
            from motor.motor_asyncio import AsyncIOMotorClient
            from os import getenv
            
            mongo_url = getenv("MONGODB_URL", "mongodb://mongo:27017")
            client = AsyncIOMotorClient(mongo_url)
            db = client.get_database(getenv("MONGODB_DB", "nexios"))
            
            # Buscar execuções
            cursor = db.automation_executions.find(
                {"automation_id": str(automation_id)}
            ).sort("started_at", -1).skip(offset).limit(limit)
            
            # Converter para AutomationExecution
            executions = []
            async for doc in cursor:
                # Converter _id para id
                doc["id"] = doc.pop("_id")
                
                # Adicionar à lista
                executions.append(AutomationExecution(**doc))
            
            return executions
            
        except Exception as e:
            logger.error(f"Erro ao obter execuções de automação: {str(e)}")
            # Em desenvolvimento, podemos retornar dados simulados
            if getenv("ENVIRONMENT", "development") == "development":
                return self._get_mock_automation_executions(automation_id, limit, offset)
            raise
    
    async def get_client_stats(
        self,
        client_id: UUID,
        from_date: datetime
    ) -> ClientDashboardStats:
        """
        Obtém estatísticas gerais do dashboard para um cliente
        
        Args:
            client_id: ID do cliente
            from_date: Data inicial para estatísticas
            
        Returns:
            ClientDashboardStats: Estatísticas do cliente
        """
        try:
            # Conectar ao MongoDB
            from motor.motor_asyncio import AsyncIOMotorClient
            from os import getenv
            
            mongo_url = getenv("MONGODB_URL", "mongodb://mongo:27017")
            client = AsyncIOMotorClient(mongo_url)
            db = client.get_database(getenv("MONGODB_DB", "nexios"))
            
            # Calcular datas
            today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            this_week = today - timedelta(days=today.weekday())
            
            # Pipeline para agregar por tipo
            pipeline = [
                {"$match": {"client_id": str(client_id)}},
                {"$group": {
                    "_id": "$automation_type",
                    "count": {"$sum": 1}
                }}
            ]
            
            # Executar agregação
            automation_types = {}
            cursor = db.automations.aggregate(pipeline)
            async for doc in cursor:
                automation_type = doc["_id"]
                count = doc["count"]
                automation_types[automation_type] = count
            
            # Buscar automação mais usada
            most_used_pipeline = [
                {"$match": {"client_id": str(client_id)}},
                {"$sort": {"executions_count": -1}},
                {"$limit": 1},
                {"$project": {"name": 1}}
            ]
            
            most_used_doc = await db.automations.aggregate(most_used_pipeline).to_list(1)
            most_used_automation = most_used_doc[0]["name"] if most_used_doc else None
            
            # Contar automações
            total_automations = await db.automations.count_documents({"client_id": str(client_id)})
            active_automations = await db.automations.count_documents({"client_id": str(client_id), "status": "active"})
            
            # Contar execuções
            pipeline = [
                {"$lookup": {
                    "from": "automations",
                    "localField": "automation_id",
                    "foreignField": "_id",
                    "as": "automation"
                }},
                {"$match": {
                    "automation.client_id": str(client_id)
                }},
                {"$group": {
                    "_id": None,
                    "total": {"$sum": 1},
                    "success": {"$sum": {"$cond": [{"$eq": ["$success", True]}, 1, 0]}},
                    "time_saved": {"$sum": "$time_saved"},
                    "today": {"$sum": {"$cond": [{"$gte": ["$started_at", today]}, 1, 0]}},
                    "this_week": {"$sum": {"$cond": [{"$gte": ["$started_at", this_week]}, 1, 0]}},
                    "errors_today": {"$sum": {"$cond": [{"$and": [
                        {"$gte": ["$started_at", today]},
                        {"$eq": ["$success", False]}
                    ]}, 1, 0]}}
                }}
            ]
            
            execution_stats = await db.automation_executions.aggregate(pipeline).to_list(1)
            
            # Valores padrão caso não haja execuções
            total_executions = 0
            success_rate = 100.0
            time_saved = 0
            executions_today = 0
            executions_this_week = 0
            errors_today = 0
            
            # Se tiver execuções, usar os valores calculados
            if execution_stats:
                stats = execution_stats[0]
                total_executions = stats.get("total", 0)
                success_count = stats.get("success", 0)
                success_rate = (success_count / total_executions * 100) if total_executions > 0 else 100.0
                time_saved = stats.get("time_saved", 0)
                executions_today = stats.get("today", 0)
                executions_this_week = stats.get("this_week", 0)
                errors_today = stats.get("errors_today", 0)
            
            # Retornar estatísticas completas
            return ClientDashboardStats(
                total_automations=total_automations,
                active_automations=active_automations,
                total_executions=total_executions,
                success_rate=round(success_rate, 1),
                time_saved=time_saved,
                executions_today=executions_today,
                executions_this_week=executions_this_week,
                errors_today=errors_today,
                most_used_automation=most_used_automation,
                automation_types=automation_types
            )
            
        except Exception as e:
            logger.error(f"Erro ao obter estatísticas do cliente: {str(e)}")
            # Em desenvolvimento, podemos retornar dados simulados
            if getenv("ENVIRONMENT", "development") == "development":
                return self._get_mock_client_stats(client_id, from_date)
            raise
    
    async def get_time_series_data(
        self,
        client_id: UUID,
        metric: str,
        from_date: datetime,
        automation_id: Optional[UUID] = None
    ) -> TimeSeriesData:
        """
        Obtém dados de série temporal para gráficos
        
        Args:
            client_id: ID do cliente
            metric: Métrica a ser analisada (executions, time_saved, success_rate, errors)
            from_date: Data inicial para análise
            automation_id: Filtrar por automação específica (opcional)
            
        Returns:
            TimeSeriesData: Dados de série temporal
        """
        try:
            # Conectar ao MongoDB
            from motor.motor_asyncio import AsyncIOMotorClient
            from os import getenv
            
            mongo_url = getenv("MONGODB_URL", "mongodb://mongo:27017")
            client = AsyncIOMotorClient(mongo_url)
            db = client.get_database(getenv("MONGODB_DB", "nexios"))
            
            # Definir parâmetros com base na métrica
            unit = "count"
            if metric == "time_saved":
                unit = "minutes"
            elif metric == "success_rate":
                unit = "percent"
            
            # Calcular o número de dias no período
            today = datetime.now().replace(hour=23, minute=59, second=59, microsecond=999999)
            days = (today - from_date).days + 1
            
            # Criar pipeline de agregação
            lookup_stage = {
                "$lookup": {
                    "from": "automations",
                    "localField": "automation_id",
                    "foreignField": "_id",
                    "as": "automation"
                }
            }
            
            match_stage = {
                "$match": {
                    "automation.client_id": str(client_id),
                    "started_at": {"$gte": from_date, "$lte": today}
                }
            }
            
            # Adicionar filtro por automação específica se fornecido
            if automation_id:
                match_stage["$match"]["automation_id"] = str(automation_id)
            
            # Definir como agrupar por data
            date_format = "%Y-%m-%d"
            date_trunc = {"$dateToString": {"format": date_format, "date": "$started_at"}}
            
            # Definir como calcular o valor da métrica
            value_expr = None
            if metric == "executions":
                value_expr = {"$sum": 1}
            elif metric == "time_saved":
                value_expr = {"$sum": "$time_saved"}
            elif metric == "success_rate":
                value_expr = {"$avg": {"$cond": [{"$eq": ["$success", True]}, 100, 0]}}
            elif metric == "errors":
                value_expr = {"$sum": {"$cond": [{"$eq": ["$success", False]}, 1, 0]}}
            
            group_stage = {
                "$group": {
                    "_id": date_trunc,
                    "value": value_expr
                }
            }
            
            sort_stage = {"$sort": {"_id": 1}}
            
            # Montar pipeline completo
            pipeline = [lookup_stage, match_stage, group_stage, sort_stage]
            
            # Executar agregação
            results = await db.automation_executions.aggregate(pipeline).to_list(100)
            
            # Transformar resultados em TimeSeriesPoint
            data_points = []
            for result in results:
                data_points.append(TimeSeriesPoint(
                    date=result["_id"],
                    value=round(result["value"], 2) if isinstance(result["value"], float) else result["value"]
                ))
            
            # Preencher datas faltantes
            all_dates = {}
            for i in range(days):
                date_str = (from_date + timedelta(days=i)).strftime(date_format)
                all_dates[date_str] = 0
            
            # Substituir com dados reais onde disponíveis
            for point in data_points:
                all_dates[point.date] = point.value
            
            # Criar lista final de pontos
            final_data = [
                TimeSeriesPoint(date=date, value=value)
                for date, value in all_dates.items()
            ]
            
            # Calcular comparação com período anterior
            comparison = self._calculate_comparison(final_data)
            
            # Retornar dados completos
            return TimeSeriesData(
                metric=metric,
                unit=unit,
                data=final_data,
                comparison=comparison
            )
            
        except Exception as e:
            logger.error(f"Erro ao obter dados de série temporal: {str(e)}")
            # Em desenvolvimento, podemos retornar dados simulados
            if getenv("ENVIRONMENT", "development") == "development":
                return self._get_mock_time_series_data(client_id, metric, from_date, automation_id)
            raise
    
    async def create_automation(
        self,
        name: str,
        client_id: UUID,
        automation_type: str,
        description: Optional[str] = None,
        workflow_id: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None,
        schedule: Optional[Dict[str, Any]] = None,
        created_by: UUID = None
    ) -> AutomationDetail:
        """
        Cria uma nova automação
        
        Args:
            name: Nome da automação
            client_id: ID do cliente
            automation_type: Tipo de automação
            description: Descrição (opcional)
            workflow_id: ID do workflow no N8N (opcional)
            config: Configurações (opcional)
            schedule: Agendamento (opcional)
            created_by: ID do usuário que criou
            
        Returns:
            AutomationDetail: Detalhes da automação criada
        """
        try:
            # Conectar ao MongoDB
            from motor.motor_asyncio import AsyncIOMotorClient
            from os import getenv
            
            mongo_url = getenv("MONGODB_URL", "mongodb://mongo:27017")
            client = AsyncIOMotorClient(mongo_url)
            db = client.get_database(getenv("MONGODB_DB", "nexios"))
            
            # Criar documento de automação
            automation_id = str(uuid4())
            now = datetime.now()
            
            automation_doc = {
                "_id": automation_id,
                "name": name,
                "description": description,
                "client_id": str(client_id),
                "automation_type": automation_type,
                "status": "active",
                "workflow_id": workflow_id,
                "config": config or {},
                "schedule": schedule,
                "created_by": str(created_by) if created_by else None,
                "created_at": now,
                "updated_at": now,
                "executions_count": 0,
                "success_rate": 100.0,
                "time_saved": 0,
                "tags": []
            }
            
            # Inserir no banco
            await db.automations.insert_one(automation_doc)
            
            # Converter _id para id para retorno
            automation_doc["id"] = automation_doc.pop("_id")
            
            # Retornar como AutomationDetail
            return AutomationDetail(**automation_doc)
            
        except Exception as e:
            logger.error(f"Erro ao criar automação: {str(e)}")
            raise
    
    async def update_automation(
        self,
        automation_id: UUID,
        name: Optional[str] = None,
        description: Optional[str] = None,
        status: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None,
        schedule: Optional[Dict[str, Any]] = None,
        updated_by: Optional[UUID] = None
    ) -> AutomationDetail:
        """
        Atualiza uma automação existente
        
        Args:
            automation_id: ID da automação
            name: Novo nome (opcional)
            description: Nova descrição (opcional)
            status: Novo status (opcional)
            config: Novas configurações (opcional)
            schedule: Novo agendamento (opcional)
            updated_by: ID do usuário que atualizou
            
        Returns:
            AutomationDetail: Detalhes da automação atualizada
        """
        try:
            # Conectar ao MongoDB
            from motor.motor_asyncio import AsyncIOMotorClient
            from os import getenv
            
            mongo_url = getenv("MONGODB_URL", "mongodb://mongo:27017")
            client = AsyncIOMotorClient(mongo_url)
            db = client.get_database(getenv("MONGODB_DB", "nexios"))
            
            # Criar objeto de atualização
            update_data = {"$set": {"updated_at": datetime.now()}}
            
            # Adicionar campos a serem atualizados
            if name is not None:
                update_data["$set"]["name"] = name
            if description is not None:
                update_data["$set"]["description"] = description
            if status is not None:
                update_data["$set"]["status"] = status
            if config is not None:
                update_data["$set"]["config"] = config
            if schedule is not None:
                update_data["$set"]["schedule"] = schedule
            if updated_by is not None:
                update_data["$set"]["updated_by"] = str(updated_by)
            
            # Atualizar no banco
            result = await db.automations.update_one(
                {"_id": str(automation_id)},
                update_data
            )
            
            # Verificar se a automação existe
            if result.matched_count == 0:
                raise ValueError(f"Automação com ID {automation_id} não encontrada")
            
            # Buscar a automação atualizada
            doc = await db.automations.find_one({"_id": str(automation_id)})
            
            # Converter _id para id
            doc["id"] = doc.pop("_id")
            
            # Retornar como AutomationDetail
            return AutomationDetail(**doc)
            
        except Exception as e:
            logger.error(f"Erro ao atualizar automação: {str(e)}")
            raise
    
    async def delete_automation(self, automation_id: UUID) -> bool:
        """
        Exclui uma automação
        
        Args:
            automation_id: ID da automação
            
        Returns:
            bool: True se excluído com sucesso
        """
        try:
            # Conectar ao MongoDB
            from motor.motor_asyncio import AsyncIOMotorClient
            from os import getenv
            
            mongo_url = getenv("MONGODB_URL", "mongodb://mongo:27017")
            client = AsyncIOMotorClient(mongo_url)
            db = client.get_database(getenv("MONGODB_DB", "nexios"))
            
            # Excluir automação
            result = await db.automations.delete_one({"_id": str(automation_id)})
            
            # Verificar se a automação existia
            if result.deleted_count == 0:
                raise ValueError(f"Automação com ID {automation_id} não encontrada")
            
            # Também excluir execuções relacionadas
            await db.automation_executions.delete_many({"automation_id": str(automation_id)})
            
            return True
            
        except Exception as e:
            logger.error(f"Erro ao excluir automação: {str(e)}")
            raise
    
    async def register_execution(
        self,
        automation_id: UUID,
        execution_id: str,
        triggered_by: Optional[UUID] = None,
        payload: Optional[Dict[str, Any]] = None
    ) -> UUID:
        """
        Registra uma nova execução de automação
        
        Args:
            automation_id: ID da automação
            execution_id: ID da execução no N8N
            triggered_by: ID do usuário que acionou (opcional)
            payload: Dados enviados para execução (opcional)
            
        Returns:
            UUID: ID do registro de execução
        """
        try:
            # Conectar ao MongoDB
            from motor.motor_asyncio import AsyncIOMotorClient
            from os import getenv
            
            mongo_url = getenv("MONGODB_URL", "mongodb://mongo:27017")
            client = AsyncIOMotorClient(mongo_url)
            db = client.get_database(getenv("MONGODB_DB", "nexios"))
            
            # Criar documento de execução
            execution_record_id = str(uuid4())
            now = datetime.now()
            
            execution_doc = {
                "_id": execution_record_id,
                "automation_id": str(automation_id),
                "execution_id": execution_id,
                "status": "running",
                "started_at": now,
                "triggered_by": str(triggered_by) if triggered_by else None,
                "trigger_type": "manual" if triggered_by else "automated",
                "metadata": {
                    "payload": payload
                }
            }
            
            # Inserir no banco
            await db.automation_executions.insert_one(execution_doc)
            
            # Atualizar contador de execuções na automação
            await db.automations.update_one(
                {"_id": str(automation_id)},
                {"$inc": {"executions_count": 1}, "$set": {"last_execution": now}}
            )
            
            return UUID(execution_record_id)
            
        except Exception as e:
            logger.error(f"Erro ao registrar execução: {str(e)}")
            raise
    
    async def update_execution_result(
        self,
        execution_id: str,
        status: str,
        success: bool,
        finished_at: datetime = None,
        duration_seconds: Optional[int] = None,
        error_message: Optional[str] = None,
        processed_items: Optional[int] = None,
        time_saved: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Atualiza o resultado de uma execução
        
        Args:
            execution_id: ID da execução no N8N
            status: Status final (success, error)
            success: Se a execução foi bem-sucedida
            finished_at: Data/hora de conclusão (opcional)
            duration_seconds: Duração em segundos (opcional)
            error_message: Mensagem de erro (opcional)
            processed_items: Número de itens processados (opcional)
            time_saved: Tempo economizado em minutos (opcional)
            metadata: Metadados adicionais (opcional)
        """
        try:
            # Conectar ao MongoDB
            from motor.motor_asyncio import AsyncIOMotorClient
            from os import getenv
            
            mongo_url = getenv("MONGODB_URL", "mongodb://mongo:27017")
            client = AsyncIOMotorClient(mongo_url)
            db = client.get_database(getenv("MONGODB_DB", "nexios"))
            
            # Calcular valores padrão
            if not finished_at:
                finished_at = datetime.now()
                
            if not duration_seconds and "started_at" in execution:
                started_at = execution["started_at"]
                duration_seconds = int((finished_at - started_at).total_seconds())
            
            # Criar objeto de atualização
            update_data = {
                "$set": {
                    "status": status,
                    "success": success,
                    "finished_at": finished_at,
                    "duration_seconds": duration_seconds
                }
            }
            
            # Adicionar campos opcionais
            if error_message is not None:
                update_data["$set"]["error_message"] = error_message
            if processed_items is not None:
                update_data["$set"]["processed_items"] = processed_items
            if time_saved is not None:
                update_data["$set"]["time_saved"] = time_saved
            if metadata is not None:
                update_data["$set"]["metadata"] = {**update_data["$set"].get("metadata", {}), **metadata}
            
            # Atualizar no banco
            result = await db.automation_executions.update_one(
                {"execution_id": execution_id},
                update_data
            )
            
            # Verificar se a execução existe
            if result.matched_count == 0:
                raise ValueError(f"Execução com ID {execution_id} não encontrada")
            
            # Buscar a execução para obter automation_id
            execution = await db.automation_executions.find_one({"execution_id": execution_id})
            automation_id = execution.get("automation_id")
            
            # Atualizar estatísticas da automação
            if automation_id:
                # Calcular taxa de sucesso
                pipeline = [
                    {"$match": {"automation_id": automation_id}},
                    {"$group": {
                        "_id": None,
                        "total": {"$sum": 1},
                        "success": {"$sum": {"$cond": [{"$eq": ["$success", True]}, 1, 0]}},
                        "time_saved": {"$sum": "$time_saved"}
                    }}
                ]
                
                stats = await db.automation_executions.aggregate(pipeline).to_list(1)
                
                if stats:
                    stat = stats[0]
                    total = stat.get("total", 0)
                    success_count = stat.get("success", 0)
                    total_time_saved = stat.get("time_saved", 0)
                    
                    success_rate = (success_count / total * 100) if total > 0 else 0
                    
                    # Atualizar automação
                    await db.automations.update_one(
                        {"_id": automation_id},
                        {"$set": {
                            "success_rate": round(success_rate, 1),
                            "time_saved": total_time_saved
                        }}
                    )
            
        except Exception as e:
            logger.error(f"Erro ao atualizar resultado de execução: {str(e)}")
            raise
    
    def _calculate_comparison(self, data_points: List[TimeSeriesPoint]) -> Dict[str, Any]:
        """
        Calcula comparação com período anterior
        
        Args:
            data_points: Pontos de dados da série temporal
            
        Returns:
            Dict: Informações de comparação
        """
        if len(data_points) <= 1:
            return None
            
        # Dividir em período atual e anterior
        half_point = len(data_points) // 2
        current_period = data_points[half_point:]
        previous_period = data_points[:half_point]
        
        # Calcular totais
        current_total = sum(point.value for point in current_period)
        previous_total = sum(point.value for point in previous_period)
        
        # Calcular mudança percentual
        if previous_total == 0:
            change_percent = 100.0 if current_total > 0 else 0.0
        else:
            change_percent = ((current_total - previous_total) / previous_total) * 100
        
        return {
            "previous_period": previous_total,
            "current_period": current_total,
            "change_percent": round(change_percent, 1)
        }
    
    # Métodos para dados simulados (modo de desenvolvimento)
    
    def _get_mock_automation_detail(self, automation_id: UUID) -> AutomationDetail:
        """Retorna detalhes de automação simulados para desenvolvimento"""
        from random import randint, choice
        
        types = ["api_integration", "document_processing", "email_automation", "data_sync", "approval_flow"]
        statuses = ["active", "inactive", "error"]
        
        return AutomationDetail(
            id=automation_id,
            name=f"Automação {automation_id}",
            description="Esta é uma automação simulada para desenvolvimento",
            client_id=UUID("a21ac50c-28bc-4562-a567-1e02f6c5d124"),
            workflow_id=str(randint(1, 100)),
            automation_type=choice(types),
            status=choice(statuses),
            created_at=datetime.now() - timedelta(days=randint(10, 100)),
            updated_at=datetime.now() - timedelta(days=randint(0, 10)),
            created_by=UUID("c17dc30a-18fc-4162-b427-0e04f2c1a432"),
            updated_by=UUID("c17dc30a-18fc-4162-b427-0e04f2c1a432"),
            last_execution=datetime.now() - timedelta(days=randint(0, 5)),
            executions_count=randint(10, 1000),
            success_rate=round(randint(800, 999) / 10, 1),
            time_saved=randint(100, 5000),
            config={
                "api_key": "••••••••••••••••",
                "target_folder": "/uploads/processed",
                "notification_email": "admin@example.com"
            },
            schedule={
                "frequency": "daily",
                "time": "08:00",
                "weekdays": [1, 2, 3, 4, 5]
            },
            tags=["simulado", "desenvolvimento"],
            metadata={
                "version": "1.0",
                "environment": "development"
            }
        )
    
    def _get_mock_automations(
        self, 
        client_id: UUID, 
        status: Optional[str] = None,
        automation_type: Optional[str] = None
    ) -> List[AutomationSummary]:
        """Retorna lista de automações simuladas para desenvolvimento"""
        from random import randint, choice, sample
        import uuid
        
        types = ["api_integration", "document_processing", "email_automation", "data_sync", "approval_flow", "client_onboarding"]
        statuses = ["active", "inactive", "error"]
        names = [
            "Integração com Salesforce", 
            "Processamento de Documentos", 
            "Automação de Email Marketing", 
            "Sincronização de Dados", 
            "Fluxo de Aprovação de Contratos",
            "Onboarding de Clientes",
            "Geração de Relatórios",
            "Extração de Dados",
            "Notificações Automáticas",
            "Acompanhamento de Leads"
        ]
        
        # Número de automações a retornar
        count = randint(5, 15)
        
        # Filtrar por status, se fornecido
        filtered_statuses = [status] if status else statuses
        
        # Filtrar por tipo, se fornecido
        filtered_types = [automation_type] if automation_type else types
        
        result = []
        for i in range(count):
            auto_status = choice(filtered_statuses)
            auto_type = choice(filtered_types)
            auto_name = choice(names)
            
            # Gerar datas
            created_at = datetime.now() - timedelta(days=randint(30, 365))
            updated_at = created_at + timedelta(days=randint(1, 30))
            last_execution = datetime.now() - timedelta(days=randint(0, 14))
            
            # Gerar estatísticas
            executions = randint(10, 1000)
            success_rate = round(randint(800, 999) / 10, 1)
            time_saved = randint(100, 5000)
            
            result.append(AutomationSummary(
                id=uuid.uuid4(),
                name=f"{auto_name} {i+1}",
                description=f"Automação simulada de {auto_type}",
                automation_type=auto_type,
                status=auto_status,
                created_at=created_at,
                updated_at=updated_at,
                last_execution=last_execution,
                executions_count=executions,
                success_rate=success_rate,
                time_saved=time_saved
            ))
        
        return result
    
    def _get_mock_automation_executions(
        self, 
        automation_id: UUID,
        limit: int = 50,
        offset: int = 0
    ) -> List[AutomationExecution]:
        """Retorna histórico de execuções simulado para desenvolvimento"""
        from random import randint, choice, sample, random
        import uuid
        
        result = []
        for i in range(limit):
            # Definir se foi sucesso ou erro
            success = random() < 0.95  # 95% de chance de sucesso
            status = "success" if success else "error"
            
            # Gerar tempos
            started_at = datetime.now() - timedelta(days=randint(0, 30), hours=randint(0, 23), minutes=randint(0, 59))
            duration = randint(5, 300)  # 5 segundos a 5 minutos
            finished_at = started_at + timedelta(seconds=duration)
            
            # Gerar outros campos
            trigger_types = ["manual", "scheduled", "webhook"]
            processed_items = randint(1, 50) if success else randint(0, 10)
            time_saved = randint(5, 60) if success else 0
            
            # Gerar erro se aplicável
            error_message = None
            if not success:
                errors = [
                    "Timeout na conexão com a API externa",
                    "Erro de autenticação",
                    "Formato de dados inválido",
                    "Arquivo não encontrado",
                    "Permissão negada"
                ]
                error_message = choice(errors)
            
            # Criar execução
            execution = AutomationExecution(
                id=uuid.uuid4(),
                automation_id=automation_id,
                execution_id=str(randint(1000, 9999)),
                status=status,
                started_at=started_at,
                finished_at=finished_at,
                duration_seconds=duration,
                triggered_by=uuid.uuid4() if choice(trigger_types) == "manual" else None,
                trigger_type=choice(trigger_types),
                success=success,
                error_message=error_message,
                processed_items=processed_items,
                metadata={
                    "time_saved": time_saved,
                    "bytes_processed": randint(100, 10000000) if success else 0
                }
            )
            
            result.append(execution)
        
        # Ordenar por data de início (mais recente primeiro)
        result.sort(key=lambda x: x.started_at, reverse=True)
        
        return result
    
    def _get_mock_client_stats(self, client_id: UUID, from_date: datetime) -> ClientDashboardStats:
        """Retorna estatísticas simuladas do cliente para desenvolvimento"""
        from random import randint, choice
        
        # Tipos de automação e contagem
        automation_types = {
            "api_integration": randint(1, 5),
            "document_processing": randint(1, 5),
            "email_automation": randint(0, 3),
            "data_sync": randint(0, 3),
            "approval_flow": randint(0, 2),
            "client_onboarding": randint(0, 2)
        }
        
        # Calcular totais
        total_automations = sum(automation_types.values())
        active_automations = randint(total_automations // 2, total_automations)
        total_executions = randint(500, 5000)
        success_rate = round(randint(950, 999) / 10, 1)
        time_saved = randint(1000, 20000)
        
        # Estatísticas recentes
        executions_today = randint(5, 50)
        executions_this_week = executions_today + randint(20, 200)
        errors_today = randint(0, 3)
        
        # Automação mais usada
        most_used_options = [
            "Integração com Salesforce", 
            "Processamento de Documentos", 
            "Automação de Email Marketing", 
            "Sincronização de Dados"
        ]
        most_used_automation = choice(most_used_options)
        
        return ClientDashboardStats(
            total_automations=total_automations,
            active_automations=active_automations,
            total_executions=total_executions,
            success_rate=success_rate,
            time_saved=time_saved,
            executions_today=executions_today,
            executions_this_week=executions_this_week,
            errors_today=errors_today,
            most_used_automation=most_used_automation,
            automation_types=automation_types
        )
    
    def _get_mock_time_series_data(
        self,
        client_id: UUID,
        metric: str,
        from_date: datetime,
        automation_id: Optional[UUID] = None
    ) -> TimeSeriesData:
        """Retorna dados de série temporal simulados para desenvolvimento"""
        from random import randint, uniform
        
        # Definir unidade com base na métrica
        unit = "count"
        if metric == "time_saved":
            unit = "minutes"
        elif metric == "success_rate":
            unit = "percent"
        
        # Calcular número de dias no período
        days = (datetime.now() - from_date).days + 1
        
        # Gerar pontos de dados
        data_points = []
        base_value = 0
        
        if metric == "executions":
            base_value = randint(5, 30)
        elif metric == "time_saved":
            base_value = randint(30, 200)
        elif metric == "success_rate":
            base_value = randint(90, 100)
        elif metric == "errors":
            base_value = randint(0, 3)
        
        for i in range(days):
            date = (from_date + timedelta(days=i)).strftime("%Y-%m-%d")
            
            # Gerar valor com variação
            if metric == "success_rate":
                # Manter a taxa de sucesso realista
                value = base_value + uniform(-5, 5)
                value = min(100, max(80, value))
            elif metric == "errors":
                # Poucos erros por dia
                value = max(0, base_value + randint(-2, 2))
            else:
                # Outras métricas podem variar mais
                variation = randint(-base_value // 2, base_value)
                value = max(0, base_value + variation)
            
            # Arredondar o valor
            if isinstance(value, float):
                value = round(value, 1)
                
            data_points.append(TimeSeriesPoint(
                date=date,
                value=value
            ))
        
        # Calcular comparação
        half_point = len(data_points) // 2
        current_data = data_points[half_point:]
        previous_data = data_points[:half_point]
        
        current_total = sum(point.value for point in current_data)
        previous_total = sum(point.value for point in previous_data)
        
        if previous_total == 0:
            change_percent = 100.0 if current_total > 0 else 0.0
        else:
            change_percent = ((current_total - previous_total) / previous_total) * 100
        
        comparison = {
            "previous_period": round(previous_total, 1),
            "current_period": round(current_total, 1),
            "change_percent": round(change_percent, 1)
        }
        
        return TimeSeriesData(
            metric=metric,
            unit=unit,
            data=data_points,
            comparison=comparison
        )