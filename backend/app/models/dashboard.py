from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional
from enum import Enum
from datetime import datetime
from uuid import UUID, uuid4

# Enums para status e tipos de automação
class AutomationStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    PAUSED = "paused"

class AutomationType(str, Enum):
    API_INTEGRATION = "api_integration"
    DOCUMENT_PROCESSING = "document_processing"
    EMAIL_AUTOMATION = "email_automation"
    DATA_SYNC = "data_sync"
    APPROVAL_FLOW = "approval_flow"
    LEAD_GENERATION = "lead_generation"
    CLIENT_ONBOARDING = "client_onboarding"
    CUSTOM = "custom"

# Modelo para resumo de automação (lista)
class AutomationSummary(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    automation_type: AutomationType
    status: AutomationStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_execution: Optional[datetime] = None
    executions_count: int = 0
    success_rate: float = 0.0
    time_saved: int = 0  # Em minutos
    
    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
                "name": "Processamento de Pedidos",
                "description": "Automação para processamento de pedidos do e-commerce",
                "automation_type": "document_processing",
                "status": "active",
                "created_at": "2023-03-15T14:30:00Z",
                "updated_at": "2023-04-20T10:15:00Z",
                "last_execution": "2023-05-01T08:45:00Z",
                "executions_count": 128,
                "success_rate": 98.4,
                "time_saved": 1240
            }
        }

# Modelo para detalhe de automação (visualização individual)
class AutomationDetail(AutomationSummary):
    client_id: UUID
    workflow_id: Optional[str] = None
    created_by: UUID
    updated_by: Optional[UUID] = None
    config: Dict[str, Any] = {}
    schedule: Optional[Dict[str, Any]] = None
    tags: List[str] = []
    metadata: Dict[str, Any] = {}
    
    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
                "name": "Processamento de Pedidos",
                "description": "Automação para processamento de pedidos do e-commerce",
                "client_id": "a21ac50c-28bc-4562-a567-1e02f6c5d124",
                "workflow_id": "32",
                "automation_type": "document_processing",
                "status": "active",
                "created_at": "2023-03-15T14:30:00Z",
                "updated_at": "2023-04-20T10:15:00Z",
                "created_by": "c17dc30a-18fc-4162-b427-0e04f2c1a432",
                "updated_by": "c17dc30a-18fc-4162-b427-0e04f2c1a432",
                "last_execution": "2023-05-01T08:45:00Z",
                "executions_count": 128,
                "success_rate": 98.4,
                "time_saved": 1240,
                "config": {
                    "api_key": "••••••••••••••••",
                    "target_folder": "/uploads/processed",
                    "notification_email": "admin@example.com"
                },
                "schedule": {
                    "frequency": "daily",
                    "time": "08:00",
                    "weekdays": [1, 2, 3, 4, 5]
                },
                "tags": ["e-commerce", "pedidos", "processamento"],
                "metadata": {
                    "version": "1.2",
                    "template_id": "doc-proc-v2"
                }
            }
        }

# Modelo para execução de automação
class AutomationExecution(BaseModel):
    id: UUID
    automation_id: UUID
    execution_id: str  # ID da execução no N8N
    status: str  # success, error, running
    started_at: datetime
    finished_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    triggered_by: Optional[UUID] = None  # Usuário que acionou manualmente, se aplicável
    trigger_type: str  # manual, scheduled, webhook
    success: Optional[bool] = None
    error_message: Optional[str] = None
    processed_items: Optional[int] = None
    metadata: Dict[str, Any] = {}
    
    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "id": "d47ac10b-58cc-4372-a567-0e02b2c3d479",
                "automation_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
                "execution_id": "45",
                "status": "success",
                "started_at": "2023-05-01T08:45:00Z",
                "finished_at": "2023-05-01T08:46:30Z",
                "duration_seconds": 90,
                "triggered_by": "c17dc30a-18fc-4162-b427-0e04f2c1a432",
                "trigger_type": "manual",
                "success": true,
                "processed_items": 15,
                "metadata": {
                    "files_processed": 12,
                    "bytes_processed": 1458900
                }
            }
        }

# Modelo para estatísticas do dashboard
class ClientDashboardStats(BaseModel):
    total_automations: int
    active_automations: int
    total_executions: int
    success_rate: float
    time_saved: int  # Em minutos
    executions_today: int
    executions_this_week: int
    errors_today: int
    most_used_automation: Optional[str] = None
    automation_types: Dict[str, int]  # Contagem por tipo
    
    class Config:
        schema_extra = {
            "example": {
                "total_automations": 12,
                "active_automations": 8,
                "total_executions": 2450,
                "success_rate": 97.8,
                "time_saved": 15240,
                "executions_today": 25,
                "executions_this_week": 143,
                "errors_today": 1,
                "most_used_automation": "Processamento de Pedidos",
                "automation_types": {
                    "document_processing": 4,
                    "api_integration": 3,
                    "data_sync": 2,
                    "email_automation": 2,
                    "client_onboarding": 1
                }
            }
        }

# Modelo para dados de série temporal (gráficos)
class TimeSeriesPoint(BaseModel):
    date: str
    value: float
    label: Optional[str] = None

class TimeSeriesData(BaseModel):
    metric: str
    unit: str
    data: List[TimeSeriesPoint]
    comparison: Optional[Dict[str, Any]] = None
    
    class Config:
        schema_extra = {
            "example": {
                "metric": "executions",
                "unit": "count",
                "data": [
                    {"date": "2023-04-25", "value": 15},
                    {"date": "2023-04-26", "value": 22},
                    {"date": "2023-04-27", "value": 18},
                    {"date": "2023-04-28", "value": 25},
                    {"date": "2023-04-29", "value": 20},
                    {"date": "2023-04-30", "value": 12},
                    {"date": "2023-05-01", "value": 25}
                ],
                "comparison": {
                    "previous_period": 105,
                    "current_period": 137,
                    "change_percent": 30.5
                }
            }
        }

# Modelo para nova automação
class NewAutomation(BaseModel):
    name: str
    description: Optional[str] = None
    client_id: Optional[UUID] = None  # Se não fornecido, usa o cliente do usuário atual
    type: AutomationType
    template_id: Optional[str] = None  # ID do template no N8N, se aplicável
    config: Dict[str, Any] = {}
    schedule: Optional[Dict[str, Any]] = None
    tags: List[str] = []
    
    class Config:
        schema_extra = {
            "example": {
                "name": "Novo Processamento de Documentos",
                "description": "Automação para processar documentos da pasta compartilhada",
                "type": "document_processing",
                "template_id": "doc-proc-v2",
                "config": {
                    "source_folder": "/shared/uploads",
                    "target_folder": "/processed",
                    "notification_email": "admin@example.com"
                },
                "schedule": {
                    "frequency": "daily",
                    "time": "08:00",
                    "weekdays": [1, 2, 3, 4, 5]
                },
                "tags": ["documentos", "processamento"]
            }
        }

# Modelo para atualização de automação
class UpdateAutomation(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[AutomationStatus] = None
    config: Optional[Dict[str, Any]] = None
    schedule: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    
    @validator('config')
    def validate_config(cls, v, values):
        # Verificar se há dados de configuração a serem validados
        if not v:
            return v
            
        # Verificar se a configuração contém dados sensíveis mascarados
        for key, value in v.items():
            if isinstance(value, str) and value.startswith("••••"):
                raise ValueError(f"Campo de configuração '{key}' contém valor mascarado. Forneça o valor completo ou remova este campo.")
        
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "name": "Processamento de Documentos Atualizado",
                "description": "Automação para processar documentos com novos parâmetros",
                "status": "active",
                "config": {
                    "source_folder": "/shared/uploads/new",
                    "notification_email": "admin@example.com"
                },
                "schedule": {
                    "frequency": "daily",
                    "time": "10:00",
                    "weekdays": [1, 2, 3, 4, 5]
                },
                "tags": ["documentos", "processamento", "atualizado"]
            }
        }