import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  upsert: vi.fn(),
  deleteMany: vi.fn(),
  requireUser: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    rascunhoObra: {
      findFirst: mocks.findFirst,
      upsert: mocks.upsert,
      deleteMany: mocks.deleteMany,
    },
  },
}));

vi.mock("@/lib/auth/authorization", () => ({
  requireUser: mocks.requireUser,
}));

import { DELETE, GET, PUT } from "./route";

const secretariaId = "11111111-1111-4111-8111-111111111111";

function request(body?: unknown) {
  return new Request("http://localhost/api/obras/rascunho", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/obras/rascunho", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUser.mockResolvedValue({
      user: {
        id: "usuario-1",
        role: "ADM_SECRETARIA",
        secretariaId,
      },
    });
  });

  it("carrega somente o rascunho do usuário na secretaria vinculada", async () => {
    mocks.findFirst.mockResolvedValue({
      dados: { titulo: "Obra em preparação" },
      updatedAt: new Date("2026-10-14T12:00:00.000Z"),
    });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      dados: expect.objectContaining({ titulo: "Obra em preparação" }),
      updatedAt: "2026-10-14T12:00:00.000Z",
    });
    expect(mocks.findFirst).toHaveBeenCalledWith({
      where: { usuarioId: "usuario-1", secretariaId },
      select: { dados: true, updatedAt: true },
    });
  });

  it("salva o rascunho do usuário autenticado", async () => {
    mocks.upsert.mockResolvedValue({
      id: "rascunho-1",
      updatedAt: new Date("2026-10-14T12:00:00.000Z"),
    });

    const response = await PUT(request({ titulo: "Obra em preparação" }));

    expect(response.status).toBe(200);
    expect(mocks.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { usuarioId: "usuario-1" },
        create: expect.objectContaining({
          usuarioId: "usuario-1",
          secretariaId,
          dados: expect.objectContaining({ titulo: "Obra em preparação" }),
        }),
      }),
    );
  });

  it("remove o rascunho após a publicação", async () => {
    mocks.deleteMany.mockResolvedValue({ count: 1 });

    const response = await DELETE();

    expect(response.status).toBe(204);
    expect(mocks.deleteMany).toHaveBeenCalledWith({
      where: { usuarioId: "usuario-1" },
    });
  });

  it("nega acesso quando o usuário não está autenticado", async () => {
    mocks.requireUser.mockResolvedValue({
      response: new Response(
        JSON.stringify({ message: "Autenticação necessária." }),
        { status: 401 },
      ),
    });

    const response = await GET();

    expect(response.status).toBe(401);
    expect(mocks.findFirst).not.toHaveBeenCalled();
  });
});
