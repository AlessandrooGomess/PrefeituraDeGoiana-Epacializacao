import { beforeEach, describe, expect, it, vi } from "vitest";

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("aplica filtro por status", async () => {
    mocks.obraFindMany.mockResolvedValue([]);

    const response = await GET(
      new Request("http://localhost/api/obras?status=EM_ANDAMENTO"),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);

    expect(mocks.obraFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: "EM_ANDAMENTO",
        },
      }),
    );
  });

  it("retorna obras paginadas com metadados", async () => {
    mocks.obraFindMany.mockResolvedValue([]);
    mocks.obraCount.mockResolvedValue(21);

    const response = await GET(
      new Request("http://localhost/api/obras?page=2&pageSize=10"),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      items: [],
      pagination: {
        page: 2,
        pageSize: 10,
        total: 21,
        totalPages: 3,
      },
    });

    it("retorna 400 quando a página é inválida", async () => {
      const response = await GET(
        new Request("http://localhost/api/obras?page=0"),
      );

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual(
        expect.objectContaining({
          message: "Os parâmetros da consulta são inválidos.",
        }),
      );

      expect(mocks.obraFindMany).not.toHaveBeenCalled();
    });

    it("retorna 400 quando pageSize ultrapassa o limite", async () => {
      const response = await GET(
        new Request("http://localhost/api/obras?pageSize=101"),
      );

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual(
        expect.objectContaining({
          message: "Os parâmetros da consulta são inválidos.",
        }),
      );

      expect(mocks.obraFindMany).not.toHaveBeenCalled();
    });

    it("retorna 500 quando ocorre erro ao buscar obras", async () => {
      mocks.obraFindMany.mockRejectedValue(new Error("Erro de conexão"));

      const response = await GET(new Request("http://localhost/api/obras"));

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        message: "Erro interno ao carregar listagem de obras.",
      });
    });

    expect(mocks.obraFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      }),
    );

    expect(mocks.obraCount).toHaveBeenCalledWith({
      where: {},
    });
  });

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

    const response = await GET(new Request("http://localhost/api/obras"));

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
