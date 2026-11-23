import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  secretariaFindUnique: vi.fn(),
  eixoFindUnique: vi.fn(),
  areaTematicaFindUnique: vi.fn(),
  usuarioFindUnique: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    secretaria: {
      findUnique: mocks.secretariaFindUnique,
    },
    eixoEstrategico: {
      findUnique: mocks.eixoFindUnique,
    },
    areaTematica: {
      findUnique: mocks.areaTematicaFindUnique,
    },
    usuario: {
      findUnique: mocks.usuarioFindUnique,
    },
  },
}));

import { validateObraRelations } from "./validate-relations";

describe("validateObraRelations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna nenhuma inconsistência quando todas as relações são válidas", async () => {
    mocks.secretariaFindUnique.mockResolvedValue({
      id: "secretaria-1",
      eixoId: "eixo-1",
    });
    mocks.eixoFindUnique.mockResolvedValue({ id: "eixo-1" });
    mocks.areaTematicaFindUnique.mockResolvedValue({
      id: "area-1",
      eixoId: "eixo-1",
    });
    mocks.usuarioFindUnique.mockResolvedValue({
      id: "engenheiro-1",
      role: "ENGENHEIRO",
      ativo: true,
    });

    const result = await validateObraRelations({
      secretariaId: "secretaria-1",
      eixoId: "eixo-1",
      areaTematicaId: "area-1",
      engenheiroId: "engenheiro-1",
    });

    expect(result).toEqual([]);
  });

  it("identifica secretaria inexistente", async () => {
    mocks.secretariaFindUnique.mockResolvedValue(null);

    const result = await validateObraRelations({
      secretariaId: "secretaria-inexistente",
      eixoId: null,
      areaTematicaId: null,
      engenheiroId: null,
    });

    expect(result).toEqual(["secretariaId"]);
  });

  it("identifica eixo inexistente", async () => {
    mocks.secretariaFindUnique.mockResolvedValue({ id: "secretaria-1" });
    mocks.eixoFindUnique.mockResolvedValue(null);

    const result = await validateObraRelations({
      secretariaId: "secretaria-1",
      eixoId: "eixo-inexistente",
      areaTematicaId: null,
      engenheiroId: null,
    });

    expect(result).toEqual(["eixoId"]);
  });

  it("identifica eixo diferente do eixo da secretaria", async () => {
    mocks.secretariaFindUnique.mockResolvedValue({
      id: "secretaria-1",
      eixoId: "eixo-1",
    });
    mocks.eixoFindUnique.mockResolvedValue({ id: "eixo-2" });

    const result = await validateObraRelations({
      secretariaId: "secretaria-1",
      eixoId: "eixo-2",
      areaTematicaId: null,
      engenheiroId: null,
    });

    expect(result).toEqual(["eixoId"]);
  });

  it("identifica área temática pertencente a outro eixo", async () => {
    mocks.secretariaFindUnique.mockResolvedValue({
      id: "secretaria-1",
      eixoId: "eixo-1",
    });
    mocks.eixoFindUnique.mockResolvedValue({ id: "eixo-1" });
    mocks.areaTematicaFindUnique.mockResolvedValue({
      id: "area-1",
      eixoId: "eixo-2",
    });

    const result = await validateObraRelations({
      secretariaId: "secretaria-1",
      eixoId: "eixo-1",
      areaTematicaId: "area-1",
      engenheiroId: null,
    });

    expect(result).toEqual(["areaTematicaId"]);
  });

  it("identifica engenheiro inativo ou com papel incorreto", async () => {
    mocks.secretariaFindUnique.mockResolvedValue({ id: "secretaria-1" });
    mocks.usuarioFindUnique.mockResolvedValue({
      id: "usuario-1",
      role: "CIDADAO",
      ativo: false,
    });

    const result = await validateObraRelations({
      secretariaId: "secretaria-1",
      eixoId: null,
      areaTematicaId: null,
      engenheiroId: "usuario-1",
    });

    expect(result).toEqual(["engenheiroId"]);
  });
});
