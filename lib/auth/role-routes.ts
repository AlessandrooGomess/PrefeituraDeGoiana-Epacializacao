export type RoleName =
  | "SUPER_ADMIN"
  | "GESTAO"
  | "ADM_SECRETARIA"
  | "ENGENHEIRO"
  | (string & {});

export const SERVIDOR_HOME = "/area-do-servidor";
export const ENGENHEIRO_HOME = "/area-do-engenheiro";
export const ADMIN_HOME = "/area-do-admin";

export function getHomeByRole(role?: RoleName | null): string {
  switch (role) {
    case "SUPER_ADMIN":
      return ADMIN_HOME;
    case "ENGENHEIRO":
      return ENGENHEIRO_HOME;
    case "ADM_SECRETARIA":
    case "GESTAO":
      return SERVIDOR_HOME;
    default:
      return "/";
  }
}