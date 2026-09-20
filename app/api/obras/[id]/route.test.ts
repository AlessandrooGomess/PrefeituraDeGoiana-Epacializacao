import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  obraFindUnique: vi.fn(),
  obraUpdate: vi.fn(),
  validateObraRelations: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    obra: {
      findUnique: mocks.obraFindUnique,
      update: mocks.obraUpdate,
    },
  },
}));

vi.mock("@/lib/obras/validate-relations", () => ({
  validateObraRelations: mocks.validateObraRelations,
}));

import { GET, PATCH } from "./route";

describe("GET /api/obras/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna 400 quando o identificador é inválido", async () => {
    const response = await GET(
      new Request("http://localhost/api/obras/id-invalido"),
      {
        params: Promise.resolve({
          id: "id-invalido",
        }),
      },
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      message: "O identificador da obra é inválido.",
    });

    expect(mocks.obraFindUnique).not.toHaveBeenCalled();
  });

  it("retorna 404 quando a obra não existe", async () => {
    mocks.obraFindUnique.mockResolvedValue(null);

    const response = await GET(
      new Request(
        "http://localhost/api/obras/550e8400-e29b-41d4-a716-446655440000",
      ),
      {
        params: Promise.resolve({
          id: "550e8400-e29b-41d4-a716-446655440000",
        }),
      },
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      message: "Obra não encontrada.",
    });

    expect(mocks.obraFindUnique).toHaveBeenCalledOnce();
  });

  it("retorna os detalhes da obra encontrada", async () => {
    mocks.obraFindUnique.mockResolvedValue({
      id: "550e8400-e29b-41d4-a716-446655440000",
      titulo: "Reforma da UBS Central",
      descricao: "Reforma geral da unidade.",
      endereco: "Rua Central",
      bairro: "Centro",
      latitude: -7.55,
      longitude: -35.0,
      valorContrato: 150000.5,
      empresaContratada: "Construtora Teste",
      numeroOrdemServico: "OS-001",
      dataOrdemServico: new Date("2026-01-10T00:00:00.000Z"),
      previsaoConclusao: new Date("2026-12-20T00:00:00.000Z"),
      dataConclusaoReal: null,
      updatedAt: new Date("2026-02-01T00:00:00.000Z"),
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      status: "EM_ANDAMENTO",
      secretaria: {
        id: "secretaria-1",
        nome: "Saúde",
        sigla: "SESAU",
        corIdentificacao: "#123456",
      },
      eixo: {
        id: "eixo-1",
        nome: "Desenvolvimento Social",
        slug: "desenvolvimento-social",
        cor: "#3182CE",
      },
      areaTematica: {
        id: "area-1",
        nome: "Saúde",
      },
      engenheiro: {
        id: "engenheiro-1",
        nome: "Engenheiro Teste",
        cargo: "Engenheiro Civil",
      },
      medicoes: [
        {
          id: "medicao-1",
          dataVistoria: new Date("2026-02-10T00:00:00.000Z"),
          percentualExecutado: 42.5,
          observacoesTecnicas: "Execução em andamento.",
          engenheiro: {
            id: "engenheiro-1",
            nome: "Engenheiro Teste",
            cargo: "Engenheiro Civil",
          },
        },
      ],
      fotos: [
        {
          id: "foto-1",
          url: "/fotos/ubs-central.jpg",
          tipo: "EM_ANDAMENTO",
          descricao: "Registro da obra.",
          dataFoto: new Date("2026-02-11T00:00:00.000Z"),
        },
      ],
    });

    const response = await GET(
      new Request(
        "http://localhost/api/obras/550e8400-e29b-41d4-a716-446655440000",
      ),
      {
        params: Promise.resolve({
          id: "550e8400-e29b-41d4-a716-446655440000",
        }),
      },
    );

    expect(response.status).toBe(200);

    const body = await response.json();

    expect(body).toEqual(
      expect.objectContaining({
        id: "550e8400-e29b-41d4-a716-446655440000",
        titulo: "Reforma da UBS Central",
        valorContrato: 150000.5,
        dataOrdemServico: "2026-01-10T00:00:00.000Z",
        percentualExecutado: 42.5,
        imagemUrl: "/fotos/ubs-central.jpg",
        status: "EM_ANDAMENTO",
      }),
    );

    expect(body.medicoes).toHaveLength(1);
    expect(body.fotos).toHaveLength(1);
    expect(mocks.obraFindUnique).toHaveBeenCalledOnce();
  });

  it("retorna 500 quando ocorre erro ao buscar a obra", async () => {
    mocks.obraFindUnique.mockRejectedValue(new Error("Erro de conexão"));

    const response = await GET(
      new Request(
        "http://localhost/api/obras/550e8400-e29b-41d4-a716-446655440000",
      ),
      {
        params: Promise.resolve({
          id: "550e8400-e29b-41d4-a716-446655440000",
        }),
      },
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      message: "Erro interno ao carregar a obra.",
    });
  });
});

describe("PATCH /api/obras/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.validateObraRelations.mockResolvedValue([]);
  });

  it("retorna 400 quando o identificador é inválido", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/obras/id-invalido", {
        method: "PATCH",
        body: JSON.stringify({ titulo: "Novo título" }),
      }),
      {
        params: Promise.resolve({
          id: "id-invalido",
        }),
      },
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      message: "O identificador da obra é inválido.",
    });

    expect(mocks.obraFindUnique).not.toHaveBeenCalled();
    expect(mocks.obraUpdate).not.toHaveBeenCalled();
  });

  it("retorna 400 quando o corpo não contém JSON válido", async () => {
    const response = await PATCH(
      new Request(
        "http://localhost/api/obras/550e8400-e29b-41d4-a716-446655440000",
        {
          method: "PATCH",
          body: "{json-invalido",
        },
      ),
      {
        params: Promise.resolve({
          id: "550e8400-e29b-41d4-a716-446655440000",
        }),
      },
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      message: "O corpo da requisição deve conter um JSON válido.",
    });

    expect(mocks.obraFindUnique).not.toHaveBeenCalled();
    expect(mocks.obraUpdate).not.toHaveBeenCalled();
  });

  it("retorna 400 quando não há campos para atualizar", async () => {
    const response = await PATCH(
      new Request(
        "http://localhost/api/obras/550e8400-e29b-41d4-a716-446655440000",
        {
          method: "PATCH",
          body: JSON.stringify({}),
        },
      ),
      {
        params: Promise.resolve({
          id: "550e8400-e29b-41d4-a716-446655440000",
        }),
      },
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual(
      expect.objectContaining({
        message: "Os dados da obra são inválidos.",
      }),
    );

    expect(mocks.obraFindUnique).not.toHaveBeenCalled();
    expect(mocks.obraUpdate).not.toHaveBeenCalled();
  });

  it("retorna 404 quando a obra não existe para atualização", async () => {
    mocks.obraFindUnique.mockResolvedValue(null);

    const response = await PATCH(
      new Request(
        "http://localhost/api/obras/550e8400-e29b-41d4-a716-446655440000",
        {
          method: "PATCH",
          body: JSON.stringify({
            titulo: "Novo título",
          }),
        },
      ),
      {
        params: Promise.resolve({
          id: "550e8400-e29b-41d4-a716-446655440000",
        }),
      },
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      message: "Obra não encontrada.",
    });

    expect(mocks.obraFindUnique).toHaveBeenCalledOnce();
    expect(mocks.obraUpdate).not.toHaveBeenCalled();
  });

  it("atualiza uma obra válida", async () => {
    mocks.obraFindUnique.mockResolvedValue({
      secretariaId: "secretaria-1",
      eixoId: "eixo-1",
      areaTematicaId: "area-1",
      engenheiroId: null,
    });
    mocks.obraUpdate.mockResolvedValue({
      id: "550e8400-e29b-41d4-a716-446655440000",
      titulo: "Novo título",
      status: "EM_ANDAMENTO",
      secretariaId: "secretaria-1",
      eixoId: "eixo-1",
      areaTematicaId: "area-1",
      engenheiroId: null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-02-01T00:00:00.000Z"),
    });

    const response = await PATCH(
      new Request(
        "http://localhost/api/obras/550e8400-e29b-41d4-a716-446655440000",
        {
          method: "PATCH",
          body: JSON.stringify({
            titulo: "Novo título",
            status: "EM_ANDAMENTO",
          }),
        },
      ),
      {
        params: Promise.resolve({
          id: "550e8400-e29b-41d4-a716-446655440000",
        }),
      },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      id: "550e8400-e29b-41d4-a716-446655440000",
      titulo: "Novo título",
      status: "EM_ANDAMENTO",
      secretariaId: "secretaria-1",
      eixoId: "eixo-1",
      areaTematicaId: "area-1",
      engenheiroId: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-02-01T00:00:00.000Z",
    });

    expect(mocks.validateObraRelations).toHaveBeenCalledOnce();
    expect(mocks.obraUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "550e8400-e29b-41d4-a716-446655440000",
        },
        data: {
          titulo: "Novo título",
          status: "EM_ANDAMENTO",
        },
      }),
    );
  });

  it("retorna 400 quando as relações da obra são inválidas", async () => {
    mocks.obraFindUnique.mockResolvedValue({
      secretariaId: "11111111-1111-4111-8111-111111111111",
      eixoId: "22222222-2222-4222-8222-222222222222",
      areaTematicaId: null,
      engenheiroId: null,
    });
    mocks.validateObraRelations.mockResolvedValue(["eixoId"]);

    const response = await PATCH(
      new Request(
        "http://localhost/api/obras/550e8400-e29b-41d4-a716-446655440000",
        {
          method: "PATCH",
          body: JSON.stringify({
            eixoId: "33333333-3333-4333-8333-333333333333",
          }),
        },
      ),
      {
        params: Promise.resolve({
          id: "550e8400-e29b-41d4-a716-446655440000",
        }),
      },
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      message: "Uma ou mais referências relacionadas são inválidas.",
      fields: ["eixoId"],
    });

    expect(mocks.validateObraRelations).toHaveBeenCalledOnce();
    expect(mocks.obraUpdate).not.toHaveBeenCalled();
  });

  it("retorna 500 quando ocorre erro ao atualizar a obra", async () => {
    mocks.obraFindUnique.mockResolvedValue({
      secretariaId: "11111111-1111-4111-8111-111111111111",
      eixoId: "22222222-2222-4222-8222-222222222222",
      areaTematicaId: null,
      engenheiroId: null,
    });
    mocks.obraUpdate.mockRejectedValue(new Error("Erro de conexão"));

    const response = await PATCH(
      new Request(
        "http://localhost/api/obras/550e8400-e29b-41d4-a716-446655440000",
        {
          method: "PATCH",
          body: JSON.stringify({
            titulo: "Novo título",
          }),
        },
      ),
      {
        params: Promise.resolve({
          id: "550e8400-e29b-41d4-a716-446655440000",
        }),
      },
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      message: "Erro interno ao atualizar obra.",
    });
  });
});
