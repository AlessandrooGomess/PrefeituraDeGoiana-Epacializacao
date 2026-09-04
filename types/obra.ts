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
  previsaoConclusao: string | null;
  status: StatusObra;
  secretaria: SecretariaResumo;
  percentualExecutado: number | null;
}

