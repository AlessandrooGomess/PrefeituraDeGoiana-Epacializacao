import type { Prisma, StatusEtapa } from "@prisma/client";

export type EstadoMarco = "concluido" | "atual" | "paralisado" | "pendente";

export interface MarcoLinhaDoTempo {
  id: string;
  titulo: string;
  estado: EstadoMarco;
  detalhe: string;
}

interface EtapaLinhaDoTempo {
  id: string;
  status: StatusEtapa;
  percentualConcluido: Prisma.Decimal | number;
  dataPrevisao: Date | null;
  dataConclusao: Date | null;
  etapaTemplate: { nomeCidadao: string };
}

const formatador = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

function descreverEtapa(etapa: EtapaLinhaDoTempo): Pick<MarcoLinhaDoTempo, "estado" | "detalhe"> {
  switch (etapa.status) {
    case "CONCLUIDA":
      return {
        estado: "concluido",
        detalhe: etapa.dataConclusao ? `Concluída em ${formatador.format(etapa.dataConclusao)}` : "Concluída",
      };
    case "EM_ANDAMENTO": {
      const percentual = `${Math.round(Number(etapa.percentualConcluido))}% concluída`;
      return {
        estado: "atual",
        detalhe: etapa.dataPrevisao ? `${percentual} · previsão ${formatador.format(etapa.dataPrevisao)}` : percentual,
      };
    }
    case "PARALISADA":
      return { estado: "paralisado", detalhe: "Etapa paralisada" };
    case "PENDENTE":
      return {
        estado: "pendente",
        detalhe: etapa.dataPrevisao ? `Previsão: ${formatador.format(etapa.dataPrevisao)}` : "Aguardando início",
      };
  }
}

/**
 * Monta os marcos da evolução da obra exibidos ao cidadão:
 * a emissão da ordem de serviço (quando houver) seguida das etapas, na ordem recebida.
 */
export function montarLinhaDoTempo(
  dataOrdemServico: Date | null,
  etapas: EtapaLinhaDoTempo[],
): MarcoLinhaDoTempo[] {
  const marcos: MarcoLinhaDoTempo[] = [];

  if (dataOrdemServico) {
    marcos.push({
      id: "ordem-servico",
      titulo: "Ordem de Serviço emitida",
      estado: "concluido",
      detalhe: `Emitida em ${formatador.format(dataOrdemServico)}`,
    });
  }

  for (const etapa of etapas) {
    marcos.push({ id: etapa.id, titulo: etapa.etapaTemplate.nomeCidadao, ...descreverEtapa(etapa) });
  }

  return marcos;
}
