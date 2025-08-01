# 🚀 Sistema de Notificações com RabbitMQ

Sistema completo de notificações utilizando **Message-Oriented Middleware (MOM)** com **RabbitMQ**, demonstrando conceitos de sistemas distribuídos com produtores, consumidores e filas de mensagens.

## 🎯 Objetivo Acadêmico
- ✅ Implementar sistema com **tópicos/filas de mensagens**
- ✅ Criar **processos publicadores/produtores** (API Gateway)
- ✅ Criar **processos assinantes/consumidores** (Email, SMS, Push)
- ✅ Utilizar **RabbitMQ** como MOM para interligar processos

## 🏗️ Arquitetura

\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │───▶│    RabbitMQ     │───▶│   Consumidores  │
│   (Produtor)    │    │     (MOM)       │    │  (Assinantes)   │
│                 │    │                 │    │                 │
│ • REST API      │    │ • Exchanges     │    │ • Email Consumer│
│ • Validação     │    │ • Queues        │    │ • SMS Consumer  │
│ • Roteamento    │    │ • Routing Keys  │    │ • Push Consumer │
└─────────────────┘    └─────────────────┘    └─────────────────┘
\`\`\`

## 🛠️ Tecnologias

| Tecnologia | Papel no Sistema |
|------------|------------------|
| **Node.js + Express** | API Gateway (Produtor) |
| **RabbitMQ** | Message Broker (MOM) |
| **amqplib** | Cliente AMQP para comunicação |
| **Docker** | Containerização do RabbitMQ |


## 🚀 Como Executar

### 1. Preparar Ambiente
\`\`\`bash
# Instalar dependências
npm install

# Dar permissão aos scripts
chmod +x scripts/*.sh
\`\`\`

### 2. Iniciar RabbitMQ
\`\`\`bash
# Subir RabbitMQ com Docker
docker-compose up -d rabbitmq

# Aguardar inicialização (60 segundos)
sleep 60

# Verificar se está pronto
curl http://localhost:15672
# Login: admin / Senha: admin123
\`\`\`

### 3. Executar Sistema (4 terminais)

**Terminal 1 - API Gateway:**
\`\`\`bash
npm start
\`\`\`

**Terminal 2 - Email Consumer:**
\`\`\`bash
npm run consumer:email
\`\`\`

**Terminal 3 - SMS Consumer:**
\`\`\`bash
npm run consumer:sms
\`\`\`

**Terminal 4 - Push Consumer:**
\`\`\`bash
npm run consumer:push
\`\`\`

## 🧪 Testar Sistema

### Teste Rápido
\`\`\`bash
# Health check
curl http://localhost:3000/health

# Enviar notificação por email
curl -X POST http://localhost:3000/api/v1/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "email",
    "destinatario": "teste@exemplo.com",
    "mensagem": "Sistema funcionando!",
    "prioridade": "normal"
  }'
\`\`\`

### Testes Automatizados
\`\`\`bash
# Executar todos os testes
npm test

# Demonstração completa
npm run test:demo
\`\`\`

## 📊 Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/health` | Health check |
| POST | `/api/v1/notifications` | Enviar notificação |
| POST | `/api/v1/notifications/batch` | Envio em lote |

### Payload de Exemplo
\`\`\`json
{
  "tipo": "email|sms|push",
  "destinatario": "email@exemplo.com",
  "mensagem": "Sua mensagem aqui",
  "prioridade": "baixa|normal|alta"
}
\`\`\`

## 🎭 Para Apresentação

### Preparação (5 min)
\`\`\`bash
# 1. Iniciar RabbitMQ
docker-compose up -d rabbitmq && sleep 60

# 2. Abrir 4 terminais e executar:
npm start                    # Terminal 1
npm run consumer:email       # Terminal 2
npm run consumer:sms         # Terminal 3
npm run consumer:push        # Terminal 4
\`\`\`

### Demonstração
\`\`\`bash
# Script de demonstração automática
npm run test:demo
\`\`\`

### Pontos de Destaque
- ✅ **API Gateway** recebendo requisições HTTP
- ✅ **RabbitMQ** roteando mensagens por tipo
- ✅ **Consumidores** processando em paralelo
- ✅ **Logs em tempo real** mostrando fluxo
- ✅ **Painel RabbitMQ**: http://localhost:15672

## 🚨 Solução de Problemas

**RabbitMQ não inicia:**
\`\`\`bash
docker-compose down && docker-compose up -d rabbitmq
\`\`\`

**Erro de conexão:**
\`\`\`bash
# Verificar se RabbitMQ está rodando
curl http://localhost:15672
\`\`\`

**Porta 3000 ocupada:**
\`\`\`bash
export PORT=3001 && npm start
\`\`\`

## 📚 Conceitos Demonstrados

- **Message-Oriented Middleware (MOM)**: RabbitMQ como broker central
- **Publisher/Subscriber**: API publica, consumidores assinam filas
- **Topic Exchange**: Roteamento por routing keys (`notification.email.*`)
- **Dead Letter Queue**: Tratamento de mensagens com falha
- **Retry Pattern**: Tentativas automáticas em caso de erro

---

**Sistema pronto para demonstração acadêmica de Message-Oriented Middleware! 🎓**
