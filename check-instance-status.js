const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkInstanceStatus() {
  try {
    const instance = await prisma.instance.findFirst({
      where: { name: 'Advance-Security' },
      select: { name: true, connectionStatus: true, disconnectionReasonCode: true, disconnectionAt: true },
    });

    if (!instance) {
      console.log('Instância "Advance-Security" não encontrada no banco');
    } else {
      console.log('Status da instância no banco:');
      console.log(JSON.stringify(instance, null, 2));
    }
  } catch (error) {
    console.error('Erro ao verificar status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkInstanceStatus();
