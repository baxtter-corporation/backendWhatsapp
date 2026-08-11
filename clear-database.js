const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log('Iniciando limpeza completa do banco de dados...');

    // Deletar em ordem de dependência (filhos antes dos pais)
    await prisma.messageUpdate.deleteMany();
    console.log('✓ MessageUpdate deletados');

    await prisma.message.deleteMany();
    console.log('✓ Messages deletados');

    await prisma.media.deleteMany();
    console.log('✓ Media deletados');

    await prisma.chat.deleteMany();
    console.log('✓ Chats deletados');

    await prisma.contact.deleteMany();
    console.log('✓ Contacts deletados');

    await prisma.label.deleteMany();
    console.log('✓ Labels deletados');

    await prisma.typebot.deleteMany();
    console.log('✓ Typebots deletados');

    await prisma.openaiCreds.deleteMany();
    console.log('✓ OpenaiCreds deletados');

    await prisma.openaiBot.deleteMany();
    console.log('✓ OpenaiBots deletados');

    await prisma.webhook.deleteMany();
    console.log('✓ Webhooks deletados');

    await prisma.chatwoot.deleteMany();
    console.log('✓ Chatwoot deletados');

    await prisma.proxy.deleteMany();
    console.log('✓ Proxies deletados');

    await prisma.setting.deleteMany();
    console.log('✓ Settings deletados');

    await prisma.rabbitmq.deleteMany();
    console.log('✓ Rabbitmq deletados');

    await prisma.nats.deleteMany();
    console.log('✓ Nats deletados');

    await prisma.sqs.deleteMany();
    console.log('✓ Sqs deletados');

    await prisma.kafka.deleteMany();
    console.log('✓ Kafka deletados');

    await prisma.websocket.deleteMany();
    console.log('✓ Websockets deletados');

    await prisma.typebotSetting.deleteMany();
    console.log('✓ TypebotSettings deletados');

    await prisma.openaiSetting.deleteMany();
    console.log('✓ OpenaiSettings deletados');

    await prisma.session.deleteMany();
    console.log('✓ Sessions deletadas');

    await prisma.instance.deleteMany();
    console.log('✓ Instances deletadas');

    console.log('\n✅ Banco de dados limpo completamente!');
  } catch (error) {
    console.error('Erro durante limpeza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();
