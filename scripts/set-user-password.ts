import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Defina ADMIN_EMAIL e ADMIN_PASSWORD no ambiente.");
  }

  if (password.length < 8) {
    throw new Error("A senha deve possuir pelo menos 8 caracteres.");
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email },
    select: { id: true, role: true, ativo: true },
  });

  if (!usuario) {
    throw new Error("Usuário não encontrado.");
  }

  if (!usuario.ativo || usuario.role === "CIDADAO") {
    throw new Error("Usuário sem permissão para acesso administrativo.");
  }

  const passwordHash = await hash(password, 12);

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { passwordHash },
  });

  console.log("Senha atualizada com sucesso.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
