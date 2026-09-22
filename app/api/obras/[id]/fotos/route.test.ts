import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  obraFindUnique: vi.fn(),
  fotoFindMany: vi.fn(),
  fotoCreate: vi.fn(),
  requireUser: vi.fn(),
  canAccessSecretaria: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    obra: {
      findUnique: mocks.obraFindUnique,
    },
    foto: {
      findMany: mocks.fotoFindMany,
      create: mocks.fotoCreate,
    },
  },
}));

vi.mock("@/lib/auth/authorization", () => ({
  requireUser: mocks.requireUser,
  canAccessSecretaria: mocks.canAccessSecretaria,
}));

import { GET, POST } from "./route";

const obraId = "550e8400-e29b-41d4-a716-446655440000";
const usuarioId = "660e8400-e29b-41d4-a716-446655440000";

function request(body: unknown) {
  return new Request(`http://localhost/api/obras/${obraId}/fotos`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("GET /api/obras/[id]/fotos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejeita identificador de obra inválido", async () => {
    const response = await GET(
      new Request("http://localhost/api/obras/id-invalido/fotos"),
      { params: Promise.resolve({ id: "id-invalido" }) },
    );

    expect(response.status).toBe(400);
    expect(mocks.obraFindUnique).not.toHaveBeenCalled();
  });

  it("retorna 404 quando a obra não existe", async () => {
    mocks.obraFindUnique.mockResolvedValue(null);

    const response = await GET(
      new Request(`http://localhost/api/obras/${obraId}/fotos`),
      { params: Promise.resolve({ id: obraId }) },
    );

    expect(response.status).toBe(404);
    expect(mocks.fotoFindMany).not.toHaveBeenCalled();
  });

  it("retorna as fotos serializadas e ordenadas", async () => {
    mocks.obraFindUnique.mockResolvedValue({ id: obraId, deletedAt: null });
    mocks.fotoFindMany.mockResolvedValue([
      {
        id: "770e8400-e29b-41d4-a716-446655440000",
        obraId,
        usuarioId,
        url: "/fotos/obra-escola-angelo.jpg",
        tipo: "EM_ANDAMENTO",
        descricao: "Registro da obra.",
        dataFoto: new Date("2026-02-10T00:00:00.000Z"),
        createdAt: new Date("2026-02-10T00:00:00.000Z"),
      },
    ]);

    const response = await GET(
      new Request(`http://localhost/api/obras/${obraId}/fotos`),
      { params: Promise.resolve({ id: obraId }) },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([
      {
        id: "770e8400-e29b-41d4-a716-446655440000",
        obraId,
        usuarioId,
        url: "/fotos/obra-escola-angelo.jpg",
        tipo: "EM_ANDAMENTO",
        descricao: "Registro da obra.",
        dataFoto: "2026-02-10T00:00:00.000Z",
        createdAt: "2026-02-10T00:00:00.000Z",
      },
    ]);
    expect(mocks.fotoFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { obraId },
        orderBy: { dataFoto: "desc" },
      }),
    );
  });
});

describe("POST /api/obras/[id]/fotos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUser.mockResolvedValue({
      user: {
        id: usuarioId,
        role: "ENGENHEIRO",
        secretariaId: "secretaria-1",
      },
    });
    mocks.canAccessSecretaria.mockReturnValue(true);
  });

  it("retorna 401 sem autenticação", async () => {
    mocks.requireUser.mockResolvedValue({
      response: new Response(
        JSON.stringify({ message: "Autenticação necessária." }),
        { status: 401 },
      ),
    });

    const response = await POST(
      request({ url: "/fotos/obra.jpg" }),
      { params: Promise.resolve({ id: obraId }) },
    );

    expect(response.status).toBe(401);
    expect(mocks.obraFindUnique).not.toHaveBeenCalled();
  });

  it("retorna 400 para dados inválidos", async () => {
    const response = await POST(
      request({ url: "javascript:alert(1)" }),
      { params: Promise.resolve({ id: obraId }) },
    );

    expect(response.status).toBe(400);
    expect(mocks.obraFindUnique).not.toHaveBeenCalled();
  });

  it("cria uma foto vinculada ao usuário autenticado", async () => {
    mocks.obraFindUnique.mockResolvedValue({
      id: obraId,
      secretariaId: "secretaria-1",
      deletedAt: null,
    });
    mocks.fotoCreate.mockResolvedValue({
      id: "770e8400-e29b-41d4-a716-446655440000",
      obraId,
      usuarioId,
      url: "/fotos/obra.jpg",
      tipo: "ANTES",
      descricao: "Antes da intervenção.",
      dataFoto: new Date("2026-02-10T00:00:00.000Z"),
      createdAt: new Date("2026-02-10T00:00:00.000Z"),
    });

    const response = await POST(
      request({
        url: "/fotos/obra.jpg",
        tipo: "ANTES",
        descricao: "Antes da intervenção.",
        dataFoto: "2026-02-10",
      }),
      { params: Promise.resolve({ id: obraId }) },
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      id: "770e8400-e29b-41d4-a716-446655440000",
      obraId,
      usuarioId,
      url: "/fotos/obra.jpg",
      tipo: "ANTES",
      descricao: "Antes da intervenção.",
      dataFoto: "2026-02-10T00:00:00.000Z",
      createdAt: "2026-02-10T00:00:00.000Z",
    });
    expect(mocks.fotoCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          obraId,
          usuarioId,
          url: "/fotos/obra.jpg",
          tipo: "ANTES",
        }),
      }),
    );
  });

  it("retorna 403 para usuário sem acesso à secretaria", async () => {
    mocks.obraFindUnique.mockResolvedValue({
      id: obraId,
      secretariaId: "secretaria-2",
      deletedAt: null,
    });
    mocks.canAccessSecretaria.mockReturnValue(false);

    const response = await POST(
      request({ url: "/fotos/obra.jpg" }),
      { params: Promise.resolve({ id: obraId }) },
    );

    expect(response.status).toBe(403);
    expect(mocks.fotoCreate).not.toHaveBeenCalled();
  });

  it("retorna 404 para obra excluída logicamente", async () => {
    mocks.obraFindUnique.mockResolvedValue({
      id: obraId,
      secretariaId: "secretaria-1",
      deletedAt: new Date("2026-09-21T00:00:00.000Z"),
    });

    const response = await POST(
      request({ url: "/fotos/obra.jpg" }),
      { params: Promise.resolve({ id: obraId }) },
    );

    expect(response.status).toBe(404);
    expect(mocks.fotoCreate).not.toHaveBeenCalled();
  });
});