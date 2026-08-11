const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanInstance() {
  const instanceName = 'Advance-Security';

  try {
    console.log(`Buscando instância ${instanceName}...`);
    const instance = await prisma.instance.findUnique({
      where: { name: instanceName },
    });

    if (!instance) {
      console.log('Instância não encontrada.');
      return;
    }

    console.log(`Instância encontrada com ID: ${instance.id}`);
    console.log('Iniciando limpeza de dados...');

    // Deletar em ordem de dependência
    await prisma.messageUpdate.deleteMany({ where: { instanceId: instance.id } });
    console.log('✓ MessageUpdate deletados');

    await prisma.message.deleteMany({ where: { instanceId: instance.id } });
    console.log('✓ Messages deletados');

    await prisma.media.deleteMany({ where: { instanceId: instance.id } });
    console.log('✓ Media deletados');

    await prisma.chat.deleteMany({ where: { instanceId: instance.id } });
    console.log('✓ Chats deletados');

    await prisma.contact.deleteMany({ where: { instanceId: instance.id } });
    console.log('✓ Contacts deletados');

    await prisma.label.deleteMany({ where: { instanceId: instance.id } });
    console.log('✓ Labels deletados');

    await prisma.typebot.deleteMany({ where: { instanceId: instance.id } });
    console.log('✓ Typebots deletados');

    await prisma.openaiCreds.deleteMany({ where: { instanceId: instance.id } });
    console.log('✓ OpenaiCreds deletados');

    await prisma.openaiBot.deleteMany({ where: { instanceId: instance.id } });
    console.log('✓ OpenaiBots deletados');

    await prisma.webhook.deleteMany({ where: { instanceId: instance.id } });
    console.log('✓ Webhook deletado');

    await prisma.chatwoot.deleteMany({ where: { instanceId: instance.id } });
    console.log('✓ Chatwoot deletado');

    await prisma.proxy.deleteMany({ where: { instanceId: instance.id } });
    console.log('✓ Proxy deletado');

    await prisma.setting.deleteMany({ where: { instanceId: instance.id } });
    console.log('✓ Setting deletado');

    await prisma.rabbitmq.deleteMany({ where: { instanceId: instance.id } });
    console.log('✓ Rabbitmq deletado');

    await prisma.nats.deleteMany({ where: { instanceId: instance.id } });
    console.log('✓ Nats deletado');

    await prisma.sqs.deleteMany({ where: { instanceId: instance.id } });
    console.log('✓ Sqs deletado');

    await prisma.kafka.deleteMany({ where: { instanceId: instance.id } });
    console.log('✓ Kafka deletado');

    await prisma.websocket.deleteMany({ where: { instanceId: instance.id } });
    console.log('✓ Websocket deletado');

    await prisma.typebotSetting.deleteMany({ where: { instanceId: instance.id } });
    console.log('✓ TypebotSetting deletado');

    await prisma.openaiSetting.deleteMany({ where: { instanceId: instance.id } });
    console.log('✓ OpenaiSetting deletado');

    await prisma.session.deleteMany({ where: { sessionId: instance.id } });
    console.log('✓ Session deletada');

    await prisma.instance.delete({ where: { name: instanceName } });
    console.log('✓ Instância deletada');

    console.log('\n✅ Limpeza concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante limpeza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanInstance();
