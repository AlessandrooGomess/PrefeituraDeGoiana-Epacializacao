const { PrismaClient } = require('@prisma/client');
const { calcularProgressoObra } = require('./lib/obras/calcular-progresso.ts');
// Wait, calcular-progresso is TS. I will just copy its logic here to check.
const prisma = new PrismaClient();

async function check() {
  const obra = await prisma.obra.findFirst({ where: { titulo: { contains: 'Feira Livre' } }});
  
  const etapas = await prisma.etapaObra.findMany({
    where: { obraId: obra.id },
    select: { percentualConcluido: true, etapaTemplate: { select: { peso: true } } }
  });
  console.log('Etapas DB:', etapas);

  let somaPonderada = 0;
  let somaPesos = 0;

  for (const etapa of etapas) {
    const peso = etapa.etapaTemplate.peso;
    const percentual = Number(etapa.percentualConcluido);
    somaPonderada += percentual * peso;
    somaPesos += peso;
  }

  const prog = somaPesos === 0 ? 0 : Math.round((somaPonderada / somaPesos) * 100) / 100;
  console.log('Calculated Progresso:', prog);
}
check().then(() => process.exit(0));
