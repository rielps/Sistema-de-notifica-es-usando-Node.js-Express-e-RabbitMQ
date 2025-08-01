const amqp = require("amqplib")
const RabbitMQConfig = require("../config/rabbitmq")

class PushNotificationConsumer {
  constructor() {
    this.rabbitmq = new RabbitMQConfig()
    this.consumerTag = null
  }

  async start() {
    try {
      console.log("[Push Consumer] Iniciando consumidor de notificações push...")

      // Conectar ao RabbitMQ
      const channel = await this.rabbitmq.connect()

      // Configurar QoS para processar uma mensagem por vez
      await channel.prefetch(1)

      console.log("[Push Consumer] Aguardando notificações push...")
      console.log("[Push Consumer] Para parar, pressione CTRL+C")

      // Iniciar consumo da fila de push notifications
      const consumerInfo = await channel.consume(
        this.rabbitmq.queues.PUSH_NOTIFICATIONS,
        async (message) => {
          if (message) {
            await this.processPushNotification(channel, message)
          }
        },
        { noAck: false },
      )

      this.consumerTag = consumerInfo.consumerTag
    } catch (error) {
      console.error("[Push Consumer] Erro ao iniciar consumidor:", error.message)
      process.exit(1)
    }
  }

  async processPushNotification(channel, message) {
    try {
      const notification = JSON.parse(message.content.toString())

      console.log(`\n🔔 [Push Consumer] Nova notificação recebida:`)
      console.log(`   ID: ${notification.id}`)
      console.log(`   Destinatário: ${notification.destinatario}`)
      console.log(`   Mensagem: ${notification.mensagem}`)
      console.log(`   Prioridade: ${notification.prioridade}`)
      console.log(`   Timestamp: ${notification.timestamp}`)

      // Simular processamento de push notification
      await this.sendPushNotification(notification)

      // Confirmar processamento da mensagem
      channel.ack(message)

      console.log(`✅ [Push Consumer] Push notification enviada com sucesso para ${notification.destinatario}`)
    } catch (error) {
      console.error(`❌ [Push Consumer] Erro ao processar notificação:`, error.message)

      // Rejeitar mensagem e enviar para dead letter queue após 3 tentativas
      const retryCount = (message.properties.headers && message.properties.headers["x-retry-count"]) || 0

      if (retryCount < 3) {
        console.log(`🔄 [Push Consumer] Tentativa ${retryCount + 1}/3 - Reenviando mensagem`)

        // Incrementar contador de tentativas
        const headers = { ...message.properties.headers, "x-retry-count": retryCount + 1 }

        // Republicar mensagem com delay
        setTimeout(() => {
          channel.publish(this.rabbitmq.exchanges.NOTIFICATIONS, message.fields.routingKey, message.content, {
            ...message.properties,
            headers,
          })
          channel.ack(message)
        }, 2000) // 2 segundos de delay
      } else {
        console.log(`💀 [Push Consumer] Máximo de tentativas excedido - Enviando para Dead Letter Queue`)
        channel.nack(message, false, false) // Enviar para DLQ
      }
    }
  }

  async sendPushNotification(notification) {
    // Simular tempo de processamento de push notification
    const processingTime = Math.random() * 1000 + 300 // 0.3-1.3 segundos

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simular falha ocasional (2% de chance)
        if (Math.random() < 0.02) {
          reject(new Error("Falha na conexão com FCM/APNS"))
          return
        }

        // Simular envio bem-sucedido
        console.log(`   📱 Conectando ao serviço push (FCM/APNS)...`)
        console.log(`   📝 Preparando push notification para ${notification.destinatario}`)
        console.log(`   🚀 Push notification enviada!`)

        resolve()
      }, processingTime)
    })
  }

  async stop() {
    try {
      console.log("[Push Consumer] Parando consumidor...")

      if (this.consumerTag && this.rabbitmq.channel) {
        await this.rabbitmq.channel.cancel(this.consumerTag)
      }

      await this.rabbitmq.close()
      console.log("[Push Consumer] Consumidor parado com sucesso")
    } catch (error) {
      console.error("[Push Consumer] Erro ao parar consumidor:", error.message)
    }
  }
}

// Inicializar consumidor
const consumer = new PushNotificationConsumer()

// Handlers para shutdown graceful
process.on("SIGTERM", () => consumer.stop().then(() => process.exit(0)))
process.on("SIGINT", () => consumer.stop().then(() => process.exit(0)))

// Iniciar consumidor
consumer.start()

module.exports = PushNotificationConsumer
