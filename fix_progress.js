const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  const etapas = await prisma.etapaObra.findMany({
    include: { subEtapasObra: true }
  });

  for (const etapa of etapas) {
    const total = etapa.subEtapasObra.length;
    const concluidas = etapa.subEtapasObra.filter(s => s.status === 'CONCLUIDA').length;
    const percentualCorreto = total === 0 ? 0 : (concluidas / total) * 100;

    await prisma.etapaObra.update({
      where: { id: etapa.id },
      data: { percentualConcluido: percentualCorreto }
    });
  }

  console.log('Progresso sincronizado com os checkboxes!');
}
fix().then(() => process.exit(0));
