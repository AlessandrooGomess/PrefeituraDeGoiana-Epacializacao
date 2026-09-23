import { beforeEach, describe, expect, it, vi } from "vitest";
import { Role } from "@prisma/client";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: mocks.auth,
}));

import { canAccessSecretaria, requireUser } from "./authorization";

describe("requireUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna 401 sem sessão", async () => {
    mocks.auth.mockResolvedValue(null);

    const result = await requireUser();

    expect(result.response?.status).toBe(401);
  });

  it("retorna 403 para papel não autorizado", async () => {
    mocks.auth.mockResolvedValue({
      user: {
        id: "usuario-1",
        role: Role.CIDADAO,
        secretariaId: null,
      },
    });

    const result = await requireUser([Role.GESTAO]);

    expect(result.response?.status).toBe(403);
  });

  it("retorna o usuário para papel autorizado", async () => {
    mocks.auth.mockResolvedValue({
      user: {
        id: "usuario-1",
        role: Role.GESTAO,
        secretariaId: null,
      },
    });

    const result = await requireUser([Role.GESTAO]);

    expect(result.user).toEqual({
      id: "usuario-1",
      role: Role.GESTAO,
      secretariaId: null,
    });
  });
});

describe("canAccessSecretaria", () => {
  it("permite gestão e super administrador em qualquer secretaria", () => {
    expect(
      canAccessSecretaria(
        { id: "1", role: Role.GESTAO, secretariaId: null },
        "secretaria-2",
      ),
    ).toBe(true);
    expect(
      canAccessSecretaria(
        { id: "1", role: Role.SUPER_ADMIN, secretariaId: null },
        "secretaria-2",
      ),
    ).toBe(true);
  });

  it("limita administrador e engenheiro à própria secretaria", () => {
    const user = {
      id: "1",
      role: Role.ADM_SECRETARIA,
      secretariaId: "secretaria-1",
    };

    expect(canAccessSecretaria(user, "secretaria-1")).toBe(true);
    expect(canAccessSecretaria(user, "secretaria-2")).toBe(false);
  });
});
