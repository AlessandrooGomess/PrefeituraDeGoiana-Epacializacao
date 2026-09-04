import { PrismaClient, Role, StatusObra, TipoFoto } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 [1/4] Limpando dados antigos...");
  await prisma.foto.deleteMany();
  await prisma.medicao.deleteMany();
  await prisma.obra.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.secretaria.deleteMany();

  console.log("🏛️ [2/4] Criando Secretarias Municipais...");
  const seinfra = await prisma.secretaria.create({
    data: {
      nome: "Secretaria de Infraestrutura e Serviços Públicos",
      sigla: "SEINFRA",
      corIdentificacao: "#2563EB",
    },
  });

  const seduc = await prisma.secretaria.create({
    data: {
      nome: "Secretaria de Educação",
      sigla: "SEDUC",
      corIdentificacao: "#EAB308",
    },
  });

  console.log("👷 [3/4] Criando Usuário Fiscal (Engenheiro)...");
  const engenheiro = await prisma.usuario.create({
    data: {
      nome: "Fiscal de Obras - Prefeitura de Goiana",
      email: "fiscal.obras@goiana.pe.gov.br",
      cargo: "Engenheiro Civil",
      role: Role.ENGENHEIRO,
    },
  });

  console.log("📍 [4/4] Inserindo Obras Reais de Goiana (2025)...");

  const obraPontaDePedras = await prisma.obra.create({
    data: {
      titulo: "Pavimentação em Paralelepípedo e Drenagem no Centro de Ponta de Pedras",
      descricao: "PAVIMENTAÇÃO EM PARALELEPÍPEDO E DRENAGEM DO CENTRO DE PONTA DE PEDRAS DISTRITO DE GOIANA/PE - ETAPA 02",
      endereco: "Centro de Ponta de Pedras",
      bairro: "Ponta de Pedras",
      latitude: -7.618,
      longitude: -34.8385,
      valorContrato: 2834000.0,
      empresaContratada: "J L MARANHAO CONSTRUTORA LTDA",
      numeroOrdemServico: "OS-737/2025",
      dataOrdemServico: new Date("2025-10-29"),
      previsaoConclusao: new Date("2027-01-03"),
      status: StatusObra.EM_ANDAMENTO,
      secretariaId: seinfra.id,
      engenheiroId: engenheiro.id,
    },
  });

  await prisma.medicao.create({
    data: {
      obraId: obraPontaDePedras.id,
      engenheiroId: engenheiro.id,
      percentualExecutado: 73.31,
      observacoesTecnicas: "Execução de drenagem avançada e assentamento de paralelepípedos.",
    },
  });

  const obraCarneDeVaca = await prisma.obra.create({
    data: {
      titulo: "Pavimentação de 18 Ruas em Carne de Vaca",
      descricao: "PAVIMENTAÇÃO EM PARALELEPÍPEDOS GRANÍTICOS DE 18 RUAS NA COMUNIDADE DE CARNE DE VACA - GOIANA/PE",
      endereco: "Comunidade de Carne de Vaca",
      bairro: "Carne de Vaca",
      latitude: -7.5255,
      longitude: -34.8322,
      valorContrato: 1919999.98,
      empresaContratada: "A2 ENGENHARIA LTDA",
      numeroOrdemServico: "OS-498/2025",
      dataOrdemServico: new Date("2025-07-25"),
      previsaoConclusao: new Date("2026-07-19"),
      status: StatusObra.EM_ANDAMENTO,
      secretariaId: seinfra.id,
      engenheiroId: engenheiro.id,
    },
  });

  await prisma.medicao.create({
    data: {
      obraId: obraCarneDeVaca.id,
      engenheiroId: engenheiro.id,
      percentualExecutado: 76.72,
      observacoesTecnicas: "Pavimentação granítica em estágio avançado nas vias principais.",
    },
  });

  const obraRestauroCentro = await prisma.obra.create({
    data: {
      titulo: "Restauro do Prédio da Secretaria de Urbanismo e Obras",
      descricao: "RESTAURO DO ANTIGO PRÉDIO DA SECRETARIA DE URBANISMO, OBRAS E PATRIMÔNIO, LOCALIZADO NA R. DR. MANOEL BORBA, CENTRO",
      endereco: "Rua Dr. Manoel Borba",
      bairro: "Centro",
      latitude: -7.5592,
      longitude: -35.0028,
      valorContrato: 1815911.69,
      empresaContratada: "A2 ENGENHARIA LTDA",
      numeroOrdemServico: "OS-497/2025",
      dataOrdemServico: new Date("2025-07-25"),
      previsaoConclusao: new Date("2026-11-17"),
      status: StatusObra.EM_ANDAMENTO,
      secretariaId: seinfra.id,
      engenheiroId: engenheiro.id,
    },
  });

  await prisma.medicao.create({
    data: {
      obraId: obraRestauroCentro.id,
      engenheiroId: engenheiro.id,
      percentualExecutado: 10.27,
      observacoesTecnicas: "Fase inicial de escoramento e prospecção do patrimônio histórico.",
    },
  });

  const obraTejucupapo = await prisma.obra.create({
    data: {
      titulo: "Pavimentação e Passeio em Ruas de Tejucupapo",
      descricao: "PAVIMENTAÇÃO EM PARALELEPÍPEDO E PASSEIO DE DIVERSAS RUAS LOCALIZADAS NO DISTRITO DE TEJUCUPAPO",
      endereco: "Vias urbanas de Tejucupapo",
      bairro: "Tejucupapo",
      latitude: -7.5619,
      longitude: -34.9317,
      valorContrato: 1058599.98,
      empresaContratada: "A2 ENGENHARIA LTDA",
      numeroOrdemServico: "OS-256/2025",
      dataOrdemServico: new Date("2025-04-11"),
      previsaoConclusao: new Date("2026-01-11"),
      status: StatusObra.EM_ANDAMENTO,
      secretariaId: seinfra.id,
      engenheiroId: engenheiro.id,
    },
  });

  await prisma.medicao.create({
    data: {
      obraId: obraTejucupapo.id,
      engenheiroId: engenheiro.id,
      percentualExecutado: 93.29,
      observacoesTecnicas: "Reta final de acabamento de meio-fio e passeios acessíveis.",
    },
  });

  const obraAsfaltoCentro = await prisma.obra.create({
    data: {
      titulo: "Pavimentação Asfáltica em CBUQ - Etapa 5",
      descricao: "PRESTAÇÃO DE SERVIÇOS DE PAVIMENTAÇÃO ASFÁLTICA EM CBUQ DA ETAPA 5 DE DIVERSAS RUAS DO CENTRO DE GOIANA/PE",
      endereco: "Ruas do Centro",
      bairro: "Centro",
      latitude: -7.5568,
      longitude: -35.0055,
      valorContrato: 4085652.13,
      empresaContratada: "CONSTRUTORA GONCALO LTDA",
      numeroOrdemServico: "OS-397/2025",
      dataOrdemServico: new Date("2025-06-06"),
      previsaoConclusao: new Date("2025-09-04"),
      dataConclusaoReal: new Date("2025-09-04"),
      status: StatusObra.CONCLUIDA,
      secretariaId: seinfra.id,
      engenheiroId: engenheiro.id,
    },
  });

  await prisma.medicao.create({
    data: {
      obraId: obraAsfaltoCentro.id,
      engenheiroId: engenheiro.id,
      percentualExecutado: 100.0,
      observacoesTecnicas: "Obra 100% executada, sinalizada e entregue à população.",
    },
  });

  const obraEscolaAngelo = await prisma.obra.create({
    data: {
      titulo: "Reforma e Ampliação da Escola Municipal Prefeito Ângelo Jordão",
      descricao: "EXECUÇÃO DAS OBRAS DE REFORMA, AMPLIAÇÃO E ADEQUAÇÃO NA ESCOLA MUNICIPAL PREFEITO ÂNGELO JORDÃO",
      endereco: "Av. Marechal Deodoro",
      bairro: "Centro",
      latitude: -7.5542,
      longitude: -35.0019,
      valorContrato: 336599.09,
      empresaContratada: "A2 ENGENHARIA LTDA",
      numeroOrdemServico: "OS-320/2025",
      dataOrdemServico: new Date("2025-04-29"),
      previsaoConclusao: new Date("2026-02-23"),
      status: StatusObra.EM_ANDAMENTO,
      secretariaId: seduc.id,
      engenheiroId: engenheiro.id,
    },
  });

  await prisma.medicao.create({
    data: {
      obraId: obraEscolaAngelo.id,
      engenheiroId: engenheiro.id,
      percentualExecutado: 87.05,
      observacoesTecnicas: "Pintura geral e instalação de esquadrias em andamento.",
    },
  });

  const obraFeiraFlexeiras = await prisma.obra.create({
    data: {
      titulo: "Implantação do Pátio de Feira Livre de Flexeiras",
      descricao: "CONTRATAÇÃO DE EMPRESA ESPECIALIZADA NA PRESTAÇÃO DE SERVIÇOS DE EXECUÇÃO DE OBRAS PARA IMPLANTAÇÃO DO PÁTIO DE FEIRA LIVRE DE FLEXEIRAS",
      endereco: "Distrito de Flexeiras",
      bairro: "Flexeiras",
      latitude: -7.5812,
      longitude: -34.965,
      valorContrato: 504999.0,
      empresaContratada: "CASSIANO FERNANDE DE LIRA CONSTRUTORA LTDA",
      numeroOrdemServico: "OS-019/2025",
      dataOrdemServico: new Date("2025-01-16"),
      previsaoConclusao: new Date("2025-07-17"),
      dataConclusaoReal: new Date("2025-07-17"),
      status: StatusObra.CONCLUIDA,
      secretariaId: seinfra.id,
      engenheiroId: engenheiro.id,
    },
  });

  await prisma.medicao.create({
    data: {
      obraId: obraFeiraFlexeiras.id,
      engenheiroId: engenheiro.id,
      percentualExecutado: 100.0,
      observacoesTecnicas: "Pátio pavimentado, bancadas instaladas e iluminação concluída.",
    },
  });

  console.log("✨ Todas as 7 obras foram inseridas com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });