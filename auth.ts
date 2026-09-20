import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { Role } from "@prisma/client";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const authenticatedRoles = new Set<Role>([
  Role.SUPER_ADMIN,
  Role.GESTAO,
  Role.ADM_SECRETARIA,
  Role.ENGENHEIRO,
]);

export const { handlers, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const usuario = await prisma.usuario.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
          select: {
            id: true,
            nome: true,
            email: true,
            passwordHash: true,
            role: true,
            secretariaId: true,
            ativo: true,
          },
        });

        if (
          !usuario ||
          !usuario.ativo ||
          !usuario.passwordHash ||
          !authenticatedRoles.has(usuario.role)
        ) {
          return null;
        }

        const passwordMatches = await compare(
          parsed.data.password,
          usuario.passwordHash,
        );

        if (!passwordMatches) return null;

        return {
          id: usuario.id,
          name: usuario.nome,
          email: usuario.email,
          role: usuario.role,
          secretariaId: usuario.secretariaId,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.secretariaId = user.secretariaId;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        const role =
          typeof token.role === "string" &&
          Object.values(Role).includes(token.role as Role)
            ? (token.role as Role)
            : Role.CIDADAO;
        const secretariaId =
          typeof token.secretariaId === "string" || token.secretariaId === null
            ? token.secretariaId
            : null;

        session.user.id = token.sub ?? "";
        session.user.role = role;
        session.user.secretariaId = secretariaId;
      }

      return session;
    },
  },
});
