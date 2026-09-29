import { Role } from "@prisma/client";
import { ArrowLeft, CheckCircle2, ClipboardList, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Sidebar from "@/components/sidebar/Sidebar";
import { getHomeByRole } from "@/lib/auth/role-routes";
import { prisma } from "@/lib/prisma";
import styles from "../../../area-do-servidor.module.css";

export default async function ConfirmacaoNovaObraPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, session] = await Promise.all([params, auth()]);

  if (!session?.user) redirect("/login");
  if (session.user.role !== Role.ADM_SECRETARIA) {
    redirect(getHomeByRole(session.user.role));
  }
  if (!session.user.secretariaId) redirect("/");

  const obra = await prisma.obra.findFirst({
    where: {
      id,
      secretariaId: session.user.secretariaId,
      deletedAt: null,
    },
    select: {
      titulo: true,
      numeroOrdemServico: true,
      valorContrato: true,
      empresaContratada: true,
      createdAt: true,
      tipoObraId: true,
      secretaria: { select: { nome: true, sigla: true } },
      engenheiro: { select: { nome: true } },
    },
  });

  if (!obra) redirect("/area-do-servidor");

  const tipoObra = obra.tipoObraId
    ? await prisma.tipoObra.findUnique({
        where: { id: obra.tipoObraId },
        select: { nome: true },
      })
    : null;

  const resumo = [
    ["Nome oficial da obra", obra.titulo],
    ["Código identificador", obra.numeroOrdemServico || "Não informado"],
    ["Categoria da intervenção", tipoObra?.nome || "Não informada"],
    ["Secretaria", `${obra.secretaria.sigla} · ${obra.secretaria.nome}`],
    [
      "Valor contratado",
      obra.valorContrato === null
        ? "Não informado"
        : new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(Number(obra.valorContrato)),
    ],
    ["Empresa contratada", obra.empresaContratada || "Não informada"],
    ["Engenheiro fiscal", obra.engenheiro?.nome || "Não atribuído"],
    [
      "Data do cadastro",
      new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(
        obra.createdAt,
      ),
    ],
  ];

}