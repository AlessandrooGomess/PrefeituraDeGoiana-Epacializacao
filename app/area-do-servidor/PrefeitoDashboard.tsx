import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  MapPinned,
  PauseCircle,
  PlayCircle,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/sidebar/Sidebar";
import DashboardMap from "./DashboardMap";
import styles from "./prefeito-dashboard.module.css";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 1,
  notation: "compact",
});

const fullCurrency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const dateFormat = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dashboardDateFormat = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

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

export default async function PrefeitoDashboard({ name }: { name: string }) {
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setDate(nextMonth.getDate() + 30);
  const firstName = name.trim().split(/\s+/)[0] || "Prefeito";

  const [
    totalObras,
    emAndamento,
    concluidas,
    paralisadas,
    atrasadas,
    proximasEntregas,
    investimento,
    obrasDestaque,
    entregas,
    totalEmRisco,
    riscos,
    obrasPorEixo,
  ] = await Promise.all([
    prisma.obra.count({ where: { deletedAt: null } }),
    prisma.obra.count({ where: { deletedAt: null, status: "EM_ANDAMENTO" } }),
    prisma.obra.count({ where: { deletedAt: null, status: "CONCLUIDA" } }),
    prisma.obra.count({ where: { deletedAt: null, status: "PARALISADA" } }),
    prisma.obra.count({
      where: {
        deletedAt: null,
        status: { not: "CONCLUIDA" },
        previsaoConclusao: { lt: now },
      },
    }),
    prisma.obra.count({
      where: {
        deletedAt: null,
        status: { not: "CONCLUIDA" },
        previsaoConclusao: { gte: now, lte: nextMonth },
      },
    }),
    prisma.obra.aggregate({
      where: { deletedAt: null },
      _sum: { valorContrato: true },
    }),
    prisma.obra.findMany({
      where: { deletedAt: null, status: "EM_ANDAMENTO" },
      orderBy: { updatedAt: "desc" },
      take: 4,
      select: {
        id: true,
        titulo: true,
        bairro: true,
        status: true,
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
        deletedAt: null,
        status: { not: "CONCLUIDA" },
        previsaoConclusao: { gte: now },
      },
      orderBy: { previsaoConclusao: "asc" },
      take: 3,
      select: {
        id: true,
        titulo: true,
        previsaoConclusao: true,
        secretaria: { select: { sigla: true } },
      },
    }),
    prisma.obra.count({
      where: {
        deletedAt: null,
        OR: [
          { status: "PARALISADA" },
          { status: { not: "CONCLUIDA" }, previsaoConclusao: { lt: now } },
        ],
      },
    }),
    prisma.obra.findMany({
      where: {
        deletedAt: null,
        OR: [
          { status: "PARALISADA" },
          { status: { not: "CONCLUIDA" }, previsaoConclusao: { lt: now } },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: 3,
      select: {
        id: true,
        titulo: true,
        status: true,
        previsaoConclusao: true,
        secretaria: { select: { sigla: true } },
      },
    }),
    prisma.obra.findMany({
      where: { deletedAt: null },
      select: {
        status: true,
        valorContrato: true,
        eixo: { select: { nome: true } },
      },
    }),
  ]);

  const investimentoTotal = Number(investimento._sum.valorContrato ?? 0);
  const eixoInvestimento = obrasPorEixo.reduce<Record<string, number>>((totals, obra) => {
    const eixo = obra.eixo?.nome ?? "Sem eixo definido";
    totals[eixo] = (totals[eixo] ?? 0) + Number(obra.valorContrato ?? 0);
    return totals;
  }, {});
  const eixosOrdenados = Object.entries(eixoInvestimento)
    .sort((first, second) => second[1] - first[1])
    .slice(0, 3);
  const maiorEixo = Math.max(1, ...eixosOrdenados.map(([, value]) => value));
  const concluidasPercentual = totalObras
    ? Math.round((concluidas / totalObras) * 100)
    : 0;
  const statusCounts = [
    ["PLANEJADA", obrasPorEixo.filter((obra) => obra.status === "PLANEJADA").length],
    ["ORDEM_EMITIDA", obrasPorEixo.filter((obra) => obra.status === "ORDEM_EMITIDA").length],
    ["EM_ANDAMENTO", emAndamento],
    ["PARALISADA", paralisadas],
    ["CONCLUIDA", concluidas],
  ] as const;

  return (
    <div className={styles.shell}>
      <Sidebar user={{ name, role: "GESTAO" }} />
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
            <Link className={`${styles.navItem} ${styles.navItemActive}`} href="/area-do-servidor">
              <TrendingUp size={16} aria-hidden="true" />
              Painel de gestão
            </Link>
            <Link className={styles.navItem} href="/area-do-servidor/obras">
              <MapPinned size={16} aria-hidden="true" />
              Obras
            </Link>
            <Link className={styles.navItem} href="/">
              <MapPinned size={16} aria-hidden="true" />
              Mapa
            </Link>
            <Link className={styles.navItem} href="/area-do-servidor/nova-obra">
              <CalendarDays size={16} aria-hidden="true" />
              Cadastrar obra
            </Link>
          </nav>
          <div className={styles.sidebarBottom}>
            <span className={styles.navItem}>
              <CheckCircle2 size={16} aria-hidden="true" />
              Dados atualizados
            </span>
          </div>
        </aside>

        <main className={styles.dashboard}>
          <header className={styles.heading}>
            <div>
              <p className={styles.eyebrow}>{dashboardDateFormat.format(now).toLocaleUpperCase("pt-BR")}</p>
              <h1>Bom dia, {firstName}</h1>
              <p className={styles.updated}><span /> Dados atualizados agora</p>
            </div>
            <Link className={styles.allWorks} href="/area-do-servidor/obras">
              Mais infraestrutura.<br />Uma Goiana melhor.
            </Link>
          </header>

          <section className={styles.metrics} aria-label="Indicadores de gestão">
            <article className={styles.metric}>
              <span className={`${styles.metricIcon} ${styles.blue}`}><CircleDollarSign size={19} /></span>
              <div><small>Investimento total</small><strong>{currency.format(investimentoTotal)}</strong><span>{totalObras} obras cadastradas</span></div>
            </article>
            <article className={styles.metric}>
              <span className={`${styles.metricIcon} ${styles.green}`}><PlayCircle size={19} /></span>
              <div><small>Em andamento</small><strong>{emAndamento}</strong><span>{totalObras ? Math.round((emAndamento / totalObras) * 100) : 0}% da carteira</span></div>
            </article>
            <article className={styles.metric}>
              <span className={`${styles.metricIcon} ${styles.red}`}><AlertTriangle size={19} /></span>
              <div><small>Atrasadas</small><strong>{atrasadas}</strong><span>{totalObras ? Math.round((atrasadas / totalObras) * 100) : 0}% da carteira</span></div>
            </article>
            <article className={styles.metric}>
              <span className={`${styles.metricIcon} ${styles.cyan}`}><CalendarDays size={19} /></span>
              <div><small>Entregas nos próximos 30 dias</small><strong>{proximasEntregas}</strong><span>Previsões cadastradas</span></div>
            </article>
          </section>

          <section className={styles.statusSummary} aria-label="Resumo por situação">
            <div className={styles.statusTrack}>
              <span><CheckCircle2 size={13} /> Concluídas <b>{concluidas} ({concluidasPercentual}%)</b></span>
              <i><i style={{ width: `${concluidasPercentual}%` }} /></i>
            </div>
            <div className={styles.statusTrack}>
              <span><PauseCircle size={13} /> Paralisadas <b>{paralisadas} ({totalObras ? Math.round((paralisadas / totalObras) * 100) : 0}%)</b></span>
              <i><i className={styles.pausedProgress} style={{ width: `${totalObras ? (paralisadas / totalObras) * 100 : 0}%` }} /></i>
            </div>
          </section>

          <div className={styles.primaryGrid}>
            <section className={styles.panel}>
              <div className={styles.panelHeading}>
                <div><h2>Obras em destaque</h2><p>Acompanhamento das frentes em execução</p></div>
                <Link href="/area-do-servidor/obras">Ver todas <ArrowUpRight size={14} /></Link>
              </div>
              {obrasDestaque.length ? (
                <div className={styles.featuredList}>
                  {obrasDestaque.map((obra) => {
                    const progress = progressFor(obra.status, obra.medicoes[0]);
                    return (
                      <Link className={styles.featuredRow} href={`/area-do-servidor/obras/${obra.id}`} key={obra.id}>
                        <span className={styles.workDot} />
                        <span className={styles.workTitle}><strong>{obra.titulo}</strong><small>{obra.secretaria.sigla} · {obra.bairro}</small></span>
                        <span className={styles.statusPill}>Em andamento</span>
                        <span className={styles.progress}><i><i style={{ width: `${progress}%` }} /></i><b>{progress}%</b></span>
                        <ArrowUpRight className={styles.rowArrow} size={14} />
                      </Link>
                    );
                  })}
                </div>
              ) : <p className={styles.empty}>Ainda não há obras em andamento.</p>}
            </section>

            <section className={`${styles.panel} ${styles.mapPanel}`}>
              <div className={styles.panelHeading}>
                <div><h2><MapPinned size={16} /> Mapa das obras</h2><p>Distribuição no município</p></div>
                <Link href="/">Ver mapa <ArrowUpRight size={14} /></Link>
              </div>
              <div className={styles.mapFrame}><DashboardMap /></div>
              <div className={styles.mapLegend}>
                {statusCounts.map(([status, count]) => {
                  const info = statusInfo[status];
                  return <span key={status}><i style={{ background: info.color }} />{info.label}<b>{count}</b></span>;
                })}
              </div>
            </section>
          </div>

          <div className={styles.secondaryGrid}>
            <section className={styles.panel}>
              <div className={styles.panelHeading}>
                <div><h2><CalendarDays size={16} /> Próximas entregas</h2><p>Previsão de conclusão cadastrada</p></div>
                <span className={styles.headingCount}>{entregas.length}</span>
              </div>
              {entregas.length ? (
                <div className={styles.compactList}>
                  {entregas.map((obra) => (
                    <Link href={`/area-do-servidor/obras/${obra.id}`} className={styles.compactRow} key={obra.id}>
                      <time>{obra.previsaoConclusao ? dateFormat.format(obra.previsaoConclusao) : "Sem data"}</time>
                      <span><strong>{obra.titulo}</strong><small>{obra.secretaria.sigla}</small></span>
                      <ArrowUpRight size={14} />
                    </Link>
                  ))}
                </div>
              ) : <p className={styles.empty}>Nenhuma entrega prevista.</p>}
            </section>

            <section className={`${styles.panel} ${styles.riskPanel}`}>
              <div className={styles.panelHeading}>
                <div><h2><AlertTriangle size={16} /> Obras em risco</h2><p>Atrasadas ou paralisadas</p></div>
                <span className={styles.riskCount}>{totalEmRisco}</span>
              </div>
              {riscos.length ? (
                <div className={styles.compactList}>
                  {riscos.map((obra) => (
                    <Link href={`/area-do-servidor/obras/${obra.id}`} className={styles.riskRow} key={obra.id}>
                      <span className={styles.riskMark}><Clock3 size={14} /></span>
                      <span><strong>{obra.titulo}</strong><small>{obra.secretaria.sigla} · prazo {obra.previsaoConclusao ? dateFormat.format(obra.previsaoConclusao) : "não informado"}</small></span>
                      <b>{obra.status === "PARALISADA" ? "Paralisada" : "Atrasada"}</b>
                    </Link>
                  ))}
                </div>
              ) : <p className={styles.empty}>Nenhuma obra com prazo vencido.</p>}
            </section>

            <section className={`${styles.panel} ${styles.investmentPanel}`}>
              <div className={styles.panelHeading}>
                <div><h2><TrendingUp size={16} /> Investimento por eixo</h2><p>Valores dos contratos ativos</p></div>
              </div>
              <div className={styles.investmentTotal}>{fullCurrency.format(investimentoTotal)}</div>
              <div className={styles.axisList}>
                {eixosOrdenados.length ? eixosOrdenados.map(([axis, value], index) => (
                  <div className={styles.axisRow} key={axis}>
                    <span className={`${styles.axisDot} ${styles[`axis${index}`]}`} />
                    <span className={styles.axisName}>{axis}</span>
                    <i><i style={{ width: `${(value / maiorEixo) * 100}%` }} /></i>
                    <b>{currency.format(value)}</b>
                  </div>
                )) : <p className={styles.empty}>Sem valores de contrato cadastrados.</p>}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}