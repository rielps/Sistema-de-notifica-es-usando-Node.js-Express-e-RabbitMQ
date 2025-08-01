#!/bin/bash
# scripts/test-demo.sh
# Script de demonstração para apresentação

echo "🎭 Demonstração do Sistema de Notificações"
echo "=========================================="

API_URL="http://localhost:3000"

# Função para verificar se jq está instalado
check_jq() {
    if ! command -v jq &> /dev/null; then
        echo "⚠️  jq não está instalado. Instalando respostas sem formatação JSON..."
        return 1
    fi
    return 0
}

# Função para enviar notificação
send_notification() {
    local tipo=$1
    local destinatario=$2
    local mensagem=$3
    local prioridade=$4
    
    echo "📤 Enviando notificação $tipo para $destinatario..."
    
    if check_jq; then
        curl -s -X POST "$API_URL/api/v1/notifications" \
             -H "Content-Type: application/json" \
             -d "{
               \"tipo\": \"$tipo\",
               \"destinatario\": \"$destinatario\",
               \"mensagem\": \"$mensagem\",
               \"prioridade\": \"$prioridade\"
             }" | jq '.'
    else
        curl -s -X POST "$API_URL/api/v1/notifications" \
             -H "Content-Type: application/json" \
             -d "{
               \"tipo\": \"$tipo\",
               \"destinatario\": \"$destinatario\",
               \"mensagem\": \"$mensagem\",
               \"prioridade\": \"$prioridade\"
             }"
    fi
    
    echo ""
    sleep 2
}

# Verificar se a API está rodando
echo "🔍 Verificando se a API está rodando..."
if ! curl -s "$API_URL/health" > /dev/null; then
    echo "❌ API não está rodando. Inicie com: npm start"
    echo "💡 Certifique-se de que o RabbitMQ também está rodando: docker-compose up -d rabbitmq"
    exit 1
fi

echo "✅ API está rodando!"
echo ""

# Demonstração de diferentes tipos de notificação
echo "🎯 Demonstrando diferentes tipos de notificação:"
echo ""

send_notification "email" "cliente@empresa.com" "Seu pedido #12345 foi confirmado!" "normal"

send_notification "sms" "+5511999887766" "Código de verificação: 789123" "alta"

send_notification "push" "device_abc123" "Você tem 3 novas mensagens!" "normal"

# Demonstração de envio em lote
echo "📦 Demonstrando envio em lote..."

if check_jq; then
    curl -s -X POST "$API_URL/api/v1/notifications/batch" \
         -H "Content-Type: application/json" \
         -d '{
           "notifications": [
             {
               "tipo": "email",
               "destinatario": "user1@demo.com",
               "mensagem": "Promoção especial só hoje!",
               "prioridade": "baixa"
             },
             {
               "tipo": "sms", 
               "destinatario": "+5511888777666",
               "mensagem": "Lembrete: consulta amanhã às 14h",
               "prioridade": "alta"
             },
             {
               "tipo": "push",
               "destinatario": "device_xyz789",
               "mensagem": "Nova atualização disponível!",
               "prioridade": "normal"
             }
           ]
         }' | jq '.'
else
    curl -s -X POST "$API_URL/api/v1/notifications/batch" \
         -H "Content-Type: application/json" \
         -d '{
           "notifications": [
             {
               "tipo": "email",
               "destinatario": "user1@demo.com",
               "mensagem": "Promoção especial só hoje!",
               "prioridade": "baixa"
             },
             {
               "tipo": "sms", 
               "destinatario": "+5511888777666",
               "mensagem": "Lembrete: consulta amanhã às 14h",
               "prioridade": "alta"
             },
             {
               "tipo": "push",
               "destinatario": "device_xyz789",
               "mensagem": "Nova atualização disponível!",
               "prioridade": "normal"
             }
           ]
         }'
fi

echo ""
echo "🎉 Demonstração concluída!"
echo "👀 Verifique os logs dos consumidores para ver o processamento das mensagens."
echo ""
echo "📊 Para ver as filas no RabbitMQ: http://localhost:15672"
echo "   Usuário: admin | Senha: admin123"
