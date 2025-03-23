# Backend Nexios Digital - API para Assistente de IA

## Visão Geral

Este módulo backend implementa a API para o assistente virtual da Nexios Digital, permitindo processamento de mensagens via OpenAI e integração com fluxos de trabalho N8N para respostas mais avançadas. O sistema suporta comunicação em tempo real via WebSockets e fornece endpoints para interação com o frontend e sistemas externos.

## Tecnologias Utilizadas

- **FastAPI**: Framework web moderno, rápido e assíncrono para APIs
- **WebSockets**: Para comunicação em tempo real com o frontend
- **OpenAI API**: Para processamento de linguagem natural
- **N8N**: Para fluxos de trabalho personalizados e automações
- **Docker**: Para containerização e ambiente de desenvolvimento consistente

## Estrutura do Projeto

```
backend/
├── app/                  # Código principal
├── main.py               # Arquivo principal com todas as rotas
├── requirements.txt      # Dependências Python
└── Dockerfile            # Configuração Docker
```

## Endpoints da API

### Endpoints REST

| Rota | Método | Descrição |
|------|--------|-----------|
| `/api/chat` | POST | Processamento de mensagens via OpenAI |
| `/api/chat-n8n` | POST | Encaminhamento de mensagens para N8N |
| `/api/n8n-callback` | POST | Recebe respostas processadas do N8N |
| `/api/conversations/{conversation_id}` | GET | Obtém histórico de conversas |
| `/api/status` | GET | Verifica status do sistema e suas conexões |
| `/` | GET | Verificação básica de disponibilidade da API |

### Endpoint WebSocket

| Rota | Descrição |
|------|-----------|
| `/ws/{client_id}` | Conexão WebSocket para atualizações em tempo real |

## Modelos de Dados

### Requisição para Chat
```json
{
  "message": "Texto da mensagem do usuário",
  "conversation_history": [
    {"role": "user", "content": "Mensagem anterior do usuário"},
    {"role": "assistant", "content": "Resposta anterior do assistente"}
  ],
  "conversation_id": "uuid-opcional-para-conversa"
}
```

### Resposta do Chat
```json
{
  "response": "Texto da resposta do assistente",
  "conversation_id": "uuid-da-conversa"
}
```

### Callback do N8N
```json
{
  "conversation_id": "uuid-da-conversa",
  "original_message": "Mensagem original do usuário",
  "processed_response": "Resposta processada pelo N8N",
  "timestamp": "2023-05-01T12:34:56.789Z",
  "metadata": {
    "source": "n8n-flow",
    "processing_time": 123
  }
}
```

## Configuração

### Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `OPENAI_API_KEY` | Chave da API OpenAI | Sim, para o modo OpenAI |
| `OPENAI_ORG_ID` | ID da organização OpenAI | Não |
| `N8N_WEBHOOK_URL` | URL do webhook do N8N | Sim, para o modo N8N |
| `N8N_API_TOKEN` | Token para autenticar callbacks do N8N | Sim, para callbacks |
| `SECRET_KEY` | Chave secreta para JWT | Sim |

### Executando Localmente

1. Instale as dependências:
```bash
pip install -r requirements.txt
```

2. Execute o servidor:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Executando com Docker

```bash
docker-compose up -d
```

## Integração com N8N

O sistema pode processar mensagens através de um fluxo de trabalho N8N personalizado. Para isso:

1. A mensagem é enviada do frontend para o endpoint `/api/chat-n8n`
2. A API encaminha a mensagem para o webhook do N8N configurado
3. O fluxo N8N processa a mensagem e pode:
   - Retornar uma resposta direta
   - Enviar uma resposta via callback para `/api/n8n-callback`
4. Se a resposta vier via callback, a API a transmite para o frontend via WebSocket

### Configuração do Callback N8N

Para que o N8N possa enviar callbacks ao backend, adicione um nó HTTP Request no seu fluxo N8N:

```json
{
  "url": "https://seu-backend.com/api/n8n-callback",
  "method": "POST",
  "authentication": "headerAuth",
  "headerParameters": {
    "Authorization": "Bearer seu_token_secreto"
  },
  "bodyParameters": {
    "conversation_id": "={{ $node[\"Webhook\"].json.conversation_id }}",
    "original_message": "={{ $node[\"Webhook\"].json.message }}",
    "processed_response": "Sua resposta processada aqui",
    "timestamp": "={{ $now }}"
  }
}
```

## Nota Importante

Se o backend estiver rodando localmente e o N8N em um servidor externo, será necessário usar uma ferramenta como ngrok para expor o endpoint `/api/n8n-callback` para a internet:

```bash
ngrok http 8000
```

Em seguida, atualize o nó HTTP Request do N8N para usar a URL fornecida pelo ngrok.

## Armazenamento de Conversas

Atualmente, as conversas são armazenadas em memória até um máximo de 50 mensagens por conversa. Em uma implementação de produção, recomenda-se substituir por um banco de dados persistente.

## WebSockets

O sistema utiliza WebSockets para enviar atualizações em tempo real para o frontend. Cada cliente recebe um ID único e pode se inscrever para receber atualizações específicas de sua conversa.

## Segurança

- Autenticação por token Bearer para o endpoint de callback
- Validação de entrada usando modelos Pydantic
- CORS configurado para permitir requisições do frontend

## Próximas Melhorias Previstas

- Implementação de banco de dados para persistência
- Autenticação de usuários
- Sistema de notificações avançado
- Análise de sentimento e intenções
- Melhor tratamento de erros e retentativas