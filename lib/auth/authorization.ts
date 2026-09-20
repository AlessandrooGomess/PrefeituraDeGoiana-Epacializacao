import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export interface AuthenticatedUser {
  id: string;
  role: Role;
  secretariaId: string | null;
}

export async function requireUser(
  allowedRoles?: readonly Role[],
): Promise<
  | { user: AuthenticatedUser; response?: never }
  | { user?: never; response: NextResponse }
> {
  const session = await auth();
  const sessionUser = session?.user;

  if (!sessionUser?.id || !sessionUser.role) {
    return {
      response: NextResponse.json(
        { message: "Autenticação necessária." },
        { status: 401 },
      ),
    };
  }

  if (allowedRoles && !allowedRoles.includes(sessionUser.role)) {
    return {
      response: NextResponse.json(
        { message: "Você não tem permissão para executar esta ação." },
        { status: 403 },
      ),
    };
  }

  return {
    user: {
      id: sessionUser.id,
      role: sessionUser.role,
      secretariaId: sessionUser.secretariaId,
    },
  };
}

export function canAccessSecretaria(
  user: AuthenticatedUser,
  secretariaId: string,
): boolean {
  if (user.role === Role.SUPER_ADMIN || user.role === Role.GESTAO) {
    return true;
  }

  return (
    (user.role === Role.ADM_SECRETARIA || user.role === Role.ENGENHEIRO) &&
    user.secretariaId === secretariaId
  );
}
