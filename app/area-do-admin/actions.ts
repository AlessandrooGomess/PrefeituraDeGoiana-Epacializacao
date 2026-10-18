"use server";

import { hash } from "bcryptjs";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.SUPER_ADMIN) {
    throw new Error("Acesso negado: permissão exclusiva de Super Administrador.");
  }
  return session.user;
}

export async function createSecretaria(data: FormData) {
  await requireSuperAdmin();

  const nome = (data.get("nome") as string).trim();
  const sigla = (data.get("sigla") as string).trim().toUpperCase();
  const corIdentificacao = (data.get("corIdentificacao") as string) || null;
  const eixoId = (data.get("eixoId") as string) || null;
  const areaTematicaId = (data.get("areaTematicaId") as string) || null;

  await prisma.secretaria.create({
    data: {
      nome,
      sigla,
      corIdentificacao: corIdentificacao || undefined,
      eixoId,
      areaTematicaId,
    },
  });

  revalidatePath("/area-do-admin");
  revalidatePath("/area-do-admin/secretarias");
  if (eixoId) revalidatePath(`/area-do-admin/eixos/${eixoId}`);
}

export async function deleteSecretaria(id: string) {
  await requireSuperAdmin();
  await prisma.secretaria.delete({ where: { id } });
  revalidatePath("/area-do-admin");
  revalidatePath("/area-do-admin/secretarias");
}

export async function updateSecretaria(id: string, data: FormData) {
  await requireSuperAdmin();

  const nome = (data.get("nome") as string).trim();
  const sigla = (data.get("sigla") as string).trim().toUpperCase();
  const corIdentificacao = (data.get("corIdentificacao") as string) || null;
  const eixoId = (data.get("eixoId") as string) || null;
  const areaTematicaId = (data.get("areaTematicaId") as string) || null;

  await prisma.secretaria.update({
    where: { id },
    data: {
      nome,
      sigla,
      corIdentificacao: corIdentificacao || undefined,
      eixoId,
      areaTematicaId,
    },
  });

  revalidatePath("/area-do-admin");
  revalidatePath("/area-do-admin/secretarias");
  revalidatePath(`/area-do-admin/secretarias/${id}`);
  revalidatePath("/area-do-admin/eixos");
}

export async function createUsuario(data: FormData) {
  await requireSuperAdmin();

  const nome = (data.get("nome") as string).trim();
  const email = (data.get("email") as string).trim().toLowerCase();
  const role = data.get("role") as Role;
  const secretariaId = (data.get("secretariaId") as string) || null;
  const password = (data.get("password") as string) || "";

  if (!password || password.length < 6) {
    throw new Error("A senha deve ter pelo menos 6 caracteres.");
  }

  const passwordHash = await hash(password, 12);

  await prisma.usuario.create({
    data: {
      nome,
      email,
      role,
      ativo: true,
      secretariaId,
      passwordHash,
    },
  });

  revalidatePath("/area-do-admin");
  revalidatePath("/area-do-admin/usuarios");
}

export async function toggleUsuarioStatus(id: string, currentStatus: boolean) {
  await requireSuperAdmin();

  await prisma.usuario.update({
    where: { id },
    data: { ativo: !currentStatus },
  });

  revalidatePath("/area-do-admin");
  revalidatePath("/area-do-admin/usuarios");
  revalidatePath(`/area-do-admin/usuarios/${id}`);
}

export async function updateUsuario(id: string, data: FormData) {
  await requireSuperAdmin();

  const nome = (data.get("nome") as string).trim();
  const email = (data.get("email") as string).trim().toLowerCase();
  const role = data.get("role") as Role;
  const secretariaId = (data.get("secretariaId") as string) || null;
  const newPassword = ((data.get("password") as string | null) ?? "").trim();

  const updateData: {
    nome: string;
    email: string;
    role: Role;
    secretariaId: string | null;
    passwordHash?: string;
  } = {
    nome,
    email,
    role,
    secretariaId,
  };

  if (newPassword.length > 0) {
    if (newPassword.length < 6) {
      throw new Error("A nova senha deve ter pelo menos 6 caracteres.");
    }
    updateData.passwordHash = await hash(newPassword, 12);
  }

  await prisma.usuario.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/area-do-admin");
  revalidatePath("/area-do-admin/usuarios");
  revalidatePath(`/area-do-admin/usuarios/${id}`);
}

export async function deleteUsuario(id: string) {
  await requireSuperAdmin();

  await prisma.$transaction([
    prisma.obra.updateMany({
      where: { engenheiroId: id },
      data: { engenheiroId: null },
    }),
    prisma.usuario.delete({ where: { id } }),
  ]);

  revalidatePath("/area-do-admin");
  revalidatePath("/area-do-admin/usuarios");
}

export async function createEixo(data: FormData) {
  await requireSuperAdmin();

  const nome = (data.get("nome") as string).trim();
  const slug = (data.get("slug") as string).trim().toLowerCase();
  const descricao = (data.get("descricao") as string)?.trim() || null;
  const cor = (data.get("cor") as string) || null;

  await prisma.eixoEstrategico.create({
    data: {
      nome,
      slug,
      descricao,
      cor,
    },
  });

  revalidatePath("/area-do-admin");
  revalidatePath("/area-do-admin/eixos");
}

export async function updateEixo(id: string, data: FormData) {
  await requireSuperAdmin();

  const nome = (data.get("nome") as string).trim();
  const slug = (data.get("slug") as string).trim().toLowerCase();
  const descricao = (data.get("descricao") as string)?.trim() || null;
  const cor = (data.get("cor") as string) || null;

  await prisma.eixoEstrategico.update({
    where: { id },
    data: {
      nome,
      slug,
      descricao,
      cor,
    },
  });

  revalidatePath("/area-do-admin");
  revalidatePath("/area-do-admin/eixos");
  revalidatePath(`/area-do-admin/eixos/${id}`);
}

export async function deleteEixo(id: string) {
  await requireSuperAdmin();
  await prisma.eixoEstrategico.delete({ where: { id } });
  revalidatePath("/area-do-admin");
  revalidatePath("/area-do-admin/eixos");
}

export async function createAreaTematica(eixoId: string, data: FormData) {
  await requireSuperAdmin();

  const nome = ((data.get("nome") as string) ?? "").trim();
  if (!nome) return;

  await prisma.areaTematica.create({
    data: {
      nome,
      eixoId,
    },
  });

  revalidatePath(`/area-do-admin/eixos/${eixoId}`);
  revalidatePath("/area-do-admin/secretarias");
}

export async function deleteAreaTematica(id: string, eixoId: string) {
  await requireSuperAdmin();

  await prisma.areaTematica.delete({ where: { id } });

  revalidatePath(`/area-do-admin/eixos/${eixoId}`);
  revalidatePath("/area-do-admin/secretarias");
}


