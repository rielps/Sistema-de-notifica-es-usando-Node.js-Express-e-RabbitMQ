const amqp = require("amqplib")
const RabbitMQConfig = require("../config/rabbitmq")

class SMSNotificationConsumer {
  constructor() {
    this.rabbitmq = new RabbitMQConfig()
    this.consumerTag = null
  }

  async start() {
    try {
      console.log("[SMS Consumer] Iniciando consumidor de notificações por SMS...")

      // Conectar ao RabbitMQ
      const channel = await this.rabbitmq.connect()

      // Configurar QoS para processar uma mensagem por vez
      await channel.prefetch(1)

      console.log("[SMS Consumer] Aguardando notificações por SMS...")
      console.log("[SMS Consumer] Para parar, pressione CTRL+C")

      // Iniciar consumo da fila de SMS
      const consumerInfo = await channel.consume(
        this.rabbitmq.queues.SMS_NOTIFICATIONS,
        async (message) => {
          if (message) {
            await this.processSMSNotification(channel, message)
          }
        },
        { noAck: false },
      )

      this.consumerTag = consumerInfo.consumerTag
    } catch (error) {
      console.error("[SMS Consumer] Erro ao iniciar consumidor:", error.message)
      process.exit(1)
    }
  }

  async processSMSNotification(channel, message) {
    try {
      const notification = JSON.parse(message.content.toString())

      console.log(`\n📱 [SMS Consumer] Nova notificação recebida:`)
      console.log(`   ID: ${notification.id}`)
      console.log(`   Destinatário: ${notification.destinatario}`)
      console.log(`   Mensagem: ${notification.mensagem}`)
      console.log(`   Prioridade: ${notification.prioridade}`)
      console.log(`   Timestamp: ${notification.timestamp}`)

      // Simular processamento de SMS
      await this.sendSMS(notification)

      // Confirmar processamento da mensagem
      channel.ack(message)

      console.log(`✅ [SMS Consumer] SMS enviado com sucesso para ${notification.destinatario}`)
    } catch (error) {
      console.error(`❌ [SMS Consumer] Erro ao processar notificação:`, error.message)

      // Rejeitar mensagem e enviar para dead letter queue após 3 tentativas
      const retryCount = (message.properties.headers && message.properties.headers["x-retry-count"]) || 0

      if (retryCount < 3) {
        console.log(`🔄 [SMS Consumer] Tentativa ${retryCount + 1}/3 - Reenviando mensagem`)

        // Incrementar contador de tentativas
        const headers = { ...message.properties.headers, "x-retry-count": retryCount + 1 }

        // Republicar mensagem com delay
        setTimeout(() => {
          channel.publish(this.rabbitmq.exchanges.NOTIFICATIONS, message.fields.routingKey, message.content, {
            ...message.properties,
            headers,
          })
          channel.ack(message)
        }, 3000) // 3 segundos de delay
      } else {
        console.log(`💀 [SMS Consumer] Máximo de tentativas excedido - Enviando para Dead Letter Queue`)
        channel.nack(message, false, false) // Enviar para DLQ
      }
    }
  }

  async sendSMS(notification) {
    // Simular tempo de processamento de SMS
    const processingTime = Math.random() * 1500 + 500 // 0.5-2 segundos

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simular falha ocasional (3% de chance)
        if (Math.random() < 0.03) {
          reject(new Error("Falha na conexão com gateway SMS"))
          return
        }

        // Simular envio bem-sucedido
        console.log(`   📡 Conectando ao gateway SMS...`)
        console.log(`   📝 Preparando SMS para ${notification.destinatario}`)
        console.log(`   🚀 SMS enviado via gateway!`)

        resolve()
      }, processingTime)
    })
  }

  async stop() {
    try {
      console.log("[SMS Consumer] Parando consumidor...")

      if (this.consumerTag && this.rabbitmq.channel) {
        await this.rabbitmq.channel.cancel(this.consumerTag)
      }

      await this.rabbitmq.close()
      console.log("[SMS Consumer] Consumidor parado com sucesso")
    } catch (error) {
      console.error("[SMS Consumer] Erro ao parar consumidor:", error.message)
    }
  }
}

// Inicializar consumidor
const consumer = new SMSNotificationConsumer()

// Handlers para shutdown graceful
process.on("SIGTERM", () => consumer.stop().then(() => process.exit(0)))
process.on("SIGINT", () => consumer.stop().then(() => process.exit(0)))

// Iniciar consumidor
consumer.start()

module.exports = SMSNotificationConsumer
