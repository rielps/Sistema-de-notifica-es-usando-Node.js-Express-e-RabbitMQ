# 🚀 Sistema de Notificações com Node.js, Express e RabbitMQ

Sistema didático para demonstrar o uso de filas de mensagens (Message Queue) com RabbitMQ, implementando o padrão Produtor/Consumidor.

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- Docker e Docker Compose
- Git

## 🛠️ Instalação

### 1. Clone o repositório
\`\`\`bash
git clone <url-do-repositorio>
cd sistema-notificacoes-rabbitmq
\`\`\`

### 2. Instale as dependências
\`\`\`bash
npm install
\`\`\`

### 3. Inicie o RabbitMQ com Docker
\`\`\`bash
docker-compose up -d
\`\`\`

Aguarde alguns segundos para o RabbitMQ inicializar completamente.

### 4. Verifique se o RabbitMQ está rodando
- Acesse o painel administrativo: http://localhost:15672
- Login: `guest` / Senha: `guest`

## 🚀 Como usar

### 1. Inicie a API Gateway (Terminal 1)
\`\`\`bash
npm start
\`\`\`

A API estará disponível em: http://localhost:3000

### 2. Inicie o Consumidor (Terminal 2)
\`\`\`bash
npm run consumer
\`\`\`

### 3. Teste o sistema

#### Opção A: Usando curl
\`\`\`bash
curl -X POST http://localhost:3000/nova-notificacao \
  -H "Content-Type: application/json" \
  -d '{"mensagem": "Seu pedido foi confirmado!"}'
\`\`\`

#### Opção B: Usando o script de teste
\`\`\`bash
npm test
\`\`\`

#### Opção C: Usando Postman
- **URL:** `POST http://localhost:3000/nova-notificacao`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
\`\`\`json
{
  "mensagem": "Seu pedido foi confirmado!"
}
\`\`\`

## 📡 Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Página inicial com documentação |
| GET | `/health` | Health check da API |
| POST | `/nova-notificacao` | Enviar nova notificação |

### Exemplo de requisição:
\`\`\`json
{
  "mensagem": "Seu pedido foi confirmado!"
}
\`\`\`

### Exemplo de resposta:
\`\`\`json
{
  "success": true,
  "message": "Notificação enviada com sucesso!",
  "data": {
    "mensagem": "Seu pedido foi confirmado!",
    "fila": "notificacoes",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
\`\`\`

## 🏗️ Arquitetura do Sistema

\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Cliente       │    │   API Gateway   │    │   RabbitMQ      │
│   (Postman/     │───▶│   (Express)     │───▶│   (Fila)        │
│    curl)        │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │   Consumidor    │
                                               │   (Node.js)     │
                                               └─────────────────┘
\`\`\`

## 🔧 Scripts disponíveis

- `npm start` - Inicia a API Gateway
- `npm run consumer` - Inicia o consumidor
- `npm run dev` - Inicia a API em modo desenvolvimento (com nodemon)
- `npm test` - Executa testes automatizados

## 🐳 Comandos Docker úteis

\`\`\`bash
# Iniciar RabbitMQ
docker-compose up -d

# Ver logs do RabbitMQ
docker-compose logs -f rabbitmq

# Parar RabbitMQ
docker-compose down

# Parar e remover volumes (limpar dados)
docker-compose down -v
\`\`\`

## 📊 Monitoramento

### Painel RabbitMQ Management
- **URL:** http://localhost:15672
- **Login:** guest
- **Senha:** guest

No painel você pode:
- Ver filas criadas
- Monitorar mensagens
- Ver estatísticas de consumo
- Gerenciar exchanges e bindings

## 🧪 Testando o Sistema

### Teste Manual
1. Inicie a API e o consumidor
2. Envie uma requisição POST para `/nova-notificacao`
3. Observe a mensagem sendo processada no terminal do consumidor

### Teste Automatizado
\`\`\`bash
npm test
\`\`\`

Este comando enviará várias notificações de teste e verificará se tudo está funcionando.

## 🔍 Troubleshooting

### Erro: ECONNREFUSED
- **Problema:** RabbitMQ não está rodando
- **Solução:** Execute `docker-compose up -d`

### Erro: Port already in use
- **Problema:** Porta 3000 já está em uso
- **Solução:** Pare outros processos ou altere a porta no `app.js`

### Consumidor não recebe mensagens
- **Problema:** Consumidor não está conectado
- **Solução:** Verifique se o RabbitMQ está rodando e reinicie o consumidor

## 📚 Conceitos Demonstrados

- **Message Queue (Fila de Mensagens):** Comunicação assíncrona entre sistemas
- **Producer/Publisher:** API Gateway que envia mensagens
- **Consumer/Subscriber:** Script que processa mensagens
- **Message Oriented Middleware (MOM):** RabbitMQ como intermediário
- **Durabilidade:** Mensagens persistem mesmo se o RabbitMQ reiniciar
- **Acknowledgment:** Confirmação de processamento das mensagens

## 🎯 Casos de Uso Reais

- Envio de emails de confirmação
- Notificações push para mobile
- Processamento de pedidos
- Integração entre microserviços
- Logs e auditoria
- Processamento de imagens/vídeos

## 📝 Próximos Passos

Para expandir este sistema, você pode:

1. Adicionar diferentes tipos de notificação (email, SMS, push)
2. Implementar filas com prioridade
3. Adicionar retry automático para falhas
4. Criar dashboard de monitoramento
5. Implementar autenticação na API
6. Adicionar testes unitários
7. Dockerizar toda a aplicação

## 🤝 Contribuição

Sinta-se à vontade para contribuir com melhorias, correções ou novas funcionalidades!

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.
