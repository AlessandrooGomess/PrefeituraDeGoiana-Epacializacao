import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

const mocks = vi.hoisted(() => ({
  obraFindUnique: vi.fn(),
  etapaObraCreate: vi.fn(),
  etapaObraUpdate: vi.fn(),
  requireUser: vi.fn(),
  canAccessSecretaria: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    obra: {
      findUnique: mocks.obraFindUnique,
    },
    etapaObra: {
      create: mocks.etapaObraCreate,
      update: mocks.etapaObraUpdate,
    },
  },
}));

vi.mock("@/lib/auth/authorization", () => ({
  requireUser: mocks.requireUser,
  canAccessSecretaria: mocks.canAccessSecretaria,
}));

import { POST } from "./route";
import { PATCH } from "./[etapaId]/route";

const obraId = "550e8400-e29b-41d4-a716-446655440000";
const etapaId = "660e8400-e29b-41d4-a716-446655440000";
const templateId = "770e8400-e29b-41d4-a716-446655440000";
const engenheiroId = "880e8400-e29b-41d4-a716-446655440000";
const secretariaId = "990e8400-e29b-41d4-a716-446655440000";

function postRequest() {
  return POST(
    new Request(`http://localhost/api/obras/${obraId}/etapas`, {
      method: "POST",
      body: JSON.stringify({ etapasTemplateIds: [templateId] }),
    }),
    { params: Promise.resolve({ id: obraId }) },
  );
}

function patchRequest() {
  return PATCH(
    new Request(`http://localhost/api/obras/${obraId}/etapas/${etapaId}`, {
      method: "PATCH",
      body: JSON.stringify({ percentualConcluido: 50 }),
    }),
    { params: Promise.resolve({ id: obraId, etapaId }) },
  );
}

describe("POST /api/obras/[id]/etapas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("não permite que o engenheiro cadastre etapas", async () => {
    mocks.requireUser.mockImplementation(async (roles: string[]) =>
      roles.includes("ENGENHEIRO")
        ? { user: { id: engenheiroId, role: "ENGENHEIRO", secretariaId } }
        : {
            response: NextResponse.json(
              { message: "Você não tem permissão para executar esta ação." },
              { status: 403 },
            ),
          },
    );

    const response = await postRequest();

    expect(response.status).toBe(403);
    expect(mocks.etapaObraCreate).not.toHaveBeenCalled();
  });

  it("bloqueia secretaria que não é dona da obra", async () => {
    mocks.requireUser.mockResolvedValue({
      user: { id: "adm", role: "ADM_SECRETARIA", secretariaId: "outra" },
    });
    mocks.obraFindUnique.mockResolvedValue({ secretariaId, deletedAt: null });
    mocks.canAccessSecretaria.mockReturnValue(false);

    const response = await postRequest();

    expect(response.status).toBe(403);
    expect(mocks.etapaObraCreate).not.toHaveBeenCalled();
  });

  it("permite que a secretaria dona da obra cadastre etapas", async () => {
    mocks.requireUser.mockResolvedValue({
      user: { id: "adm", role: "ADM_SECRETARIA", secretariaId },
    });
    mocks.obraFindUnique.mockResolvedValue({ secretariaId, deletedAt: null });
    mocks.canAccessSecretaria.mockReturnValue(true);
    mocks.etapaObraCreate.mockResolvedValue({ id: etapaId });

    const response = await postRequest();

    expect(response.status).toBe(201);
    expect(mocks.etapaObraCreate).toHaveBeenCalledTimes(1);
  });
});

describe("PATCH /api/obras/[id]/etapas/[etapaId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("bloqueia engenheiro que não é responsável pela obra", async () => {
    mocks.requireUser.mockResolvedValue({
      user: { id: engenheiroId, role: "ENGENHEIRO", secretariaId },
    });
    mocks.obraFindUnique.mockResolvedValue({
      secretariaId,
      engenheiroId: "outro-engenheiro",
      deletedAt: null,
    });
    mocks.canAccessSecretaria.mockReturnValue(true);

    const response = await patchRequest();

    expect(response.status).toBe(403);
    expect(mocks.etapaObraUpdate).not.toHaveBeenCalled();
  });

  it("permite que o engenheiro responsável atualize a etapa", async () => {
    mocks.requireUser.mockResolvedValue({
      user: { id: engenheiroId, role: "ENGENHEIRO", secretariaId },
    });
    mocks.obraFindUnique.mockResolvedValue({
      secretariaId,
      engenheiroId,
      deletedAt: null,
    });
    mocks.etapaObraUpdate.mockResolvedValue({
      id: etapaId,
      percentualConcluido: 50,
    });

    const response = await patchRequest();

    expect(response.status).toBe(200);
    expect(mocks.etapaObraUpdate).toHaveBeenCalledTimes(1);
  });

  it("retorna 404 para etapa inexistente", async () => {
    mocks.requireUser.mockResolvedValue({
      user: { id: engenheiroId, role: "ENGENHEIRO", secretariaId },
    });
    mocks.obraFindUnique.mockResolvedValue({
      secretariaId,
      engenheiroId,
      deletedAt: null,
    });
    mocks.etapaObraUpdate.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Registro não encontrado.", {
        code: "P2025",
        clientVersion: "test",
      }),
    );

    const response = await patchRequest();

    expect(response.status).toBe(404);
  });

  it("retorna 404 para obra inexistente", async () => {
    mocks.requireUser.mockResolvedValue({
      user: { id: "adm", role: "ADM_SECRETARIA", secretariaId },
    });
    mocks.obraFindUnique.mockResolvedValue(null);

    const response = await patchRequest();

    expect(response.status).toBe(404);
    expect(mocks.etapaObraUpdate).not.toHaveBeenCalled();
  });
});
