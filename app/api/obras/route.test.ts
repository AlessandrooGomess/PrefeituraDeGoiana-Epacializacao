import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  obraFindMany: vi.fn(),
  obraCount: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    obra: {
      findMany: mocks.obraFindMany,
      count: mocks.obraCount,
    },
  },
}));

import { GET } from "./route";

describe("GET /api/obras", () => {
  it("retorna a lista de obras sem paginação", async () => {
    mocks.obraFindMany.mockResolvedValue([
      {
        id: "obra-1",
        titulo: "Reforma da UBS Central",
        descricao: null,
        endereco: "Rua Central",
        bairro: "Centro",
        latitude: -7.55,
        longitude: -35.0,
        valorContrato: 100000,
        empresaContratada: null,
        numeroOrdemServico: null,
        dataOrdemServico: null,
        previsaoConclusao: null,
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        status: "EM_ANDAMENTO",
        secretaria: {
          id: "secretaria-1",
          nome: "Saúde",
          sigla: "SESAU",
          corIdentificacao: null,
        },
        eixo: null,
        areaTematica: null,
        medicoes: [],
        fotos: [],
      },
    ]);

    const response = await GET(
      new Request("http://localhost/api/obras"),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([
      expect.objectContaining({
        id: "obra-1",
        titulo: "Reforma da UBS Central",
        status: "EM_ANDAMENTO",
        percentualExecutado: null,
        imagemUrl: null,
      }),
    ]);

    expect(mocks.obraFindMany).toHaveBeenCalledOnce();
    expect(mocks.obraCount).not.toHaveBeenCalled();
  });
});