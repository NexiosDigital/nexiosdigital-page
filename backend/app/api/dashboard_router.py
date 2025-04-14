from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional, Dict, Any
import logging
from datetime import datetime, timedelta
from uuid import UUID
import json

from ..core.security import get_current_user, check_client_access
from ..models.dashboard import (
    AutomationSummary, 
    AutomationDetail, 
    ClientDashboardStats,
    AutomationExecution,
    TimeSeriesData,
    NewAutomation,
    UpdateAutomation
)
from ..models.auth import User, Client
from ..services.n8n_service import N8NService
from ..services.automation_service import AutomationService

logger = logging.getLogger(__name__)

# Criar router
router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

# Dependências
def get_automation_service():
    return AutomationService()

def get_n8n_service():
    return N8NService()

# Endpoint para obter estatísticas gerais do dashboard
@router.get("/stats", response_model=ClientDashboardStats)
async def get_dashboard_stats(
    client_id: Optional[UUID] = None,
    period: str = Query("7d", regex=r"^(7d|30d|90d|365d)$"),
    current_user: User = Depends(get_current_user),
    automation_service: AutomationService = Depends(get_automation_service)
):
    """
    Obtém estatísticas gerais para o dashboard do cliente.
    
    - **client_id**: ID do cliente (opcional, usa o cliente do usuário atual se não fornecido)
    - **period**: Período para estatísticas (7d, 30d, 90d, 365d)
    """
    # Se client_id não for fornecido, usa o do usuário atual
    if not client_id:
        client_id = current_user.client_id
    
    # Verificar se o usuário tem acesso a este cliente
    await check_client_access(current_user, client_id)
    
    # Converter period para timedelta
    period_map = {
        "7d": timedelta(days=7),
        "30d": timedelta(days=30),
        "90d": timedelta(days=90),
        "365d": timedelta(days=365)
    }
    time_period = period_map.get(period, timedelta(days=7))
    from_date = datetime.now() - time_period
    
    # Obter estatísticas do serviço
    try:
        stats = await automation_service.get_client_stats(client_id, from_date)
        return stats
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas do dashboard: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter estatísticas: {str(e)}"
        )

# Endpoint para listar automações
@router.get("/automations", response_model=List[AutomationSummary])
async def list_automations(
    client_id: Optional[UUID] = None,
    status: Optional[str] = None,
    type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    automation_service: AutomationService = Depends(get_automation_service)
):
    """
    Lista todas as automações do cliente com filtros opcionais.
    
    - **client_id**: ID do cliente (opcional, usa o cliente do usuário atual se não fornecido)
    - **status**: Filtrar por status (active, inactive, error)
    - **type**: Filtrar por tipo de automação
    """
    # Se client_id não for fornecido, usa o do usuário atual
    if not client_id:
        client_id = current_user.client_id
    
    # Verificar se o usuário tem acesso a este cliente
    await check_client_access(current_user, client_id)
    
    try:
        automations = await automation_service.list_automations(
            client_id=client_id,
            status=status,
            automation_type=type
        )
        return automations
    except Exception as e:
        logger.error(f"Erro ao listar automações: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar automações: {str(e)}"
        )

# Endpoint para obter detalhes de uma automação
@router.get("/automations/{automation_id}", response_model=AutomationDetail)
async def get_automation_details(
    automation_id: UUID,
    current_user: User = Depends(get_current_user),
    automation_service: AutomationService = Depends(get_automation_service)
):
    """
    Obtém detalhes de uma automação específica.
    
    - **automation_id**: ID da automação
    """
    try:
        # Buscar a automação
        automation = await automation_service.get_automation(automation_id)
        
        # Verificar se a automação existe
        if not automation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Automação com ID {automation_id} não encontrada"
            )
        
        # Verificar se o usuário tem acesso ao cliente desta automação
        await check_client_access(current_user, automation.client_id)
        
        return automation
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter detalhes da automação: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter detalhes da automação: {str(e)}"
        )

# Endpoint para histórico de execução de uma automação
@router.get("/automations/{automation_id}/executions", response_model=List[AutomationExecution])
async def get_automation_executions(
    automation_id: UUID,
    limit: int = Query(50, gt=0, le=1000),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    automation_service: AutomationService = Depends(get_automation_service)
):
    """
    Obtém o histórico de execuções de uma automação específica.
    
    - **automation_id**: ID da automação
    - **limit**: Número máximo de registros a retornar (padrão: 50, máx: 1000)
    - **offset**: Deslocamento para paginação (padrão: 0)
    """
    try:
        # Buscar a automação para verificar acesso
        automation = await automation_service.get_automation(automation_id)
        
        # Verificar se a automação existe
        if not automation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Automação com ID {automation_id} não encontrada"
            )
        
        # Verificar se o usuário tem acesso ao cliente desta automação
        await check_client_access(current_user, automation.client_id)
        
        # Buscar execuções
        executions = await automation_service.get_automation_executions(
            automation_id=automation_id,
            limit=limit,
            offset=offset
        )
        
        return executions
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao obter execuções da automação: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter execuções da automação: {str(e)}"
        )

# Endpoint para obter dados de série temporal para gráficos
@router.get("/time-series", response_model=TimeSeriesData)
async def get_time_series_data(
    client_id: Optional[UUID] = None,
    metric: str = Query(..., regex=r"^(executions|time_saved|success_rate|errors)$"),
    period: str = Query("7d", regex=r"^(7d|30d|90d|365d)$"),
    automation_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_user),
    automation_service: AutomationService = Depends(get_automation_service)
):
    """
    Obtém dados de série temporal para gráficos.
    
    - **client_id**: ID do cliente (opcional, usa o cliente do usuário atual se não fornecido)
    - **metric**: Métrica a ser analisada (executions, time_saved, success_rate, errors)
    - **period**: Período para análise (7d, 30d, 90d, 365d)
    - **automation_id**: Filtrar por automação específica (opcional)
    """
    # Se client_id não for fornecido, usa o do usuário atual
    if not client_id:
        client_id = current_user.client_id
    
    # Verificar se o usuário tem acesso a este cliente
    await check_client_access(current_user, client_id)
    
    # Converter period para timedelta
    period_map = {
        "7d": timedelta(days=7),
        "30d": timedelta(days=30),
        "90d": timedelta(days=90),
        "365d": timedelta(days=365)
    }
    time_period = period_map.get(period, timedelta(days=7))
    from_date = datetime.now() - time_period
    
    try:
        data = await automation_service.get_time_series_data(
            client_id=client_id,
            metric=metric,
            from_date=from_date,
            automation_id=automation_id
        )
        return data
    except Exception as e:
        logger.error(f"Erro ao obter dados de série temporal: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter dados de série temporal: {str(e)}"
        )

# Endpoint para executar uma automação manualmente
@router.post("/automations/{automation_id}/execute", status_code=status.HTTP_202_ACCEPTED)
async def execute_automation(
    automation_id: UUID,
    payload: Optional[Dict[str, Any]] = None,
    current_user: User = Depends(get_current_user),
    automation_service: AutomationService = Depends(get_automation_service),
    n8n_service: N8NService = Depends(get_n8n_service)
):
    """
    Executa uma automação manualmente.
    
    - **automation_id**: ID da automação
    - **payload**: Dados opcionais para a execução
    """
    try:
        # Buscar a automação para verificar acesso
        automation = await automation_service.get_automation(automation_id)
        
        # Verificar se a automação existe
        if not automation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Automação com ID {automation_id} não encontrada"
            )
        
        # Verificar se o usuário tem acesso ao cliente desta automação
        await check_client_access(current_user, automation.client_id)
        
        # Verificar se a automação está ativa
        if automation.status != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A automação não está ativa e não pode ser executada"
            )
        
        # Executar a automação
        execution_id = await n8n_service.execute_workflow(
            workflow_id=automation.workflow_id,
            payload=payload or {}
        )
        
        # Registrar a execução no banco de dados
        await automation_service.register_execution(
            automation_id=automation_id,
            execution_id=execution_id,
            triggered_by=current_user.id,
            payload=payload
        )
        
        return {
            "message": "Automação iniciada com sucesso",
            "execution_id": execution_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao executar automação: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao executar automação: {str(e)}"
        )

# Endpoint para criar uma nova automação
@router.post("/automations", response_model=AutomationDetail, status_code=status.HTTP_201_CREATED)
async def create_automation(
    automation: NewAutomation,
    current_user: User = Depends(get_current_user),
    automation_service: AutomationService = Depends(get_automation_service),
    n8n_service: N8NService = Depends(get_n8n_service)
):
    """
    Cria uma nova automação.
    
    Requer permissão de gerente ou administrador.
    """
    # Verificar permissão para criar automação
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permissão insuficiente para criar automações"
        )
    
    # Se client_id não for fornecido, usa o do usuário atual
    client_id = automation.client_id or current_user.client_id
    
    # Verificar se o usuário tem acesso a este cliente
    await check_client_access(current_user, client_id)
    
    try:
        # Criar fluxo de trabalho no N8N se for um template
        workflow_id = None
        if automation.template_id:
            workflow_id = await n8n_service.create_workflow_from_template(
                template_id=automation.template_id,
                name=automation.name,
                client_id=client_id,
                config=automation.config
            )
        
        # Criar registro de automação
        new_automation = await automation_service.create_automation(
            name=automation.name,
            description=automation.description,
            client_id=client_id,
            automation_type=automation.type,
            workflow_id=workflow_id,
            config=automation.config,
            schedule=automation.schedule,
            created_by=current_user.id
        )
        
        return new_automation
    except Exception as e:
        logger.error(f"Erro ao criar automação: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar automação: {str(e)}"
        )

# Endpoint para atualizar uma automação
@router.put("/automations/{automation_id}", response_model=AutomationDetail)
async def update_automation(
    automation_id: UUID,
    update_data: UpdateAutomation,
    current_user: User = Depends(get_current_user),
    automation_service: AutomationService = Depends(get_automation_service),
    n8n_service: N8NService = Depends(get_n8n_service)
):
    """
    Atualiza uma automação existente.
    
    Requer permissão de gerente ou administrador.
    """
    # Verificar permissão para atualizar automação
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permissão insuficiente para atualizar automações"
        )
    
    try:
        # Buscar a automação para verificar acesso
        automation = await automation_service.get_automation(automation_id)
        
        # Verificar se a automação existe
        if not automation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Automação com ID {automation_id} não encontrada"
            )
        
        # Verificar se o usuário tem acesso ao cliente desta automação
        await check_client_access(current_user, automation.client_id)
        
        # Atualizar a configuração no N8N se necessário
        if update_data.config and automation.workflow_id:
            await n8n_service.update_workflow_config(
                workflow_id=automation.workflow_id,
                config=update_data.config
            )
        
        # Atualizar registro de automação
        updated_automation = await automation_service.update_automation(
            automation_id=automation_id,
            name=update_data.name,
            description=update_data.description,
            status=update_data.status,
            config=update_data.config,
            schedule=update_data.schedule,
            updated_by=current_user.id
        )
        
        return updated_automation
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao atualizar automação: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar automação: {str(e)}"
        )

# Endpoint para excluir uma automação
@router.delete("/automations/{automation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_automation(
    automation_id: UUID,
    current_user: User = Depends(get_current_user),
    automation_service: AutomationService = Depends(get_automation_service),
    n8n_service: N8NService = Depends(get_n8n_service)
):
    """
    Exclui uma automação.
    
    Requer permissão de administrador.
    """
    # Verificar permissão para excluir automação
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permissão insuficiente para excluir automações"
        )
    
    try:
        # Buscar a automação para verificar acesso
        automation = await automation_service.get_automation(automation_id)
        
        # Verificar se a automação existe
        if not automation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Automação com ID {automation_id} não encontrada"
            )
        
        # Verificar se o usuário tem acesso ao cliente desta automação
        await check_client_access(current_user, automation.client_id)
        
        # Excluir o fluxo de trabalho no N8N se existir
        if automation.workflow_id:
            await n8n_service.delete_workflow(automation.workflow_id)
        
        # Excluir registro de automação
        await automation_service.delete_automation(automation_id)
        
        # Retorna 204 No Content
        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao excluir automação: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir automação: {str(e)}"
        )