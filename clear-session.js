const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearSession() {
  const instanceName = 'Advance-Security';

  try {
    const instance = await prisma.instance.findUnique({
      where: { name: instanceName },
    });

    if (!instance) {
      console.log('Instância não encontrada');
      return;
    }

    console.log('Deletando sessão da instância:', instanceName);

    await prisma.session.delete({
      where: { sessionId: instance.id },
    });

    await prisma.instance.update({
      where: { id: instance.id },
      data: {
        connectionStatus: 'close',
        disconnectionAt: null,
        disconnectionReasonCode: null,
        disconnectionObject: null,
      },
    });

    console.log('✅ Sessão deletada e instância resetada');
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearSession();
