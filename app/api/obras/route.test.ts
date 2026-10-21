import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  obraFindMany: vi.fn(),
  obraCount: vi.fn(),
  transaction: vi.fn(),
  transactionObraCreate: vi.fn(),
  etapaTemplateFindMany: vi.fn(),
  etapaObraCreate: vi.fn(),
  draftDeleteMany: vi.fn(),
  validateObraRelations: vi.fn(),
  requireUser: vi.fn(),
  canAccessSecretaria: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    obra: {
      findMany: mocks.obraFindMany,
      count: mocks.obraCount,
    },
    $transaction: mocks.transaction,
  },
}));

vi.mock("@/lib/obras/validate-relations", () => ({
  validateObraRelations: mocks.validateObraRelations,
}));

vi.mock("@/lib/auth/authorization", () => ({
  requireUser: mocks.requireUser,
  canAccessSecretaria: mocks.canAccessSecretaria,
}));

import { GET } from "./route";

const transactionClient = {
  obra: { create: mocks.transactionObraCreate },
  etapaTemplate: { findMany: mocks.etapaTemplateFindMany },
  etapaObra: { create: mocks.etapaObraCreate },
  rascunhoObra: { deleteMany: mocks.draftDeleteMany },
};

describe("GET /api/obras", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUser.mockResolvedValue({
      user: {
        id: "usuario-1",
        role: "GESTAO",
        secretariaId: null,
      },
    });
    mocks.canAccessSecretaria.mockReturnValue(true);
    mocks.validateObraRelations.mockResolvedValue([]);
    mocks.transaction.mockImplementation((operation) =>
      operation(transactionClient),
    );
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
          deletedAt: null,
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

    expect(mocks.obraFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      }),
    );

    expect(mocks.obraCount).toHaveBeenCalledWith({
      where: { deletedAt: null },
    });
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

  it("retorna 401 ao criar obra sem autenticação", async () => {
    mocks.requireUser.mockResolvedValue({
      response: new Response(
        JSON.stringify({ message: "Autenticação necessária." }),
        { status: 401 },
      ),
    });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/obras", {
        method: "POST",
        body: "{}",
      }),
    );

    expect(response.status).toBe(401);
    expect(mocks.obraFindMany).not.toHaveBeenCalled();
  });

  it("retorna 403 se o administrador não estiver vinculado a uma secretaria", async () => {
    mocks.requireUser.mockResolvedValue({
      user: {
        id: "usuario-1",
        role: "ADM_SECRETARIA",
        secretariaId: null,
      },
    });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/obras", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(403);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("retorna 403 quando a secretaria da sessão não pode receber a obra", async () => {
    const secretariaDaSessao = "550e8400-e29b-41d4-a716-446655440000";
    mocks.canAccessSecretaria.mockReturnValue(false);
    mocks.requireUser.mockResolvedValue({
      user: {
        id: "usuario-1",
        role: "ADM_SECRETARIA",
        secretariaId: secretariaDaSessao,
      },
    });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/obras", {
        method: "POST",
        body: JSON.stringify({
          titulo: "Obra de teste",
          endereco: "Rua Central",
          bairro: "Centro",
          latitude: -7.55,
          longitude: -35,
          tipoObraId: "770e8400-e29b-41d4-a716-446655440000",
          secretariaId: "660e8400-e29b-41d4-a716-446655440000",
        }),
      }),
    );

    expect(response.status).toBe(403);
    expect(mocks.canAccessSecretaria).toHaveBeenCalledWith(
      expect.objectContaining({ secretariaId: secretariaDaSessao }),
      secretariaDaSessao,
    );
  });

  it("cria obra, etapas e remove o rascunho na mesma transação", async () => {
    const secretariaId = "550e8400-e29b-41d4-a716-446655440000";
    const tipoObraId = "770e8400-e29b-41d4-a716-446655440000";
    const etapaTemplateId = "880e8400-e29b-41d4-a716-446655440000";
    const subEtapaTemplateId = "990e8400-e29b-41d4-a716-446655440000";
    mocks.requireUser.mockResolvedValue({
      user: {
        id: "usuario-1",
        role: "ADM_SECRETARIA",
        secretariaId,
      },
    });
    mocks.transactionObraCreate.mockResolvedValue({
      id: "obra-1",
      titulo: "Reforma da UBS",
      status: "PLANEJADA",
      secretariaId,
      eixoId: null,
      areaTematicaId: null,
      engenheiroId: null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });
    mocks.etapaTemplateFindMany.mockResolvedValue([
      {
        id: etapaTemplateId,
        subEtapasTemplate: [{ id: subEtapaTemplateId }],
      },
    ]);
    mocks.etapaObraCreate.mockResolvedValue({});

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/obras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: "Reforma da UBS",
          endereco: "Rua Central",
          bairro: "Centro",
          latitude: -7.55,
          longitude: -35,
          tipoObraId,
        }),
      }),
    );

    expect(response.status).toBe(201);
    expect(mocks.transaction).toHaveBeenCalledOnce();
    expect(mocks.etapaObraCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          obraId: "obra-1",
          etapaTemplateId,
          subEtapasObra: {
            create: [
              expect.objectContaining({
                subEtapaTemplateId,
                status: "PENDENTE",
                percentualConcluido: 0,
              }),
            ],
          },
        }),
      }),
    );
    expect(mocks.draftDeleteMany).toHaveBeenCalledWith({
      where: { usuarioId: "usuario-1" },
    });
  });

  it("retorna erro sem confirmar o cadastro se a criação das etapas falhar", async () => {
    const secretariaId = "550e8400-e29b-41d4-a716-446655440000";
    mocks.requireUser.mockResolvedValue({
      user: {
        id: "usuario-1",
        role: "ADM_SECRETARIA",
        secretariaId,
      },
    });
    mocks.transactionObraCreate.mockResolvedValue({
      id: "obra-1",
      titulo: "Reforma da UBS",
      status: "PLANEJADA",
      secretariaId,
      eixoId: null,
      areaTematicaId: null,
      engenheiroId: null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });
    mocks.etapaTemplateFindMany.mockResolvedValue([
      { id: "880e8400-e29b-41d4-a716-446655440000", subEtapasTemplate: [] },
    ]);
    mocks.etapaObraCreate.mockRejectedValue(new Error("Falha ao criar etapa"));

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/obras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: "Reforma da UBS",
          endereco: "Rua Central",
          bairro: "Centro",
          latitude: -7.55,
          longitude: -35,
          tipoObraId: "770e8400-e29b-41d4-a716-446655440000",
        }),
      }),
    );

    expect(response.status).toBe(500);
    expect(mocks.draftDeleteMany).not.toHaveBeenCalled();
  });
});
