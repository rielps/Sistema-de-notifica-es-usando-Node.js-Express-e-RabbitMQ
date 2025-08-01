#!/bin/bash
# scripts/start-all.sh
# Script para iniciar todos os componentes do sistema

echo "🚀 Iniciando Sistema de Notificações"
echo "===================================="

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Parar containers existentes se estiverem rodando
echo "🧹 Limpando containers existentes..."
docker-compose down > /dev/null 2>&1

# Subir RabbitMQ
echo "📦 Iniciando RabbitMQ..."
docker-compose up -d rabbitmq

# Aguardar RabbitMQ ficar pronto
echo "⏳ Aguardando RabbitMQ ficar pronto..."
sleep 15

# Verificar se RabbitMQ está saudável
echo "🔍 Verificando saúde do RabbitMQ..."
max_attempts=12
attempt=1

while [ $attempt -le $max_attempts ]; do
    if docker-compose exec -T rabbitmq rabbitmq-diagnostics check_port_connectivity > /dev/null 2>&1; then
        echo "✅ RabbitMQ está pronto!"
        break
    fi
    
    echo "   Tentativa $attempt/$max_attempts - Aguardando RabbitMQ..."
    sleep 5
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ RabbitMQ não ficou pronto após $max_attempts tentativas"
    echo "📋 Verificar logs: docker-compose logs rabbitmq"
    exit 1
fi

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

echo ""
echo "🎯 Sistema pronto! Agora você pode:"
echo "   1. Iniciar API Gateway: npm start"
echo "   2. Iniciar consumidores em terminais separados:"
echo "      - Email: npm run consumer:email"
echo "      - SMS: npm run consumer:sms"  
echo "      - Push: npm run consumer:push"
echo "   3. Executar testes: npm test"
echo "   4. Demonstração completa: npm run test:demo"
echo ""
echo "🌐 Painel RabbitMQ: http://localhost:15672"
echo "   Usuário: admin | Senha: admin123"
echo ""
echo "📡 API Gateway: http://localhost:3000"
echo ""
echo "⚠️  IMPORTANTE: Execute cada consumidor em um terminal separado!"
