import { PrismaClient, Role, StatusObra, TipoFoto } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 [1/4] Limpando dados antigos...");
  await prisma.foto.deleteMany();
  await prisma.medicao.deleteMany();
  await prisma.obra.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.secretaria.deleteMany();
  await prisma.areaTematica.deleteMany();
  await prisma.eixoEstrategico.deleteMany();

  const eixoSocial = await prisma.eixoEstrategico.create({
    data: {
      nome: "DESENVOLVIMENTO SOCIAL",
      slug: "desenvolvimento-social",
      cor: "#3182CE",
      descricao:
        "Infraestrutura urbana, saúde, educação, assistência social, esporte, segurança, mobilidade e habitação.",
      areas: {
        create: [
          { nome: "Infraestrutura Urbana" },
          { nome: "Direito à Cidade" },
          { nome: "Resiliencia Urbana" },
          { nome: "Assistência Social" },
          { nome: "Saúde" },
          { nome: "Esporte e Lazer" },
          { nome: "Educação" },
          { nome: "Segurança Pública e Mobilidade Urbana" },
        ],
      },
    },
    include: { areas: true },
  });

  const eixoEconomico = await prisma.eixoEstrategico.create({
    data: {
      nome: "DESENVOLVIMENTO ECONÔMICO SUSTENTÁVEL",
      slug: "desenvolvimento-economico-sustentavel",
      cor: "#059669",
      descricao:
        "Turismo, cultura, patrimônio histórico, desenvolvimento econômico, tecnologia, agricultura, pesca, proteção animal e meio ambiente.",
      areas: {
        create: [
          { nome: "Economia Local" },
          { nome: "Ciência e Tecnologia" },
          { nome: "Agricultura e Pesca" },
          { nome: "Patrimônio Histórico" },
          { nome: "Meio Ambiente" },
        ],
      },
    },
    include: { areas: true },
  });

  const eixoModernizacao = await prisma.eixoEstrategico.create({
    data: {
      nome: "MODERNIZAÇÃO ADMINISTRATIVA",
      slug: "modernizacao-administrativa",
      cor: "#D97706",
      descricao:
        "Planejamento estratégico, orçamento, gestão, administração, fazenda, controle, comunicação e assuntos jurídicos.",
      areas: {
        create: [{ nome: "Inovação e Gestão Administrativa" }],
      },
    },
    include: { areas: true },
  });

  console.log("📍 [3/4] Criando Secretarias Municipais...");

  const areaInfra = eixoSocial.areas.find(
    (area) => area.nome === "Infraestrutura Urbana",
  )!;
  const areaDireitoCidade = eixoSocial.areas.find(
    (area) => area.nome === "Direito à Cidade",
  )!;
  const areaAssistencia = eixoSocial.areas.find(
    (area) => area.nome === "Assistência Social",
  )!;
  const areaSaude = eixoSocial.areas.find((area) => area.nome === "Saúde")!;
  const areaEsporte = eixoSocial.areas.find(
    (area) => area.nome === "Esporte e Lazer",
  )!;
  const areaEducacao = eixoSocial.areas.find(
    (area) => area.nome === "Educação",
  )!;
  const areaSeguranca = eixoSocial.areas.find(
    (area) => area.nome === "Segurança Pública e Mobilidade Urbana",
  )!;

  const areaEconomia = eixoEconomico.areas.find(
    (area) => area.nome === "Economia Local",
  )!;
  const areaTecnologia = eixoEconomico.areas.find(
    (area) => area.nome === "Ciência e Tecnologia",
  )!;
  const areaAgricultura = eixoEconomico.areas.find(
    (area) => area.nome === "Agricultura e Pesca",
  )!;
  const areaPatrimonio = eixoEconomico.areas.find(
    (area) => area.nome === "Patrimônio Histórico",
  )!;
  const areaMeioAmbiente = eixoEconomico.areas.find(
    (area) => area.nome === "Meio Ambiente",
  )!;

  const areaGestao = eixoModernizacao.areas.find(
    (area) => area.nome === "Inovação e Gestão Administrativa",
  )!;

  const seinfra = await prisma.secretaria.create({
    data: {
      nome: "Desenvolvimento Urbano e Obras",
      sigla: "SEDUO",
      corIdentificacao: "#2563EB",
      eixoId: eixoSocial.id,
      areaTematicaId: areaInfra.id,
    },
  });

  const seduc = await prisma.secretaria.create({
    data: {
      nome: "Educação e Inovação Pedagógica",
      sigla: "SECEDIP",
      corIdentificacao: "#EAB308",
      eixoId: eixoSocial.id,
      areaTematicaId: areaEducacao.id,
    },
  });

  // Siglas provisórias, aguardando confirmação institucional.
  await prisma.secretaria.createMany({
    data: [
      {
        nome: "Manutenção e Serviços Públicos",
        sigla: "SEMANGES",
        eixoId: eixoSocial.id,
      },
      { nome: "Esportes", sigla: "SEES", eixoId: eixoSocial.id },
      { nome: "Criança e Juventude", sigla: "SECJ", eixoId: eixoSocial.id },
      { nome: "Saúde", sigla: "SESAU", eixoId: eixoSocial.id },
      {
        nome: "Assistência Social e Direitos Humanos",
        sigla: "SASDH",
        eixoId: eixoSocial.id,
      },
      {
        nome: "Autarquia de Ensino Superior",
        sigla: "AMESG",
        eixoId: eixoSocial.id,
      },
      { nome: "Mulher", sigla: "SEMUL", eixoId: eixoSocial.id },
      { nome: "Segurança Cidadã", sigla: "SSC", eixoId: eixoSocial.id },
      {
        nome: "Trânsito e Transportes Urbanos",
        sigla: "STTU",
        eixoId: eixoSocial.id,
      },
      {
        nome: "Habitação e Regularização Fundiária",
        sigla: "SHRF",
        eixoId: eixoSocial.id,
      },
      {
        nome: "Turismo",
        sigla: "SETUR",
        eixoId: eixoEconomico.id,
      },
      {
        nome: "Cultura e Proteção ao Patrimônio Histórico Cultural",
        sigla: "SCPPHC",
        eixoId: eixoEconomico.id,
      },
      {
        nome: "Agência de Desenvolvimento de Goiana",
        sigla: "ADG",
        eixoId: eixoEconomico.id,
      },
      {
        nome: "Desenvolvimento Econômico e Tecnologia",
        sigla: "SDET",
        eixoId: eixoEconomico.id,
      },
      {
        nome: "Agricultura, Pecuária, Pesca e Proteção Animal",
        sigla: "SAPPA",
        eixoId: eixoEconomico.id,
      },
      {
        nome: "Agência de Meio Ambiente",
        sigla: "AMAG",
        eixoId: eixoEconomico.id,
      },
      {
        nome: "Planejamento Estratégico",
        sigla: "SPE",
        eixoId: eixoModernizacao.id,
      },
      {
        nome: "Orçamento e Gestão",
        sigla: "SOG",
        eixoId: eixoModernizacao.id,
      },
      {
        nome: "Administração e Gestão da Qualidade",
        sigla: "SAGQ",
        eixoId: eixoModernizacao.id,
      },
      {
        nome: "Fazenda Municipal",
        sigla: "SFM",
        eixoId: eixoModernizacao.id,
      },
      {
        nome: "Articulação Política",
        sigla: "SAP",
        eixoId: eixoModernizacao.id,
      },
      {
        nome: "Governo e Participação Social",
        sigla: "SGPS",
        eixoId: eixoModernizacao.id,
      },
      {
        nome: "Licitações e Contratos Públicos",
        sigla: "SLCP",
        eixoId: eixoModernizacao.id,
      },
      { nome: "Ouvidoria", sigla: "OUV", eixoId: eixoModernizacao.id },
      { nome: "Goiana Previ", sigla: "GP", eixoId: eixoModernizacao.id },
      { nome: "Controladoria", sigla: "CGM", eixoId: eixoModernizacao.id },
      { nome: "Comunicação", sigla: "ASCOM", eixoId: eixoModernizacao.id },
      { nome: "Procuradoria", sigla: "PGM", eixoId: eixoModernizacao.id },
    ],
  });

  console.log(
    " [4/4] Criando Hierarquia de Usuários (Admin, Gestor e Fiscal)...",
  );
  await prisma.usuario.create({
    data: {
      nome: "Administrador Geral - Prefeitura de Goiana",
      email: "admin@goiana.pe.gov.br",
      cargo: "Gestor de Tecnologia e Transparência",
      role: Role.SUPER_ADMIN,
    },
  });

  await prisma.usuario.create({
    data: {
      nome: "Secretario de Obras - SEINFRA",
      email: "gestor.seinfra@goiana.pe.gov.br",
      cargo: "Secretario Executivo de Infraestrutura",
      role: Role.ADM_SECRETARIA,
      secretariaId: seinfra.id,
    },
  });

  const engenheiro = await prisma.usuario.create({
    data: {
      nome: "Fiscal de Obras - Prefeitura de Goiana",
      email: "fiscal.obras@goiana.pe.gov.br",
      cargo: "Engenheiro Civil Fiscal",
      role: Role.ENGENHEIRO,
      secretariaId: seinfra.id,
    },
  });

  const engenheiroSeduc = await prisma.usuario.create({
    data: {
      nome: "Fiscal de Obras da Educação",
      email: "fiscal.educacao@goiana.pe.gov.br",
      cargo: "Engenheiro Civil Fiscal",
      role: Role.ENGENHEIRO,
      secretariaId: seduc.id,
    },
  });

  console.log("📍 [4/4] Inserindo Obras Reais de Goiana (2025)...");

  const obraPontaDePedras = await prisma.obra.create({
    data: {
      titulo:
        "Pavimentação em Paralelepípedo e Drenagem no Centro de Ponta de Pedras",
      descricao:
        "PAVIMENTAÇÃO EM PARALELEPÍPEDO E DRENAGEM DO CENTRO DE PONTA DE PEDRAS DISTRITO DE GOIANA/PE - ETAPA 02",
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
      eixoId: eixoSocial.id,
      areaTematicaId: areaInfra.id,
    },
  });

  await prisma.medicao.create({
    data: {
      obraId: obraPontaDePedras.id,
      engenheiroId: engenheiro.id,
      percentualExecutado: 73.31,
      observacoesTecnicas:
        "Execução de drenagem avançada e assentamento de paralelepípedos.",
    },
  });

  await prisma.foto.createMany({
    data: [
      {
        tipo: TipoFoto.RENDER_PROJETO,
        obraId: obraPontaDePedras.id,
        usuarioId: engenheiro.id,
        url: "/fotos/obra-ponta-de-pedras.jpg",
        descricao:
          "Perspectiva do projeto executivo de pavimentação e escoamento.",
        dataFoto: new Date("2025-10-30"),
      },
    ],
  });

  const obraCarneDeVaca = await prisma.obra.create({
    data: {
      titulo: "Pavimentação de 18 Ruas em Carne de Vaca",
      descricao:
        "PAVIMENTAÇÃO EM PARALELEPÍPEDOS GRANÍTICOS DE 18 RUAS NA COMUNIDADE DE CARNE DE VACA - GOIANA/PE",
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
      eixoId: eixoSocial.id,
      areaTematicaId: areaInfra.id,
    },
  });

  await prisma.medicao.create({
    data: {
      obraId: obraCarneDeVaca.id,
      engenheiroId: engenheiro.id,
      percentualExecutado: 76.72,
      observacoesTecnicas:
        "Pavimentação granítica em estágio avançado nas vias principais.",
    },
  });

  await prisma.foto.create({
    data: {
      tipo: TipoFoto.EM_ANDAMENTO,
      obraId: obraCarneDeVaca.id,
      usuarioId: engenheiro.id,
      url: "/fotos/obra-carne-de-vaca.jpg",
      descricao: "Registro fotográfico da pavimentação em Carne de Vaca.",
    },
  });

  const obraRestauroCentro = await prisma.obra.create({
    data: {
      titulo: "Restauro do Prédio da Secretaria de Urbanismo e Obras",
      descricao:
        "RESTAURO DO ANTIGO PRÉDIO DA SECRETARIA DE URBANISMO, OBRAS E PATRIMÔNIO, LOCALIZADO NA R. DR. MANOEL BORBA, CENTRO",
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
      eixoId: eixoEconomico.id,
      areaTematicaId: areaPatrimonio.id,
    },
  });

  await prisma.medicao.create({
    data: {
      obraId: obraRestauroCentro.id,
      engenheiroId: engenheiro.id,
      percentualExecutado: 10.27,
      observacoesTecnicas:
        "Fase inicial de escoramento e prospecção do patrimônio histórico.",
    },
  });

  await prisma.foto.createMany({
    data: [
      {
        tipo: TipoFoto.ANTES,
        obraId: obraRestauroCentro.id,
        usuarioId: engenheiro.id,
        url: "/fotos/obra-restauro-centro.jpg",
        descricao: "Estado da fachada histórica antes do início do escoramento",
        dataFoto: new Date("2025-07-28"),
      },
    ],
  });

  const obraTejucupapo = await prisma.obra.create({
    data: {
      titulo: "Pavimentação e Passeio em Ruas de Tejucupapo",
      descricao:
        "PAVIMENTAÇÃO EM PARALELEPÍPEDO E PASSEIO DE DIVERSAS RUAS LOCALIZADAS NO DISTRITO DE TEJUCUPAPO",
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
      eixoId: eixoSocial.id,
      areaTematicaId: areaInfra.id,
    },
  });

  await prisma.medicao.create({
    data: {
      obraId: obraTejucupapo.id,
      engenheiroId: engenheiro.id,
      percentualExecutado: 93.29,
      observacoesTecnicas:
        "Reta final de acabamento de meio-fio e passeios acessíveis.",
    },
  });

  await prisma.foto.create({
    data: {
      tipo: TipoFoto.EM_ANDAMENTO,
      obraId: obraTejucupapo.id,
      usuarioId: engenheiro.id,
      url: "/fotos/obra-tejucupapo.jpg",
      descricao: "Registro fotográfico da pavimentação em Tejucupapo.",
    },
  });

  const obraAsfaltoCentro = await prisma.obra.create({
    data: {
      titulo: "Pavimentação Asfáltica em CBUQ - Etapa 5",
      descricao:
        "PRESTAÇÃO DE SERVIÇOS DE PAVIMENTAÇÃO ASFÁLTICA EM CBUQ DA ETAPA 5 DE DIVERSAS RUAS DO CENTRO DE GOIANA/PE",
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
      eixoId: eixoSocial.id,
      areaTematicaId: areaInfra.id,
    },
  });

  await prisma.medicao.create({
    data: {
      obraId: obraAsfaltoCentro.id,
      engenheiroId: engenheiro.id,
      percentualExecutado: 100.0,
      observacoesTecnicas:
        "Obra 100% executada, sinalizada e entregue à população.",
    },
  });

  await prisma.foto.createMany({
    data: [
      {
        tipo: TipoFoto.CONCLUIDO,
        obraId: obraAsfaltoCentro.id,
        usuarioId: engenheiro.id,
        url: "/fotos/obra-asfalto-cbuq.jpg",
        descricao: "Vias centrais totalmente asfaltadas em CBUQ e sinalizadas.",
        dataFoto: new Date("2025-09-04"),
      },
    ],
  });

  const obraEscolaAngelo = await prisma.obra.create({
    data: {
      titulo: "Reforma e Ampliação da Escola Municipal Prefeito Ângelo Jordão",
      descricao:
        "EXECUÇÃO DAS OBRAS DE REFORMA, AMPLIAÇÃO E ADEQUAÇÃO NA ESCOLA MUNICIPAL PREFEITO ÂNGELO JORDÃO",
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
      engenheiroId: engenheiroSeduc.id,
      eixoId: eixoSocial.id,
      areaTematicaId: areaEducacao.id,
    },
  });

  await prisma.medicao.create({
    data: {
      obraId: obraEscolaAngelo.id,
      engenheiroId: engenheiroSeduc.id,
      percentualExecutado: 87.05,
      observacoesTecnicas:
        "Pintura geral e instalação de esquadrias em andamento.",
    },
  });

  await prisma.foto.create({
    data: {
      tipo: TipoFoto.EM_ANDAMENTO,
      obraId: obraEscolaAngelo.id,
      usuarioId: engenheiroSeduc.id,
      url: "/fotos/obra-escola-angelo.jpg",
      descricao:
        "Registro fotográfico da reforma da Escola Municipal Prefeito Ângelo Jordão.",
    },
  });

  const obraFeiraFlexeiras = await prisma.obra.create({
    data: {
      titulo: "Implantação do Pátio de Feira Livre de Flexeiras",
      descricao:
        "CONTRATAÇÃO DE EMPRESA ESPECIALIZADA NA PRESTAÇÃO DE SERVIÇOS DE EXECUÇÃO DE OBRAS PARA IMPLANTAÇÃO DO PÁTIO DE FEIRA LIVRE DE FLEXEIRAS",
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
      eixoId: eixoEconomico.id,
      areaTematicaId: areaEconomia.id,
    },
  });

  await prisma.medicao.create({
    data: {
      obraId: obraFeiraFlexeiras.id,
      engenheiroId: engenheiro.id,
      percentualExecutado: 100.0,
      observacoesTecnicas:
        "Pátio pavimentado, bancadas instaladas e iluminação concluída.",
    },
  });

  await prisma.foto.create({
    data: {
      tipo: TipoFoto.CONCLUIDO,
      obraId: obraFeiraFlexeiras.id,
      usuarioId: engenheiro.id,
      url: "/fotos/obra-patio-flexeiras.jpg",
      descricao: "Registro fotográfico do pátio de feira de Flexeiras.",
    },
  });

  console.log("✨ Todas as 7 obras foram inseridas com sucesso!");
}

main()
  .catch((e: unknown) => {
    console.error("❌ Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
