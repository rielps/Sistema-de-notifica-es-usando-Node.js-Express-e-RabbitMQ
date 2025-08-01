const express = require("express")
const amqp = require("amqplib") // Biblioteca para interagir com o RabbitMQ

const app = express()
const PORT = 3000
const RABBITMQ_URL = "amqp://guest:guest@localhost:5672" // URL de conexão com o RabbitMQ
const QUEUE_NAME = "notificacoes" // Nome da fila onde as mensagens serão publicadas

// Middleware para parsear o corpo das requisições como JSON
app.use(express.json())

/**
 * Endpoint POST /nova-notificacao
 * Recebe uma mensagem JSON e a publica na fila do RabbitMQ.
 * Exemplo de corpo da requisição: { "mensagem": "Seu pedido foi confirmado!" }
 */
app.post("/nova-notificacao", async (req, res) => {
  const { mensagem } = req.body

  // Verifica se a mensagem foi fornecida no corpo da requisição
  if (!mensagem) {
    return res.status(400).json({ error: 'O campo "mensagem" é obrigatório.' })
  }

  let connection
  try {
    // 1. Conecta-se ao servidor RabbitMQ
    connection = await amqp.connect(RABBITMQ_URL)
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

    console.log(`[API Gateway] Mensagem enviada para a fila '${QUEUE_NAME}': "${mensagem}"`)
    res.status(200).json({ success: true, message: "Notificação enviada com sucesso!" })
  } catch (error) {
    console.error("[API Gateway] Erro ao enviar notificação:", error.message)
    res.status(500).json({ error: "Erro interno do servidor ao enviar notificação." })
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
  console.log(`[API Gateway] Servidor rodando em http://localhost:${PORT}`)
  console.log(`[API Gateway] Endpoint para envio de notificações: POST /nova-notificacao`)
})
