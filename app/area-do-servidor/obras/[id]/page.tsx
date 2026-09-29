import { Role } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getHomeByRole } from "@/lib/auth/role-routes";
import { prisma } from "@/lib/prisma";
import ObraDetalheClient from "@/app/area-do-servidor/obras/[id]/ObraDetalheClient";

export default async function ObraDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ modo?: string }>;
}) {
  const [{ id }, query, session] = await Promise.all([
    params,
    searchParams,
    auth(),
  ]);

  if (!session?.user) redirect("/login");

  const allowedRoles: Role[] = [Role.SUPER_ADMIN, Role.GESTAO, Role.ADM_SECRETARIA];
  if (!allowedRoles.includes(session.user.role)) {
    redirect(getHomeByRole(session.user.role));
  }

  if (session.user.role === Role.ADM_SECRETARIA && !session.user.secretariaId) {
    redirect("/");
  }

  const obra = await prisma.obra.findFirst({
    where: {
      id,
      deletedAt: null,
      ...(session.user.role === Role.ADM_SECRETARIA
        ? { secretariaId: session.user.secretariaId! }
        : {}),
    },
    select: {
      id: true,
      titulo: true,
      descricao: true,
      endereco: true,
      bairro: true,
      latitude: true,
      longitude: true,
      valorContrato: true,
      empresaContratada: true,
      numeroOrdemServico: true,
      dataOrdemServico: true,
      previsaoConclusao: true,
      dataConclusaoReal: true,
      status: true,
      secretariaId: true,
      eixoId: true,
      areaTematicaId: true,
      engenheiroId: true,
      tipoObraId: true,
      createdAt: true,
      updatedAt: true,
      secretaria: { select: { id: true, nome: true, sigla: true } },
      eixo: { select: { id: true, nome: true } },
      areaTematica: { select: { id: true, nome: true } },
      engenheiro: { select: { id: true, nome: true, cargo: true } },
      medicoes: {
        orderBy: { dataVistoria: "desc" },
        select: {
          id: true,
          dataVistoria: true,
          percentualExecutado: true,
          observacoesTecnicas: true,
          engenheiro: { select: { nome: true, cargo: true } },
        },
      },
      fotos: {
        orderBy: { dataFoto: "desc" },
        select: { id: true, url: true, tipo: true, descricao: true, dataFoto: true },
      },
      registrosCampo: {
        orderBy: { dataVistoria: "desc" },
        select: {
          id: true,
          dataVistoria: true,
          status: true,
          intercorrencias: true,
          observacoes: true,
          engenheiro: { select: { nome: true } },
          fotos: {
            select: { id: true, url: true, tipo: true, descricao: true, dataFoto: true },
          },
        },
      },
    },
  });

  if (!obra) notFound();

  const [tipoObra, tiposObra, engenheiros] = await Promise.all([
    obra.tipoObraId
      ? prisma.tipoObra.findUnique({
          where: { id: obra.tipoObraId },
          select: { id: true, nome: true },
        })
      : null,
    prisma.tipoObra.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
    prisma.usuario.findMany({
      where: {
        secretariaId: obra.secretariaId,
        role: Role.ENGENHEIRO,
        ativo: true,
      },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
  ]);

  return (
    <ObraDetalheClient
      user={{
        name: session.user.name ?? session.user.email ?? "Usuário",
        role: session.user.role,
      }}
      initialEditMode={query.modo === "editar"}
      tiposObra={tiposObra}
      engenheiros={engenheiros}
      obra={{
        id: obra.id,
        titulo: obra.titulo,
        descricao: obra.descricao,
        endereco: obra.endereco,
        bairro: obra.bairro,
        latitude: obra.latitude,
        longitude: obra.longitude,
        valorContrato: obra.valorContrato === null ? null : Number(obra.valorContrato),
        empresaContratada: obra.empresaContratada,
        numeroOrdemServico: obra.numeroOrdemServico,
        dataOrdemServico: obra.dataOrdemServico?.toISOString() ?? null,
        previsaoConclusao: obra.previsaoConclusao?.toISOString() ?? null,
        dataConclusaoReal: obra.dataConclusaoReal?.toISOString() ?? null,
        status: obra.status,
        secretaria: obra.secretaria,
        eixo: obra.eixo,
        areaTematica: obra.areaTematica,
        engenheiro: obra.engenheiro,
        tipoObra,
        createdAt: obra.createdAt.toISOString(),
        updatedAt: obra.updatedAt.toISOString(),
        medicoes: obra.medicoes.map((medicao) => ({
          id: medicao.id,
          dataVistoria: medicao.dataVistoria.toISOString(),
          percentualExecutado: Number(medicao.percentualExecutado),
          observacoesTecnicas: medicao.observacoesTecnicas,
          engenheiro: medicao.engenheiro,
        })),
        fotos: obra.fotos.map((foto) => ({
          ...foto,
          dataFoto: foto.dataFoto.toISOString(),
        })),
        registrosCampo: obra.registrosCampo.map((registro) => ({
          ...registro,
          dataVistoria: registro.dataVistoria.toISOString(),
          fotos: registro.fotos.map((foto) => ({
            ...foto,
            dataFoto: foto.dataFoto.toISOString(),
          })),
        })),
      }}
    />
  );
}
