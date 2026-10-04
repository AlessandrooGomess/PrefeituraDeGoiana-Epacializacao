import { PrismaClient, Role, StatusObra, TipoFoto } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 [1/4] Limpando dados antigos...");

  await prisma.foto.deleteMany();
  await prisma.registroCampo.deleteMany();
  await prisma.medicao.deleteMany();
  await prisma.subEtapaObra.deleteMany();
  await prisma.etapaObra.deleteMany();
  await prisma.obra.deleteMany();
  await prisma.subEtapaTemplate.deleteMany();
  await prisma.etapaTemplate.deleteMany();
  await prisma.tipoObra.deleteMany();
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
  const areaEducacao = eixoSocial.areas.find(
    (area) => area.nome === "Educação",
  )!;
  const areaEconomia = eixoEconomico.areas.find(
    (area) => area.nome === "Economia Local",
  )!;
  const areaPatrimonio = eixoEconomico.areas.find(
    (area) => area.nome === "Patrimônio Histórico",
  )!;

  const seinfra = await prisma.secretaria.create({
    data: {
      nome: "Desenvolvimento Urbano e Obras",
      sigla: "SEDUO",
      corIdentificacao: "#2563EB",
      eixoId: eixoSocial.id,
    },
  });

  const seduc = await prisma.secretaria.create({
    data: {
      nome: "Educação e Inovação Pedagógica",
      sigla: "SECEDIP",
      corIdentificacao: "#EAB308",
      eixoId: eixoSocial.id,
    },
  });

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
        nome: "Autarquia de Ensino Superior de Ensino",
        sigla: "AMESG",
        eixoId: eixoSocial.id,
      },
      { nome: "Mulher", sigla: "SEMUL", eixoId: eixoSocial.id },
      {
        nome: "Segurança Cidadã, Trânsito e Transportes Urbanos",
        sigla: "SESTRAN",
        eixoId: eixoSocial.id,
      },
      {
        nome: "Habitação e Regularização Fundiária",
        sigla: "SEHAB",
        eixoId: eixoSocial.id,
      },
      {
        nome: "Turismo, Cultura e Proteção ao Patrimônio Histórico Cultural",
        sigla: "SETUR",
        eixoId: eixoEconomico.id,
      },
      {
        nome: "Agência de Desenvolvimento de Goiana",
        sigla: "AD",
        eixoId: eixoEconomico.id,
      },
      {
        nome: "Desenvolvimento Econômico e Tecnologia",
        sigla: "SECTI",
        eixoId: eixoEconomico.id,
      },
      {
        nome: "Agricultura, Pecuária, Pesca e Proteção Animal",
        sigla: "SEAPPA",
        eixoId: eixoEconomico.id,
      },
      {
        nome: "Agência de Meio Ambiente",
        sigla: "AMAG",
        eixoId: eixoEconomico.id,
      },
      {
        nome: "Planejamento Estratégico, Orçamento e Gestão",
        sigla: "SEPLAN",
        eixoId: eixoModernizacao.id,
      },
      {
        nome: "Administração e Gestão da Qualidade",
        sigla: "SECAD",
        eixoId: eixoModernizacao.id,
      },
      {
        nome: "Fazenda Municipal",
        sigla: "SEFAZ",
        eixoId: eixoModernizacao.id,
      },
      {
        nome: "Articulação Política, Governo e Participação Social",
        sigla: "SEAPOG",
        eixoId: eixoModernizacao.id,
      },
      {
        nome: "Licitações e Contratos Públicos",
        sigla: "SLCP",
        eixoId: eixoModernizacao.id,
      },
      { nome: "Ouvidoria", sigla: "OGM", eixoId: eixoModernizacao.id },
      {
        nome: "Goiana Previ",
        sigla: "GOIANAPREVI",
        eixoId: eixoModernizacao.id,
      },
      { nome: "Controladoria", sigla: "CCI", eixoId: eixoModernizacao.id },
      { nome: "Comunicação", sigla: "SECOM", eixoId: eixoModernizacao.id },
      { nome: "Procuradoria", sigla: "PGM", eixoId: eixoModernizacao.id },
    ],
  });

  console.log(
    " [4/4] Criando Hierarquia de Usuários (Admin, Gestor e Fiscal)...",
  );

  const senhaAdmin = await hash(process.env.SEED_SENHA_ADMIN || "12345678", 12);
  const senhaSec = await hash(process.env.SEED_SENHA_GESTOR_SEDUO || "12345678", 12);
  const senhaEng = await hash(process.env.SEED_SENHA_ENG_SEDUO || "12345678", 12);

  await prisma.usuario.create({
    data: {
      nome: "Administrador Geral - Prefeitura de Goiana",
      email: "admin@goiana.pe.gov.br",
      cargo: "Gestor de Tecnologia e Transparência",
      role: Role.SUPER_ADMIN,
      passwordHash: senhaAdmin,
    },
  });

  await prisma.usuario.create({
    data: {
      nome: "Secretario de Obras - SEDUO",
      email: "gestor.seduo@goiana.pe.gov.br",
      cargo: "Secretario Executivo de Infraestrutura",
      role: Role.ADM_SECRETARIA,
      secretariaId: seinfra.id,
      passwordHash: senhaSec,
    },
  });

  const engenheiro = await prisma.usuario.create({
    data: {
      nome: "Fiscal de Obras - Prefeitura de Goiana",
      email: "engenheiro.seduo@goiana.pe.gov.br",
      cargo: "Engenheiro Civil Fiscal",
      role: Role.ENGENHEIRO,
      secretariaId: seinfra.id,
      passwordHash: senhaEng,
    },
  });

  const engenheiroSeduc = await prisma.usuario.create({
    data: {
      nome: "Fiscal de Obras da Educação",
      email: "engenheiro.seduc@goiana.pe.gov.br",
      cargo: "Engenheiro Civil Fiscal",
      role: Role.ENGENHEIRO,
      secretariaId: seduc.id,
      passwordHash: senhaEng,
    },
  });

  console.log("📍 [4/4] Inserindo Obras Reais de Goiana (2025)...");

  console.log("📑 Criando Tipos de Obra e Templates de Etapas...");

  const tipoPavimentacao = await prisma.tipoObra.create({
    data: {
      nome: "Pavimentação",
      slug: "pavimentacao",
      descricao: "Obras de asfalto, calçamento e infraestrutura viária.",
      etapasTemplate: {
        create: [
          { nome: "Início da Obra", nomeCidadao: "Preparação", ordem: 1, peso: 10, subEtapasTemplate: { create: [
            { nome: "Placa de obra", ordem: 1, peso: 10 },
            { nome: "Serviços preliminares", ordem: 2, peso: 50 },
            { nome: "Administração local", ordem: 3, peso: 40 }
          ]}},
          { nome: "Terraplanagem", nomeCidadao: "Terraplanagem", ordem: 2, peso: 20, subEtapasTemplate: { create: [
            { nome: "Corte e aterro", ordem: 1, peso: 50 },
            { nome: "Regularização", ordem: 2, peso: 50 }
          ]}},
          { nome: "Base da Pavimentação", nomeCidadao: "Base da Rua", ordem: 3, peso: 20, subEtapasTemplate: { create: [
            { nome: "Base e sub-base", ordem: 1, peso: 100 }
          ]}},
          { nome: "Preparação", nomeCidadao: "Preparação Asfalto", ordem: 4, peso: 10, subEtapasTemplate: { create: [
            { nome: "Imprimação (pintura de ligação)", ordem: 1, peso: 100 }
          ]}},
          { nome: "Drenagem", nomeCidadao: "Drenagem", ordem: 5, peso: 25, subEtapasTemplate: { create: [
            { nome: "Meio fio e sarjetas", ordem: 1, peso: 50 },
            { nome: "Rede e equipamentos coletores", ordem: 2, peso: 50 }
          ]}},
          { nome: "Sinalização", nomeCidadao: "Sinalização", ordem: 6, peso: 15, subEtapasTemplate: { create: [
            { nome: "Horizontal", ordem: 1, peso: 50 },
            { nome: "Vertical", ordem: 2, peso: 50 }
          ]}},
        ]
      }
    }
  });

  const tipoReforma = await prisma.tipoObra.create({
    data: {
      nome: "Reforma de Prédio Público",
      slug: "reforma-predio-publico",
      descricao: "Obras de melhoria, ampliação ou reparo estrutural em prédios existentes.",
      etapasTemplate: {
        create: [
          { nome: "Início da Obra", nomeCidadao: "Preparação", ordem: 1, peso: 5, subEtapasTemplate: { create: [
            { nome: "Placa de obra", ordem: 1, peso: 20 },
            { nome: "Serviços preliminares", ordem: 2, peso: 40 },
            { nome: "Administração local", ordem: 3, peso: 40 }
          ]}},
          { nome: "Estruturas", nomeCidadao: "Estruturas", ordem: 2, peso: 15, subEtapasTemplate: { create: [
            { nome: "Recuperação estrutural", ordem: 1, peso: 100 }
          ]}},
          { nome: "Coberta", nomeCidadao: "Telhado", ordem: 3, peso: 15, subEtapasTemplate: { create: [
            { nome: "Telhado (telhamento e retelhamento)", ordem: 1, peso: 40 },
            { nome: "Estrutura da coberta", ordem: 2, peso: 40 },
            { nome: "Forro", ordem: 3, peso: 20 }
          ]}},
          { nome: "Paredes", nomeCidadao: "Paredes", ordem: 4, peso: 10, subEtapasTemplate: { create: [
            { nome: "Demolições", ordem: 1, peso: 40 },
            { nome: "Construções", ordem: 2, peso: 60 }
          ]}},
          { nome: "Instalações", nomeCidadao: "Instalações", ordem: 5, peso: 20, subEtapasTemplate: { create: [
            { nome: "Hidrossanitária", ordem: 1, peso: 40 },
            { nome: "Elétrica", ordem: 2, peso: 40 },
            { nome: "Lógica", ordem: 3, peso: 20 }
          ]}},
          { nome: "Pisos", nomeCidadao: "Pisos e Calçadas", ordem: 6, peso: 15, subEtapasTemplate: { create: [
            { nome: "Contra piso", ordem: 1, peso: 30 },
            { nome: "Revestimento", ordem: 2, peso: 50 },
            { nome: "Passeio e calçadas", ordem: 3, peso: 20 }
          ]}},
          { nome: "Acabamentos", nomeCidadao: "Acabamentos", ordem: 7, peso: 15, subEtapasTemplate: { create: [
            { nome: "Revestimento", ordem: 1, peso: 30 },
            { nome: "Esquadrias", ordem: 2, peso: 30 },
            { nome: "Pinturas", ordem: 3, peso: 40 }
          ]}},
          { nome: "Paisagismos e Equipamentos", nomeCidadao: "Paisagismo", ordem: 8, peso: 5, subEtapasTemplate: { create: [
            { nome: "Paisagismos e Equipamentos", ordem: 1, peso: 100 }
          ]}}
        ]
      }
    }
  });

  const tipoReformaAmpliacao = await prisma.tipoObra.create({
    data: {
      nome: "Reforma com Ampliação de Prédio Público",
      slug: "reforma-ampliacao-predio-publico",
      descricao: "Obras de reforma e aumento da área construída.",
      etapasTemplate: {
        create: [
          { nome: "Início da Obra", nomeCidadao: "Preparação", ordem: 1, peso: 5, subEtapasTemplate: { create: [
            { nome: "Placa de obra", ordem: 1, peso: 20 },
            { nome: "Serviços preliminares", ordem: 2, peso: 40 },
            { nome: "Administração local", ordem: 3, peso: 40 }
          ]}},
          { nome: "Fundações e Superestruturas", nomeCidadao: "Fundações e Estrutura", ordem: 2, peso: 20, subEtapasTemplate: { create: [
            { nome: "Fundações (sapatas, blocos e vigas baldrames)", ordem: 1, peso: 30 },
            { nome: "Pilares", ordem: 2, peso: 20 },
            { nome: "Vigas", ordem: 3, peso: 20 },
            { nome: "Lajes", ordem: 4, peso: 30 }
          ]}},
          { nome: "Estruturas (Reforma)", nomeCidadao: "Recuperação", ordem: 3, peso: 10, subEtapasTemplate: { create: [
            { nome: "Recuperação estrutural", ordem: 1, peso: 100 }
          ]}},
          { nome: "Coberta", nomeCidadao: "Telhado", ordem: 4, peso: 10, subEtapasTemplate: { create: [
            { nome: "Telhado (telhamento e retelhamento)", ordem: 1, peso: 40 },
            { nome: "Estrutura da coberta", ordem: 2, peso: 40 },
            { nome: "Forro", ordem: 3, peso: 20 }
          ]}},
          { nome: "Paredes", nomeCidadao: "Paredes", ordem: 5, peso: 15, subEtapasTemplate: { create: [
            { nome: "Demolições", ordem: 1, peso: 40 },
            { nome: "Construções", ordem: 2, peso: 60 }
          ]}},
          { nome: "Instalações", nomeCidadao: "Instalações", ordem: 6, peso: 15, subEtapasTemplate: { create: [
            { nome: "Hidrossanitária", ordem: 1, peso: 40 },
            { nome: "Elétrica", ordem: 2, peso: 40 },
            { nome: "Lógica", ordem: 3, peso: 20 }
          ]}},
          { nome: "Pisos", nomeCidadao: "Pisos e Calçadas", ordem: 7, peso: 10, subEtapasTemplate: { create: [
            { nome: "Contra piso", ordem: 1, peso: 30 },
            { nome: "Revestimento", ordem: 2, peso: 50 },
            { nome: "Passeio e calçadas", ordem: 3, peso: 20 }
          ]}},
          { nome: "Acabamentos", nomeCidadao: "Acabamentos", ordem: 8, peso: 15, subEtapasTemplate: { create: [
            { nome: "Revestimento", ordem: 1, peso: 30 },
            { nome: "Esquadrias", ordem: 2, peso: 30 },
            { nome: "Pinturas", ordem: 3, peso: 40 }
          ]}}
        ]
      }
    }
  });

  const tipoConstrucao = await prisma.tipoObra.create({
    data: {
      nome: "Construção de Prédio Público",
      slug: "construcao-predio-publico",
      descricao: "Obras de construção do zero de edificações como escolas, hospitais, etc.",
      etapasTemplate: {
        create: [
          { nome: "Início da Obra", nomeCidadao: "Preparação do Terreno", ordem: 1, peso: 5, subEtapasTemplate: { create: [
            { nome: "Placa de obra", ordem: 1, peso: 10 },
            { nome: "Serviços preliminares", ordem: 2, peso: 20 },
            { nome: "Administração local", ordem: 3, peso: 30 },
            { nome: "Locação de gabarito", ordem: 4, peso: 20 },
            { nome: "Tapume", ordem: 5, peso: 20 }
          ]}},
          { nome: "Fundações e Superestruturas", nomeCidadao: "Fundações e Estrutura", ordem: 2, peso: 25, subEtapasTemplate: { create: [
            { nome: "Fundações (sapatas, blocos e vigas baldrames)", ordem: 1, peso: 30 },
            { nome: "Pilares", ordem: 2, peso: 20 },
            { nome: "Vigas", ordem: 3, peso: 20 },
            { nome: "Lajes", ordem: 4, peso: 30 }
          ]}},
          { nome: "Coberta", nomeCidadao: "Telhado", ordem: 3, peso: 15, subEtapasTemplate: { create: [
            { nome: "Telhado (telhamento e retelhamento)", ordem: 1, peso: 40 },
            { nome: "Estrutura da coberta", ordem: 2, peso: 40 },
            { nome: "Forro", ordem: 3, peso: 20 }
          ]}},
          { nome: "Paredes", nomeCidadao: "Paredes", ordem: 4, peso: 15, subEtapasTemplate: { create: [
            { nome: "Demolições", ordem: 1, peso: 10 },
            { nome: "Construções", ordem: 2, peso: 90 }
          ]}},
          { nome: "Instalações", nomeCidadao: "Instalações", ordem: 5, peso: 15, subEtapasTemplate: { create: [
            { nome: "Hidrossanitária", ordem: 1, peso: 40 },
            { nome: "Elétrica", ordem: 2, peso: 40 },
            { nome: "Lógica", ordem: 3, peso: 20 }
          ]}},
          { nome: "Pisos", nomeCidadao: "Pisos e Calçadas", ordem: 6, peso: 10, subEtapasTemplate: { create: [
            { nome: "Contra piso", ordem: 1, peso: 30 },
            { nome: "Revestimento", ordem: 2, peso: 50 },
            { nome: "Passeio e calçadas", ordem: 3, peso: 20 }
          ]}},
          { nome: "Acabamentos", nomeCidadao: "Acabamentos", ordem: 7, peso: 15, subEtapasTemplate: { create: [
            { nome: "Revestimento", ordem: 1, peso: 30 },
            { nome: "Esquadrias", ordem: 2, peso: 30 },
            { nome: "Pinturas", ordem: 3, peso: 40 }
          ]}}
        ]
      }
    }
  });

  
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

  
console.log("🔗 Associando os Tipos de Obra e calculando progresso...");

  const associacoes = [
    { obraId: obraPontaDePedras.id, tipo: tipoPavimentacao, progresso: 40 },
    { obraId: obraCarneDeVaca.id, tipo: tipoPavimentacao, progresso: 25 },
    { obraId: obraRestauroCentro.id, tipo: tipoReforma, progresso: 15 },
    { obraId: obraTejucupapo.id, tipo: tipoPavimentacao, progresso: 60 },
    { obraId: obraAsfaltoCentro.id, tipo: tipoPavimentacao, progresso: 100 },
    { obraId: obraEscolaAngelo.id, tipo: tipoReformaAmpliacao, progresso: 35 },
    { obraId: obraFeiraFlexeiras.id, tipo: tipoConstrucao, progresso: 100 },
  ];

  for (const assoc of associacoes) {
    await prisma.obra.update({
      where: { id: assoc.obraId },
      data: { tipoObraId: assoc.tipo.id },
    });

    const templates = await prisma.etapaTemplate.findMany({
      where: { tipoObraId: assoc.tipo.id },
      orderBy: { ordem: "asc" },
      include: { subEtapasTemplate: true },
    });

    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      const etapaProgresso =
        assoc.progresso === 100
          ? 100
          : i === 0 || i === 1
            ? assoc.progresso * 1.5
            : 0;
      const limitProgresso = Math.min(etapaProgresso, 100);

      const statusEtapa =
        limitProgresso === 100
          ? "CONCLUIDA"
          : limitProgresso > 0
            ? "EM_ANDAMENTO"
            : "PENDENTE";

      await prisma.etapaObra.create({
        data: {
          obraId: assoc.obraId,
          etapaTemplateId: template.id,
          percentualConcluido: limitProgresso,
          status: statusEtapa,
          dataInicio: limitProgresso > 0 ? new Date("2025-06-01") : null,
          dataConclusao: limitProgresso === 100 ? new Date("2025-08-01") : null,
          subEtapasObra: {
            create: template.subEtapasTemplate.map((sub) => ({
              subEtapaTemplateId: sub.id,
              percentualConcluido: limitProgresso,
              status: statusEtapa,
              dataInicio: limitProgresso > 0 ? new Date("2025-06-01") : null,
              dataConclusao: limitProgresso === 100 ? new Date("2025-08-01") : null,
            }))
          }
        },
      });
    }
  }

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

