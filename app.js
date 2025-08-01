const express = require("express")
const amqp = require("amqplib") // Biblioteca para interagir com o RabbitMQ
const cors = require("cors")

const app = express()
const PORT = 3000
const RABBITMQ_URL = "amqp://guest:guest@localhost:5672" // URL de conexão com o RabbitMQ
const QUEUE_NAME = "notificacoes" // Nome da fila onde as mensagens serão publicadas

// Middlewares
app.use(cors()) // Permitir requisições de qualquer origem
app.use(express.json()) // Middleware para parsear o corpo das requisições como JSON

/**
 * Endpoint GET / - Página inicial com informações da API
 */
app.get("/", (req, res) => {
  res.json({
    message: "🚀 API Gateway - Sistema de Notificações",
    version: "1.0.0",
    endpoints: {
      "POST /nova-notificacao": "Enviar nova notificação",
      "GET /health": "Verificar saúde da API",
    },
    rabbitmq: {
      queue: QUEUE_NAME,
      url: RABBITMQ_URL,
    },
    exemplo: {
      url: "POST http://localhost:3000/nova-notificacao",
      body: {
        mensagem: "Seu pedido foi confirmado!",
      },
    },
  })
})

/**
 * Endpoint GET /health - Health check da API
 */
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "Notification API Gateway",
  })
})

/**
 * Endpoint POST /nova-notificacao
 * Recebe uma mensagem JSON e a publica na fila do RabbitMQ.
 * Exemplo de corpo da requisição: { "mensagem": "Seu pedido foi confirmado!" }
 */
app.post("/nova-notificacao", async (req, res) => {
  const { mensagem } = req.body

  // Verifica se a mensagem foi fornecida no corpo da requisição
  if (!mensagem) {
    return res.status(400).json({
      error: 'O campo "mensagem" é obrigatório.',
      exemplo: {
        mensagem: "Seu pedido foi confirmado!",
      },
    })
  }

  let connection
  try {
    console.log(`[API Gateway] Tentando conectar ao RabbitMQ...`)

    // 1. Conecta-se ao servidor RabbitMQ
    connection = await amqp.connect(RABBITMQ_URL)
    console.log(`[API Gateway] Conectado ao RabbitMQ com sucesso!`)

    // 2. Cria um canal de comunicação
    const channel = await connection.createChannel()

    // 3. Garante que a fila existe. Se não existir, ela será criada.
    // `durable: true` significa que a fila sobreviverá a reinícios do RabbitMQ.
    await channel.assertQueue(QUEUE_NAME, { durable: true })

    // 4. Envia a mensagem para a fila.
    // A mensagem é convertida para um Buffer.
    // `persistent: true` marca a mensagem como persistente, para que ela não seja perdida
    // se o RabbitMQ reiniciar antes de ser consumida.
    channel.sendToQueue(QUEUE_NAME, Buffer.from(mensagem), { persistent: true })

    console.log(`[API Gateway] ✅ Mensagem enviada para a fila '${QUEUE_NAME}': "${mensagem}"`)

    res.status(200).json({
      success: true,
      message: "Notificação enviada com sucesso!",
      data: {
        mensagem: mensagem,
        fila: QUEUE_NAME,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[API Gateway] ❌ Erro ao enviar notificação:", error.message)
    res.status(500).json({
      error: "Erro interno do servidor ao enviar notificação.",
      details: error.message,
      troubleshooting: "Verifique se o RabbitMQ está rodando: docker-compose up -d",
    })
  } finally {
    // Garante que a conexão com o RabbitMQ seja fechada após o envio da mensagem
    if (connection) {
      await connection.close()
      console.log("[API Gateway] Conexão com RabbitMQ fechada.")
    }
  }
})

// Inicia o servidor Express
app.listen(PORT, () => {
  console.log(`\n🚀 [API Gateway] Servidor rodando em http://localhost:${PORT}`)
  console.log(`📡 [API Gateway] Endpoint para envio de notificações: POST /nova-notificacao`)
  console.log(`🏥 [API Gateway] Health check: GET /health`)
  console.log(`📋 [API Gateway] Documentação: GET /`)
  console.log(`\n💡 Exemplo de uso:`)
  console.log(`curl -X POST http://localhost:${PORT}/nova-notificacao \\`)
  console.log(`  -H "Content-Type: application/json" \\`)
  console.log(`  -d '{"mensagem": "Seu pedido foi confirmado!"}'`)
  console.log(`\n⚠️  Certifique-se de que o RabbitMQ está rodando: docker-compose up -d\n`)
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("[API Gateway] Recebido SIGTERM, encerrando servidor...")
  process.exit(0)
})

process.on("SIGINT", () => {
  console.log("\n[API Gateway] Recebido SIGINT, encerrando servidor...")
  process.exit(0)
})
