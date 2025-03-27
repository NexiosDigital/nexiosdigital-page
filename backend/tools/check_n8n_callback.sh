#!/bin/bash
# Script para testar o callback do N8N em produção
# Salve como /backend/tools/check_n8n_callback.sh e dê permissão de execução (chmod +x)

# Configurações
BASE_URL="https://nexiosdigital.com"
N8N_API_TOKEN=${N8N_API_TOKEN:-"dasdaksmda"}  # Usa a variável de ambiente ou o default
CONVERSATION_ID="test-callback-$(date +%s)"

# Cores para saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Teste de Callback N8N - Produção ===${NC}"
echo -e "URL Base: ${BASE_URL}"
echo -e "ID de Conversação de Teste: ${CONVERSATION_ID}"
echo -e "Data/Hora: $(date)"
echo -e "${YELLOW}Iniciando testes...${NC}"
echo ""

# Teste do endpoint de status
echo -e "1. Verificando status da API..."
STATUS_RESULT=$(curl -s -w "%{http_code}" -o /tmp/response.txt "${BASE_URL}/api/status")
STATUS_CODE=${STATUS_RESULT: -3}

if [[ $STATUS_CODE == 2* ]]; then
    echo -e "${GREEN}✓ API disponível (HTTP ${STATUS_CODE})${NC}"
    cat /tmp/response.txt | grep -vE "(api_key|secret|token)" | jq 2>/dev/null || cat /tmp/response.txt | grep -v "\"api_key\""
else
    echo -e "${RED}✗ API indisponível (HTTP ${STATUS_CODE})${NC}"
    cat /tmp/response.txt
    exit 1
fi

echo ""
echo "--------------------------------------------"
echo ""

# Teste do endpoint de callback sem autenticação
echo -e "2. Testando callback sem autenticação (deve falhar com 401)..."
NO_AUTH_RESULT=$(curl -s -X POST -H "Content-Type: application/json" -w "%{http_code}" -d '{
  "conversation_id": "'${CONVERSATION_ID}'",
  "original_message": "Mensagem de teste sem autenticação",
  "processed_response": "Esta mensagem não deve ser processada por falta de autenticação",
  "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
}' -o /tmp/response.txt "${BASE_URL}/api/n8n-callback")

NO_AUTH_CODE=${NO_AUTH_RESULT: -3}

if [[ $NO_AUTH_CODE == 401 ]]; then
    echo -e "${GREEN}✓ Comportamento correto: Rejeitou request sem autenticação (HTTP ${NO_AUTH_CODE})${NC}"
    cat /tmp/response.txt
else
    echo -e "${RED}✗ Comportamento inesperado: Aceitou request sem autenticação! (HTTP ${NO_AUTH_CODE})${NC}"
    cat /tmp/response.txt
    echo -e "${YELLOW}Verifique configurações de segurança!${NC}"
fi

echo ""
echo "--------------------------------------------"
echo ""

# Teste do endpoint de callback com autenticação
echo -e "3. Testando callback com autenticação correta..."
AUTH_RESULT=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${N8N_API_TOKEN}" -w "%{http_code}" -d '{
  "conversation_id": "'${CONVERSATION_ID}'",
  "original_message": "Mensagem de teste com autenticação",
  "processed_response": "Esta é uma resposta de teste do script de diagnóstico. Se você está vendo esta mensagem, o callback N8N está funcionando!",
  "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
  "metadata": {
    "source": "script_diagnóstico",
    "test_id": "'${CONVERSATION_ID}'",
    "environment": "production"
  }
}' -o /tmp/response.txt "${BASE_URL}/api/n8n-callback")

AUTH_CODE=${AUTH_RESULT: -3}

if [[ $AUTH_CODE == 2* ]]; then
    echo -e "${GREEN}✓ Callback processado com sucesso (HTTP ${AUTH_CODE})${NC}"
    cat /tmp/response.txt
else
    echo -e "${RED}✗ Falha no processamento do callback (HTTP ${AUTH_CODE})${NC}"
    cat /tmp/response.txt
fi

echo ""
echo "--------------------------------------------"
echo ""

# Verificar se a mensagem foi armazenada no servidor
echo -e "4. Verificando se a mensagem foi armazenada na conversa..."
MESSAGES_RESULT=$(curl -s -w "%{http_code}" -o /tmp/response.txt "${BASE_URL}/api/messages/${CONVERSATION_ID}")
MESSAGES_CODE=${MESSAGES_RESULT: -3}

if [[ $MESSAGES_CODE == 2* ]]; then
    echo -e "${GREEN}✓ Mensagens recuperadas com sucesso (HTTP ${MESSAGES_CODE})${NC}"
    cat /tmp/response.txt | jq 2>/dev/null || cat /tmp/response.txt
    
    # Verificar se a resposta de teste está nas mensagens
    if grep -q "resposta de teste do script de diagnóstico" /tmp/response.txt; then
        echo -e "${GREEN}✓ Mensagem de teste encontrada no histórico!${NC}"
    else
        echo -e "${YELLOW}⚠ Mensagem de teste não encontrada no histórico, verifique os logs do servidor.${NC}"
    fi
else
    echo -e "${RED}✗ Falha ao recuperar mensagens (HTTP ${MESSAGES_CODE})${NC}"
    cat /tmp/response.txt
fi

echo ""
echo "--------------------------------------------"

# Teste completo
echo -e "${BLUE}==== Resultado dos Testes ====${NC}"

if [[ $STATUS_CODE == 2* && $NO_AUTH_CODE == 401 && $AUTH_CODE == 2* && $MESSAGES_CODE == 2* ]]; then
    echo -e "${GREEN}✓ Todos os testes passaram!${NC}"
    echo -e "A configuração do callback N8N parece estar funcionando corretamente."
    echo -e "Para validar completamente, faça um teste com o fluxo N8N real."
    exit 0
else
    echo -e "${RED}✗ Alguns testes falharam!${NC}"
    echo -e "Revise os resultados acima para identificar o problema."
    exit 1
fi