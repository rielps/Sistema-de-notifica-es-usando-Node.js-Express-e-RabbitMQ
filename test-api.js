const axios = require("axios")

const API_URL = "http://localhost:3000"

async function testAPI() {
  console.log("🧪 Iniciando testes da API de Notificações...\n")

  try {
    // Teste 1: Health Check
    console.log("1️⃣ Testando Health Check...")
    const healthResponse = await axios.get(`${API_URL}/health`)
    console.log("✅ Health Check OK:", healthResponse.data.status)
    console.log("")

    // Teste 2: Página inicial
    console.log("2️⃣ Testando página inicial...")
    const homeResponse = await axios.get(`${API_URL}/`)
    console.log("✅ Página inicial OK:", homeResponse.data.message)
    console.log("")

    // Teste 3: Envio de notificação válida
    console.log("3️⃣ Testando envio de notificação válida...")
    const notificationResponse = await axios.post(`${API_URL}/nova-notificacao`, {
      mensagem: "Teste automatizado - Seu pedido foi confirmado!",
    })
    console.log("✅ Notificação enviada:", notificationResponse.data.message)
    console.log("📋 Dados:", notificationResponse.data.data)
    console.log("")

    // Teste 4: Envio de múltiplas notificações
    console.log("4️⃣ Testando múltiplas notificações...")
    const mensagens = [
      "Pedido #001 confirmado!",
      "Produto enviado para entrega",
      "Avalie sua compra",
      "Promoção especial disponível!",
    ]

    for (let i = 0; i < mensagens.length; i++) {
      const response = await axios.post(`${API_URL}/nova-notificacao`, {
        mensagem: mensagens[i],
      })
      console.log(`✅ Notificação ${i + 1}/4 enviada: ${mensagens[i]}`)

      // Aguardar 1 segundo entre envios
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
    console.log("")

    // Teste 5: Teste de validação (mensagem vazia)
    console.log("5️⃣ Testando validação (mensagem vazia)...")
    try {
      await axios.post(`${API_URL}/nova-notificacao`, {})
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log("✅ Validação funcionando:", error.response.data.error)
      } else {
        console.log("❌ Erro inesperado:", error.message)
      }
    }
    console.log("")

    console.log("🎉 Todos os testes concluídos com sucesso!")
    console.log("👀 Verifique o terminal do consumidor para ver as mensagens sendo processadas.")
  } catch (error) {
    console.error("❌ Erro durante os testes:", error.message)

    if (error.code === "ECONNREFUSED") {
      console.log("💡 Certifique-se de que a API está rodando: npm start")
    }
  }
}

// Executar testes
testAPI()
