import { prisma } from "@/lib/prisma";
import styles from "@/app/area-do-servidor/area-do-servidor.module.css";
import ExportRelatoriosButtons, { type ObraExportRow } from "./ExportRelatoriosButtons";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PLANEJADA: "Em planejamento",
  ORDEM_EMITIDA: "Ordem emitida",
  EM_ANDAMENTO: "Em andamento",
  PARALISADA: "Paralisada",
  CONCLUIDA: "Concluída",
};

function formatDateBR(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date);
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default async function RelatoriosAdminPage() {
  const obras = await prisma.obra.findMany({
    where: { deletedAt: null },
    orderBy: [{ secretaria: { nome: "asc" } }, { titulo: "asc" }],
    include: {
      secretaria: { select: { id: true, nome: true, sigla: true } },
      eixo: { select: { nome: true } },
      areaTematica: { select: { nome: true } },
      tipoObra: { select: { nome: true } },
      engenheiro: { select: { nome: true } },
      medicoes: {
        orderBy: { dataVistoria: "desc" },
        take: 1,
        select: { percentualExecutado: true },
      },
    },
  });

  const exportRows: ObraExportRow[] = obras.map((o) => ({
    id: o.id,
    titulo: o.titulo,
    status: STATUS_LABEL[o.status] ?? o.status,
    percentualFisico: o.medicoes[0]
      ? Number(o.medicoes[0].percentualExecutado)
      : o.status === "CONCLUIDA"
        ? 100
        : 0,
    secretariaNome: o.secretaria.nome,
    secretariaSigla: o.secretaria.sigla,
    eixoNome: o.eixo?.nome ?? "",
    areaTematicaNome: o.areaTematica?.nome ?? "",
    tipoObraNome: o.tipoObra?.nome ?? "",
    bairro: o.bairro,
    endereco: o.endereco,
    latitude: o.latitude,
    longitude: o.longitude,
    valorContrato: o.valorContrato !== null ? Number(o.valorContrato) : null,
    empresaContratada: o.empresaContratada ?? "",
    numeroOrdemServico: o.numeroOrdemServico ?? "",
    dataOrdemServico: formatDateBR(o.dataOrdemServico),
    previsaoConclusao: formatDateBR(o.previsaoConclusao),
    dataConclusaoReal: formatDateBR(o.dataConclusaoReal),
    engenheiroNome: o.engenheiro?.nome ?? "",
  }));

  const investimentoTotal = exportRows.reduce(
    (acc, r) => acc + (r.valorContrato ?? 0),
    0,
  );
  const concluidas = obras.filter((o) => o.status === "CONCLUIDA").length;
  const emAndamento = obras.filter((o) => o.status === "EM_ANDAMENTO").length;
  const paralisadas = obras.filter((o) => o.status === "PARALISADA").length;

  const porSecretariaMap = new Map<
    string,
    {
      sigla: string;
      nome: string;
      total: number;
      concluidas: number;
      emAndamento: number;
      paralisadas: number;
      valorTotal: number;
    }
  >();

  for (const obra of obras) {
    const key = obra.secretaria.id;
    const item = porSecretariaMap.get(key) ?? {
      sigla: obra.secretaria.sigla,
      nome: obra.secretaria.nome,
      total: 0,
      concluidas: 0,
      emAndamento: 0,
      paralisadas: 0,
      valorTotal: 0,
    };
    item.total += 1;
    if (obra.status === "CONCLUIDA") item.concluidas += 1;
    if (obra.status === "EM_ANDAMENTO") item.emAndamento += 1;
    if (obra.status === "PARALISADA") item.paralisadas += 1;
    item.valorTotal += obra.valorContrato !== null ? Number(obra.valorContrato) : 0;
    porSecretariaMap.set(key, item);
  }

  const resumoSecretarias = Array.from(porSecretariaMap.values());

  return (
    <main className={styles.main}>
      <div className={styles.pageHeading}>
        <div>
          <div className={styles.breadcrumb}>
            Administração Geral <span>/</span> Relatórios
          </div>
          <h1 className={styles.pageTitle}>Relatórios e Exportação</h1>
          <p>Emissão de relatórios gerenciais e exportação de dados consolidados.</p>
        </div>
      </div>

      <section className={styles.metrics} aria-label="Resumo para exportação">
        <div className={styles.metric}>
          <span>Obras Ativas</span>
          <strong>{obras.length}</strong>
        </div>
        <div className={styles.metric}>
          <span>Em Andamento / Concluídas</span>
          <strong>
            {emAndamento} / {concluidas}
          </strong>
        </div>
        <div className={styles.metric}>
          <span>Paralisadas</span>
          <strong>{paralisadas}</strong>
        </div>
        <div className={styles.metric}>
          <span>Volume Contratado</span>
          <strong style={{ fontSize: 20 }}>{formatBRL(investimentoTotal)}</strong>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeading}>
          <div>
            <h2>Exportar base de Obras</h2>
            <p>Baixe uma planilha completa (CSV compatível com Excel) ou o JSON da API com as {obras.length} obras ativas.</p>
          </div>
        </div>

        <div style={{ paddingTop: 10 }}>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>
            A exportação contém todos os dados técnicos: status, avanço físico, valores de contrato, datas, endereço, coordenadas, eixo estratégico, área temática, engenheiro fiscal e secretaria responsável.
          </p>
          <ExportRelatoriosButtons obras={exportRows} />
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeading}>
          <div>
            <h2>Consolidado por Secretaria</h2>
            <p>Distribuição de obras e volume financeiro contratado por órgão municipal</p>
          </div>
        </div>

        {resumoSecretarias.length ? (
          <div className={styles.workList}>
            {resumoSecretarias.map((sec) => (
              <article className={styles.workRow} key={sec.sigla}>
                <div>
                  <strong>
                    {sec.sigla} - {sec.nome}
                  </strong>
                  <span>Volume contratado: {formatBRL(sec.valorTotal)}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <span className={styles.statusTag}>Total: {sec.total}</span>
                  <span
                    className={styles.statusTag}
                    style={{ background: "#eff6ff", color: "#1d4ed8" }}
                  >
                    Em andamento: {sec.emAndamento}
                  </span>
                  <span
                    className={styles.statusTag}
                    style={{ background: "#dcfce7", color: "#15803d" }}
                  >
                    Concluídas: {sec.concluidas}
                  </span>
                  {sec.paralisadas > 0 && (
                    <span
                      className={styles.statusTag}
                      style={{ background: "#fee2e2", color: "#b91c1c" }}
                    >
                      Paralisadas: {sec.paralisadas}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>Nenhuma obra ativa para consolidar.</p>
        )}
      </section>
    </main>
  );
}

