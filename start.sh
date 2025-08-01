#!/bin/bash

echo "🚀 Iniciando Sistema de Notificações"
echo "===================================="

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado. Por favor, instale o Node.js primeiro."
    exit 1
fi

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Subir RabbitMQ
echo "🐰 Iniciando RabbitMQ..."
docker-compose up -d

# Aguardar RabbitMQ ficar pronto
echo "⏳ Aguardando RabbitMQ ficar pronto..."
sleep 15

# Verificar se RabbitMQ está saudável
echo "🔍 Verificando saúde do RabbitMQ..."
until docker-compose exec rabbitmq rabbitmq-diagnostics check_port_connectivity > /dev/null 2>&1; do
    echo "   Aguardando RabbitMQ..."
    sleep 5
done

echo "✅ RabbitMQ está pronto!"
echo ""
echo "🎯 Sistema pronto! Agora você pode:"
echo "   1. Iniciar API Gateway: npm start"
echo "   2. Iniciar consumidor: npm run consumer"
echo "   3. Executar testes: npm test"
echo ""
echo "🌐 Painel RabbitMQ: http://localhost:15672"
echo "   Usuário: guest | Senha: guest"
echo ""
echo "📡 API Gateway: http://localhost:3000"
echo ""
echo "💡 Exemplo de teste:"
echo "curl -X POST http://localhost:3000/nova-notificacao \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"mensagem\": \"Seu pedido foi confirmado!\"}'"
