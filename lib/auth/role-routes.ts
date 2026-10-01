export type RoleName =
  | "SUPER_ADMIN"
  | "GESTAO"
  | "ADM_SECRETARIA"
  | "ENGENHEIRO"
  | (string & {});

export const SERVIDOR_HOME = "/area-do-servidor";
export const ENGENHEIRO_HOME = "/area-do-engenheiro";

export function getHomeByRole(role?: RoleName | null): string {
  switch (role) {
    case "ENGENHEIRO":
      return ENGENHEIRO_HOME;
    case "ADM_SECRETARIA":
    case "SUPER_ADMIN":
    case "GESTAO":
      return SERVIDOR_HOME;
    default:
      return "/";
  }
}