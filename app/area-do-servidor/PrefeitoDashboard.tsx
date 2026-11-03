import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Building2,
  CircleDollarSign,
  Clock3,
  ClipboardList,
  MapPinned,
  PlayCircle,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/sidebar/Sidebar";
import SidebarSettingsFooter from "@/components/sidebar/SidebarSettingsFooter";
import PrefeitoFiltros from "./PrefeitoFiltros";
import InvestimentoPainel, { type ObraInvestimentoItem } from "./InvestimentoPainel";
import styles from "./prefeito-dashboard.module.css";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 1,
  notation: "compact",
});

const dateFormat = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const timeZone = "America/Recife";

const dashboardDateFormat = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone,
});

const updatedFormat = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone,
});

const hourFormat = new Intl.DateTimeFormat("pt-BR", {
  hour: "numeric",
  hourCycle: "h23",
  timeZone,
});

const DAY_MS = 86_400_000;
const ALERTA_PRAZO_DIAS = 60;

const statusInfo = {
  PLANEJADA: { label: "Planejadas", color: "#f5b83d" },
  ORDEM_EMITIDA: { label: "Ordem emitida", color: "#34a5da" },
  EM_ANDAMENTO: { label: "Em andamento", color: "#27ae78" },
  PARALISADA: { label: "Paralisadas", color: "#ef6868" },
  CONCLUIDA: { label: "Concluídas", color: "#2781dc" },
} as const;

function progressFor(status: string, measurement?: { percentualExecutado: unknown }) {
  if (measurement) {
    return Math.min(100, Math.max(0, Number(measurement.percentualExecutado)));
  }
  return status === "CONCLUIDA" ? 100 : 0;
}

function greetingFor(date: Date) {
  const hour = Number(hourFormat.format(date));
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function isLate(obra: { status: string; previsaoConclusao: Date | null }, now: Date) {
  return (
    obra.status !== "CONCLUIDA" &&
    obra.previsaoConclusao !== null &&
    obra.previsaoConclusao < now
  );
}

function isOverdueOrPaused(
  obra: { status: string; previsaoConclusao: Date | null },
  now: Date,
) {
  return obra.status === "PARALISADA" || isLate(obra, now);
}

function daysUntilDeadline(previsaoConclusao: Date | null, now: Date) {
  if (!previsaoConclusao) return null;
  return Math.ceil((previsaoConclusao.getTime() - now.getTime()) / DAY_MS);
}

function isNearDeadline(
  obra: { status: string; previsaoConclusao: Date | null },
  now: Date,
) {
  if (obra.status === "CONCLUIDA" || obra.status === "PARALISADA") return false;
  const daysLeft = daysUntilDeadline(obra.previsaoConclusao, now);
  return daysLeft !== null && daysLeft >= 0 && daysLeft <= ALERTA_PRAZO_DIAS;
}

function delayDays(previsaoConclusao: Date | null, now: Date) {
  if (!previsaoConclusao || previsaoConclusao >= now) return 0;
  return Math.ceil((now.getTime() - previsaoConclusao.getTime()) / DAY_MS);
}

function percent(part: number, total: number) {
  return total ? Math.round((part / total) * 100) : 0;
}

function workHealth(
  obra: { status: string; previsaoConclusao: Date | null },
  progress: number,
  now: Date,
) {
  if (obra.status === "PARALISADA") {
    return {
      label: "Paralisada",
      dotClass: styles.dotPaused,
      pillClass: styles.pillPaused,
    };
  }

  if (isLate(obra, now)) {
    return {
      label: "Atrasada",
      dotClass: styles.dotRisk,
      pillClass: styles.pillRisk,
    };
  }

  if (isNearDeadline(obra, now)) {
    return {
      label: "Em alerta",
      dotClass: styles.dotWarning,
      pillClass: styles.pillWarning,
    };
  }

  if (progress >= 90) {
    return {
      label: "Fase final",
      dotClass: styles.dotGood,
      pillClass: styles.pillGood,
    };
  }

  return {
    label: "No ritmo",
    dotClass: styles.dotGood,
    pillClass: styles.pillGood,
  };
}

interface PrefeitoDashboardProps {
  name: string;
  role: string;
  filtroSecretaria?: string;
  filtroEixo?: string;
}

export default async function PrefeitoDashboard({
  name,
  role,
  filtroSecretaria,
  filtroEixo,
}: PrefeitoDashboardProps) {
  const now = new Date();
  const nextAlertLimit = new Date(now.getTime() + ALERTA_PRAZO_DIAS * DAY_MS);
  const firstName = name.trim().split(/\s+/)[0] || "Prefeito";

  const [todasSecretarias, todosEixos, todasObrasInvestimento] = await Promise.all([
    prisma.secretaria.findMany({
      select: { id: true, nome: true, sigla: true, eixoId: true },
      orderBy: { nome: "asc" },
    }),
    prisma.eixoEstrategico.findMany({
      select: { id: true, nome: true },
      orderBy: { nome: "asc" },
    }),
    prisma.obra.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        titulo: true,
        status: true,
        valorContrato: true,
        eixoId: true,
        eixo: { select: { id: true, nome: true } },
        secretaria: {
          select: {
            id: true,
            nome: true,
            sigla: true,
            eixoId: true,
            eixo: { select: { id: true, nome: true } },
          },
        },
        medicoes: {
          orderBy: { dataVistoria: "desc" },
          take: 1,
          select: { percentualExecutado: true },
        },
      },
    }),
  ]);

  // Garante que uma secretaria de outro eixo nunca seja combinada indevidamente
  const secretariaValida =
    filtroSecretaria &&
    (!filtroEixo ||
      todasSecretarias.some(
        (sec) => sec.id === filtroSecretaria && sec.eixoId === filtroEixo,
      ))
      ? filtroSecretaria
      : undefined;

  const whereCarteira = {
    deletedAt: null,
    ...(secretariaValida ? { secretariaId: secretariaValida } : {}),
    ...(filtroEixo
      ? {
          OR: [
            { eixoId: filtroEixo },
            { secretaria: { eixoId: filtroEixo } },
          ],
        }
      : {}),
  };

  const [obrasDestaque, obrasEmAlerta, obrasAtrasadasLista, carteira] =
    await Promise.all([
      prisma.obra.findMany({
        where: { ...whereCarteira, status: "EM_ANDAMENTO" },
        orderBy: { updatedAt: "desc" },
        take: 6,
        select: {
          id: true,
          titulo: true,
          bairro: true,
          status: true,
          previsaoConclusao: true,
          secretaria: { select: { sigla: true } },
          medicoes: {
            orderBy: { dataVistoria: "desc" },
            take: 1,
            select: { percentualExecutado: true },
          },
        },
      }),
      prisma.obra.findMany({
        where: {
          ...whereCarteira,
          status: { notIn: ["CONCLUIDA", "PARALISADA"] },
          previsaoConclusao: { gte: now, lte: nextAlertLimit },
        },
        orderBy: { previsaoConclusao: "asc" },
        take: 5,
        select: {
          id: true,
          titulo: true,
          bairro: true,
          status: true,
          previsaoConclusao: true,
          secretaria: { select: { sigla: true } },
          medicoes: {
            orderBy: { dataVistoria: "desc" },
            take: 1,
            select: { percentualExecutado: true },
          },
        },
      }),
      prisma.obra.findMany({
        where: {
          ...whereCarteira,
          OR: [
            { status: "PARALISADA" },
            { status: { not: "CONCLUIDA" }, previsaoConclusao: { lt: now } },
          ],
        },
        orderBy: { previsaoConclusao: "asc" },
        take: 5,
        select: {
          id: true,
          titulo: true,
          status: true,
          previsaoConclusao: true,
          bairro: true,
          secretaria: { select: { sigla: true } },
        },
      }),
      prisma.obra.findMany({
        where: whereCarteira,
        select: {
          id: true,
          titulo: true,
          bairro: true,
          status: true,
          valorContrato: true,
          previsaoConclusao: true,
          updatedAt: true,
          eixo: { select: { nome: true } },
          secretaria: { select: { sigla: true } },
          medicoes: {
            orderBy: { dataVistoria: "desc" },
            take: 1,
            select: { percentualExecutado: true },
          },
        },
      }),
    ]);

  const totalObras = carteira.length;
  const statusCounts = Object.fromEntries(
    Object.keys(statusInfo).map((status) => [
      status,
      carteira.filter((obra) => obra.status === status).length,
    ]),
  ) as Record<keyof typeof statusInfo, number>;

  const emAndamento = statusCounts.EM_ANDAMENTO;
  const concluidas = statusCounts.CONCLUIDA;
  const paralisadas = statusCounts.PARALISADA;
  const atrasadas = carteira.filter((obra) => isLate(obra, now)).length;
  const totalAtrasadasOuParalisadas = carteira.filter((obra) =>
    isOverdueOrPaused(obra, now),
  ).length;
  const totalEmAlerta60 = carteira.filter((obra) =>
    isNearDeadline(obra, now),
  ).length;

  const ultimaAtualizacao = carteira.reduce<Date | null>(
    (latest, obra) =>
      !latest || obra.updatedAt > latest ? obra.updatedAt : latest,
    null,
  );

  const investimentoTotal = carteira.reduce(
    (total, obra) => total + Number(obra.valorContrato ?? 0),
    0,
  );

  const obrasInvestimentoSerializadas: ObraInvestimentoItem[] =
    todasObrasInvestimento.map((o) => ({
      id: o.id,
      titulo: o.titulo,
      valorContrato: Number(o.valorContrato ?? 0),
      percentualFisico: progressFor(o.status, o.medicoes[0]),
      eixoId: o.eixo?.id ?? o.secretaria.eixo?.id ?? o.eixoId ?? o.secretaria.eixoId ?? null,
      eixoNome:
        o.eixo?.nome ?? o.secretaria.eixo?.nome ?? "Sem eixo definido",
      secretariaId: o.secretaria.id,
      secretariaSigla: o.secretaria.sigla,
      secretariaNome: o.secretaria.nome,
    }));

  const secretarias = Object.entries(
    carteira.reduce<Record<string, { total: number; atrasadas: number }>>(
      (totals, obra) => {
        const sigla = obra.secretaria.sigla;
        totals[sigla] ??= { total: 0, atrasadas: 0 };
        totals[sigla].total += 1;
        if (isOverdueOrPaused(obra, now)) totals[sigla].atrasadas += 1;
        return totals;
      },
      {},
    ),
  ).sort(
    (first, second) =>
      second[1].atrasadas - first[1].atrasadas ||
      second[1].total - first[1].total,
  );
  const maiorSecretaria = Math.max(
    1,
    ...secretarias.map(([, counts]) => counts.total),
  );

  // Distribuição territorial por Bairro / Distrito
  const bairros = Object.entries(
    carteira.reduce<Record<string, { total: number; valor: number }>>(
      (totals, obra) => {
        const nomeBairro = obra.bairro?.trim() || "Não informado";
        totals[nomeBairro] ??= { total: 0, valor: 0 };
        totals[nomeBairro].total += 1;
        totals[nomeBairro].valor += Number(obra.valorContrato ?? 0);
        return totals;
      },
      {},
    ),
  )
    .sort((a, b) => b[1].total - a[1].total || b[1].valor - a[1].valor)
    .slice(0, 5);
  const maiorBairro = Math.max(1, ...bairros.map(([, data]) => data.total));

  return (
    <div className={styles.shell}>
      <Sidebar user={{ name, role }} />
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
            <Link
              className={`${styles.navItem} ${styles.navItemActive}`}
              href="/area-do-prefeito"
            >
              <TrendingUp size={16} aria-hidden="true" />
              Painel de gestão
            </Link>
            <Link
              className={styles.navItem}
              href="/area-do-prefeito/status-obras"
            >
              <ClipboardList size={16} aria-hidden="true" />
              Status de Obras
            </Link>
          </nav>
          <SidebarSettingsFooter
            user={{ name, role }}
            className="max-[760px]:hidden"
          />
        </aside>

        <main className={styles.dashboard}>
          <header className={styles.heading}>
            <div>
              <p className={styles.eyebrow}>
                {dashboardDateFormat.format(now).toLocaleUpperCase("pt-BR")}
              </p>
              <h1>
                {greetingFor(now)}, {firstName}
              </h1>
              <p className={styles.updated}>
                <span />
                {ultimaAtualizacao
                  ? `Última atualização de obra em ${updatedFormat.format(ultimaAtualizacao)}`
                  : "Nenhuma obra cadastrada"}
              </p>
            </div>
            <p className={styles.slogan}>
              Mais infraestrutura.
              <br />
              Uma Goiana melhor.
            </p>
          </header>

          <PrefeitoFiltros
            secretarias={todasSecretarias}
            eixos={todosEixos}
            filtroSecretaria={secretariaValida}
            filtroEixo={filtroEixo}
          />

          <section className={styles.metrics} aria-label="Indicadores de gestão">
            <article className={styles.metric}>
              <span className={`${styles.metricIcon} ${styles.blue}`}>
                <CircleDollarSign size={19} />
              </span>
              <div>
                <small>Carteira total</small>
                <strong>{currency.format(investimentoTotal)}</strong>
                <span>{totalObras} obras cadastradas</span>
              </div>
            </article>

            <article className={styles.metric}>
              <span className={`${styles.metricIcon} ${styles.green}`}>
                <PlayCircle size={19} />
              </span>
              <div>
                <small>Em andamento</small>
                <strong>{emAndamento}</strong>
                <span>{percent(emAndamento, totalObras)}% da carteira</span>
              </div>
            </article>

            <article className={styles.metric}>
              <span className={`${styles.metricIcon} ${styles.cyan}`}>
                <CheckCircle2 size={19} />
              </span>
              <div>
                <small>Concluídas</small>
                <strong>{concluidas}</strong>
                <span>{percent(concluidas, totalObras)}% da carteira</span>
              </div>
            </article>

            <article className={styles.metric}>
              <span className={`${styles.metricIcon} ${styles.red}`}>
                <Clock3 size={19} />
              </span>
              <div>
                <small>Obras Atrasadas</small>
                <strong>{atrasadas}</strong>
                <span>
                  {paralisadas > 0
                    ? `${paralisadas} paralisada(s) na carteira`
                    : `${percent(atrasadas, totalObras)}% com prazo vencido`}
                </span>
              </div>
            </article>

            <article className={styles.metric}>
              <span className={`${styles.metricIcon} ${styles.amber}`}>
                <AlertTriangle size={19} />
              </span>
              <div>
                <small>Obras em Alerta</small>
                <strong>{totalEmAlerta60}</strong>
                <span>Prazo final em até {ALERTA_PRAZO_DIAS} dias</span>
              </div>
            </article>
          </section>

          <div className={styles.dashboardGrid}>
            <section className={styles.panel}>
              <div className={styles.panelHeading}>
                <div>
                  <h2>Obras em destaque</h2>
                  <p>Acompanhamento das principais frentes em andamento</p>
                </div>
                <Link href="/area-do-prefeito/status-obras">
                  Ver todas <ArrowUpRight size={14} />
                </Link>
              </div>
              {obrasDestaque.length ? (
                <div className={styles.featuredList}>
                  {obrasDestaque.map((obra) => {
                    const progress = progressFor(obra.status, obra.medicoes[0]);
                    const health = workHealth(obra, progress, now);
                    return (
                      <Link
                        className={styles.featuredRow}
                        href={`/area-do-servidor/obras/${obra.id}`}
                        key={obra.id}
                      >
                        <span
                          className={`${styles.workDot} ${health.dotClass}`}
                        />
                        <span className={styles.workTitle}>
                          <strong>{obra.titulo}</strong>
                          <small>
                            {obra.secretaria.sigla} · {obra.bairro}
                          </small>
                        </span>
                        <span
                          className={`${styles.statusPill} ${health.pillClass}`}
                        >
                          {health.label}
                        </span>
                        <span className={styles.progress}>
                          <i>
                            <i style={{ width: `${progress}%` }} />
                          </i>
                          <b>{Math.round(progress)}%</b>
                        </span>
                        <ArrowUpRight className={styles.rowArrow} size={14} />
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className={styles.empty}>
                  Ainda não há obras em andamento com os filtros selecionados.
                </p>
              )}
            </section>

            <section className={`${styles.panel} ${styles.riskPanel}`}>
              <div className={styles.panelHeading}>
                <div>
                  <h2>
                    <Clock3 size={16} /> Obras Atrasadas
                  </h2>
                  <p>Obras que já estouraram o prazo final ou estão paralisadas</p>
                </div>
                <span className={styles.riskCount}>
                  {totalAtrasadasOuParalisadas}
                </span>
              </div>
              {obrasAtrasadasLista.length ? (
                <div className={styles.compactList}>
                  {obrasAtrasadasLista.map((obra) => {
                    const days = delayDays(obra.previsaoConclusao, now);
                    return (
                      <Link
                        href={`/area-do-servidor/obras/${obra.id}`}
                        className={styles.riskRow}
                        key={obra.id}
                      >
                        <span className={styles.riskMark}>
                          <Clock3 size={14} />
                        </span>
                        <span>
                          <strong>{obra.titulo}</strong>
                          <small>
                            {obra.secretaria.sigla} · {obra.bairro}
                            {obra.previsaoConclusao
                              ? ` · Prazo era ${dateFormat.format(obra.previsaoConclusao)}`
                              : ""}
                          </small>
                        </span>
                        <b className={styles.riskBadgeNegative}>
                          {obra.status === "PARALISADA"
                            ? "Paralisada"
                            : `-${days}d`}
                        </b>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className={styles.empty}>
                  Nenhuma obra com prazo estourado ou paralisada.
                </p>
              )}
            </section>

            <section className={`${styles.panel} ${styles.alertPanel}`}>
              <div className={styles.panelHeading}>
                <div>
                  <h2>
                    <AlertTriangle size={16} /> Obras em Alerta
                  </h2>
                  <p>
                    Próximas do prazo final de entrega (vencimento em até{" "}
                    {ALERTA_PRAZO_DIAS} dias)
                  </p>
                </div>
                <span className={styles.alertCount}>{totalEmAlerta60}</span>
              </div>
              {obrasEmAlerta.length ? (
                <div className={styles.compactList}>
                  {obrasEmAlerta.map((obra) => {
                    const daysLeft =
                      daysUntilDeadline(obra.previsaoConclusao, now) ?? 0;
                    const progress = progressFor(obra.status, obra.medicoes[0]);
                    return (
                      <Link
                        href={`/area-do-servidor/obras/${obra.id}`}
                        className={styles.riskRow}
                        key={obra.id}
                      >
                        <span className={styles.alertMark}>
                          <CalendarDays size={14} />
                        </span>
                        <span>
                          <strong>{obra.titulo}</strong>
                          <small>
                            {obra.secretaria.sigla} · {obra.bairro} · Entrega:{" "}
                            {obra.previsaoConclusao
                              ? dateFormat.format(obra.previsaoConclusao)
                              : "Sem data"}{" "}
                            ({Math.round(progress)}% concluído)
                          </small>
                        </span>
                        <b className={styles.alertBadgeWarning}>
                          {daysLeft === 0 ? "Vence hoje" : `Faltam ${daysLeft}d`}
                        </b>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className={styles.empty}>
                  Nenhuma obra com prazo vencendo nos próximos{" "}
                  {ALERTA_PRAZO_DIAS} dias.
                </p>
              )}
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeading}>
                <div>
                  <h2>
                    <Building2 size={16} /> Obras por secretaria
                  </h2>
                  <p>Total da carteira e obras atrasadas</p>
                </div>
              </div>
              <div className={styles.axisList}>
                {secretarias.length ? (
                  secretarias.map(([sigla, counts]) => (
                    <div className={styles.secretariaRow} key={sigla}>
                      <span className={styles.axisName}>{sigla}</span>
                      <i>
                        <i
                          style={{
                            width: `${(counts.total / maiorSecretaria) * 100}%`,
                          }}
                        />
                      </i>
                      <b>{counts.total}</b>
                      <em
                        className={
                          counts.atrasadas ? styles.riskBadge : styles.noRisk
                        }
                      >
                        {counts.atrasadas} atrasada(s)
                      </em>
                    </div>
                  ))
                ) : (
                  <p className={styles.empty}>Nenhuma obra cadastrada.</p>
                )}
              </div>
            </section>

            <InvestimentoPainel
              obras={obrasInvestimentoSerializadas}
              eixos={todosEixos}
              secretarias={todasSecretarias}
              initialEixoId={filtroEixo}
              initialSecretariaId={secretariaValida}
            />

            <section className={styles.panel}>
              <div className={styles.panelHeading}>
                <div>
                  <h2>
                    <MapPinned size={16} /> Obras por bairro e distrito
                  </h2>
                  <p>Regiões com mais frentes cadastradas</p>
                </div>
              </div>
              <div className={styles.axisList}>
                {bairros.length ? (
                  bairros.map(([bairroNome, data]) => (
                    <div className={styles.secretariaRow} key={bairroNome}>
                      <span className={styles.axisName}>{bairroNome}</span>
                      <i>
                        <i
                          style={{
                            width: `${(data.total / maiorBairro) * 100}%`,
                          }}
                        />
                      </i>
                      <b>{data.total}</b>
                      <em className={styles.noRisk}>
                        {currency.format(data.valor)}
                      </em>
                    </div>
                  ))
                ) : (
                  <p className={styles.empty}>Nenhum bairro cadastrado.</p>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}