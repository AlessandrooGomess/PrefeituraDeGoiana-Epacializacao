import fs from "node:fs";
import path from "node:path";
import { PrismaClient, Role, StatusEtapa, StatusObra, TipoFoto } from "@prisma/client";
import { calcularMediaPonderada, statusPorPercentual } from "../lib/obras/progresso";

function readDatabaseUrlFromEnvFile(): string | undefined {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return undefined;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*DATABASE_URL\s*=\s*"?([^"\r\n]+)"?/);
    if (match) return match[1].trim();
  }
  return undefined;
}

function getDatasourceUrl(): string | undefined {
  const raw = process.env.DATABASE_URL ?? readDatabaseUrlFromEnvFile();
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    if (!url.searchParams.has("connect_timeout")) {
      url.searchParams.set("connect_timeout", "30");
    }
    if (!url.searchParams.has("pool_timeout")) {
      url.searchParams.set("pool_timeout", "30");
    }
    return url.toString();
  } catch {
    return raw;
  }
}

const datasourceUrl = getDatasourceUrl();
const prisma = new PrismaClient(datasourceUrl ? { datasourceUrl } : undefined);

interface ObraComplementarDef {
  secretariaSigla: string;
  eixoSlug: string;
  areaNome: string;
  tipoSlug: string;
  status: StatusObra;
  alertaDias?: number;
  prazoDias?: number;
  targetProgresso: number;
  titulo: string;
  descricao: string;
  endereco: string;
  bairro: string;
  latitude: number;
  longitude: number;
  valorContrato: number;
  empresaContratada: string | null;
  numeroOrdemServico: string;
  fotoUrl: string;
  fotoDescricao: string;
  observacaoMedicao: string;
}

const OBRAS_COMPLEMENTARES: ObraComplementarDef[] = [
  // === EIXO: DESENVOLVIMENTO SOCIAL (9 secretarias) ===
  {
    secretariaSigla: "SESAU",
    eixoSlug: "desenvolvimento-social",
    areaNome: "Saúde",
    tipoSlug: "reforma-ampliacao-predio-publico",
    status: StatusObra.EM_ANDAMENTO,
    prazoDias: 165,
    targetProgresso: 65,
    titulo: "Ampliação da UPA de Santo Amaro e Nova Sala de Fisioterapia",
    descricao:
      "Ampliação de alas de atendimento, climatização e implantação da nova sala de fisioterapia da UPA de Santo Amaro para atender Ponta de Pedras e distritos litorâneos.",
    endereco: "Av. Beira Mar, s/n",
    bairro: "Ponta de Pedras",
    latitude: -7.6195,
    longitude: -34.8415,
    valorContrato: 1420000.0,
    empresaContratada: "CONSTRUTORA LITORAL NORTE LTDA",
    numeroOrdemServico: "OS-901/2026",
    fotoUrl: "/fotos/obra-escola-angelo.jpg",
    fotoDescricao: "Ampliação da ala ambulatorial e sala de fisioterapia em Ponta de Pedras.",
    observacaoMedicao: "Instalações elétricas e hidráulicas da nova ala em fase avançada.",
  },
  {
    secretariaSigla: "SEMANGES",
    eixoSlug: "desenvolvimento-social",
    areaNome: "Infraestrutura Urbana",
    tipoSlug: "construcao-predio-publico",
    status: StatusObra.EM_ANDAMENTO,
    alertaDias: 32,
    targetProgresso: 70,
    titulo: "Construção do Novo Pátio da Feira Pública e Mercado de Goiana",
    descricao:
      "Implantação de galpão coberto, boxes padronizados, área de carga e descarga, drenagem pluvial e praça de alimentação para feirantes e comerciantes locais.",
    endereco: "Rua da Feira Nova, s/n",
    bairro: "Centro",
    latitude: -7.5608,
    longitude: -35.0046,
    valorContrato: 6850000.0,
    empresaContratada: "CONSTRUTORA GONCALO LTDA",
    numeroOrdemServico: "OS-902/2026",
    fotoUrl: "/fotos/obra-patio-flexeiras.jpg",
    fotoDescricao: "Montagem de cobertura metálica e pavimentação interna do pátio.",
    observacaoMedicao: "Estrutura metálica e instalações elétricas em execução dentro do prazo de entrega.",
  },
  {
    secretariaSigla: "SEES",
    eixoSlug: "desenvolvimento-social",
    areaNome: "Esporte e Lazer",
    tipoSlug: "reforma-predio-publico",
    status: StatusObra.EM_ANDAMENTO,
    prazoDias: 180,
    targetProgresso: 55,
    titulo: "Reforma e Iluminação Solar LED do Ginásio Poliesportivo Municipal",
    descricao:
      "Recuperação da coberta, novo piso poliesportivo de alto rendimento, vestiários acessíveis e sistema de iluminação LED eficiente.",
    endereco: "Rua Projetada, Lote 12",
    bairro: "Nova Goiana",
    latitude: -7.5495,
    longitude: -34.9965,
    valorContrato: 945000.0,
    empresaContratada: "A2 ENGENHARIA LTDA",
    numeroOrdemServico: "OS-903/2026",
    fotoUrl: "/fotos/obra-escola-angelo.jpg",
    fotoDescricao: "Reforma da estrutura metálica e preparação de base para piso esportivo.",
    observacaoMedicao: "Coberta revisada e rede elétrica dos refletores em instalação.",
  },
  {
    secretariaSigla: "SASDH",
    eixoSlug: "desenvolvimento-social",
    areaNome: "Assistência Social",
    tipoSlug: "reforma-predio-publico",
    status: StatusObra.CONCLUIDA,
    targetProgresso: 100,
    titulo: "Reforma e Acessibilidade do CRAS Sede",
    descricao:
      "Adequação completa de acessibilidade, salas de atendimento socioassistencial, climatização e fachada do CRAS no Baldo do Rio.",
    endereco: "Rua do Baldo, 140",
    bairro: "Baldo do Rio",
    latitude: -7.5642,
    longitude: -35.0085,
    valorContrato: 418500.0,
    empresaContratada: "J L MARANHAO CONSTRUTORA LTDA",
    numeroOrdemServico: "OS-904/2026",
    fotoUrl: "/fotos/obra-restauro-centro.jpg",
    fotoDescricao: "Prédio do CRAS Sede requalificado e entregue à comunidade.",
    observacaoMedicao: "Obra 100% concluída com rampas de acessibilidade e pintura finalizada.",
  },
  {
    secretariaSigla: "SECJ",
    eixoSlug: "desenvolvimento-social",
    areaNome: "Esporte e Lazer",
    tipoSlug: "construcao-predio-publico",
    status: StatusObra.EM_ANDAMENTO,
    prazoDias: 195,
    targetProgresso: 45,
    titulo: "Construção do Espaço Juventude e Praça de Convivência",
    descricao:
      "Construção de centro de convivência juvenil com salas multimídia, quadra de areia, pista de caminhada e iluminação pública.",
    endereco: "Rua da Esperança, s/n",
    bairro: "Mutirão",
    latitude: -7.5675,
    longitude: -35.0125,
    valorContrato: 1180000.0,
    empresaContratada: "CASSIANO FERNANDE DE LIRA CONSTRUTORA LTDA",
    numeroOrdemServico: "OS-905/2026",
    fotoUrl: "/fotos/obra-patio-flexeiras.jpg",
    fotoDescricao: "Superestrutura em execução e delimitação da área de convivência.",
    observacaoMedicao: "Fundações, pilares e vigas concluídos; iniciada alvenaria de vedação.",
  },
  {
    secretariaSigla: "AMESG",
    eixoSlug: "desenvolvimento-social",
    areaNome: "Educação",
    tipoSlug: "reforma-predio-publico",
    status: StatusObra.EM_ANDAMENTO,
    prazoDias: 160,
    targetProgresso: 60,
    titulo: "Reforma de Laboratórios e Biblioteca da FFPG/AMESG",
    descricao:
      "Modernização dos laboratórios acadêmicos, rede lógica de alta velocidade, acervo climatizado e acessibilidade no bloco central.",
    endereco: "Rua Poeta Zé da Luz, 88",
    bairro: "Centro",
    latitude: -7.5565,
    longitude: -34.9982,
    valorContrato: 790000.0,
    empresaContratada: "A2 ENGENHARIA LTDA",
    numeroOrdemServico: "OS-906/2026",
    fotoUrl: "/fotos/obra-escola-angelo.jpg",
    fotoDescricao: "Readequação interna das salas de laboratório e biblioteca.",
    observacaoMedicao: "Cabeamento lógico e forro acústico executados nos pavimentos principais.",
  },
  {
    secretariaSigla: "SEMUL",
    eixoSlug: "desenvolvimento-social",
    areaNome: "Assistência Social",
    tipoSlug: "reforma-ampliacao-predio-publico",
    status: StatusObra.ORDEM_EMITIDA,
    targetProgresso: 0,
    titulo: "Implantação da Casa da Mulher Goianense e Centro de Referência",
    descricao:
      "Reforma e ampliação de imóvel municipal para acolhimento psicossocial, capacitação profissional e atendimento jurídico especializado.",
    endereco: "Rua Direita, 215",
    bairro: "Centro",
    latitude: -7.5582,
    longitude: -35.0072,
    valorContrato: 860000.0,
    empresaContratada: "J L MARANHAO CONSTRUTORA LTDA",
    numeroOrdemServico: "OS-907/2026",
    fotoUrl: "/fotos/obra-restauro-centro.jpg",
    fotoDescricao: "Imóvel vistoriado após emissão da ordem de serviço.",
    observacaoMedicao: "Ordem de serviço emitida; equipe em mobilização inicial de canteiro.",
  },
  {
    secretariaSigla: "SESTRAN",
    eixoSlug: "desenvolvimento-social",
    areaNome: "Segurança Pública e Mobilidade Urbana",
    tipoSlug: "pavimentacao",
    status: StatusObra.EM_ANDAMENTO,
    prazoDias: 170,
    targetProgresso: 50,
    titulo: "Requalificação da Sinalização Viária e Abrigos de Ônibus",
    descricao:
      "Implantação de novos abrigos padronizados, faixas elevadas de travessia, sinalização horizontal termoplástica e semafórica no corredor central.",
    endereco: "Av. Marechal Deodoro da Fonseca",
    bairro: "Centro",
    latitude: -7.5551,
    longitude: -35.0038,
    valorContrato: 635000.0,
    empresaContratada: "VIARIO SINALIZACAO E OBRAS LTDA",
    numeroOrdemServico: "OS-908/2026",
    fotoUrl: "/fotos/obra-asfalto-cbuq.jpg",
    fotoDescricao: "Requalificação do corredor viário e instalação de novos pontos de parada.",
    observacaoMedicao: "Base dos abrigos instalada e sinalização horizontal iniciada.",
  },
  {
    secretariaSigla: "SEHAB",
    eixoSlug: "desenvolvimento-social",
    areaNome: "Direito à Cidade",
    tipoSlug: "pavimentacao",
    status: StatusObra.PARALISADA,
    targetProgresso: 30,
    titulo: "Urbanização e Infraestrutura do Conjunto Habitacional Nova Goiana",
    descricao:
      "Terraplanagem, drenagem de águas pluviais, meio-fio e pavimentação em paralelepípedo das vias internas do loteamento habitacional.",
    endereco: "Quadra C — Loteamento Nova Goiana",
    bairro: "Nova Goiana",
    latitude: -7.5472,
    longitude: -34.9922,
    valorContrato: 2340000.0,
    empresaContratada: "CASSIANO FERNANDE DE LIRA CONSTRUTORA LTDA",
    numeroOrdemServico: "OS-909/2026",
    fotoUrl: "/fotos/obra-carne-de-vaca.jpg",
    fotoDescricao: "Trecho com terraplanagem concluída aguardando retomada de drenagem.",
    observacaoMedicao: "Obra temporariamente paralisada para revisão técnica da rede de drenagem.",
  },

  // === EIXO: DESENVOLVIMENTO ECONÔMICO SUSTENTÁVEL (5 secretarias) ===
  {
    secretariaSigla: "SETUR",
    eixoSlug: "desenvolvimento-economico-sustentavel",
    areaNome: "Patrimônio Histórico",
    tipoSlug: "pavimentacao",
    status: StatusObra.EM_ANDAMENTO,
    prazoDias: 185,
    targetProgresso: 55,
    titulo: "Requalificação da Orla Turística e Calçadão de Barra de Catuama",
    descricao:
      "Pavimentação intertravada do calçadão, drenagem costeira, iluminação cênica, ciclovia e acessibilidade nas descidas para a praia.",
    endereco: "Av. Litorânea de Catuama",
    bairro: "Barra de Catuama",
    latitude: -7.661,
    longitude: -34.8285,
    valorContrato: 2150000.0,
    empresaContratada: "CONSTRUTORA LITORAL NORTE LTDA",
    numeroOrdemServico: "OS-910/2026",
    fotoUrl: "/fotos/obra-ponta-de-pedras.jpg",
    fotoDescricao: "Trecho costeiro em execução de base e pavimentação da orla.",
    observacaoMedicao: "Terraplanagem e base viária concluídas em 60% da extensão da orla.",
  },
  {
    secretariaSigla: "AD",
    eixoSlug: "desenvolvimento-economico-sustentavel",
    areaNome: "Economia Local",
    tipoSlug: "construcao-predio-publico",
    status: StatusObra.PLANEJADA,
    targetProgresso: 0,
    titulo: "Implantação do Centro de Apoio ao Empreendedor e Polo de Serviços",
    descricao:
      "Construção de centro multifuncional para suporte a microempresas, fornecedores locais e atração de investimentos na margem da BR-101.",
    endereco: "Rodovia BR-101 Norte, Km 12",
    bairro: "Distrito Industrial",
    latitude: -7.572,
    longitude: -35.025,
    valorContrato: 3100000.0,
    empresaContratada: null,
    numeroOrdemServico: "OS-911/2026",
    fotoUrl: "/fotos/obra-patio-flexeiras.jpg",
    fotoDescricao: "Projeto executivo planejado para implantação no Distrito Industrial.",
    observacaoMedicao: "Projeto em fase de planejamento licitatório e validação de terreno.",
  },
  {
    secretariaSigla: "SECTI",
    eixoSlug: "desenvolvimento-economico-sustentavel",
    areaNome: "Ciência e Tecnologia",
    tipoSlug: "reforma-ampliacao-predio-publico",
    status: StatusObra.EM_ANDAMENTO,
    alertaDias: 38,
    targetProgresso: 75,
    titulo: "Implantação do Hub de Inovação e Capacitação Tecnológica",
    descricao:
      "Requalificação e ampliação de prédio público para coworking municipal, salas de formação digital e laboratório de inovação cívica.",
    endereco: "Rua do Rosário, 52",
    bairro: "Centro",
    latitude: -7.5615,
    longitude: -34.999,
    valorContrato: 1290000.0,
    empresaContratada: "A2 ENGENHARIA LTDA",
    numeroOrdemServico: "OS-912/2026",
    fotoUrl: "/fotos/obra-escola-angelo.jpg",
    fotoDescricao: "Instalações de rede lógica e acabamentos internos no Hub de Inovação.",
    observacaoMedicao: "Falta conclusão de pisos, esquadrias e acabamentos finais.",
  },
  {
    secretariaSigla: "SEAPPA",
    eixoSlug: "desenvolvimento-economico-sustentavel",
    areaNome: "Agricultura e Pesca",
    tipoSlug: "construcao-predio-publico",
    status: StatusObra.EM_ANDAMENTO,
    prazoDias: 200,
    targetProgresso: 45,
    titulo: "Construção do Entreposto de Pesca Artesanal de Atapuz",
    descricao:
      "Edificação equipada com câmara fria, área de beneficiamento sanitário, fábrica de gelo e apoio aos pescadores e marisqueiras de Atapuz.",
    endereco: "Rua dos Pescadores, s/n",
    bairro: "Atapuz",
    latitude: -7.638,
    longitude: -34.862,
    valorContrato: 980000.0,
    empresaContratada: "J L MARANHAO CONSTRUTORA LTDA",
    numeroOrdemServico: "OS-913/2026",
    fotoUrl: "/fotos/obra-tejucupapo.jpg",
    fotoDescricao: "Execução de estrutura e alvenaria do entreposto pesqueiro em Atapuz.",
    observacaoMedicao: "Estrutura executada e iniciada etapa de instalações hidrossanitárias.",
  },
  {
    secretariaSigla: "AMAG",
    eixoSlug: "desenvolvimento-economico-sustentavel",
    areaNome: "Meio Ambiente",
    tipoSlug: "construcao-predio-publico",
    status: StatusObra.CONCLUIDA,
    targetProgresso: 100,
    titulo: "Implantação do Viveiro Municipal de Mudas e Parque Ecológico",
    descricao:
      "Construção de estufas de mudas nativas da Mata Atlântica, sistema de irrigação automatizado e centro de educação ambiental.",
    endereco: "Estrada de São Lourenço, Km 3",
    bairro: "São Lourenço",
    latitude: -7.596,
    longitude: -34.948,
    valorContrato: 740000.0,
    empresaContratada: "CASSIANO FERNANDE DE LIRA CONSTRUTORA LTDA",
    numeroOrdemServico: "OS-914/2026",
    fotoUrl: "/fotos/obra-patio-flexeiras.jpg",
    fotoDescricao: "Viveiro municipal e núcleo de educação ambiental entregues em São Lourenço.",
    observacaoMedicao: "Todas as estufas, rede hidráulica e sede administrativa 100% entregues.",
  },

  // === EIXO: MODERNIZAÇÃO ADMINISTRATIVA (10 secretarias) ===
  {
    secretariaSigla: "SEPLAN",
    eixoSlug: "modernizacao-administrativa",
    areaNome: "Inovação e Gestão Administrativa",
    tipoSlug: "reforma-predio-publico",
    status: StatusObra.CONCLUIDA,
    targetProgresso: 100,
    titulo: "Reforma da Sala de Situação e Central de Geoprocessamento (CTM)",
    descricao:
      "Adequação acústica, infraestrutura de TI, painéis de monitoramento de projetos e rede estruturada da central de geoprocessamento municipal.",
    endereco: "Av. Marechal Deodoro da Fonseca, 115",
    bairro: "Centro",
    latitude: -7.5578,
    longitude: -35.0011,
    valorContrato: 520000.0,
    empresaContratada: "A2 ENGENHARIA LTDA",
    numeroOrdemServico: "OS-915/2026",
    fotoUrl: "/fotos/obra-restauro-centro.jpg",
    fotoDescricao: "Central de geoprocessamento e monitoramento estratégico concluída.",
    observacaoMedicao: "Obra recebida definitivamente com 100% dos testes de rede aprovados.",
  },
  {
    secretariaSigla: "SECAD",
    eixoSlug: "modernizacao-administrativa",
    areaNome: "Inovação e Gestão Administrativa",
    tipoSlug: "reforma-predio-publico",
    status: StatusObra.EM_ANDAMENTO,
    prazoDias: 175,
    targetProgresso: 60,
    titulo: "Reforma e Acessibilidade do Centro Administrativo Municipal",
    descricao:
      "Revitalização de fachada, instalação de elevador acessível, modernização elétrica e eficiência energética da sede administrativa.",
    endereco: "Praça João Pessoa, 30",
    bairro: "Centro",
    latitude: -7.5625,
    longitude: -35.0058,
    valorContrato: 1150000.0,
    empresaContratada: "CONSTRUTORA GONCALO LTDA",
    numeroOrdemServico: "OS-916/2026",
    fotoUrl: "/fotos/obra-restauro-centro.jpg",
    fotoDescricao: "Requalificação interna e adaptação de rotas acessíveis no prédio sede.",
    observacaoMedicao: "Instalações elétricas e coberta concluídas; iniciada fase de pisos.",
  },
  {
    secretariaSigla: "SEFAZ",
    eixoSlug: "modernizacao-administrativa",
    areaNome: "Inovação e Gestão Administrativa",
    tipoSlug: "reforma-predio-publico",
    status: StatusObra.EM_ANDAMENTO,
    alertaDias: 44,
    targetProgresso: 70,
    titulo: "Modernização da Central de Atendimento ao Contribuinte (CAC)",
    descricao:
      "Reforma completa do salão de atendimento fazendário, guichês acessíveis, triagem digital e climatização de alto desempenho.",
    endereco: "Rua da Matriz, 74",
    bairro: "Centro",
    latitude: -7.5599,
    longitude: -35.0019,
    valorContrato: 485000.0,
    empresaContratada: "J L MARANHAO CONSTRUTORA LTDA",
    numeroOrdemServico: "OS-917/2026",
    fotoUrl: "/fotos/obra-escola-angelo.jpg",
    fotoDescricao: "Adequação dos guichês e cabeamento lógico na Central do Contribuinte.",
    observacaoMedicao: "Pisos em assentamento; entrega prevista dentro da janela de 45 dias.",
  },
  {
    secretariaSigla: "SEAPOG",
    eixoSlug: "modernizacao-administrativa",
    areaNome: "Inovação e Gestão Administrativa",
    tipoSlug: "reforma-predio-publico",
    status: StatusObra.PLANEJADA,
    targetProgresso: 0,
    titulo: "Reforma do Auditório de Audiências Públicas e Participação Cidadã",
    descricao:
      "Requalificação acústica, sistema de transmissão pública, acessibilidade na tribuna e climatização do auditório municipal.",
    endereco: "Rua Nunes Machado, 45",
    bairro: "Centro",
    latitude: -7.5548,
    longitude: -35.0068,
    valorContrato: 395000.0,
    empresaContratada: null,
    numeroOrdemServico: "OS-918/2026",
    fotoUrl: "/fotos/obra-restauro-centro.jpg",
    fotoDescricao: "Levantamento arquitetônico inicial para reforma do auditório.",
    observacaoMedicao: "Escopo técnico finalizado e incluído no cronograma de contratação.",
  },
  {
    secretariaSigla: "SLCP",
    eixoSlug: "modernizacao-administrativa",
    areaNome: "Inovação e Gestão Administrativa",
    tipoSlug: "reforma-predio-publico",
    status: StatusObra.CONCLUIDA,
    targetProgresso: 100,
    titulo: "Adequação da Sala de Pregões e Arquivo de Contratos",
    descricao:
      "Estruturação de sala para pregões presenciais e eletrônicos com transmissão ao vivo e arquivo climatizado com proteção contra umidade.",
    endereco: "Rua do Carmo, 118",
    bairro: "Centro",
    latitude: -7.5618,
    longitude: -35.0082,
    valorContrato: 310000.0,
    empresaContratada: "A2 ENGENHARIA LTDA",
    numeroOrdemServico: "OS-919/2026",
    fotoUrl: "/fotos/obra-escola-angelo.jpg",
    fotoDescricao: "Sala de licitações e arquivo documental entregues em operação.",
    observacaoMedicao: "Execução física 100% atestada e em pleno funcionamento.",
  },
  {
    secretariaSigla: "OGM",
    eixoSlug: "modernizacao-administrativa",
    areaNome: "Inovação e Gestão Administrativa",
    tipoSlug: "reforma-predio-publico",
    status: StatusObra.EM_ANDAMENTO,
    prazoDias: 210,
    targetProgresso: 50,
    titulo: "Implantação do Posto Presencial da Ouvidoria Geral Municipal",
    descricao:
      "Reforma de espaço térreo acessível no Centro para atendimento reservado ao cidadão, protocolo integrado e acessibilidade em Libras.",
    endereco: "Rua Augusto Gondim, 64",
    bairro: "Centro",
    latitude: -7.5571,
    longitude: -35.0049,
    valorContrato: 275000.0,
    empresaContratada: "CASSIANO FERNANDE DE LIRA CONSTRUTORA LTDA",
    numeroOrdemServico: "OS-920/2026",
    fotoUrl: "/fotos/obra-escola-angelo.jpg",
    fotoDescricao: "Adaptação de divisórias acústicas e acessibilidade no posto da Ouvidoria.",
    observacaoMedicao: "Metade das etapas executadas; paredes e instalações concluídas.",
  },
  {
    secretariaSigla: "GOIANAPREVI",
    eixoSlug: "modernizacao-administrativa",
    areaNome: "Inovação e Gestão Administrativa",
    tipoSlug: "reforma-ampliacao-predio-publico",
    status: StatusObra.EM_ANDAMENTO,
    prazoDias: 190,
    targetProgresso: 65,
    titulo: "Reforma e Ampliação da Sede de Atendimento do GoianaPrevi",
    descricao:
      "Ampliação das salas de perícia médica previdenciária, recepção acessível para aposentados e pensionistas e arquivo digitalizado.",
    endereco: "Rua Duque de Caxias, 92",
    bairro: "Centro",
    latitude: -7.5634,
    longitude: -35.0024,
    valorContrato: 680000.0,
    empresaContratada: "CONSTRUTORA GONCALO LTDA",
    numeroOrdemServico: "OS-921/2026",
    fotoUrl: "/fotos/obra-restauro-centro.jpg",
    fotoDescricao: "Obras de ampliação da recepção e consultórios periciais do GoianaPrevi.",
    observacaoMedicao: "Ampliação estrutural e coberta prontas; iniciados revestimentos internos.",
  },
  {
    secretariaSigla: "CCI",
    eixoSlug: "modernizacao-administrativa",
    areaNome: "Inovação e Gestão Administrativa",
    tipoSlug: "reforma-predio-publico",
    status: StatusObra.ORDEM_EMITIDA,
    targetProgresso: 0,
    titulo: "Readequação Estrutural e Sala de Auditoria da Controladoria",
    descricao:
      "Reforma das estações técnicas de auditoria interna, segurança elétrica e climatização da Controladoria Geral do Município.",
    endereco: "Rua 15 de Novembro, 40",
    bairro: "Centro",
    latitude: -7.5588,
    longitude: -35.0002,
    valorContrato: 340000.0,
    empresaContratada: "J L MARANHAO CONSTRUTORA LTDA",
    numeroOrdemServico: "OS-922/2026",
    fotoUrl: "/fotos/obra-escola-angelo.jpg",
    fotoDescricao: "Vistoria prévia registrada após emissão da ordem de serviço.",
    observacaoMedicao: "Ordem de serviço emitida; início físico programado para esta semana.",
  },
  {
    secretariaSigla: "SECOM",
    eixoSlug: "modernizacao-administrativa",
    areaNome: "Inovação e Gestão Administrativa",
    tipoSlug: "reforma-predio-publico",
    status: StatusObra.EM_ANDAMENTO,
    prazoDias: 155,
    targetProgresso: 55,
    titulo: "Implantação do Estúdio Municipal de Comunicação e Transparência",
    descricao:
      "Tratamento acústico, iluminação técnica, cabeamento dedicado e ilha de edição para transmissões oficiais e comunicados de utilidade pública.",
    endereco: "Praça Epitácio Pessoa, 18",
    bairro: "Centro",
    latitude: -7.5535,
    longitude: -35.0008,
    valorContrato: 425000.0,
    empresaContratada: "A2 ENGENHARIA LTDA",
    numeroOrdemServico: "OS-923/2026",
    fotoUrl: "/fotos/obra-escola-angelo.jpg",
    fotoDescricao: "Execução de isolamento acústico e infraestrutura elétrica no estúdio.",
    observacaoMedicao: "Divisórias acústicas e dutos de ar-condicionado instalados.",
  },
  {
    secretariaSigla: "PGM",
    eixoSlug: "modernizacao-administrativa",
    areaNome: "Inovação e Gestão Administrativa",
    tipoSlug: "reforma-predio-publico",
    status: StatusObra.CONCLUIDA,
    targetProgresso: 100,
    titulo: "Reforma e Modernização do Arquivo da Procuradoria Geral",
    descricao:
      "Reforma estrutural, impermeabilização, estantes deslizantes e rede lógica do núcleo contencioso e arquivo jurídico da Procuradoria.",
    endereco: "Rua do Rosário, 190",
    bairro: "Centro",
    latitude: -7.5604,
    longitude: -35.0095,
    valorContrato: 365000.0,
    empresaContratada: "CASSIANO FERNANDE DE LIRA CONSTRUTORA LTDA",
    numeroOrdemServico: "OS-924/2026",
    fotoUrl: "/fotos/obra-restauro-centro.jpg",
    fotoDescricao: "Arquivo jurídico e salas da Procuradoria Geral reformados e entregues.",
    observacaoMedicao: "100% dos serviços recebidos e em uso pela equipe jurídica.",
  },
];

function addDays(base: Date, days: number): Date {
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
}

function getDatasPorStatus(def: ObraComplementarDef, baseHoje: Date) {
  switch (def.status) {
    case StatusObra.CONCLUIDA:
      return {
        dataOrdemServico: addDays(baseHoje, -240),
        previsaoConclusao: addDays(baseHoje, -25),
        dataConclusaoReal: addDays(baseHoje, -30),
      };
    case StatusObra.PARALISADA:
      return {
        dataOrdemServico: addDays(baseHoje, -210),
        previsaoConclusao: addDays(baseHoje, 90),
        dataConclusaoReal: null,
      };
    case StatusObra.ORDEM_EMITIDA:
      return {
        dataOrdemServico: addDays(baseHoje, -10),
        previsaoConclusao: addDays(baseHoje, 210),
        dataConclusaoReal: null,
      };
    case StatusObra.PLANEJADA:
      return {
        dataOrdemServico: null,
        previsaoConclusao: addDays(baseHoje, 270),
        dataConclusaoReal: null,
      };
    case StatusObra.EM_ANDAMENTO:
    default: {
      const diasRestantes = def.alertaDias ?? def.prazoDias ?? 160;
      const diasInicio = def.alertaDias ? -160 : -120;
      return {
        dataOrdemServico: addDays(baseHoje, diasInicio),
        previsaoConclusao: addDays(baseHoje, diasRestantes),
        dataConclusaoReal: null,
      };
    }
  }
}

interface EtapaComSubEtapas {
  id: string;
  peso: number;
  subEtapasTemplate: { id: string; peso: number }[];
}

function planejarEtapas(
  templates: EtapaComSubEtapas[],
  statusObra: StatusObra,
  targetProgresso: number,
  baseHoje: Date,
) {
  const pesoTotal = templates.reduce((acc, item) => acc + item.peso, 0);
  let pesoAcumulado = 0;

  const etapasData = templates.map((template) => {
    const subs = template.subEtapasTemplate;
    let subStates: number[];

    if (statusObra === StatusObra.CONCLUIDA) {
      subStates = subs.map(() => 100);
    } else if (
      statusObra === StatusObra.PLANEJADA ||
      statusObra === StatusObra.ORDEM_EMITIDA ||
      targetProgresso <= 0
    ) {
      subStates = subs.map(() => 0);
    } else {
      const percentualSeConcluirInteira =
        pesoTotal > 0 ? ((pesoAcumulado + template.peso) / pesoTotal) * 100 : 0;
      const percentualAtual =
        pesoTotal > 0 ? (pesoAcumulado / pesoTotal) * 100 : 0;

      if (percentualSeConcluirInteira <= targetProgresso + 3) {
        subStates = subs.map(() => 100);
      } else if (percentualAtual < targetProgresso - 2 && subs.length > 1) {
        // Marca parte das subetapas como concluídas para gerar uma etapa em andamento coerente
        const qtdConcluidas = Math.max(1, Math.floor(subs.length / 2));
        subStates = subs.map((_, idx) => (idx < qtdConcluidas ? 100 : 0));
      } else {
        subStates = subs.map(() => 0);
      }
    }

    const etapaPercentual = calcularMediaPonderada(
      subs.map((sub, idx) => ({
        percentual: subStates[idx],
        peso: sub.peso,
      })),
    );
    pesoAcumulado += (template.peso * etapaPercentual) / 100;

    const statusEtapa = statusPorPercentual(etapaPercentual) as StatusEtapa;

    return {
      etapaTemplateId: template.id,
      peso: template.peso,
      percentualConcluido: etapaPercentual,
      status: statusEtapa,
      dataInicio: etapaPercentual > 0 ? addDays(baseHoje, -90) : null,
      dataConclusao: etapaPercentual === 100 ? addDays(baseHoje, -30) : null,
      subEtapas: subs.map((sub, idx) => {
        const subPerc = subStates[idx];
        return {
          subEtapaTemplateId: sub.id,
          percentualConcluido: subPerc,
          status: statusPorPercentual(subPerc) as StatusEtapa,
          dataInicio: subPerc > 0 ? addDays(baseHoje, -90) : null,
          dataConclusao: subPerc === 100 ? addDays(baseHoje, -30) : null,
        };
      }),
    };
  });

  const percentualGeral = calcularMediaPonderada(
    etapasData.map((etapa) => ({
      percentual: etapa.percentualConcluido,
      peso: etapa.peso,
    })),
  );

  return { etapasData, percentualGeral };
}

function tipoFotoParaObra(status: StatusObra): TipoFoto {
  if (status === StatusObra.CONCLUIDA) return TipoFoto.CONCLUIDO;
  if (status === StatusObra.PLANEJADA || status === StatusObra.ORDEM_EMITIDA) {
    return TipoFoto.RENDER_PROJETO;
  }
  return TipoFoto.EM_ANDAMENTO;
}

async function main() {
  const agora = new Date();
  const baseHoje = new Date(
    Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate(), 12, 0, 0),
  );

  console.log("🔧 [1/3] Corrigindo grafias cadastrais pontuais (AMESG e Resiliência Urbana)...");
  const fixAmesg = await prisma.secretaria.updateMany({
    where: {
      sigla: "AMESG",
      nome: "Autarquia de Ensino Superior de Ensino",
    },
    data: {
      nome: "Autarquia Municipal do Ensino Superior de Goiana",
    },
  });
  const fixArea = await prisma.areaTematica.updateMany({
    where: { nome: "Resiliencia Urbana" },
    data: { nome: "Resiliência Urbana" },
  });
  console.log(
    `   ↳ AMESG corrigida: ${fixAmesg.count} registro(s) | Resiliência Urbana corrigida: ${fixArea.count} registro(s)`,
  );

  console.log("🔍 [2/3] Carregando eixos, secretarias, áreas temáticas e templates existentes...");
  const [eixos, secretarias, areas, tiposObra] = await Promise.all([
    prisma.eixoEstrategico.findMany({ select: { id: true, slug: true, nome: true } }),
    prisma.secretaria.findMany({ select: { id: true, sigla: true, nome: true } }),
    prisma.areaTematica.findMany({ select: { id: true, nome: true } }),
    prisma.tipoObra.findMany({
      include: {
        etapasTemplate: {
          orderBy: { ordem: "asc" },
          include: {
            subEtapasTemplate: {
              orderBy: { ordem: "asc" },
            },
          },
        },
      },
    }),
  ]);

  const fallbackUser =
    (await prisma.usuario.findUnique({ where: { email: "engenheiro.seduo@goiana.pe.gov.br" } })) ??
    (await prisma.usuario.findFirst({ where: { role: Role.ENGENHEIRO, ativo: true } })) ??
    (await prisma.usuario.findFirst({ where: { role: Role.SUPER_ADMIN, ativo: true } }));

  if (!fallbackUser) {
    throw new Error("Nenhum usuário base encontrado no banco para vincular medições e fotos.");
  }

  const eixoBySlug = new Map(eixos.map((e) => [e.slug, e]));
  const secBySigla = new Map(secretarias.map((s) => [s.sigla, s]));
  const areaByNome = new Map(areas.map((a) => [a.nome, a]));
  const tipoBySlug = new Map(tiposObra.map((t) => [t.slug, t]));

  console.log("🏗️  [3/3] Inserindo obras complementares de forma aditiva e idempotente...");
  let criadas = 0;
  let ignoradas = 0;

  for (const def of OBRAS_COMPLEMENTARES) {
    const secretaria = secBySigla.get(def.secretariaSigla);
    const eixo = eixoBySlug.get(def.eixoSlug);
    const area = areaByNome.get(def.areaNome);
    const tipoObra = tipoBySlug.get(def.tipoSlug);

    if (!secretaria) throw new Error(`Secretaria não encontrada: ${def.secretariaSigla}`);
    if (!eixo) throw new Error(`Eixo não encontrado: ${def.eixoSlug}`);
    if (!area) throw new Error(`Área temática não encontrada: ${def.areaNome}`);
    if (!tipoObra) throw new Error(`Tipo de obra não encontrado: ${def.tipoSlug}`);

    const existente = await prisma.obra.findFirst({
      where: {
        OR: [
          { numeroOrdemServico: def.numeroOrdemServico },
          { secretariaId: secretaria.id, deletedAt: null },
        ],
      },
      select: { id: true, titulo: true },
    });

    if (existente) {
      ignoradas++;
      console.log(`   ⏭️  SKIP [${def.secretariaSigla}] já possui obra ativa (${existente.titulo})`);
      continue;
    }

    const datas = getDatasPorStatus(def, baseHoje);
    const { etapasData, percentualGeral } = planejarEtapas(
      tipoObra.etapasTemplate,
      def.status,
      def.targetProgresso,
      baseHoje,
    );

    await prisma.$transaction(async (tx) => {
      const novaObra = await tx.obra.create({
        data: {
          titulo: def.titulo,
          descricao: def.descricao,
          endereco: def.endereco,
          bairro: def.bairro,
          latitude: def.latitude,
          longitude: def.longitude,
          valorContrato: def.valorContrato,
          empresaContratada: def.empresaContratada ?? null,
          numeroOrdemServico: def.numeroOrdemServico,
          dataOrdemServico: datas.dataOrdemServico,
          previsaoConclusao: datas.previsaoConclusao,
          dataConclusaoReal: datas.dataConclusaoReal,
          status: def.status,
          secretariaId: secretaria.id,
          eixoId: eixo.id,
          areaTematicaId: area.id,
          tipoObraId: tipoObra.id,
          engenheiroId: null,
        },
      });

      for (const etapa of etapasData) {
        await tx.etapaObra.create({
          data: {
            obraId: novaObra.id,
            etapaTemplateId: etapa.etapaTemplateId,
            status: etapa.status,
            percentualConcluido: etapa.percentualConcluido,
            dataInicio: etapa.dataInicio,
            dataConclusao: etapa.dataConclusao,
            subEtapasObra: {
              create: etapa.subEtapas,
            },
          },
        });
      }

      await tx.medicao.create({
        data: {
          obraId: novaObra.id,
          engenheiroId: fallbackUser.id,
          dataVistoria: addDays(baseHoje, -2),
          percentualExecutado: percentualGeral,
          observacoesTecnicas: def.observacaoMedicao,
        },
      });

      await tx.foto.create({
        data: {
          obraId: novaObra.id,
          usuarioId: fallbackUser.id,
          url: def.fotoUrl,
          tipo: tipoFotoParaObra(def.status),
          descricao: def.fotoDescricao,
          dataFoto: addDays(baseHoje, -2),
        },
      });
    }, { timeout: 20000 });

    criadas++;
    console.log(
      `   ✅ CREATED [${def.secretariaSigla}] ${def.titulo} (${def.status} · ${percentualGeral}%)`,
    );
  }

  console.log(`\n🎉 Concluído! Criadas: ${criadas} | Ignoradas (idempotente): ${ignoradas}`);
}

main()
  .catch((error) => {
    console.error("❌ Erro ao executar seed complementar:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
