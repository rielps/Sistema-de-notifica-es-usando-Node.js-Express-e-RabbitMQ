const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const { v4: uuidv4 } = require("uuid")
const RabbitMQConfig = require("./config/rabbitmq")

class NotificationAPIGateway {
  constructor() {
    this.app = express()
    this.port = process.env.PORT || 3000
    this.rabbitmq = new RabbitMQConfig()

    this.setupMiddlewares()
    this.setupRoutes()
    this.setupErrorHandling()
  }

  setupMiddlewares() {
    // Segurança
    this.app.use(helmet())

    // CORS
    this.app.use(
      cors({
        origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
      }),
    )

    // Logging
    this.app.use(morgan("combined"))

    // Parser JSON
    this.app.use(express.json({ limit: "10mb" }))
    this.app.use(express.urlencoded({ extended: true }))
  }

  setupRoutes() {
    // Rota de health check
    this.app.get("/health", (req, res) => {
      res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        service: "Notification API Gateway",
        version: "1.0.0",
      })
    })

    // Rota principal para envio de notificações
    this.app.post("/api/v1/notifications", async (req, res) => {
      try {
        const { tipo, destinatario, mensagem, prioridade = "normal", metadata = {} } = req.body

        // Validação dos dados de entrada
        const validationError = this.validateNotificationRequest(req.body)
        if (validationError) {
          return res.status(400).json({
            error: "Dados inválidos",
            details: validationError,
            timestamp: new Date().toISOString(),
          })
        }

        // Criar objeto de notificação
        const notification = {
          id: uuidv4(),
          tipo,
          destinatario,
          mensagem,
          prioridade,
          metadata,
          timestamp: new Date().toISOString(),
          status: "pending",
        }

        // Determinar routing key baseado no tipo e prioridade
        const routingKey = `notification.${tipo}.${prioridade}`

        // Publicar mensagem no RabbitMQ
        await this.rabbitmq.publishMessage(routingKey, notification)

        console.log(
          `[API Gateway] Notificação criada - ID: ${notification.id}, Tipo: ${tipo}, Destinatário: ${destinatario}`,
        )

        res.status(202).json({
          success: true,
          message: "Notificação enviada para processamento",
          notificationId: notification.id,
          timestamp: new Date().toISOString(),
        })
      } catch (error) {
        console.error("[API Gateway] Erro ao processar notificação:", error.message)
        res.status(500).json({
          error: "Erro interno do servidor",
          message: "Falha ao processar notificação",
          timestamp: new Date().toISOString(),
        })
      }
    })

    // Rota para envio em lote
    this.app.post("/api/v1/notifications/batch", async (req, res) => {
      try {
        const { notifications } = req.body

        if (!Array.isArray(notifications) || notifications.length === 0) {
          return res.status(400).json({
            error: "Lista de notificações inválida",
            timestamp: new Date().toISOString(),
          })
        }

        const results = []
        const errors = []

        for (let i = 0; i < notifications.length; i++) {
          try {
            const notificationData = notifications[i]
            const validationError = this.validateNotificationRequest(notificationData)

            if (validationError) {
              errors.push({ index: i, error: validationError })
              continue
            }

            const notification = {
              id: uuidv4(),
              ...notificationData,
              timestamp: new Date().toISOString(),
              status: "pending",
            }

            const routingKey = `notification.${notification.tipo}.${notification.prioridade || "normal"}`
            await this.rabbitmq.publishMessage(routingKey, notification)

            results.push({
              index: i,
              notificationId: notification.id,
              status: "queued",
            })
          } catch (error) {
            errors.push({ index: i, error: error.message })
          }
        }

        res.status(202).json({
          success: true,
          message: `${results.length} notificações enviadas para processamento`,
          results,
          errors,
          timestamp: new Date().toISOString(),
        })
      } catch (error) {
        console.error("[API Gateway] Erro no envio em lote:", error.message)
        res.status(500).json({
          error: "Erro interno do servidor",
          timestamp: new Date().toISOString(),
        })
      }
    })

    // Rota para estatísticas (demonstração)
    this.app.get("/api/v1/stats", (req, res) => {
      res.json({
        message: "Estatísticas do sistema de notificações",
        queues: Object.values(this.rabbitmq.queues),
        exchanges: Object.values(this.rabbitmq.exchanges),
        timestamp: new Date().toISOString(),
      })
    })
  }

  validateNotificationRequest(data) {
    const { tipo, destinatario, mensagem } = data

    if (!tipo) {
      return 'Campo "tipo" é obrigatório (email, sms, push)'
    }

    if (!["email", "sms", "push"].includes(tipo)) {
      return "Tipo deve ser: email, sms ou push"
    }

    if (!destinatario) {
      return 'Campo "destinatario" é obrigatório'
    }

    if (!mensagem) {
      return 'Campo "mensagem" é obrigatório'
    }

    if (mensagem.length > 1000) {
      return "Mensagem não pode exceder 1000 caracteres"
    }

    // Validações específicas por tipo
    if (tipo === "email" && !this.isValidEmail(destinatario)) {
      return "Email inválido"
    }

    if (tipo === "sms" && !this.isValidPhone(destinatario)) {
      return "Número de telefone inválido"
    }

    return null
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  isValidPhone(phone) {
    const phoneRegex = /^\+?[\d\s\-$$$$]{10,}$/
    return phoneRegex.test(phone)
  }

  setupErrorHandling() {
    // Handler para rotas não encontradas
    this.app.use("*", (req, res) => {
      res.status(404).json({
        error: "Rota não encontrada",
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
      })
    })

    // Handler global de erros
    this.app.use((error, req, res, next) => {
      console.error("[API Gateway] Erro não tratado:", error)
      res.status(500).json({
        error: "Erro interno do servidor",
        timestamp: new Date().toISOString(),
      })
    })
  }

  async start() {
    try {
      // Conectar ao RabbitMQ
      await this.rabbitmq.connect()

      // Iniciar servidor HTTP
      this.server = this.app.listen(this.port, () => {
        console.log(`[API Gateway] Servidor iniciado na porta ${this.port}`)
        console.log(`[API Gateway] Documentação: http://localhost:${this.port}/health`)
        console.log(`[API Gateway] Endpoint principal: POST http://localhost:${this.port}/api/v1/notifications`)
      })

      // Graceful shutdown
      process.on("SIGTERM", () => this.shutdown())
      process.on("SIGINT", () => this.shutdown())
    } catch (error) {
      console.error("[API Gateway] Erro ao iniciar servidor:", error.message)
      process.exit(1)
    }
  }

  async shutdown() {
    console.log("[API Gateway] Iniciando shutdown graceful...")

    if (this.server) {
      this.server.close(() => {
        console.log("[API Gateway] Servidor HTTP fechado")
      })
    }

    await this.rabbitmq.close()
    process.exit(0)
  }
}

// Inicializar API Gateway
const gateway = new NotificationAPIGateway()
gateway.start()

module.exports = NotificationAPIGateway
