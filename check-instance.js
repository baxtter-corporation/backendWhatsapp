const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkInstance() {
  try {
    const instance = await prisma.instance.findUnique({
      where: { name: 'Advance-Security' },
    });

    if (instance) {
      console.log('Instância encontrada:');
      console.log('ID:', instance.id);
      console.log('Nome:', instance.name);
      console.log('Status de conexão:', instance.connectionStatus);
      console.log('Número:', instance.number);
      console.log('Profile:', instance.profileName);
      console.log('Desconectado em:', instance.disconnectionAt);
      console.log('Código de desconexão:', instance.disconnectionReasonCode);
    } else {
      console.log('Instância não encontrada no banco de dados');
    }
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkInstance();
