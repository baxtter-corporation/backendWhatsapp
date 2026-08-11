const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetInstance() {
  const instanceName = 'Advance-Security';

  try {
    const instance = await prisma.instance.findUnique({
      where: { name: instanceName },
    });

    if (!instance) {
      console.log('Instância não encontrada');
      return;
    }

    console.log('Resetando instância:', instanceName);

    await prisma.instance.update({
      where: { id: instance.id },
      data: {
        connectionStatus: 'close',
        disconnectionAt: null,
        disconnectionReasonCode: null,
        disconnectionObject: null,
      },
    });

    console.log('✅ Instância resetada para status close');
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetInstance();
