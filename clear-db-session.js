const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearDbSession() {
  const instanceId = '6b3d51b9-30e3-47a8-90de-9c61cae2edbd';

  try {
    console.log('Buscando sessão no banco de dados...');
    
    const session = await prisma.session.findUnique({
      where: { sessionId: instanceId },
    });

    if (session) {
      console.log('Sessão encontrada, deletando...');
      await prisma.session.delete({
        where: { sessionId: instanceId },
      });
      console.log('✅ Sessão deletada do banco de dados');
    } else {
      console.log('Nenhuma sessão encontrada no banco de dados');
    }

    // Também limpar mensagens com erro para evitar conflitos
    const errorMessages = await prisma.message.findMany({
      where: {
        instanceId: instanceId,
        status: 'ERROR',
      },
    });

    if (errorMessages.length > 0) {
      console.log(`Encontradas ${errorMessages.length} mensagens com erro`);
      await prisma.message.deleteMany({
        where: {
          instanceId: instanceId,
          status: 'ERROR',
        },
      });
      console.log('✅ Mensagens com erro deletadas');
    }
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDbSession();
