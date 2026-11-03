export type StatusObra =
  | "PLANEJADA"
  | "ORDEM_EMITIDA"
  | "EM_ANDAMENTO"
  | "PARALISADA"
  | "CONCLUIDA";

export interface SecretariaResumo {
  id: string;
  nome: string;
  sigla: string;
  corIdentificacao: string | null;
}

export interface EixoResumo {
  id: string;
  nome: string;
  slug: string;
  cor: string | null;
}

export interface EixoComSecretarias extends EixoResumo {
  secretarias: SecretariaResumo[];
}

export interface AreaTematicaResumo {
  id: string;
  nome: string;
}

export interface ObraItem {
  id: string;
  titulo: string;
  descricao: string | null;
  endereco: string;
  bairro: string;
  latitude: number;
  longitude: number;
  valorContrato: number | null;
  empresaContratada: string | null;
  numeroOrdemServico: string | null;

  dataOrdemServico: string | null;
  previsaoConclusao: string | null;
  atualizadoEm: string;
  imagemUrl: string | null;
  status: StatusObra;
  secretaria: SecretariaResumo;
  
  eixo: EixoResumo | null;
  areaTematica: AreaTematicaResumo | null;

  percentualExecutado: number | null;
}

export interface ObrasPaginadas {
  items: ObraItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface TipoObraResumo {
  id: string;
  nome: string;
  slug?: string;
}

export interface SubEtapaResumo {
  id: string;
  nome: string;
  ordem: number;
  status: string;
  percentualConcluido: number;
  dataInicio: string | null;
  dataConclusao: string | null;
  observacoes: string | null;
}

export interface EtapaResumo {
  id: string;
  nome: string;
  nomeCidadao: string;
  ordem: number;
  status: string;
  percentualConcluido: number;
  dataInicio: string | null;
  dataPrevisao: string | null;
  dataConclusao: string | null;
  observacoes: string | null;
  subEtapas: SubEtapaResumo[];
}

export interface RegistroCampoResumo {
  id: string;
  dataVistoria: string;
  status: string;
  intercorrencias: string[];
  observacoes: string | null;
  engenheiro: { id?: string; nome: string; cargo?: string | null };
  fotos: FotoResumo[];
}

export interface ObraDetalhe extends ObraItem {
  dataConclusaoReal: string | null;
  createdAt: string;
  updatedAt?: string;
  tipoObra?: TipoObraResumo | null;
  medicoes: MedicaoResumo[];
  fotos: FotoResumo[];
  engenheiro: EngenheiroResumo | null;
  etapas?: EtapaResumo[];
  registrosCampo?: RegistroCampoResumo[];
}

export interface MedicaoResumo {
  id: string;
  dataVistoria: string;
  percentualExecutado: number;
  observacoesTecnicas: string | null;
  engenheiro: EngenheiroResumo;
}

export interface FotoResumo {
  id: string;
  url: string;
  tipo: "RENDER_PROJETO" | "ANTES" | "EM_ANDAMENTO" | "CONCLUIDO";
  descricao: string | null;
  dataFoto: string;
}

export interface EngenheiroResumo {
  id: string;
  nome: string;
  cargo: string | null;
}