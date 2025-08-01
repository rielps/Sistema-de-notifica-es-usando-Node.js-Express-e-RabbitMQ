const amqp = require("amqplib") // Biblioteca para interagir com o RabbitMQ

const RABBITMQ_URL = "amqp://guest:guest@localhost:5672" // URL de conexão com o RabbitMQ
const QUEUE_NAME = "notificacoes" // Nome da fila a ser consumida

async function startConsumer() {
  let connection
  try {
    // 1. Conecta-se ao servidor RabbitMQ
    connection = await amqp.connect(RABBITMQ_URL)
    console.log("[Consumidor] Conectado ao RabbitMQ.")

    // 2. Cria um canal de comunicação
    const channel = await connection.createChannel()
    console.log("[Consumidor] Canal criado.")

    // 3. Garante que a fila existe. É importante que tanto o produtor quanto o consumidor
    // declarem a fila para garantir que ela exista antes de tentar usá-la.
    await channel.assertQueue(QUEUE_NAME, { durable: true })
    console.log(`[Consumidor] Aguardando mensagens na fila '${QUEUE_NAME}'. Para sair, pressione CTRL+C.`)

    // 4. Inicia o consumo de mensagens da fila
    // `noAck: false` significa que o consumidor deve enviar um reconhecimento (ack)
    // ao RabbitMQ após processar a mensagem com sucesso. Isso garante que a mensagem
    // não seja removida da fila até que seja confirmada.
    channel.consume(
      QUEUE_NAME,
      (msg) => {
        if (msg !== null) {
          const mensagemRecebida = msg.content.toString() // Converte o Buffer da mensagem para String
          console.log(`📬 Nova notificação recebida: ${mensagemRecebida}`)

          // 5. Envia o reconhecimento da mensagem.
          // Isso informa ao RabbitMQ que a mensagem foi processada com sucesso e pode ser removida da fila.
          channel.ack(msg)
        }
      },
      { noAck: false },
    )
  } catch (error) {
    console.error("[Consumidor] Erro ao iniciar o consumidor:", error.message)
    // Tenta fechar a conexão se ela foi estabelecida e ocorreu um erro
    if (connection) {
      console.log("[Consumidor] Fechando conexão com RabbitMQ devido a erro.")
      await connection.close()
    }
    // Em um ambiente de produção, você pode querer implementar uma lógica de reconexão aqui.
    process.exit(1) // Sai do processo com erro
  }

  // Adiciona um listener para fechar a conexão com o RabbitMQ quando o processo for encerrado
  process.on("beforeExit", async () => {
    if (connection) {
      console.log("[Consumidor] Fechando conexão com RabbitMQ antes de sair.")
      await connection.close()
    }
  })
}

// Inicia o consumidor
startConsumer()
