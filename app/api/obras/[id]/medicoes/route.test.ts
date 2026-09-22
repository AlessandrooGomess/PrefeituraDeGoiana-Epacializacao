import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  obraFindUnique: vi.fn(),
  usuarioFindUnique: vi.fn(),
  medicaoCreate: vi.fn(),
  medicaoFindMany: vi.fn(),
  requireUser: vi.fn(),
  canAccessSecretaria: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    obra: {
      findUnique: mocks.obraFindUnique,
    },
    usuario: {
      findUnique: mocks.usuarioFindUnique,
    },
    medicao: {
      create: mocks.medicaoCreate,
      findMany: mocks.medicaoFindMany,
    },
  },
}));

vi.mock("@/lib/auth/authorization", () => ({
  requireUser: mocks.requireUser,
  canAccessSecretaria: mocks.canAccessSecretaria,
}));

import { GET, POST } from "./route";

const obraId = "550e8400-e29b-41d4-a716-446655440000";
const engenheiroId = "660e8400-e29b-41d4-a716-446655440000";

describe("GET /api/obras/[id]/medicoes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejeita identificador de obra inválido", async () => {
    const response = await GET(
      new Request("http://localhost/api/obras/id-invalido/medicoes"),
      { params: Promise.resolve({ id: "id-invalido" }) },
    );

    expect(response.status).toBe(400);
    expect(mocks.obraFindUnique).not.toHaveBeenCalled();
  });

  it("retorna 404 quando a obra não existe", async () => {
    mocks.obraFindUnique.mockResolvedValue(null);

    const response = await GET(
      new Request(`http://localhost/api/obras/${obraId}/medicoes`),
      { params: Promise.resolve({ id: obraId }) },
    );

    expect(response.status).toBe(404);
    expect(mocks.medicaoFindMany).not.toHaveBeenCalled();
  });

  it("retorna o histórico de medições serializado", async () => {
    mocks.obraFindUnique.mockResolvedValue({ id: obraId, deletedAt: null });
    mocks.medicaoFindMany.mockResolvedValue([
      {
        id: "770e8400-e29b-41d4-a716-446655440000",
        obraId,
        engenheiroId,
        dataVistoria: new Date("2026-02-10T00:00:00.000Z"),
        percentualExecutado: 40,
        observacoesTecnicas: "Execução em andamento.",
        createdAt: new Date("2026-02-10T00:00:00.000Z"),
        engenheiro: {
          id: engenheiroId,
          nome: "Engenheiro Teste",
          cargo: "Engenheiro Civil",
        },
      },
    ]);

    const response = await GET(
      new Request(`http://localhost/api/obras/${obraId}/medicoes`),
      { params: Promise.resolve({ id: obraId }) },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([
      {
        id: "770e8400-e29b-41d4-a716-446655440000",
        obraId,
        engenheiroId,
        dataVistoria: "2026-02-10T00:00:00.000Z",
        percentualExecutado: 40,
        observacoesTecnicas: "Execução em andamento.",
        createdAt: "2026-02-10T00:00:00.000Z",
        engenheiro: {
          id: engenheiroId,
          nome: "Engenheiro Teste",
          cargo: "Engenheiro Civil",
        },
      },
    ]);
    expect(mocks.medicaoFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { obraId },
        orderBy: { dataVistoria: "desc" },
      }),
    );
  });

  it("retorna 500 quando ocorre erro ao buscar medições", async () => {
    mocks.obraFindUnique.mockResolvedValue({ id: obraId, deletedAt: null });
    mocks.medicaoFindMany.mockRejectedValue(new Error("Erro de conexão"));

    const response = await GET(
      new Request(`http://localhost/api/obras/${obraId}/medicoes`),
      { params: Promise.resolve({ id: obraId }) },
    );

    expect(response.status).toBe(500);
  });
});

function request(body: unknown) {
  return new Request(`http://localhost/api/obras/${obraId}/medicoes`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/obras/[id]/medicoes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUser.mockResolvedValue({
      user: {
        id: engenheiroId,
        role: "ENGENHEIRO",
        secretariaId: "secretaria-1",
      },
    });
    mocks.canAccessSecretaria.mockReturnValue(true);
  });

  it("rejeita identificador de obra inválido", async () => {
    const response = await POST(
      new Request("http://localhost/api/obras/id-invalido/medicoes", {
        method: "POST",
        body: JSON.stringify({
          percentualExecutado: 40,
          engenheiroId,
        }),
      }),
      { params: Promise.resolve({ id: "id-invalido" }) },
    );

    expect(response.status).toBe(400);
    expect(mocks.obraFindUnique).not.toHaveBeenCalled();
  });

  it("rejeita percentual fora do intervalo permitido", async () => {
    const response = await POST(
      request({
        percentualExecutado: 101,
        engenheiroId,
      }),
      { params: Promise.resolve({ id: obraId }) },
    );

    expect(response.status).toBe(400);
    expect(mocks.obraFindUnique).not.toHaveBeenCalled();
  });

  it("cria uma medição para engenheiro ativo", async () => {
    mocks.obraFindUnique.mockResolvedValue({
      id: obraId,
      secretariaId: "secretaria-1",
    });
    mocks.usuarioFindUnique.mockResolvedValue({
      id: engenheiroId,
      role: "ENGENHEIRO",
      ativo: true,
    });
    mocks.medicaoCreate.mockResolvedValue({
      id: "770e8400-e29b-41d4-a716-446655440000",
      obraId,
      engenheiroId,
      dataVistoria: new Date("2026-02-10T00:00:00.000Z"),
      percentualExecutado: 40,
      observacoesTecnicas: "Execução em andamento.",
      createdAt: new Date("2026-02-10T00:00:00.000Z"),
    });

    const response = await POST(
      request({
        dataVistoria: "2026-02-10",
        percentualExecutado: 40,
        observacoesTecnicas: "Execução em andamento.",
        engenheiroId,
      }),
      { params: Promise.resolve({ id: obraId }) },
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      id: "770e8400-e29b-41d4-a716-446655440000",
      obraId,
      engenheiroId,
      dataVistoria: "2026-02-10T00:00:00.000Z",
      percentualExecutado: 40,
      observacoesTecnicas: "Execução em andamento.",
      createdAt: "2026-02-10T00:00:00.000Z",
    });
    expect(mocks.medicaoCreate).toHaveBeenCalledOnce();
  });

  it("retorna 401 sem autenticação", async () => {
    mocks.requireUser.mockResolvedValue({
      response: new Response(
        JSON.stringify({ message: "Autenticação necessária." }),
        { status: 401 },
      ),
    });

    const response = await POST(
      request({ percentualExecutado: 40, engenheiroId }),
      { params: Promise.resolve({ id: obraId }) },
    );

    expect(response.status).toBe(401);
    expect(mocks.obraFindUnique).not.toHaveBeenCalled();
  });

  it("retorna 403 quando o engenheiro tenta registrar em outra secretaria", async () => {
    mocks.obraFindUnique.mockResolvedValue({
      id: obraId,
      secretariaId: "secretaria-2",
    });
    mocks.canAccessSecretaria.mockReturnValue(false);

    const response = await POST(
      request({ percentualExecutado: 40, engenheiroId }),
      { params: Promise.resolve({ id: obraId }) },
    );

    expect(response.status).toBe(403);
    expect(mocks.medicaoCreate).not.toHaveBeenCalled();
  });

  it("retorna 403 quando o engenheiro informado não é o autenticado", async () => {
    mocks.obraFindUnique.mockResolvedValue({
      id: obraId,
      secretariaId: "secretaria-1",
    });

    const response = await POST(
      request({
        percentualExecutado: 40,
        engenheiroId: "770e8400-e29b-41d4-a716-446655440000",
      }),
      { params: Promise.resolve({ id: obraId }) },
    );

    expect(response.status).toBe(403);
    expect(mocks.medicaoCreate).not.toHaveBeenCalled();
  });
});
