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
  dataConclusaoReal: string | null;

  status: StatusObra;
  secretaria: SecretariaResumo;
  
  eixo: EixoResumo | null;
  areaTematica: AreaTematicaResumo | null;

  percentualExecutado: number | null;
}