# Sistema de Notificações com RabbitMQ

Sistema completo de notificações utilizando Node.js, Express e RabbitMQ, implementando padrões de Message-Oriented Middleware (MOM) com API Gateway, produtores e consumidores especializados.

## 🏗️ Arquitetura do Sistema

\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │───▶│    RabbitMQ     │───▶│   Consumidores  │
│   (Produtor)    │    │     (MOM)       │    │  (Assinantes)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        │                       │                       ├─ Email Consumer
        │                       │                       ├─ SMS Consumer  
        │                       │                       └─ Push Consumer
        │                       │
        └─ REST API              └─ Exchanges & Queues
           POST /notifications      - email_notifications
           POST /notifications/batch - sms_notifications
           GET  /health             - push_notifications
           GET  /stats              - dead_letter_queue
\`\`\`

## 🚀 Funcionalidades

### ✅ Produtores (Publishers)
- **API Gateway**: Endpoint REST para receber notificações
- **Validação de dados**: Validação completa dos payloads
- **Envio em lote**: Suporte para múltiplas notificações
- **Routing inteligente**: Direcionamento baseado em tipo e prioridade

### ✅ Consumidores (Subscribers)
- **Email Consumer**: Processamento de notificações por email
- **SMS Consumer**: Processamento de notificações por SMS  
- **Push Consumer**: Processamento de notificações push
- **Dead Letter Queue**: Tratamento de mensagens com falha

### ✅ Message-Oriented Middleware (RabbitMQ)
- **Exchanges**: Roteamento de mensagens por tópicos
- **Queues**: Filas especializadas por tipo de notificação
- **Durabilidade**: Persistência de mensagens e filas
- **Retry Logic**: Reenvio automático em caso de falha

## 📋 Pré-requisitos

- Node.js 16+ 
- Docker e Docker Compose
- Git

## 🛠️ Instalação e Configuração

### 1. Clonar o repositório
\`\`\`bash
git clone <seu-repositorio>
cd sistema-notificacoes-rabbitmq
\`\`\`

### 2. Instalar dependências
\`\`\`bash
npm install
\`\`\`

### 3. Iniciar RabbitMQ
\`\`\`bash
docker-compose up -d rabbitmq
\`\`\`

### 4. Verificar se RabbitMQ está rodando
- Painel administrativo: http://localhost:15672
- Usuário: `admin` | Senha: `admin123`

## 🎯 Como Executar

### Opção 1: Execução Manual (Recomendado para Demonstração)

#### Terminal 1 - API Gateway
\`\`\`bash
npm start
\`\`\`

#### Terminal 2 - Consumidor de Email
\`\`\`bash
npm run consumer:email
\`\`\`

#### Terminal 3 - Consumidor de SMS
\`\`\`bash
npm run consumer:sms
\`\`\`

#### Terminal 4 - Consumidor de Push
\`\`\`bash
npm run consumer:push
\`\`\`

### Opção 2: Script Automatizado
\`\`\`bash
chmod +x scripts/start-all.sh
./scripts/start-all.sh
\`\`\`

## 🧪 Testando o Sistema

### Teste Manual com cURL

#### Enviar notificação por email:
\`\`\`bash
curl -X POST http://localhost:3000/api/v1/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "email",
    "destinatario": "usuario@exemplo.com", 
    "mensagem": "Bem-vindo ao nosso sistema!",
    "prioridade": "normal"
  }'
\`\`\`

#### Enviar notificação por SMS:
\`\`\`bash
curl -X POST http://localhost:3000/api/v1/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "sms",
    "destinatario": "+5511999999999",
    "mensagem": "Código de verificação: 123456", 
    "prioridade": "alta"
  }'
\`\`\`

#### Enviar notificação push:
\`\`\`bash
curl -X POST http://localhost:3000/api/v1/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "push",
    "destinatario": "device_token_123",
    "mensagem": "Você tem uma nova mensagem!",
    "prioridade": "normal"
  }'
\`\`\`

### Teste Automatizado
\`\`\`bash
npm test
\`\`\`

### Demonstração Completa
\`\`\`bash
chmod +x scripts/test-demo.sh
./scripts/test-demo.sh
\`\`\`

## 📊 Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/health` | Health check da API |
| GET | `/api/v1/stats` | Estatísticas do sistema |
| POST | `/api/v1/notifications` | Enviar notificação individual |
| POST | `/api/v1/notifications/batch` | Enviar múltiplas notificações |

### Exemplo de Payload
\`\`\`json
{
  "tipo": "email|sms|push",
  "destinatario": "email@exemplo.com | +5511999999999 | device_token",
  "mensagem": "Sua mensagem aqui",
  "prioridade": "baixa|normal|alta",
  "metadata": {
    "campo_opcional": "valor"
  }
}
\`\`\`

## 🔧 Configuração Avançada

### Variáveis de Ambiente
\`\`\`bash
# .env
NODE_ENV=development
PORT=3000
RABBITMQ_URL=amqp://admin:admin123@localhost:5672/notifications
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
\`\`\`

### Configuração do RabbitMQ
- **Exchanges**: `notifications_exchange` (topic)
- **Routing Keys**: 
  - `notification.email.*`
  - `notification.sms.*` 
  - `notification.push.*`
- **Queues**:
  - `email_notifications`
  - `sms_notifications`
  - `push_notifications`
  - `dead_letter_queue`

## 🎭 Para Apresentação

### 1. Preparação
\`\`\`bash
# Iniciar todos os serviços
./scripts/start-all.sh

# Em terminais separados, iniciar cada consumidor
npm run consumer:email
npm run consumer:sms  
npm run consumer:push
\`\`\`

### 2. Demonstração ao Vivo
\`\`\`bash
# Executar demonstração interativa
./scripts/test-demo.sh
\`\`\`

### 3. Pontos de Destaque
- ✅ **Produtores**: API Gateway recebendo requisições
- ✅ **MOM**: RabbitMQ roteando mensagens por tópicos
- ✅ **Consumidores**: Processamento especializado por tipo
- ✅ **Resiliência**: Retry automático e Dead Letter Queue
- ✅ **Monitoramento**: Logs detalhados em tempo real

## 📈 Monitoramento

### Logs do Sistema
- API Gateway: Requisições e publicações
- Consumidores: Processamento de mensagens
- RabbitMQ: Status das filas e exchanges

### Painel RabbitMQ
- URL: http://localhost:15672
- Visualização de filas, exchanges e mensagens
- Métricas de performance em tempo real

## 🛡️ Tratamento de Erros

- **Validação**: Dados inválidos retornam erro 400
- **Retry Logic**: Até 3 tentativas automáticas
- **Dead Letter Queue**: Mensagens com falha persistente
- **Graceful Shutdown**: Fechamento seguro das conexões

## 🔄 Fluxo de Mensagens

1. **Cliente** envia requisição para API Gateway
2. **API Gateway** valida dados e publica no RabbitMQ
3. **RabbitMQ** roteia mensagem para fila apropriada
4. **Consumidor** especializado processa a mensagem
5. **Confirmação** (ACK) ou reenvio em caso de erro

## 📚 Tecnologias Utilizadas

- **Node.js**: Runtime JavaScript
- **Express**: Framework web
- **RabbitMQ**: Message broker (MOM)
- **amqplib**: Cliente AMQP para Node.js
- **Docker**: Containerização
- **UUID**: Geração de IDs únicos

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**Desenvolvido para demonstração acadêmica de sistemas distribuídos com Message-Oriented Middleware (MOM)**
