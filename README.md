# 🚀 Sistema de Notificações com RabbitMQ

## 📋 Visão Geral do Projeto

Este projeto implementa um **sistema completo de notificações** utilizando arquitetura de **Message-Oriented Middleware (MOM)** com **RabbitMQ**. O sistema demonstra conceitos fundamentais de sistemas distribuídos, incluindo produtores, consumidores, filas de mensagens e processamento assíncrono.

### 🎯 Objetivo Acadêmico
- Implementar sistema que utilize **tópicos/filas de mensagens**
- Criar **processos publicadores/produtores**
- Criar **processos assinantes/consumidores**  
- Utilizar **RabbitMQ** como MOM para interligar os processos
- Demonstrar **API Gateway** integrado com MOM

---

## 🏗️ Arquitetura do Sistema

\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │───▶│    RabbitMQ     │───▶│   Consumidores  │
│   (Produtor)    │    │     (MOM)       │    │  (Assinantes)   │
│                 │    │                 │    │                 │
│ • REST API      │    │ • Exchanges     │    │ • Email Consumer│
│ • Validação     │    │ • Queues        │    │ • SMS Consumer  │
│ • Roteamento    │    │ • Routing Keys  │    │ • Push Consumer │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        │                       │                       │
   HTTP Requests           AMQP Protocol         Message Processing
   POST /notifications     Topic Exchange        Specialized Workers
   Batch Processing        Dead Letter Queue     Retry Logic
\`\`\`

### 🔄 Fluxo de Dados
1. **Cliente** → Envia requisição HTTP para API Gateway
2. **API Gateway** → Valida dados e publica mensagem no RabbitMQ
3. **RabbitMQ** → Roteia mensagem para fila apropriada baseada no tipo
4. **Consumidor** → Processa mensagem especializada (Email/SMS/Push)
5. **Confirmação** → ACK para RabbitMQ ou reenvio em caso de erro

---

## 🛠️ Tecnologias Utilizadas

### **Backend & API**
| Tecnologia | Versão | Papel no Sistema |
|------------|--------|------------------|
| **Node.js** | 18+ | Runtime JavaScript para execução do backend |
| **Express.js** | 4.18+ | Framework web para criar API Gateway REST |
| **CORS** | 2.8+ | Middleware para controle de acesso entre origens |
| **Helmet** | 7.1+ | Middleware de segurança para headers HTTP |
| **Morgan** | 1.10+ | Middleware para logging de requisições HTTP |

### **Message-Oriented Middleware (MOM)**
| Tecnologia | Versão | Papel no Sistema |
|------------|--------|------------------|
| **RabbitMQ** | 3-management | Message broker principal - gerencia filas e exchanges |
| **amqplib** | 0.10+ | Cliente AMQP para Node.js - comunicação com RabbitMQ |
| **AMQP Protocol** | 0.9.1 | Protocolo de comunicação entre aplicação e RabbitMQ |

### **Containerização & Orquestração**
| Tecnologia | Versão | Papel no Sistema |
|------------|--------|------------------|
| **Docker** | Latest | Containerização do RabbitMQ para ambiente isolado |
| **Docker Compose** | 3.8 | Orquestração de serviços (RabbitMQ + configurações) |

### **Utilitários & Ferramentas**
| Tecnologia | Versão | Papel no Sistema |
|------------|--------|------------------|
| **UUID** | 9.0+ | Geração de IDs únicos para mensagens |
| **Axios** | Latest | Cliente HTTP para testes automatizados |
| **Nodemon** | 3.0+ | Auto-reload durante desenvolvimento |

---

## 📁 Estrutura do Projeto

\`\`\`
sistema-notificacoes-rabbitmq/
├── 📁 src/
│   ├── 📁 config/
│   │   └── rabbitmq.js          # Configurações centralizadas do RabbitMQ
│   ├── 📁 consumers/             # Consumidores especializados
│   │   ├── email-consumer.js     # Processador de notificações por email
│   │   ├── sms-consumer.js       # Processador de notificações por SMS
│   │   └── push-consumer.js      # Processador de notificações push
│   └── api-gateway.js            # API Gateway principal (Produtor)
├── 📁 tests/
│   └── test-notifications.js     # Testes automatizados do sistema
├── 📁 scripts/
│   ├── start-all.sh             # Script para iniciar todos os componentes
│   └── test-demo.sh             # Script de demonstração para apresentação
├── docker-compose.yml           # Configuração do RabbitMQ
├── Dockerfile                   # Container da aplicação Node.js
├── package.json                 # Dependências e scripts npm
└── README.md                    # Documentação completa
\`\`\`

---

## 🔧 Componentes Detalhados

### 1. **API Gateway (Produtor)**
**Arquivo:** `src/api-gateway.js`

**Responsabilidades:**
- ✅ Receber requisições HTTP REST
- ✅ Validar dados de entrada (tipo, destinatário, mensagem)
- ✅ Publicar mensagens no RabbitMQ via AMQP
- ✅ Implementar roteamento inteligente por tipo e prioridade
- ✅ Suportar envio individual e em lote
- ✅ Tratamento de erros e logging

**Endpoints:**
\`\`\`http
GET  /health                      # Health check
GET  /api/v1/stats               # Estatísticas do sistema
POST /api/v1/notifications       # Enviar notificação individual
POST /api/v1/notifications/batch # Enviar múltiplas notificações
\`\`\`

### 2. **RabbitMQ Configuration (MOM)**
**Arquivo:** `src/config/rabbitmq.js`

**Responsabilidades:**
- ✅ Gerenciar conexões com RabbitMQ
- ✅ Configurar exchanges, queues e bindings
- ✅ Implementar padrão Singleton para conexões
- ✅ Configurar Dead Letter Queue para mensagens com falha
- ✅ Definir routing keys para roteamento por tópicos

**Infraestrutura:**
\`\`\`
Exchanges:
├── notifications_exchange (topic) # Exchange principal
└── dead_letter_exchange (direct)  # Para mensagens com falha

Queues:
├── email_notifications    # Fila para emails
├── sms_notifications     # Fila para SMS
├── push_notifications    # Fila para push notifications
└── dead_letter_queue     # Fila para mensagens com falha

Routing Keys:
├── notification.email.*   # Emails (normal, alta, baixa)
├── notification.sms.*     # SMS (normal, alta, baixa)
└── notification.push.*    # Push (normal, alta, baixa)
\`\`\`

### 3. **Consumidores Especializados (Assinantes)**

#### **Email Consumer**
**Arquivo:** `src/consumers/email-consumer.js`
- 📧 Processa notificações por email
- 🔄 Simula conexão SMTP e envio
- ⚡ Retry automático (até 3 tentativas)
- 📊 Logs detalhados do processamento

#### **SMS Consumer**  
**Arquivo:** `src/consumers/sms-consumer.js`
- 📱 Processa notificações por SMS
- 🔄 Simula gateway SMS
- ⚡ Retry automático (até 3 tentativas)
- 📊 Logs detalhados do processamento

#### **Push Consumer**
**Arquivo:** `src/consumers/push-consumer.js`
- 🔔 Processa notificações push
- 🔄 Simula FCM/APNS
- ⚡ Retry automático (até 3 tentativas)
- 📊 Logs detalhados do processamento

### 4. **Sistema de Testes**
**Arquivo:** `tests/test-notifications.js`

**Funcionalidades:**
- ✅ Testes de health check
- ✅ Testes de notificações individuais
- ✅ Testes de envio em lote
- ✅ Testes de validação de dados
- ✅ Relatório automático de resultados

---

## 🚀 Guia Completo de Execução

### **Pré-requisitos**
\`\`\`bash
# Verificar versões necessárias
node --version    # v18.0.0 ou superior
npm --version     # v8.0.0 ou superior
docker --version  # v20.0.0 ou superior
\`\`\`

### **1. Preparação do Ambiente**

#### Clonar e Configurar Projeto
\`\`\`bash
# Clonar repositório
git clone <seu-repositorio-github>
cd sistema-notificacoes-rabbitmq

# Instalar dependências
npm install

# Dar permissão aos scripts
chmod +x scripts/*.sh
\`\`\`

#### Iniciar RabbitMQ
\`\`\`bash
# Subir RabbitMQ com Docker Compose
docker-compose up -d rabbitmq

# Verificar se está rodando
docker-compose ps

# Aguardar inicialização (30-60 segundos)
docker-compose logs -f rabbitmq
\`\`\`

#### Verificar RabbitMQ
- **Painel Web:** http://localhost:15672
- **Usuário:** `admin`
- **Senha:** `admin123`

### **2. Execução Manual (Recomendado para Apresentação)**

Abra **4 terminais diferentes** na pasta do projeto:

#### Terminal 1 - API Gateway (Produtor)
\`\`\`bash
npm start
# Saída esperada:
# [API Gateway] Servidor iniciado na porta 3000
# [RabbitMQ] Conexão estabelecida com sucesso!
# [RabbitMQ] Infraestrutura configurada com sucesso!
\`\`\`

#### Terminal 2 - Email Consumer
\`\`\`bash
npm run consumer:email
# Saída esperada:
# [Email Consumer] Iniciando consumidor de notificações por email...
# [Email Consumer] Aguardando notificações por email...
\`\`\`

#### Terminal 3 - SMS Consumer
\`\`\`bash
npm run consumer:sms
# Saída esperada:
# [SMS Consumer] Iniciando consumidor de notificações por SMS...
# [SMS Consumer] Aguardando notificações por SMS...
\`\`\`

#### Terminal 4 - Push Consumer
\`\`\`bash
npm run consumer:push
# Saída esperada:
# [Push Consumer] Iniciando consumidor de notificações push...
# [Push Consumer] Aguardando notificações push...
\`\`\`

### **3. Execução Automatizada**

#### Script de Inicialização Completa
\`\`\`bash
# Iniciar todos os serviços automaticamente
./scripts/start-all.sh

# O script irá:
# 1. Verificar Docker
# 2. Subir RabbitMQ
# 3. Aguardar RabbitMQ ficar pronto
# 4. Instalar dependências se necessário
# 5. Mostrar instruções para próximos passos
\`\`\`

---

## 🧪 Testando o Sistema

### **1. Teste Manual com cURL**

#### Health Check
\`\`\`bash
curl http://localhost:3000/health
\`\`\`

#### Notificação por Email
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

#### Notificação por SMS
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

#### Notificação Push
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

#### Envio em Lote
\`\`\`bash
curl -X POST http://localhost:3000/api/v1/notifications/batch \
  -H "Content-Type: application/json" \
  -d '{
    "notifications": [
      {
        "tipo": "email",
        "destinatario": "user1@demo.com",
        "mensagem": "Promoção especial!",
        "prioridade": "baixa"
      },
      {
        "tipo": "sms",
        "destinatario": "+5511888777666", 
        "mensagem": "Lembrete importante",
        "prioridade": "alta"
      }
    ]
  }'
\`\`\`

### **2. Testes Automatizados**

#### Executar Suite de Testes
\`\`\`bash
npm test

# Saída esperada:
# 🧪 Iniciando testes do sistema de notificações...
# 🔍 Testando health check...
# ✅ Health check passou
# 📧 Testando notificações individuais...
# ✅ Email Normal - Enviado com sucesso
# ✅ SMS Urgente - Enviado com sucesso
# ✅ Push Notification - Enviado com sucesso
# 📦 Testando envio em lote...
# ✅ Envio em lote - Sucesso
# 🔒 Testando validações...
# ✅ Tipo inválido - Validação funcionou corretamente
# 📊 Resumo dos Testes:
# Total: 8 | Passou: 8 | Falhou: 0
# 🎉 Todos os testes passaram!
\`\`\`

### **3. Demonstração para Apresentação**

#### Script de Demonstração Completa
\`\`\`bash
./scripts/test-demo.sh

# Este script irá:
# 1. Verificar se a API está rodando
# 2. Enviar diferentes tipos de notificação
# 3. Demonstrar envio em lote
# 4. Mostrar logs em tempo real nos consumidores
\`\`\`

---

## 📊 Monitoramento e Observabilidade

### **1. Logs do Sistema**

#### API Gateway
\`\`\`bash
# Logs mostram:
[API Gateway] Mensagem enviada para a fila 'email_notifications': "Bem-vindo!"
[API Gateway] Notificação criada - ID: abc123, Tipo: email, Destinatário: user@test.com
\`\`\`

#### Consumidores
\`\`\`bash
# Email Consumer:
📧 [Email Consumer] Nova notificação recebida:
   ID: abc123
   Destinatário: user@test.com
   Mensagem: Bem-vindo ao nosso sistema!
   📤 Conectando ao servidor SMTP...
   🚀 Email enviado via SMTP!
✅ [Email Consumer] Email enviado com sucesso para user@test.com
\`\`\`

### **2. Painel RabbitMQ**

Acesse: **http://localhost:15672**
- **Usuário:** `admin`
- **Senha:** `admin123`

**Funcionalidades do Painel:**
- 📊 Visualizar filas e número de mensagens
- 📈 Métricas de throughput e latência
- 🔍 Inspecionar mensagens individuais
- ⚙️ Configurar exchanges e bindings
- 📋 Monitorar conexões ativas

### **3. Estrutura de Filas**

\`\`\`bash
# Verificar filas via CLI
docker-compose exec rabbitmq rabbitmqctl list_queues

# Saída esperada:
# email_notifications    0
# sms_notifications      0  
# push_notifications     0
# dead_letter_queue      0
\`\`\`

---

## 🔧 Configurações Avançadas

### **Variáveis de Ambiente**
Crie arquivo `.env` na raiz do projeto:

\`\`\`bash
# .env
NODE_ENV=development
PORT=3000
RABBITMQ_URL=amqp://admin:admin123@localhost:5672/notifications
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
\`\`\`

### **Configuração do RabbitMQ**
\`\`\`yaml
# docker-compose.yml - Seção RabbitMQ
environment:
  RABBITMQ_DEFAULT_USER: admin
  RABBITMQ_DEFAULT_PASS: admin123
  RABBITMQ_DEFAULT_VHOST: /notifications
\`\`\`

### **Configuração de Retry**
\`\`\`javascript
// Configurável em cada consumer
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 segundos
\`\`\`

---

## 🛡️ Tratamento de Erros e Resiliência

### **1. Validação de Dados**
- ✅ Tipo de notificação obrigatório (email/sms/push)
- ✅ Destinatário obrigatório e formato válido
- ✅ Mensagem obrigatória (máximo 1000 caracteres)
- ✅ Validação de email com regex
- ✅ Validação de telefone com regex

### **2. Retry Logic**
- 🔄 Até 3 tentativas automáticas por mensagem
- ⏱️ Delay progressivo entre tentativas
- 💀 Dead Letter Queue após esgotar tentativas
- 📊 Headers para rastreamento de tentativas

### **3. Graceful Shutdown**
- 🛑 Captura sinais SIGTERM e SIGINT
- 🔒 Fecha conexões RabbitMQ adequadamente
- ⏳ Aguarda processamento de mensagens em andamento
- 📝 Logs de shutdown para auditoria

---

## 🎭 Guia para Apresentação

### **1. Preparação (5 minutos antes)**
\`\`\`bash
# Terminal 1: Iniciar RabbitMQ
docker-compose up -d rabbitmq

# Aguardar 30 segundos para inicialização

# Terminal 2: API Gateway
npm start

# Terminal 3: Email Consumer  
npm run consumer:email

# Terminal 4: SMS Consumer
npm run consumer:sms

# Terminal 5: Push Consumer
npm run consumer:push
\`\`\`

### **2. Demonstração ao Vivo (10-15 minutos)**

#### Passo 1: Mostrar Arquitetura
- Explicar componentes no quadro/slide
- Mostrar terminais com cada componente rodando
- Abrir painel RabbitMQ (http://localhost:15672)

#### Passo 2: Enviar Notificações
\`\`\`bash
# Demonstrar diferentes tipos
curl -X POST http://localhost:3000/api/v1/notifications \
  -H "Content-Type: application/json" \
  -d '{"tipo":"email","destinatario":"demo@apresentacao.com","mensagem":"Sistema funcionando perfeitamente!"}'
\`\`\`

#### Passo 3: Mostrar Processamento
- Apontar logs em tempo real nos consumidores
- Mostrar filas no painel RabbitMQ
- Explicar roteamento por routing keys

#### Passo 4: Demonstrar Resiliência
- Parar um consumidor (Ctrl+C)
- Enviar mensagem do mesmo tipo
- Mostrar acúmulo na fila
- Reiniciar consumidor e mostrar processamento

#### Passo 5: Testes Automatizados
\`\`\`bash
./scripts/test-demo.sh
\`\`\`

### **3. Pontos de Destaque**
- ✅ **Produtores**: API Gateway como ponto de entrada
- ✅ **MOM**: RabbitMQ gerenciando filas e roteamento
- ✅ **Consumidores**: Processamento especializado e paralelo
- ✅ **Escalabilidade**: Múltiplos consumidores por tipo
- ✅ **Resiliência**: Retry automático e Dead Letter Queue
- ✅ **Monitoramento**: Logs detalhados e painel web

---

## 🚨 Solução de Problemas

### **Problema: RabbitMQ não inicia**
\`\`\`bash
# Verificar se Docker está rodando
docker info

# Verificar logs do RabbitMQ
docker-compose logs rabbitmq

# Reiniciar serviços
docker-compose down
docker-compose up -d rabbitmq
\`\`\`

### **Problema: Erro de conexão AMQP**
\`\`\`bash
# Verificar se RabbitMQ está acessível
curl http://localhost:15672

# Verificar variáveis de ambiente
echo $RABBITMQ_URL

# Testar conexão manual
docker-compose exec rabbitmq rabbitmq-diagnostics check_port_connectivity
\`\`\`

### **Problema: Mensagens não são processadas**
\`\`\`bash
# Verificar filas no painel RabbitMQ
# http://localhost:15672 → Queues

# Verificar logs dos consumidores
# Procurar por erros de conexão ou processamento

# Reiniciar consumidores
# Ctrl+C nos terminais e executar novamente
\`\`\`

### **Problema: Porta 3000 em uso**
\`\`\`bash
# Alterar porta da API
export PORT=3001
npm start

# Ou matar processo na porta 3000
lsof -ti:3000 | xargs kill -9
\`\`\`

---

## 📚 Conceitos Demonstrados

### **1. Message-Oriented Middleware (MOM)**
- **Definição**: Sistema que facilita comunicação assíncrona entre aplicações
- **Implementação**: RabbitMQ como broker central
- **Benefícios**: Desacoplamento, escalabilidade, resiliência

### **2. Padrão Publisher/Subscriber**
- **Publishers**: API Gateway publicando mensagens
- **Subscribers**: Consumidores especializados assinando filas
- **Topic Exchange**: Roteamento baseado em routing keys

### **3. Arquitetura de Microserviços**
- **Separação de responsabilidades**: Cada consumidor tem função específica
- **Comunicação assíncrona**: Via filas de mensagens
- **Escalabilidade horizontal**: Múltiplos consumidores por tipo

### **4. Padrões de Resiliência**
- **Retry Pattern**: Tentativas automáticas em caso de falha
- **Dead Letter Queue**: Tratamento de mensagens problemáticas
- **Circuit Breaker**: Prevenção de cascata de falhas

---

## 🎓 Conclusão

Este sistema demonstra de forma prática e completa os conceitos fundamentais de **sistemas distribuídos** utilizando **Message-Oriented Middleware**. A implementação abrange desde a recepção de requisições HTTP até o processamento especializado de diferentes tipos de notificação, passando por validação, roteamento inteligente, tratamento de erros e monitoramento.

### **Principais Aprendizados:**
- ✅ Implementação de produtores e consumidores
- ✅ Configuração e uso de RabbitMQ como MOM
- ✅ Padrões de comunicação assíncrona
- ✅ Tratamento de falhas e resiliência
- ✅ Monitoramento e observabilidade
- ✅ Arquitetura de microserviços

### **Aplicações Reais:**
- 📧 Sistemas de notificação em e-commerce
- 📱 Notificações push em aplicativos móveis
- 🔔 Alertas em sistemas de monitoramento
- 📊 Processamento de eventos em tempo real
- 🚀 Integração entre microserviços

---

**Desenvolvido para demonstração acadêmica de sistemas distribuídos com Message-Oriented Middleware (MOM)**
