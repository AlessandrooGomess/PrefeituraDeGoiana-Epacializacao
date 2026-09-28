import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  obraFindUnique: vi.fn(),
  registroCampoCreate: vi.fn(),
  registroCampoFindMany: vi.fn(),
  requireUser: vi.fn(),
  canAccessSecretaria: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    obra: {
      findUnique: mocks.obraFindUnique,
    },
    registroCampo: {
      create: mocks.registroCampoCreate,
      findMany: mocks.registroCampoFindMany,
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

describe("GET /api/obras/[id]/registros-campo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejeita identificador de obra inválido", async () => {
    const response = await GET(
      new Request("http://localhost/api/obras/id-invalido/registros-campo"),
      { params: Promise.resolve({ id: "id-invalido" }) },
    );

    expect(response.status).toBe(400);
    expect(mocks.obraFindUnique).not.toHaveBeenCalled();
  });

  it("retorna 404 quando a obra não existe", async () => {
    mocks.obraFindUnique.mockResolvedValue(null);

    const response = await GET(
      new Request(`http://localhost/api/obras/${obraId}/registros-campo`),
      { params: Promise.resolve({ id: obraId }) },
    );

    expect(response.status).toBe(404);
  });

  it("retorna lista de registros com sucesso", async () => {
    mocks.obraFindUnique.mockResolvedValue({ id: obraId, deletedAt: null });
    mocks.registroCampoFindMany.mockResolvedValue([
      {
        id: "reg-1",
        obraId,
        engenheiroId,
        dataVistoria: new Date("2026-09-26T10:00:00Z"),
        status: "ENVIADO",
        intercorrencias: ["CHUVA"],
        observacoes: "Dia chuvoso",
        createdAt: new Date("2026-09-26T10:30:00Z"),
        updatedAt: new Date("2026-09-26T10:30:00Z"),
        engenheiro: { id: engenheiroId, nome: "Carlos", cargo: "Fiscal" },
        fotos: [
          {
            id: "foto-1",
            url: "/fotos/obra.jpg",
            descricao: "Frente",
            latitude: -7.56,
            longitude: -34.93,
            dataFoto: new Date("2026-09-26T10:15:00Z"),
            createdAt: new Date("2026-09-26T10:30:00Z"),
          },
        ],
      },
    ]);

    const response = await GET(
      new Request(`http://localhost/api/obras/${obraId}/registros-campo`),
      { params: Promise.resolve({ id: obraId }) },
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveLength(1);
    expect(data[0].id).toBe("reg-1");
    expect(data[0].fotos).toHaveLength(1);
    expect(data[0].fotos[0].latitude).toBe(-7.56);
  });
});

describe("POST /api/obras/[id]/registros-campo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireUser.mockResolvedValue({
      user: {
        id: engenheiroId,
        role: "ENGENHEIRO",
        secretariaId: "sec-1",
      },
    });
    mocks.canAccessSecretaria.mockReturnValue(true);
    mocks.obraFindUnique.mockResolvedValue({
      id: obraId,
      secretariaId: "sec-1",
      deletedAt: null,
    });
  });

  it("rejeita requisição quando usuário não é engenheiro", async () => {
    mocks.requireUser.mockResolvedValue({
      response: new Response(JSON.stringify({ message: "Não autorizado" }), {
        status: 403,
      }),
    });

    const response = await POST(
      new Request(`http://localhost/api/obras/${obraId}/registros-campo`, {
        method: "POST",
        body: JSON.stringify({ status: "RASCUNHO" }),
      }),
      { params: Promise.resolve({ id: obraId }) },
    );

    expect(response.status).toBe(403);
  });

  it("cria um rascunho com sucesso (sem fotos obrigatórias)", async () => {
    const fakeCreated = {
      id: "reg-rascunho-1",
      obraId,
      engenheiroId,
      dataVistoria: new Date(),
      status: "RASCUNHO",
      intercorrencias: ["ATRASO_MATERIAL"],
      observacoes: "Aguardando cimento",
      createdAt: new Date(),
      updatedAt: new Date(),
      engenheiro: { id: engenheiroId, nome: "Carlos", cargo: "Fiscal" },
      fotos: [],
    };
    mocks.registroCampoCreate.mockResolvedValue(fakeCreated);

    const response = await POST(
      new Request(`http://localhost/api/obras/${obraId}/registros-campo`, {
        method: "POST",
        body: JSON.stringify({
          status: "RASCUNHO",
          intercorrencias: ["ATRASO_MATERIAL"],
          observacoes: "Aguardando cimento",
        }),
      }),
      { params: Promise.resolve({ id: obraId }) },
    );

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.id).toBe("reg-rascunho-1");
    expect(data.status).toBe("RASCUNHO");
    expect(mocks.registroCampoCreate).toHaveBeenCalled();
  });

  it("rejeita envio definitivo se não houver fotos", async () => {
    const response = await POST(
      new Request(`http://localhost/api/obras/${obraId}/registros-campo`, {
        method: "POST",
        body: JSON.stringify({
          status: "ENVIADO",
          intercorrencias: [],
          fotos: [],
        }),
      }),
      { params: Promise.resolve({ id: obraId }) },
    );

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.message).toBe("Os dados do registro de campo são inválidos.");
  });

  it("cria envio definitivo com fotos e coordenadas GPS com sucesso", async () => {
    const fakeCreated = {
      id: "reg-enviado-1",
      obraId,
      engenheiroId,
      dataVistoria: new Date(),
      status: "ENVIADO",
      intercorrencias: ["CHUVA"],
      observacoes: "Vistoria concluída com sucesso.",
      createdAt: new Date(),
      updatedAt: new Date(),
      engenheiro: { id: engenheiroId, nome: "Carlos", cargo: "Fiscal" },
      fotos: [
        {
          id: "foto-gps-1",
          url: "/fotos/obra-alvenaria.jpg",
          descricao: "Fase de estrutura",
          latitude: -7.5619,
          longitude: -34.9317,
          dataFoto: new Date(),
          createdAt: new Date(),
        },
      ],
    };
    mocks.registroCampoCreate.mockResolvedValue(fakeCreated);

    const response = await POST(
      new Request(`http://localhost/api/obras/${obraId}/registros-campo`, {
        method: "POST",
        body: JSON.stringify({
          status: "ENVIADO",
          intercorrencias: ["CHUVA"],
          observacoes: "Vistoria concluída com sucesso.",
          fotos: [
            {
              url: "/fotos/obra-alvenaria.jpg",
              descricao: "Fase de estrutura",
              latitude: -7.5619,
              longitude: -34.9317,
            },
          ],
        }),
      }),
      { params: Promise.resolve({ id: obraId }) },
    );

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.id).toBe("reg-enviado-1");
    expect(data.status).toBe("ENVIADO");
    expect(data.fotos[0].latitude).toBe(-7.5619);
  });
});