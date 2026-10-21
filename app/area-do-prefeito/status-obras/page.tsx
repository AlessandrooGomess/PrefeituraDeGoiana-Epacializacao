import { Role, StatusObra } from "@prisma/client";
import { AlertTriangle, ArrowLeft, ArrowUpRight, ClipboardList, Clock3 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Sidebar from "@/components/sidebar/Sidebar";
import { getHomeByRole } from "@/lib/auth/role-routes";
import { prisma } from "@/lib/prisma";
import styles from "@/app/area-do-servidor/prefeito-dashboard.module.css";
import StatusObrasFiltros from "./StatusObrasFiltros";
import pageStyles from "./status-obras.module.css";

const statusLabels: Record<StatusObra, string> = {
  PLANEJADA: "Em planejamento",
  ORDEM_EMITIDA: "Ordem emitida",
  EM_ANDAMENTO: "Em andamento",
  PARALISADA: "Paralisada",
  CONCLUIDA: "Concluída",
};

const statusOptions = Object.values(StatusObra);
const dayMs = 86_400_000;
const ALERTA_PRAZO_DIAS = 60;
const dateFormat = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "America/Recife",
});
const currencyFormat = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

function progressFor(status: StatusObra, measurement?: { percentualExecutado: unknown }) {
  if (measurement) return Math.min(100, Math.max(0, Number(measurement.percentualExecutado)));
  return status === StatusObra.CONCLUIDA ? 100 : 0;
}

type HealthLevel = "late" | "warning" | "normal";

function healthFor(
  obra: { status: StatusObra; previsaoConclusao: Date | null },
  now: Date,
): { label: string; level: HealthLevel } {
  if (obra.status === StatusObra.PARALISADA) {
    return { label: "Paralisada", level: "late" };
  }
  if (
    obra.status !== StatusObra.CONCLUIDA &&
    obra.previsaoConclusao !== null &&
    obra.previsaoConclusao < now
  ) {
    return { label: "Atrasada", level: "late" };
  }

  if (obra.status !== StatusObra.CONCLUIDA && obra.previsaoConclusao) {
    const daysLeft = Math.ceil((obra.previsaoConclusao.getTime() - now.getTime()) / dayMs);
    if (daysLeft >= 0 && daysLeft <= ALERTA_PRAZO_DIAS) {
      return { label: "Em alerta (até 60 dias)", level: "warning" };
    }
  }

  return { label: statusLabels[obra.status], level: "normal" };
}

export default async function StatusObrasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; eixo?: string; secretaria?: string; status?: string }>;
}) {
  const [session, query] = await Promise.all([auth(), searchParams]);
  if (!session?.user) redirect("/login");

  const allowedRoles: Role[] = [Role.GESTAO, Role.SUPER_ADMIN];
  if (!allowedRoles.includes(session.user.role)) {
    redirect(getHomeByRole(session.user.role));
  }

  const [obras, secretarias, eixos] = await Promise.all([
    prisma.obra.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        titulo: true,
        descricao: true,
        endereco: true,
        bairro: true,
        status: true,
        valorContrato: true,
        previsaoConclusao: true,
        updatedAt: true,
        secretaria: { select: { id: true, nome: true, sigla: true, eixoId: true } },
        eixo: { select: { id: true, nome: true } },
        engenheiro: { select: { nome: true } },
        medicoes: {
          orderBy: { dataVistoria: "desc" },
          take: 1,
          select: { dataVistoria: true, percentualExecutado: true },
        },
      },
    }),
    prisma.secretaria.findMany({
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, sigla: true, eixoId: true },
    }),
    prisma.eixoEstrategico.findMany({
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
  ]);

  const now = new Date();
  const search = query.q?.trim().toLocaleLowerCase("pt-BR") ?? "";
  const selectedEixo = query.eixo && eixos.some((eixo) => eixo.id === query.eixo) ? query.eixo : "";
  const secretariasDoEixo = selectedEixo
    ? secretarias.filter((sec) => sec.eixoId === selectedEixo)
    : secretarias;
  const selectedSecretaria =
    query.secretaria && secretariasDoEixo.some((sec) => sec.id === query.secretaria)
      ? query.secretaria
      : "";

  const selectedStatus =
    query.status === "ATRASADA" ||
    query.status === "ALERTA" ||
    statusOptions.includes(query.status as StatusObra)
      ? query.status
      : "TODOS";

  const obrasFiltradas = obras
    .filter((obra) => {
      const health = healthFor(obra, now);
      const obraEixoId = obra.eixo?.id ?? obra.secretaria.eixoId;
      const matchesSearch =
        !search ||
        [obra.titulo, obra.descricao, obra.endereco, obra.bairro, obra.secretaria.nome, obra.secretaria.sigla]
          .some((value) => value?.toLocaleLowerCase("pt-BR").includes(search));
      const matchesEixo = !selectedEixo || obraEixoId === selectedEixo;
      const matchesSecretary = !selectedSecretaria || obra.secretaria.id === selectedSecretaria;
      const matchesStatus =
        selectedStatus === "TODOS" ||
        (selectedStatus === "ATRASADA"
          ? health.level === "late"
          : selectedStatus === "ALERTA"
            ? health.level === "warning"
            : obra.status === selectedStatus);
      return matchesSearch && matchesEixo && matchesSecretary && matchesStatus;
    })
    .sort((first, second) => {
      const priority: Record<HealthLevel, number> = { late: 0, warning: 1, normal: 2 };
      const firstHealth = healthFor(first, now);
      const secondHealth = healthFor(second, now);
      if (priority[firstHealth.level] !== priority[secondHealth.level]) {
        return priority[firstHealth.level] - priority[secondHealth.level];
      }
      if (firstHealth.level !== "normal" && secondHealth.level !== "normal") {
        const firstDeadline = first.previsaoConclusao?.getTime() ?? 0;
        const secondDeadline = second.previsaoConclusao?.getTime() ?? 0;
        return firstDeadline - secondDeadline;
      }
      return second.updatedAt.getTime() - first.updatedAt.getTime();
    });

  const lateCount = obrasFiltradas.filter((obra) => healthFor(obra, now).level === "late").length;
  const warningCount = obrasFiltradas.filter((obra) => healthFor(obra, now).level === "warning").length;

  return (
    <div className={styles.shell}>
      <Sidebar user={{ name: session.user.name ?? "Prefeito", role: session.user.role }} />
      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <div className={styles.profile}>
            <div className={styles.profileIcon}>GP</div>
            <div>
              <strong>Gestão Pública</strong>
              <small>Prefeitura de Goiana</small>
            </div>
          </div>
          <nav className={styles.navList} aria-label="Navegação da gestão">
            <Link className={styles.navItem} href="/area-do-prefeito">
              <ArrowLeft size={16} aria-hidden="true" />
              Painel de gestão
            </Link>
            <Link className={`${styles.navItem} ${styles.navItemActive}`} href="/area-do-prefeito/status-obras">
              <ClipboardList size={16} aria-hidden="true" />
              Status de Obras
            </Link>
          </nav>
        </aside>

        <main className={styles.dashboard}>
          <header className={styles.heading}>
            <div>
              <p className={styles.eyebrow}>ACOMPANHAMENTO DA CARTEIRA</p>
              <h1>Status de Obras</h1>
              <p className={styles.updated}>Situação, avanço físico e previsão de conclusão</p>
            </div>
            <p className={styles.slogan}>Dados atualizados<br />pelo sistema de obras.</p>
          </header>

          <section className={pageStyles.summary} aria-label="Resumo das obras">
            <div>
              <strong>{obrasFiltradas.length}</strong>
              <span>obras encontradas</span>
            </div>
            <div className={pageStyles.alertSummary}>
              <Clock3 size={18} aria-hidden="true" />
              <strong>{lateCount}</strong>
              <span>atrasadas / paralisadas</span>
            </div>
            <div className={pageStyles.warningSummary}>
              <AlertTriangle size={18} aria-hidden="true" />
              <strong>{warningCount}</strong>
              <span>em alerta (até {ALERTA_PRAZO_DIAS} dias)</span>
            </div>
          </section>

          <StatusObrasFiltros
            key={`${selectedEixo}-${selectedSecretaria}-${selectedStatus ?? "TODOS"}`}
            defaultQuery={query.q}
            selectedEixo={selectedEixo}
            selectedSecretaria={selectedSecretaria}
            selectedStatus={selectedStatus ?? "TODOS"}
            eixos={eixos}
            secretarias={secretarias}
            statusOptions={statusOptions.map((st) => ({
              value: st,
              label: statusLabels[st],
            }))}
            alertaPrazoDias={ALERTA_PRAZO_DIAS}
          />

          <section className={pageStyles.workList} aria-label="Obras cadastradas">
            {obrasFiltradas.map((obra) => {
              const progress = progressFor(obra.status, obra.medicoes[0]);
              const health = healthFor(obra, now);
              const daysLate =
                obra.status !== StatusObra.CONCLUIDA && obra.previsaoConclusao && obra.previsaoConclusao < now
                  ? Math.ceil((now.getTime() - obra.previsaoConclusao.getTime()) / dayMs)
                  : 0;
              const daysLeft =
                obra.status !== StatusObra.CONCLUIDA &&
                obra.previsaoConclusao &&
                obra.previsaoConclusao >= now
                  ? Math.ceil((obra.previsaoConclusao.getTime() - now.getTime()) / dayMs)
                  : null;
              const badgeClass =
                health.level === "late"
                  ? pageStyles.healthAlert
                  : health.level === "warning"
                    ? pageStyles.healthWarning
                    : pageStyles.healthNormal;

              return (
                <article className={pageStyles.workCard} key={obra.id}>
                  <div className={pageStyles.workTop}>
                    <div className={pageStyles.workTitle}>
                      <span className={`${pageStyles.healthBadge} ${badgeClass}`}>
                        {health.level === "late" && <Clock3 size={13} aria-hidden="true" />}
                        {health.level === "warning" && <AlertTriangle size={13} aria-hidden="true" />}
                        {health.label}
                      </span>
                      <h2>{obra.titulo}</h2>
                      <p>{obra.secretaria.sigla} · {obra.secretaria.nome} · {obra.bairro}</p>
                    </div>
                    <span className={pageStyles.statusBadge}>{statusLabels[obra.status]}</span>
                  </div>

                  <dl className={pageStyles.workDetails}>
                    <div>
                      <dt>Avanço físico</dt>
                      <dd>
                        <span className={pageStyles.progressTrack}>
                          <span style={{ width: `${progress}%` }} />
                        </span>
                        {Math.round(progress)}%
                      </dd>
                    </div>
                    <div>
                      <dt>Previsão de conclusão</dt>
                      <dd>
                        {obra.previsaoConclusao ? dateFormat.format(obra.previsaoConclusao) : "Não informada"}
                        {daysLate > 0 && <span className={pageStyles.daysLate}>{daysLate} dias em atraso</span>}
                        {daysLate === 0 && daysLeft !== null && daysLeft <= ALERTA_PRAZO_DIAS && (
                          <span className={pageStyles.daysWarning}>
                            {daysLeft === 0 ? "Vence hoje" : `Restam ${daysLeft} dias`}
                          </span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>Valor contratado</dt>
                      <dd>{obra.valorContrato ? currencyFormat.format(Number(obra.valorContrato)) : "Não informado"}</dd>
                    </div>
                    <div>
                      <dt>Eixo / responsável</dt>
                      <dd>{obra.eixo?.nome ?? "Sem eixo"} · {obra.engenheiro?.nome ?? "Sem responsável"}</dd>
                    </div>
                  </dl>

                  <div className={pageStyles.workFooter}>
                    <span>
                      {obra.medicoes[0]
                        ? `Última medição em ${dateFormat.format(obra.medicoes[0].dataVistoria)}`
                        : "Ainda sem medição de avanço"}
                    </span>
                    <Link href={`/area-do-servidor/obras/${obra.id}`}>
                      Ver detalhes da obra <ArrowUpRight size={15} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
            {!obrasFiltradas.length && (
              <p className={styles.empty}>Nenhuma obra encontrada para os filtros selecionados.</p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
