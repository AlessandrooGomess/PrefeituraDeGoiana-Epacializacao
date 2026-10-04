const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  const seinfra = await prisma.secretaria.findFirst({ where: { sigla: 'SEDUO' }});
  const areaInfra = await prisma.areaTematica.findFirst({ where: { nome: 'Infraestrutura Urbana' }});
  await prisma.obra.updateMany({
    where: { secretariaId: seinfra.id },
    data: { eixoId: seinfra.eixoId, areaTematicaId: areaInfra.id }
  });
  console.log('Fixed Obras with SEDUO secretaria to match eixoSocial.');
}
fix().then(() => process.exit(0));
