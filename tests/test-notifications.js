// tests/test-notifications.js
// Script de teste automatizado para demonstração do sistema

const axios = require("axios")

class NotificationTester {
  constructor() {
    this.apiUrl = process.env.API_URL || "http://localhost:3000"
    this.testResults = []
  }

  async runAllTests() {
    console.log("🧪 Iniciando testes do sistema de notificações...\n")

    try {
      await this.testHealthCheck()
      await this.testSingleNotifications()
      await this.testBatchNotifications()
      await this.testValidations()

      this.printResults()
    } catch (error) {
      console.error("❌ Erro durante os testes:", error.message)
    }
  }

  async testHealthCheck() {
    console.log("🔍 Testando health check...")

    try {
      const response = await axios.get(`${this.apiUrl}/health`)

      if (response.status === 200) {
        console.log("✅ Health check passou")
        this.testResults.push({ test: "Health Check", status: "PASS" })
      } else {
        throw new Error(`Status inesperado: ${response.status}`)
      }
    } catch (error) {
      console.log("❌ Health check falhou:", error.message)
      this.testResults.push({ test: "Health Check", status: "FAIL", error: error.message })
    }

    console.log("")
  }

  async testSingleNotifications() {
    console.log("📧 Testando notificações individuais...")

    const testCases = [
      {
        name: "Email Normal",
        data: {
          tipo: "email",
          destinatario: "usuario@exemplo.com",
          mensagem: "Bem-vindo ao nosso sistema!",
          prioridade: "normal",
        },
      },
      {
        name: "SMS Urgente",
        data: {
          tipo: "sms",
          destinatario: "+5511999999999",
          mensagem: "Código de verificação: 123456",
          prioridade: "alta",
        },
      },
      {
        name: "Push Notification",
        data: {
          tipo: "push",
          destinatario: "device_token_123",
          mensagem: "Você tem uma nova mensagem!",
          prioridade: "normal",
          metadata: {
            badge: 1,
            sound: "default",
          },
        },
      },
    ]

    for (const testCase of testCases) {
      try {
        console.log(`  Testando: ${testCase.name}`)

        const response = await axios.post(`${this.apiUrl}/api/v1/notifications`, testCase.data)

        if (response.status === 202) {
          console.log(`  ✅ ${testCase.name} - Enviado com sucesso`)
          this.testResults.push({ test: testCase.name, status: "PASS" })
        } else {
          throw new Error(`Status inesperado: ${response.status}`)
        }

        // Aguardar um pouco entre os testes
        await this.sleep(1000)
      } catch (error) {
        console.log(`  ❌ ${testCase.name} - Falhou:`, error.response?.data || error.message)
        this.testResults.push({ test: testCase.name, status: "FAIL", error: error.message })
      }
    }

    console.log("")
  }

  async testBatchNotifications() {
    console.log("📦 Testando envio em lote...")

    const batchData = {
      notifications: [
        {
          tipo: "email",
          destinatario: "user1@exemplo.com",
          mensagem: "Notificação em lote 1",
          prioridade: "normal",
        },
        {
          tipo: "sms",
          destinatario: "+5511888888888",
          mensagem: "Notificação em lote 2",
          prioridade: "alta",
        },
        {
          tipo: "push",
          destinatario: "device_token_456",
          mensagem: "Notificação em lote 3",
          prioridade: "baixa",
        },
      ],
    }

    try {
      const response = await axios.post(`${this.apiUrl}/api/v1/notifications/batch`, batchData)

      if (response.status === 202) {
        console.log("  ✅ Envio em lote - Sucesso")
        console.log(`  📊 Resultados: ${response.data.results.length} enviadas, ${response.data.errors.length} erros`)
        this.testResults.push({ test: "Batch Notifications", status: "PASS" })
      } else {
        throw new Error(`Status inesperado: ${response.status}`)
      }
    } catch (error) {
      console.log("  ❌ Envio em lote - Falhou:", error.response?.data || error.message)
      this.testResults.push({ test: "Batch Notifications", status: "FAIL", error: error.message })
    }

    console.log("")
  }

  async testValidations() {
    console.log("🔒 Testando validações...")

    const invalidCases = [
      {
        name: "Tipo inválido",
        data: { tipo: "invalid", destinatario: "test@test.com", mensagem: "Test" },
      },
      {
        name: "Email inválido",
        data: { tipo: "email", destinatario: "invalid-email", mensagem: "Test" },
      },
      {
        name: "Mensagem vazia",
        data: { tipo: "email", destinatario: "test@test.com", mensagem: "" },
      },
    ]

    for (const testCase of invalidCases) {
      try {
        console.log(`  Testando: ${testCase.name}`)

        const response = await axios.post(`${this.apiUrl}/api/v1/notifications`, testCase.data)

        // Se chegou aqui, o teste falhou (deveria ter dado erro 400)
        console.log(`  ❌ ${testCase.name} - Deveria ter falhado mas passou`)
        this.testResults.push({
          test: `Validation: ${testCase.name}`,
          status: "FAIL",
          error: "Should have failed validation",
        })
      } catch (error) {
        if (error.response && error.response.status === 400) {
          console.log(`  ✅ ${testCase.name} - Validação funcionou corretamente`)
          this.testResults.push({ test: `Validation: ${testCase.name}`, status: "PASS" })
        } else {
          console.log(`  ❌ ${testCase.name} - Erro inesperado:`, error.message)
          this.testResults.push({ test: `Validation: ${testCase.name}`, status: "FAIL", error: error.message })
        }
      }
    }

    console.log("")
  }

  printResults() {
    console.log("📊 Resumo dos Testes:")
    console.log("=".repeat(50))

    let passed = 0
    let failed = 0

    this.testResults.forEach((result) => {
      const status = result.status === "PASS" ? "✅" : "❌"
      console.log(`${status} ${result.test}`)

      if (result.status === "PASS") {
        passed++
      } else {
        failed++
        if (result.error) {
          console.log(`   Erro: ${result.error}`)
        }
      }
    })

    console.log("=".repeat(50))
    console.log(`Total: ${this.testResults.length} | Passou: ${passed} | Falhou: ${failed}`)

    if (failed === 0) {
      console.log("🎉 Todos os testes passaram!")
    } else {
      console.log(`⚠️  ${failed} teste(s) falharam`)
    }
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// Executar testes se o script for chamado diretamente
if (require.main === module) {
  const tester = new NotificationTester()
  tester.runAllTests()
}

module.exports = NotificationTester
