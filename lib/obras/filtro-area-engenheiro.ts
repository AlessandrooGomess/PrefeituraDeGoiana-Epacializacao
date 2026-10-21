import { Prisma, Role } from "@prisma/client";

interface UsuarioAreaEngenheiro {
  id: string;
  role: Role;
  secretariaId: string | null;
}

// Obras visíveis na área do engenheiro: o engenheiro vê as obras sob sua responsabilidade;
// os demais perfis com acesso veem as obras da própria secretaria (ou todas, sem secretaria)
export function filtroObrasAreaEngenheiro(usuario: UsuarioAreaEngenheiro): Prisma.ObraWhereInput {
  return {
    deletedAt: null,
    ...(usuario.role === Role.ENGENHEIRO
      ? { engenheiroId: usuario.id }
      : usuario.secretariaId
        ? { secretariaId: usuario.secretariaId }
        : {}),
  };
}
