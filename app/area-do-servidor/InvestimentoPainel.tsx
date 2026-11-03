"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, TrendingUp } from "lucide-react";
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
  const [openMenu, setOpenMenu] = useState<"eixo" | "secretaria" | null>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        controlsRef.current &&
        !controlsRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const eixoAtualLabel =
    eixos.find((eixo) => eixo.id === eixoSelecionado)?.nome || "Todos os Eixos";

  const secretariaPadraoLabel = eixoSelecionado
    ? "Todas as Secretarias do Eixo"
    : "Selecione um Eixo";

  const secAtual = secretariasDoEixo.find(
    (sec) => sec.id === secretariaSelecionada,
  );
  const secretariaAtualLabel = secAtual
    ? `${secAtual.sigla} - ${secAtual.nome}`
    : secretariaPadraoLabel;

  return (
    <section className={styles.panel}>
      <div className={`${styles.panelHeading} ${styles.investHeading}`}>
        <div>
          <h2>
            <TrendingUp size={16} /> Investimento por eixo e secretaria
          </h2>
          <p>{subtitulo}</p>
        </div>
        <div className={styles.investControls} ref={controlsRef}>
          <select
            aria-label="Filtrar investimento por eixo"
            value={eixoSelecionado}
            onChange={(e) => {
              setEixoSelecionado(e.target.value);
              setSecretariaSelecionada("");
            }}
            className={`${styles.filterSelect} ${styles.desktopSelect}`}
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
            className={`${styles.filterSelect} ${styles.desktopSelect}`}
            style={{ minHeight: 30, fontSize: 11, padding: "0 24px 0 8px" }}
          >
            <option value="">{secretariaPadraoLabel}</option>
            {secretariasDoEixo.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.sigla} - {sec.nome}
              </option>
            ))}
          </select>

          <div className={styles.mobileDropdown}>
            <button
              type="button"
              className={styles.mobileDropdownTrigger}
              aria-expanded={openMenu === "eixo"}
              onClick={() =>
                setOpenMenu((prev) => (prev === "eixo" ? null : "eixo"))
              }
            >
              <span className={styles.mobileDropdownLabel}>
                {eixoAtualLabel}
              </span>
              <ChevronDown
                size={15}
                className={`${styles.mobileDropdownChevron} ${
                  openMenu === "eixo" ? styles.mobileDropdownChevronOpen : ""
                }`}
                aria-hidden="true"
              />
            </button>
            {openMenu === "eixo" && (
              <ul className={styles.mobileDropdownMenu} role="listbox">
                <li>
                  <button
                    type="button"
                    role="option"
                    aria-selected={!eixoSelecionado}
                    className={`${styles.mobileDropdownOption} ${
                      !eixoSelecionado ? styles.mobileDropdownOptionActive : ""
                    }`}
                    onClick={() => {
                      setEixoSelecionado("");
                      setSecretariaSelecionada("");
                      setOpenMenu(null);
                    }}
                  >
                    Todos os Eixos
                  </button>
                </li>
                {eixos.map((eixo) => (
                  <li key={eixo.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={eixoSelecionado === eixo.id}
                      className={`${styles.mobileDropdownOption} ${
                        eixoSelecionado === eixo.id
                          ? styles.mobileDropdownOptionActive
                          : ""
                      }`}
                      onClick={() => {
                        setEixoSelecionado(eixo.id);
                        setSecretariaSelecionada("");
                        setOpenMenu(null);
                      }}
                    >
                      {eixo.nome}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.mobileDropdown}>
            <button
              type="button"
              className={styles.mobileDropdownTrigger}
              disabled={!eixoSelecionado}
              aria-expanded={openMenu === "secretaria"}
              onClick={() =>
                setOpenMenu((prev) =>
                  prev === "secretaria" ? null : "secretaria",
                )
              }
            >
              <span className={styles.mobileDropdownLabel}>
                {secretariaAtualLabel}
              </span>
              <ChevronDown
                size={15}
                className={`${styles.mobileDropdownChevron} ${
                  openMenu === "secretaria"
                    ? styles.mobileDropdownChevronOpen
                    : ""
                }`}
                aria-hidden="true"
              />
            </button>
            {openMenu === "secretaria" && eixoSelecionado && (
              <ul className={styles.mobileDropdownMenu} role="listbox">
                <li>
                  <button
                    type="button"
                    role="option"
                    aria-selected={!secretariaSelecionada}
                    className={`${styles.mobileDropdownOption} ${
                      !secretariaSelecionada
                        ? styles.mobileDropdownOptionActive
                        : ""
                    }`}
                    onClick={() => {
                      setSecretariaSelecionada("");
                      setOpenMenu(null);
                    }}
                  >
                    {secretariaPadraoLabel}
                  </button>
                </li>
                {secretariasDoEixo.map((sec) => (
                  <li key={sec.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={secretariaSelecionada === sec.id}
                      className={`${styles.mobileDropdownOption} ${
                        secretariaSelecionada === sec.id
                          ? styles.mobileDropdownOptionActive
                          : ""
                      }`}
                      onClick={() => {
                        setSecretariaSelecionada(sec.id);
                        setOpenMenu(null);
                      }}
                    >
                      <strong>{sec.sigla}</strong> - {sec.nome}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
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
