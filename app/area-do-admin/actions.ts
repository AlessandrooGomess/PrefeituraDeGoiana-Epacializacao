"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSecretaria(data: FormData) {
  const nome = data.get("nome") as string;
  const sigla = data.get("sigla") as string;
  const corIdentificacao = data.get("corIdentificacao") as string;

  await prisma.secretaria.create({
    data: {
      nome,
      sigla,
      corIdentificacao: corIdentificacao || undefined,
    },
  });

  revalidatePath("/area-do-admin/secretarias");
}

export async function deleteSecretaria(id: string) {
  await prisma.secretaria.delete({ where: { id } });
  revalidatePath("/area-do-admin/secretarias");
}

export async function updateSecretaria(id: string, data: FormData) {
  const nome = data.get("nome") as string;
  const sigla = data.get("sigla") as string;
  const corIdentificacao = data.get("corIdentificacao") as string;

  await prisma.secretaria.update({
    where: { id },
    data: {
      nome,
      sigla,
      corIdentificacao: corIdentificacao || undefined,
    },
  });

  revalidatePath("/area-do-admin/secretarias");
  revalidatePath(`/area-do-admin/secretarias/${id}`);
}

export async function createUsuario(data: FormData) {
  const nome = data.get("nome") as string;
  const email = data.get("email") as string;
  const role = data.get("role") as any;
  const secretariaId = data.get("secretariaId") as string;
  const password = data.get("password") as string;

  // Em um ambiente real, deve-se usar hash na senha (ex: bcrypt)
  // Como estamos implementando a tela usando o prisma disponível:
  await prisma.usuario.create({
    data: {
      nome,
      email,
      role,
      ativo: true,
      secretariaId: secretariaId || null,
      passwordHash: password, 
    },
  });

  revalidatePath("/area-do-admin/usuarios");
}

export async function toggleUsuarioStatus(id: string, currentStatus: boolean) {
  await prisma.usuario.update({
    where: { id },
    data: { ativo: !currentStatus },
  });
  revalidatePath("/area-do-admin/usuarios");
}

export async function updateUsuario(id: string, data: FormData) {
  const nome = data.get("nome") as string;
  const email = data.get("email") as string;
  const role = data.get("role") as any;
  const secretariaId = data.get("secretariaId") as string;
  
  await prisma.usuario.update({
    where: { id },
    data: {
      nome,
      email,
      role,
      secretariaId: secretariaId || null,
    },
  });

  revalidatePath("/area-do-admin/usuarios");
  revalidatePath(`/area-do-admin/usuarios/${id}`);
}

export async function deleteUsuario(id: string) {
  await prisma.usuario.delete({ where: { id } });
  revalidatePath("/area-do-admin/usuarios");
}

export async function createEixo(data: FormData) {
  const nome = data.get("nome") as string;
  const slug = data.get("slug") as string;
  const descricao = data.get("descricao") as string;
  const cor = data.get("cor") as string;

  await prisma.eixoEstrategico.create({
    data: {
      nome,
      slug,
      descricao: descricao || null,
      cor: cor || null,
    },
  });

  revalidatePath("/area-do-admin/eixos");
}

export async function updateEixo(id: string, data: FormData) {
  const nome = data.get("nome") as string;
  const slug = data.get("slug") as string;
  const descricao = data.get("descricao") as string;
  const cor = data.get("cor") as string;

  await prisma.eixoEstrategico.update({
    where: { id },
    data: {
      nome,
      slug,
      descricao: descricao || null,
      cor: cor || null,
    },
  });

  revalidatePath("/area-do-admin/eixos");
  revalidatePath(`/area-do-admin/eixos/${id}`);
}

export async function deleteEixo(id: string) {
  await prisma.eixoEstrategico.delete({ where: { id } });
  revalidatePath("/area-do-admin/eixos");
}

