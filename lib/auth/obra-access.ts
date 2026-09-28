import { Role } from "@prisma/client";
import {
  canAccessSecretaria,
  type AuthenticatedUser,
} from "@/lib/auth/authorization";

export interface ObraOwnership {
  secretariaId: string;
  engenheiroId: string | null;
}

/**
 * Define quem pode registrar informações em uma obra.
 * O engenheiro só atua nas obras sob sua responsabilidade;
 * os demais perfis seguem o acesso por secretaria.
 */
export function canManageObra(
  user: AuthenticatedUser,
  obra: ObraOwnership,
): boolean {
  if (user.role === Role.ENGENHEIRO) {
    return obra.engenheiroId === user.id;
  }

  return canAccessSecretaria(user, obra.secretariaId);
}
