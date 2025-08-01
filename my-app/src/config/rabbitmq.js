const amqp = require("amqplib")

class RabbitMQConfig {
  constructor() {
    this.connection = null
    this.channel = null
    this.url = process.env.RABBITMQ_URL || "amqp://admin:admin123@localhost:5672/notifications"

    // Definição das filas do sistema
    this.queues = {
      EMAIL_NOTIFICATIONS: "email_notifications",
      SMS_NOTIFICATIONS: "sms_notifications",
      PUSH_NOTIFICATIONS: "push_notifications",
      DEAD_LETTER: "dead_letter_queue",
    }

    // Definição dos exchanges (tópicos)
    this.exchanges = {
      NOTIFICATIONS: "notifications_exchange",
      DEAD_LETTER: "dead_letter_exchange",
    }
  }

  async connect() {
    try {
      console.log("[RabbitMQ] Conectando ao servidor...")
      this.connection = await amqp.connect(this.url)
      this.channel = await this.connection.createChannel()

      console.log("[RabbitMQ] Conexão estabelecida com sucesso!")

      // Configurar exchanges e filas
      await this.setupInfrastructure()

      // Configurar handlers para fechamento da conexão
      this.connection.on("error", (err) => {
        console.error("[RabbitMQ] Erro na conexão:", err.message)
      })

      this.connection.on("close", () => {
        console.log("[RabbitMQ] Conexão fechada")
      })

      return this.channel
    } catch (error) {
      console.error("[RabbitMQ] Erro ao conectar:", error.message)
      throw error
    }
  }

  async setupInfrastructure() {
    try {
      // Criar exchange principal para notificações
      await this.channel.assertExchange(this.exchanges.NOTIFICATIONS, "topic", {
        durable: true,
      })

      // Criar exchange para dead letters
      await this.channel.assertExchange(this.exchanges.DEAD_LETTER, "direct", {
        durable: true,
      })

      // Criar fila de dead letters
      await this.channel.assertQueue(this.queues.DEAD_LETTER, {
        durable: true,
      })

      // Bind da fila de dead letters
      await this.channel.bindQueue(this.queues.DEAD_LETTER, this.exchanges.DEAD_LETTER, "dead")

      // Criar filas de notificação com dead letter exchange
      const queueOptions = {
        durable: true,
        arguments: {
          "x-dead-letter-exchange": this.exchanges.DEAD_LETTER,
          "x-dead-letter-routing-key": "dead",
          "x-message-ttl": 300000, // 5 minutos TTL
        },
      }

      // Fila de notificações por email
      await this.channel.assertQueue(this.queues.EMAIL_NOTIFICATIONS, queueOptions)
      await this.channel.bindQueue(
        this.queues.EMAIL_NOTIFICATIONS,
        this.exchanges.NOTIFICATIONS,
        "notification.email.*",
      )

      // Fila de notificações por SMS
      await this.channel.assertQueue(this.queues.SMS_NOTIFICATIONS, queueOptions)
      await this.channel.bindQueue(this.queues.SMS_NOTIFICATIONS, this.exchanges.NOTIFICATIONS, "notification.sms.*")

      // Fila de notificações push
      await this.channel.assertQueue(this.queues.PUSH_NOTIFICATIONS, queueOptions)
      await this.channel.bindQueue(this.queues.PUSH_NOTIFICATIONS, this.exchanges.NOTIFICATIONS, "notification.push.*")

      console.log("[RabbitMQ] Infraestrutura configurada com sucesso!")
    } catch (error) {
      console.error("[RabbitMQ] Erro ao configurar infraestrutura:", error.message)
      throw error
    }
  }

  async publishMessage(routingKey, message, options = {}) {
    try {
      const messageBuffer = Buffer.from(JSON.stringify(message))
      const publishOptions = {
        persistent: true,
        timestamp: Date.now(),
        messageId: require("uuid").v4(),
        ...options,
      }

      const published = this.channel.publish(this.exchanges.NOTIFICATIONS, routingKey, messageBuffer, publishOptions)

      if (published) {
        console.log(`[RabbitMQ] Mensagem publicada - Routing Key: ${routingKey}`)
        return true
      } else {
        throw new Error("Falha ao publicar mensagem")
      }
    } catch (error) {
      console.error("[RabbitMQ] Erro ao publicar mensagem:", error.message)
      throw error
    }
  }

  async close() {
    try {
      if (this.channel) {
        await this.channel.close()
      }
      if (this.connection) {
        await this.connection.close()
      }
      console.log("[RabbitMQ] Conexão fechada com sucesso")
    } catch (error) {
      console.error("[RabbitMQ] Erro ao fechar conexão:", error.message)
    }
  }
}

module.exports = RabbitMQConfig
