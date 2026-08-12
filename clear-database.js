const { PrismaClient } = require('@prisma/client');
const { createClient } = require('redis');

const prisma = new PrismaClient();

async function clearRedis() {
  try {
    const redis = createClient({
      url: process.env.REDIS_URI || 'redis://localhost:6379'
    });

    await redis.connect();
    console.log('Conectado ao Redis');

    // Limpar todas as chaves relacionadas ao Evolution API
    const keys = await redis.keys('evolution:*');
    if (keys.length > 0) {
      await redis.del(keys);
      console.log(`✓ ${keys.length} chaves do Redis removidas`);
    } else {
      console.log('✓ Nenhuma chave do Evolution API encontrada no Redis');
    }

    await redis.disconnect();
  } catch (error) {
    console.error('Erro ao limpar Redis:', error.message);
    console.log('⚠ Redis não foi limpo (pode não estar configurado ou inacessível)');
  }
}

async function truncateDatabase() {
  try {
    console.log('Iniciando TRUNCATE do banco de dados...');

    // TRUNCATE em ordem de dependência (filhos antes dos pais)
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "MessageUpdate" CASCADE');
    console.log('✓ MessageUpdate truncado');

    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Message" CASCADE');
    console.log('✓ Message truncado');

    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Media" CASCADE');
    console.log('✓ Media truncado');

    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Chat" CASCADE');
    console.log('✓ Chat truncado');

    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Contact" CASCADE');
    console.log('✓ Contact truncado');

    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Label" CASCADE');
    console.log('✓ Label truncado');

    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Typebot" CASCADE');
    console.log('✓ Typebot truncado');

    await prisma.$executeRawUnsafe('TRUNCATE TABLE "OpenaiCreds" CASCADE');
    console.log('✓ OpenaiCreds truncado');

    await prisma.$executeRawUnsafe('TRUNCATE TABLE "OpenaiBot" CASCADE');
    console.log('✓ OpenaiBot truncado');

    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Webhook" CASCADE');
    console.log('✓ Webhook truncado');

    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Chatwoot" CASCADE');
    console.log('✓ Chatwoot truncado');

    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Proxy" CASCADE');
    console.log('✓ Proxy truncado');

    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Setting" CASCADE');
    console.log('✓ Setting truncado');

    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Rabbitmq" CASCADE');
    console.log('✓ Rabbitmq truncado');

    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Nats" CASCADE');
    console.log('✓ Nats truncado');

    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Sqs" CASCADE');
    console.log('✓ Sqs truncado');

    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Kafka" CASCADE');
    console.log('✓ Kafka truncado');

    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Websocket" CASCADE');
    console.log('✓ Websocket truncado');

    await prisma.$executeRawUnsafe('TRUNCATE TABLE "TypebotSetting" CASCADE');
    console.log('✓ TypebotSetting truncado');

    await prisma.$executeRawUnsafe('TRUNCATE TABLE "OpenaiSetting" CASCADE');
    console.log('✓ OpenaiSetting truncado');

    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Session" CASCADE');
    console.log('✓ Session truncado');

    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Instance" CASCADE');
    console.log('✓ Instance truncado');

    console.log('\n✅ Banco de dados truncado completamente!');

    // Limpar Redis após truncar banco
    console.log('\nLimpando Redis...');
    await clearRedis();

    console.log('\n✅ Banco de dados e Redis limpos completamente!');
  } catch (error) {
    console.error('Erro durante TRUNCATE:', error);
  } finally {
    await prisma.$disconnect();
  }
}

truncateDatabase();
