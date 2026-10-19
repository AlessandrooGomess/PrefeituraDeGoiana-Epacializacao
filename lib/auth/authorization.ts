import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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

  const usuario = await prisma.usuario.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      role: true,
      secretariaId: true,
      ativo: true,
    },
  });

  if (!usuario || !usuario.ativo) {
    return {
      response: NextResponse.json(
        { message: "Autenticação necessária." },
        { status: 401 },
      ),
    };
  }

  if (allowedRoles && !allowedRoles.includes(usuario.role)) {
    return {
      response: NextResponse.json(
        { message: "Você não tem permissão para executar esta ação." },
        { status: 403 },
      ),
    };
  }

  return {
    user: {
      id: usuario.id,
      role: usuario.role,
      secretariaId: usuario.secretariaId,
    },
  };
}

/**
 * Verifica se o usuário tem permissão de gestão/escrita sobre uma secretaria.
 * Somente o Super Admin pode atuar em qualquer secretaria;
 * ADM_SECRETARIA e ENGENHEIRO estão restritos exclusivamente à própria secretaria
 * (mesmo que outra secretaria pertença ao mesmo Eixo Estratégico).
 * A Gestão (Prefeito) possui acesso apenas de leitura no painel e não altera obras.
 */
export function canAccessSecretaria(
  user: AuthenticatedUser,
  secretariaId: string,
): boolean {
  if (user.role === Role.SUPER_ADMIN) {
    return true;
  }

  return (
    (user.role === Role.ADM_SECRETARIA || user.role === Role.ENGENHEIRO) &&
    user.secretariaId !== null &&
    user.secretariaId === secretariaId
  );
}

