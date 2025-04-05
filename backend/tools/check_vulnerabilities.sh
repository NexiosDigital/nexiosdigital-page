#!/bin/bash
# Script para verificar vulnerabilidades nas dependências Python
# Salve como backend/tools/check_vulnerabilities.sh e execute com chmod +x check_vulnerabilities.sh

set -e  # Interrompe o script em caso de erro

echo "===== Verificação de Vulnerabilidades em Dependências Python ====="
echo ""

# Verifica se pip-audit está instalado
if ! command -v pip-audit &> /dev/null; then
    echo "Instalando pip-audit..."
    pip install pip-audit
fi

# Verifica se safety está instalado
if ! command -v safety &> /dev/null; then
    echo "Instalando safety..."
    pip install safety
fi

echo "1. Verificando as dependências instaladas com pip-audit..."
echo "-------------------------------------------------------"
pip-audit

echo ""
echo "2. Verificando as dependências com safety..."
echo "-------------------------------------------------------"
safety check -r requirements.txt

echo ""
echo "3. Atualizando dependências específicas marcadas como vulneráveis..."
echo "-------------------------------------------------------"

# Lista de pacotes para atualizar (adicione conforme necessário)
PACKAGES_TO_UPDATE=""

# Verificar se existem pacotes para atualizar
if [ -n "$PACKAGES_TO_UPDATE" ]; then
    echo "Atualizando pacotes marcados como vulneráveis:"
    for package in $PACKAGES_TO_UPDATE; do
        echo "- Atualizando $package para a versão mais recente"
        pip install --upgrade $package
    done
else
    echo "Nenhum pacote específico marcado para atualização."
    echo "Se encontrou vulnerabilidades acima, atualize manualmente os pacotes afetados."
fi

echo ""
echo "4. Atualizando o requirements.txt com as versões atuais..."
echo "-------------------------------------------------------"

# Opção 1: Atualizar apenas as versões (mantém a estrutura atual do requirements.txt)
echo "Deseja atualizar o requirements.txt com as versões atuais? (s/n)"
read -r resposta
if [ "$resposta" = "s" ]; then
    # Criar backup do requirements.txt original
    cp requirements.txt requirements.txt.bak
    
    # Gerar novo requirements.txt com versões exatas
    pip freeze > requirements.txt.new
    
    echo "Arquivo requirements.txt atualizado como requirements.txt.new"
    echo "O arquivo original foi salvo como requirements.txt.bak"
    echo "Revise o novo arquivo antes de substituir o original."
else
    echo "Operação cancelada. Nenhuma mudança foi feita no requirements.txt."
fi

echo ""
echo "===== Verificação de Vulnerabilidades Concluída ====="
echo "Recomendações:"
echo "- Execute este script regularmente para verificar novas vulnerabilidades"
echo "- Considere implementar verificações automatizadas no seu pipeline CI/CD"
echo "- Utilize GitHub Dependabot ou similar para atualizações automáticas"