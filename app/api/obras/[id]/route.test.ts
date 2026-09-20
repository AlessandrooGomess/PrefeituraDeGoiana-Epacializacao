import { beforeEach, describe, expect, it, vi } from "vitest";

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
});
