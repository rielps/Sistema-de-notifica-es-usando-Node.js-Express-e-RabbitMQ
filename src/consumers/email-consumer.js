const amqp = require("amqplib")
const RabbitMQConfig = require("../config/rabbitmq")

class EmailNotificationConsumer {
  constructor() {
    this.rabbitmq = new RabbitMQConfig()
    this.consumerTag = null
  }

  async start() {
    try {
      console.log("[Email Consumer] Iniciando consumidor de notificações por email...")

      // Conectar ao RabbitMQ
      const channel = await this.rabbitmq.connect()

      // Configurar QoS para processar uma mensagem por vez
      await channel.prefetch(1)

      console.log("[Email Consumer] Aguardando notificações por email...")
      console.log("[Email Consumer] Para parar, pressione CTRL+C")

      // Iniciar consumo da fila de emails
      const consumerInfo = await channel.consume(
        this.rabbitmq.queues.EMAIL_NOTIFICATIONS,
        async (message) => {
          if (message) {
            await this.processEmailNotification(channel, message)
          }
        },
        { noAck: false },
      )

      this.consumerTag = consumerInfo.consumerTag
    } catch (error) {
      console.error("[Email Consumer] Erro ao iniciar consumidor:", error.message)
      process.exit(1)
    }
  }

  async processEmailNotification(channel, message) {
    try {
      const notification = JSON.parse(message.content.toString())

      console.log(`\n📧 [Email Consumer] Nova notificação recebida:`)
      console.log(`   ID: ${notification.id}`)
      console.log(`   Destinatário: ${notification.destinatario}`)
      console.log(`   Mensagem: ${notification.mensagem}`)
      console.log(`   Prioridade: ${notification.prioridade}`)
      console.log(`   Timestamp: ${notification.timestamp}`)

      // Simular processamento de email
      await this.sendEmail(notification)

      // Confirmar processamento da mensagem
      channel.ack(message)

      console.log(`✅ [Email Consumer] Email enviado com sucesso para ${notification.destinatario}`)
    } catch (error) {
      console.error(`❌ [Email Consumer] Erro ao processar notificação:`, error.message)

      // Rejeitar mensagem e enviar para dead letter queue após 3 tentativas
      const retryCount = (message.properties.headers && message.properties.headers["x-retry-count"]) || 0

      if (retryCount < 3) {
        console.log(`🔄 [Email Consumer] Tentativa ${retryCount + 1}/3 - Reenviando mensagem`)

        // Incrementar contador de tentativas
        const headers = { ...message.properties.headers, "x-retry-count": retryCount + 1 }

        // Republicar mensagem com delay
        setTimeout(() => {
          channel.publish(this.rabbitmq.exchanges.NOTIFICATIONS, message.fields.routingKey, message.content, {
            ...message.properties,
            headers,
          })
          channel.ack(message)
        }, 5000) // 5 segundos de delay
      } else {
        console.log(`💀 [Email Consumer] Máximo de tentativas excedido - Enviando para Dead Letter Queue`)
        channel.nack(message, false, false) // Enviar para DLQ
      }
    }
  }

  async sendEmail(notification) {
    // Simular tempo de processamento de email
    const processingTime = Math.random() * 2000 + 1000 // 1-3 segundos

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simular falha ocasional (5% de chance)
        if (Math.random() < 0.05) {
          reject(new Error("Falha na conexão com servidor SMTP"))
          return
        }

        // Simular envio bem-sucedido
        console.log(`   📤 Conectando ao servidor SMTP...`)
        console.log(`   📝 Preparando email para ${notification.destinatario}`)
        console.log(`   🚀 Email enviado via SMTP!`)

        resolve()
      }, processingTime)
    })
  }

  async stop() {
    try {
      console.log("[Email Consumer] Parando consumidor...")

      if (this.consumerTag && this.rabbitmq.channel) {
        await this.rabbitmq.channel.cancel(this.consumerTag)
      }

      await this.rabbitmq.close()
      console.log("[Email Consumer] Consumidor parado com sucesso")
    } catch (error) {
      console.error("[Email Consumer] Erro ao parar consumidor:", error.message)
    }
  }
}

// Inicializar consumidor
const consumer = new EmailNotificationConsumer()

// Handlers para shutdown graceful
process.on("SIGTERM", () => consumer.stop().then(() => process.exit(0)))
process.on("SIGINT", () => consumer.stop().then(() => process.exit(0)))

// Iniciar consumidor
consumer.start()

module.exports = EmailNotificationConsumer
