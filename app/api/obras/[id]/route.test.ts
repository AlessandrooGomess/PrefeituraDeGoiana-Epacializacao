import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  obraFindUnique: vi.fn(),
  obraUpdate: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    obra: {
      findUnique: mocks.obraFindUnique,
      update: mocks.obraUpdate,
    },
  },
}));

import { GET } from "./route";

describe("GET /api/obras/[id]", () => {
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
});
