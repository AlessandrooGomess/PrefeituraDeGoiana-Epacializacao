import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  obraFindUnique: vi.fn(),
  usuarioFindUnique: vi.fn(),
  medicaoCreate: vi.fn(),
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
    },
  },
}));

import { POST } from "./route";

const obraId = "550e8400-e29b-41d4-a716-446655440000";
const engenheiroId = "660e8400-e29b-41d4-a716-446655440000";

function request(body: unknown) {
  return new Request(`http://localhost/api/obras/${obraId}/medicoes`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/obras/[id]/medicoes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    mocks.obraFindUnique.mockResolvedValue({ id: obraId });
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
});
