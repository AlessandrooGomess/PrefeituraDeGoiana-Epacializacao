import { describe, expect, it, vi } from "vitest";
import { Role } from "@prisma/client";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { canManageObra } from "./obra-access";

const secretariaId = "secretaria-1";
const obra = { secretariaId, engenheiroId: "engenheiro-1" };

describe("canManageObra", () => {
  it("permite o engenheiro responsável pela obra", () => {
    expect(
      canManageObra(
        { id: "engenheiro-1", role: Role.ENGENHEIRO, secretariaId },
        obra,
      ),
    ).toBe(true);
  });

  it("bloqueia engenheiro da mesma secretaria que não é o responsável", () => {
    expect(
      canManageObra(
        { id: "engenheiro-2", role: Role.ENGENHEIRO, secretariaId },
        obra,
      ),
    ).toBe(false);
  });

  it("bloqueia engenheiro quando a obra não tem responsável", () => {
    expect(
      canManageObra(
        { id: "engenheiro-1", role: Role.ENGENHEIRO, secretariaId },
        { secretariaId, engenheiroId: null },
      ),
    ).toBe(false);
  });

  it("permite a secretaria dona da obra", () => {
    expect(
      canManageObra(
        { id: "adm", role: Role.ADM_SECRETARIA, secretariaId },
        obra,
      ),
    ).toBe(true);
  });

  it("bloqueia secretaria de outra pasta", () => {
    expect(
      canManageObra(
        { id: "adm", role: Role.ADM_SECRETARIA, secretariaId: "outra" },
        obra,
      ),
    ).toBe(false);
  });

  it("permite gestão em qualquer obra", () => {
    expect(
      canManageObra({ id: "gestor", role: Role.GESTAO, secretariaId: null }, obra),
    ).toBe(true);
  });
});
