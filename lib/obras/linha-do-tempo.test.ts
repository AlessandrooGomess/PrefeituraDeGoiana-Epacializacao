import { describe, expect, it } from "vitest";
import type { StatusEtapa } from "@prisma/client";
import { montarLinhaDoTempo } from "./linha-do-tempo";

function etapa(
  status: StatusEtapa,
  extras: { percentual?: number; previsao?: string; conclusao?: string } = {},
) {
  return {
    id: `etapa-${status}`,
    status,
    percentualConcluido: extras.percentual ?? 0,
    dataPrevisao: extras.previsao ? new Date(extras.previsao) : null,
    dataConclusao: extras.conclusao ? new Date(extras.conclusao) : null,
    etapaTemplate: { nomeCidadao: "Fundações" },
  };
}

describe("montarLinhaDoTempo", () => {
  it("inicia com a ordem de serviço quando ela foi emitida", () => {
    const [marco] = montarLinhaDoTempo(new Date("2025-05-10T00:00:00Z"), []);

    expect(marco).toEqual({
      id: "ordem-servico",
      titulo: "Ordem de Serviço emitida",
      estado: "concluido",
      detalhe: "Emitida em 10/05/2025",
    });
  });

  it("não inclui a ordem de serviço quando ela não foi emitida", () => {
    expect(montarLinhaDoTempo(null, [])).toEqual([]);
  });

  it("descreve etapa concluída com a data de conclusão", () => {
    const [marco] = montarLinhaDoTempo(null, [etapa("CONCLUIDA", { conclusao: "2025-03-15T00:00:00Z" })]);

    expect(marco).toMatchObject({ titulo: "Fundações", estado: "concluido", detalhe: "Concluída em 15/03/2025" });
  });

  it("marca etapa em andamento como atual, com percentual e previsão", () => {
    const [marco] = montarLinhaDoTempo(null, [
      etapa("EM_ANDAMENTO", { percentual: 44.6, previsao: "2025-06-01T00:00:00Z" }),
    ]);

    expect(marco).toMatchObject({ estado: "atual", detalhe: "45% concluída · previsão 01/06/2025" });
  });

  it("descreve etapa paralisada", () => {
    const [marco] = montarLinhaDoTempo(null, [etapa("PARALISADA")]);

    expect(marco).toMatchObject({ estado: "paralisado", detalhe: "Etapa paralisada" });
  });

  it("descreve etapa pendente pela previsão ou como aguardando início", () => {
    const [comPrevisao, semPrevisao] = montarLinhaDoTempo(null, [
      etapa("PENDENTE", { previsao: "2025-06-01T00:00:00Z" }),
      etapa("PENDENTE"),
    ]);

    expect(comPrevisao).toMatchObject({ estado: "pendente", detalhe: "Previsão: 01/06/2025" });
    expect(semPrevisao).toMatchObject({ estado: "pendente", detalhe: "Aguardando início" });
  });
});
