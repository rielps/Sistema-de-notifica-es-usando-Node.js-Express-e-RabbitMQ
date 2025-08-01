# scripts/start-all.sh
# Script para iniciar todos os componentes do sistema

echo "🚀 Iniciando Sistema de Notificações"
echo "===================================="

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Subir RabbitMQ
echo "📦 Iniciando RabbitMQ..."
docker-compose up -d rabbitmq

# Aguardar RabbitMQ ficar pronto
echo "⏳ Aguardando RabbitMQ ficar pronto..."
sleep 10

# Verificar se RabbitMQ está saudável
echo "🔍 Verificando saúde do RabbitMQ..."
until docker-compose exec rabbitmq rabbitmq-diagnostics check_port_connectivity > /dev/null 2>&1; do
    echo "   Aguardando RabbitMQ..."
    sleep 5
done

echo "✅ RabbitMQ está pronto!"

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

echo ""
echo "🎯 Sistema pronto! Agora você pode:"
echo "   1. Iniciar API Gateway: npm start"
echo "   2. Iniciar consumidores:"
echo "      - Email: npm run consumer:email"
echo "      - SMS: npm run consumer:sms"  
echo "      - Push: npm run consumer:push"
echo "   3. Executar testes: npm test"
echo ""
echo "🌐 Painel RabbitMQ: http://localhost:15672"
echo "   Usuário: admin | Senha: admin123"
echo ""
echo "📡 API Gateway: http://localhost:3000"
