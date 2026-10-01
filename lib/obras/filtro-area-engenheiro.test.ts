import { Role } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { filtroObrasAreaEngenheiro } from "./filtro-area-engenheiro";

describe("filtroObrasAreaEngenheiro", () => {
  it("restringe o engenheiro às obras sob sua responsabilidade", () => {
    const filtro = filtroObrasAreaEngenheiro({
      id: "eng-1",
      role: Role.ENGENHEIRO,
      secretariaId: "sec-1",
    });

    expect(filtro).toEqual({ deletedAt: null, engenheiroId: "eng-1" });
  });

  it("restringe perfis com secretaria às obras da própria secretaria", () => {
    const filtro = filtroObrasAreaEngenheiro({
      id: "gestor-1",
      role: Role.GESTAO,
      secretariaId: "sec-1",
    });

    expect(filtro).toEqual({ deletedAt: null, secretariaId: "sec-1" });
  });

  it("não restringe por secretaria quando o perfil não possui uma", () => {
    const filtro = filtroObrasAreaEngenheiro({
      id: "admin-1",
      role: Role.SUPER_ADMIN,
      secretariaId: null,
    });

    expect(filtro).toEqual({ deletedAt: null });
  });

  it("sempre ignora obras excluídas logicamente", () => {
    for (const role of [Role.ENGENHEIRO, Role.GESTAO, Role.SUPER_ADMIN]) {
      expect(filtroObrasAreaEngenheiro({ id: "u-1", role, secretariaId: null })).toMatchObject({
        deletedAt: null,
      });
    }
  });
});
