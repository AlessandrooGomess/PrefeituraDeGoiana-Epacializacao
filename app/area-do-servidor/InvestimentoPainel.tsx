"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, TrendingUp } from "lucide-react";
import styles from "./prefeito-dashboard.module.css";

export interface ObraInvestimentoItem {
  id: string;
  titulo: string;
  valorOrcado: number;
  valorExecutado: number;
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

function percent(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export default function InvestimentoPainel({
  obras,
  eixos,
  secretarias,
  initialEixoId = "",
  initialSecretariaId = "",
}: InvestimentoPainelProps) {
  const [eixoSelecionado, setEixoSelecionado] = useState(initialEixoId);
  const [secretariaSelecionada, setSecretariaSelecionada] =
    useState(initialSecretariaId);
  const [openMenu, setOpenMenu] = useState<"eixo" | "secretaria" | null>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

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

  // Filtra obras conforme seleção local do painel
  const obrasRecorte = obras.filter((obra) => {
    if (eixoSelecionado && obra.eixoId !== eixoSelecionado) return false;
    if (secretariaSelecionada && obra.secretariaId !== secretariaSelecionada)
      return false;
    return true;
  });

  const investimentoTotal = obrasRecorte.reduce(
    (sum, o) => sum + o.valorOrcado,
    0,
  );
  const investimentoExecutado = obrasRecorte.reduce(
    (sum, o) => sum + o.valorExecutado,
    0,
  );

  // Define o agrupamento de acordo com o nível de drill-down:
  // 1) Sem eixo selecionado -> Agrupa por Eixo Temático
  // 2) Com eixo selecionado e sem secretaria -> Agrupa por Secretaria daquele Eixo
  // 3) Com secretaria selecionada -> Lista as principais obras daquela Secretaria
  type LinhaAgrupada = { key: string; label: string; valor: number };
  let linhas: LinhaAgrupada[] = [];
  let subtitulo = "Valores contratados por eixo temático";

  if (secretariaSelecionada) {
    const secObj = secretarias.find((s) => s.id === secretariaSelecionada);
    subtitulo = secObj
      ? `Principais contratos · ${secObj.sigla} (${secObj.nome})`
      : "Principais contratos da secretaria";

    linhas = obrasRecorte
      .filter((o) => o.valorOrcado > 0)
      .sort((a, b) => b.valorOrcado - a.valorOrcado)
      .slice(0, 5)
      .map((o) => ({
        key: o.id,
        label: o.titulo,
        valor: o.valorOrcado,
      }));
  } else if (eixoSelecionado) {
    const eixoObj = eixos.find((e) => e.id === eixoSelecionado);
    subtitulo = eixoObj
      ? `Distribuição por secretaria · ${eixoObj.nome}`
      : "Distribuição por secretaria do eixo";

    const porSecretaria = new Map<string, { label: string; valor: number }>();
    for (const obra of obrasRecorte) {
      const key = obra.secretariaId;
      const atual = porSecretaria.get(key) ?? {
        label: `${obra.secretariaSigla} - ${obra.secretariaNome}`,
        valor: 0,
      };
      atual.valor += obra.valorOrcado;
      porSecretaria.set(key, atual);
    }
    linhas = Array.from(porSecretaria.entries())
      .map(([key, item]) => ({ key, label: item.label, valor: item.valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);
  } else {
    subtitulo = "Valores contratados por eixo temático";
    const porEixo = new Map<string, { label: string; valor: number }>();
    for (const obra of obrasRecorte) {
      const key = obra.eixoId ?? "sem-eixo";
      const atual = porEixo.get(key) ?? {
        label: obra.eixoNome,
        valor: 0,
      };
      atual.valor += obra.valorOrcado;
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
