const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setOpen() {
  try {
    const result = await prisma.instance.updateMany({
      where: { name: 'Advance-Security' },
      data: { connectionStatus: 'open' },
    });

    console.log(`✓ ${result.count} instância(s) atualizada(s) para 'open'`);

    const instance = await prisma.instance.findFirst({
      where: { name: 'Advance-Security' },
      select: { name: true, connectionStatus: true },
    });

    console.log('Status atualizado:');
    console.log(JSON.stringify(instance, null, 2));
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setOpen();
