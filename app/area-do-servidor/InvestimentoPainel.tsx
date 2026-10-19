"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
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

export interface ObraInvestimentoItem {
  id: string;
  titulo: string;
  valorContrato: number;
  percentualFisico: number;
  eixoId: string | null;
  eixoNome: string;
  secretariaId: string;
  secretariaSigla: string;
  secretariaNome: string;
}

interface InvestimentoPainelProps {
  obras: ObraInvestimentoItem[];
  eixos: Array<{ id: string; nome: string }>;
  secretarias: Array<{
    id: string;
    nome: string;
    sigla: string;
    eixoId: string | null;
  }>;
  initialEixoId?: string;
  initialSecretariaId?: string;
}

function percent(part: number, total: number) {
  return total ? Math.round((part / total) * 100) : 0;
}

export default function InvestimentoPainel({
  obras,
  eixos,
  secretarias,
  initialEixoId,
  initialSecretariaId,
}: InvestimentoPainelProps) {
  const [eixoSelecionado, setEixoSelecionado] = useState(initialEixoId ?? "");
  const [secretariaSelecionada, setSecretariaSelecionada] = useState(
    initialSecretariaId ?? "",
  );

  // Sincroniza caso o filtro global do topo mude via navegação
  const [prevInitial, setPrevInitial] = useState({
    eixo: initialEixoId ?? "",
    sec: initialSecretariaId ?? "",
  });
  if (
    prevInitial.eixo !== (initialEixoId ?? "") ||
    prevInitial.sec !== (initialSecretariaId ?? "")
  ) {
    setPrevInitial({
      eixo: initialEixoId ?? "",
      sec: initialSecretariaId ?? "",
    });
    setEixoSelecionado(initialEixoId ?? "");
    setSecretariaSelecionada(initialSecretariaId ?? "");
  }

  const secretariasDoEixo = eixoSelecionado
    ? secretarias.filter((s) => s.eixoId === eixoSelecionado)
    : secretarias;

  const obrasRecorte = obras.filter((obra) => {
    if (secretariaSelecionada) {
      return obra.secretariaId === secretariaSelecionada;
    }
    if (eixoSelecionado) {
      return obra.eixoId === eixoSelecionado;
    }
    return true;
  });

  const investimentoTotal = obrasRecorte.reduce(
    (acc, o) => acc + o.valorContrato,
    0,
  );
  const investimentoExecutado = obrasRecorte.reduce(
    (acc, o) => acc + o.valorContrato * (o.percentualFisico / 100),
    0,
  );

  // Define o agrupamento de acordo com o nível selecionado:
  // 1) Sem eixo -> Agrupa por Eixo Estratégico
  // 2) Com eixo e sem secretaria -> Agrupa pelas Secretarias daquele Eixo
  // 3) Com secretaria -> Lista as Obras daquela Secretaria
  type LinhaInvestimento = {
    key: string;
    label: string;
    valor: number;
  };

  let linhas: LinhaInvestimento[] = [];
  let subtitulo = "Visão completa por eixo estratégico";

  if (secretariaSelecionada) {
    const secAtual = secretarias.find((s) => s.id === secretariaSelecionada);
    subtitulo = secAtual
      ? `Obras de ${secAtual.sigla} - ${secAtual.nome}`
      : "Investimento por obra da secretaria";
    linhas = obrasRecorte
      .map((o) => ({
        key: o.id,
        label: o.titulo,
        valor: o.valorContrato,
      }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 6);
  } else if (eixoSelecionado) {
    const eixoAtual = eixos.find((e) => e.id === eixoSelecionado);
    subtitulo = eixoAtual
      ? `Secretarias do eixo ${eixoAtual.nome}`
      : "Investimento por secretaria do eixo";
    const porSec = new Map<string, { label: string; valor: number }>();
    for (const sec of secretariasDoEixo) {
      porSec.set(sec.id, { label: `${sec.sigla} - ${sec.nome}`, valor: 0 });
    }
    for (const o of obrasRecorte) {
      const atual = porSec.get(o.secretariaId) ?? {
        label: `${o.secretariaSigla} - ${o.secretariaNome}`,
        valor: 0,
      };
      atual.valor += o.valorContrato;
      porSec.set(o.secretariaId, atual);
    }
    linhas = Array.from(porSec.entries())
      .map(([key, item]) => ({ key, label: item.label, valor: item.valor }))
      .filter((item) => item.valor > 0 || secretariasDoEixo.length <= 6)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 6);
  } else {
    const porEixo = new Map<string, { label: string; valor: number }>();
    for (const o of obrasRecorte) {
      const key = o.eixoId ?? "sem-eixo";
      const atual = porEixo.get(key) ?? { label: o.eixoNome, valor: 0 };
      atual.valor += o.valorContrato;
      porEixo.set(key, atual);
    }
    linhas = Array.from(porEixo.entries())
      .map(([key, item]) => ({ key, label: item.label, valor: item.valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);
  }

  const maiorValor = Math.max(1, ...linhas.map((l) => l.valor));

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeading} style={{ flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2>
            <TrendingUp size={16} /> Investimento por eixo e secretaria
          </h2>
          <p>{subtitulo}</p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <select
            aria-label="Filtrar investimento por eixo"
            value={eixoSelecionado}
            onChange={(e) => {
              setEixoSelecionado(e.target.value);
              setSecretariaSelecionada("");
            }}
            className={styles.filterSelect}
            style={{ minHeight: 30, fontSize: 11, padding: "0 24px 0 8px" }}
          >
            <option value="">Todos os Eixos</option>
            {eixos.map((eixo) => (
              <option key={eixo.id} value={eixo.id}>
                {eixo.nome}
              </option>
            ))}
          </select>

          <select
            aria-label="Filtrar investimento por secretaria"
            value={secretariaSelecionada}
            disabled={!eixoSelecionado}
            onChange={(e) => setSecretariaSelecionada(e.target.value)}
            className={styles.filterSelect}
            style={{ minHeight: 30, fontSize: 11, padding: "0 24px 0 8px" }}
          >
            <option value="">
              {eixoSelecionado
                ? "Todas as Secretarias do Eixo"
                : "Selecione um Eixo"}
            </option>
            {secretariasDoEixo.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.sigla} - {sec.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.investmentTotal}>
        {fullCurrency.format(investimentoTotal)}
      </div>
      <p className={styles.executed}>
        {fullCurrency.format(investimentoExecutado)} executados (
        {percent(investimentoExecutado, investimentoTotal)}%, conforme a última
        medição)
      </p>

      <div className={styles.axisList}>
        {linhas.length ? (
          linhas.map((item, index) => (
            <div className={styles.axisRow} key={item.key}>
              <span
                className={`${styles.axisDot} ${styles[`axis${index % 4}`]}`}
              />
              <span className={styles.axisName} title={item.label}>
                {item.label}
              </span>
              <i>
                <i style={{ width: `${(item.valor / maiorValor) * 100}%` }} />
              </i>
              <b>{currency.format(item.valor)}</b>
            </div>
          ))
        ) : (
          <p className={styles.empty}>
            Sem valores de contrato cadastrados para este recorte.
          </p>
        )}
      </div>
    </section>
  );
}

