import { hash } from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Defina ADMIN_EMAIL e ADMIN_PASSWORD no ambiente.\nExemplo:\n$env:ADMIN_EMAIL=\"prefeito@goiana.pe.gov.br\"\n$env:ADMIN_PASSWORD=\"sua-senha-aqui\"\npnpm auth:set-password",
    );
  }

  if (password.length < 8) {
    throw new Error("A senha deve possuir pelo menos 8 caracteres.");
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email },
    select: { id: true, nome: true, email: true, role: true, ativo: true },
  });

  const passwordHash = await hash(password, 12);

  if (usuario) {
    if (usuario.role === Role.CIDADAO) {
      throw new Error("Usuário cidadão não possui permissão para acesso administrativo.");
    }

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        passwordHash,
        ativo: true,
      },
    });

    console.log(
      `✅ Senha do usuário "${usuario.nome}" (${usuario.email}) com perfil [${usuario.role}] atualizada com sucesso.`,
    );
    return;
  }

  const rawRole = process.env.ADMIN_ROLE?.trim().toUpperCase();
  let role: Role = Role.GESTAO;

  if (rawRole && Object.values(Role).includes(rawRole as Role)) {
    role = rawRole as Role;
  } else if (email.includes("admin")) {
    role = Role.SUPER_ADMIN;
  } else if (email.includes("prefeito") || email.includes("gestor")) {
    role = Role.GESTAO;
  }

  const defaultNome =
    role === Role.GESTAO
      ? "Prefeito Municipal - Gestão de Goiana"
      : role === Role.SUPER_ADMIN
        ? "Administrador Geral"
        : "Gestor Público";

  const defaultCargo =
    role === Role.GESTAO
      ? "Prefeito Municipal"
      : role === Role.SUPER_ADMIN
        ? "Administrador Geral"
        : "Gestor";

  const nome = process.env.ADMIN_NAME?.trim() || defaultNome;
  const cargo = process.env.ADMIN_CARGO?.trim() || defaultCargo;

  const novoUsuario = await prisma.usuario.create({
    data: {
      nome,
      email,
      cargo,
      role,
      passwordHash,
      ativo: true,
    },
  });

  console.log(
    `✅ Usuário criado com sucesso:\n- Nome: ${novoUsuario.nome}\n- E-mail: ${novoUsuario.email}\n- Cargo: ${novoUsuario.cargo}\n- Perfil: [${novoUsuario.role}]\n- Senha definida com sucesso.`,
  );
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

