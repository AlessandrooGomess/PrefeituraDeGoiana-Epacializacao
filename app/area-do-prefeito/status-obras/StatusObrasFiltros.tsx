"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import pageStyles from "./status-obras.module.css";

interface StatusObrasFiltrosProps {
  defaultQuery?: string;
  selectedEixo: string;
  selectedSecretaria: string;
  selectedStatus: string;
  eixos: Array<{ id: string; nome: string }>;
  secretarias: Array<{
    id: string;
    nome: string;
    sigla: string;
    eixoId: string | null;
  }>;
  statusOptions: Array<{ value: string; label: string }>;
  alertaPrazoDias: number;
}

export default function StatusObrasFiltros({
  defaultQuery = "",
  selectedEixo,
  selectedSecretaria,
  selectedStatus,
  eixos,
  secretarias,
  statusOptions,
  alertaPrazoDias,
}: StatusObrasFiltrosProps) {
  const [eixo, setEixo] = useState(selectedEixo);
  const [secretaria, setSecretaria] = useState(selectedSecretaria);
  const [status, setStatus] = useState(selectedStatus);
  const [openMenu, setOpenMenu] = useState<
    "eixo" | "secretaria" | "status" | null
  >(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setEixo(selectedEixo);
  }, [selectedEixo]);

  useEffect(() => {
    setSecretaria(selectedSecretaria);
  }, [selectedSecretaria]);

  useEffect(() => {
    setStatus(selectedStatus);
  }, [selectedStatus]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const secretariasDoEixo = eixo
    ? secretarias.filter((sec) => sec.eixoId === eixo)
    : secretarias;

  const handleEixoSelect = (novoEixo: string) => {
    setEixo(novoEixo);
    if (
      novoEixo &&
      secretaria &&
      !secretarias.some((s) => s.id === secretaria && s.eixoId === novoEixo)
    ) {
      setSecretaria("");
    }
    setOpenMenu(null);
  };

  const handleSecretariaSelect = (novaSecretaria: string) => {
    setSecretaria(novaSecretaria);
    setOpenMenu(null);
  };

  const handleStatusSelect = (novoStatus: string) => {
    setStatus(novoStatus);
    setOpenMenu(null);
  };

  const eixoLabel =
    eixos.find((item) => item.id === eixo)?.nome || "Todos os eixos";

  const secretariaPadraoLabel = eixo
    ? "Secretarias deste eixo"
    : "Todas as secretarias";

  const secAtual = secretariasDoEixo.find((item) => item.id === secretaria);
  const secretariaLabel = secAtual
    ? `${secAtual.sigla} - ${secAtual.nome}`
    : secretariaPadraoLabel;

  const allStatusItems = [
    { value: "TODOS", label: "Todos os status" },
    { value: "ATRASADA", label: "Atrasadas / Paralisadas" },
    { value: "ALERTA", label: `Em alerta (até ${alertaPrazoDias} dias)` },
    ...statusOptions,
  ];

  const statusLabel =
    allStatusItems.find((item) => item.value === status)?.label ||
    "Todos os status";

  return (
    <form
      ref={formRef}
      className={pageStyles.filters}
      action="/area-do-prefeito/status-obras"
    >
      <label className={pageStyles.searchField}>
        <span>Buscar obra</span>
        <input
          type="search"
          name="q"
          defaultValue={defaultQuery}
          placeholder="Título, bairro, endereço ou secretaria"
        />
      </label>

      <div className={pageStyles.filterField}>
        <label htmlFor="status-filtro-eixo" className={pageStyles.fieldLabel}>
          Eixo temático
        </label>
        <select
          id="status-filtro-eixo"
          name="eixo"
          value={eixo}
          onChange={(e) => handleEixoSelect(e.target.value)}
          className={pageStyles.desktopSelect}
        >
          <option value="">Todos os eixos</option>
          {eixos.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nome}
            </option>
          ))}
        </select>

        <div className={pageStyles.mobileDropdown}>
          <button
            type="button"
            className={pageStyles.mobileDropdownTrigger}
            aria-expanded={openMenu === "eixo"}
            onClick={() =>
              setOpenMenu((prev) => (prev === "eixo" ? null : "eixo"))
            }
          >
            <span className={pageStyles.mobileDropdownLabel}>{eixoLabel}</span>
            <ChevronDown
              size={15}
              className={`${pageStyles.mobileDropdownChevron} ${
                openMenu === "eixo" ? pageStyles.mobileDropdownChevronOpen : ""
              }`}
              aria-hidden="true"
            />
          </button>
          {openMenu === "eixo" && (
            <ul className={pageStyles.mobileDropdownMenu} role="listbox">
              <li>
                <button
                  type="button"
                  role="option"
                  aria-selected={!eixo}
                  className={`${pageStyles.mobileDropdownOption} ${
                    !eixo ? pageStyles.mobileDropdownOptionActive : ""
                  }`}
                  onClick={() => handleEixoSelect("")}
                >
                  Todos os eixos
                </button>
              </li>
              {eixos.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={eixo === item.id}
                    className={`${pageStyles.mobileDropdownOption} ${
                      eixo === item.id
                        ? pageStyles.mobileDropdownOptionActive
                        : ""
                    }`}
                    onClick={() => handleEixoSelect(item.id)}
                  >
                    {item.nome}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className={pageStyles.filterField}>
        <label
          htmlFor="status-filtro-secretaria"
          className={pageStyles.fieldLabel}
        >
          Secretaria
        </label>
        <select
          id="status-filtro-secretaria"
          name="secretaria"
          value={secretaria}
          onChange={(e) => handleSecretariaSelect(e.target.value)}
          className={pageStyles.desktopSelect}
        >
          <option value="">{secretariaPadraoLabel}</option>
          {secretariasDoEixo.map((sec) => (
            <option key={sec.id} value={sec.id}>
              {sec.sigla} - {sec.nome}
            </option>
          ))}
        </select>

        <div className={pageStyles.mobileDropdown}>
          <button
            type="button"
            className={pageStyles.mobileDropdownTrigger}
            aria-expanded={openMenu === "secretaria"}
            onClick={() =>
              setOpenMenu((prev) =>
                prev === "secretaria" ? null : "secretaria",
              )
            }
          >
            <span className={pageStyles.mobileDropdownLabel}>
              {secretariaLabel}
            </span>
            <ChevronDown
              size={15}
              className={`${pageStyles.mobileDropdownChevron} ${
                openMenu === "secretaria"
                  ? pageStyles.mobileDropdownChevronOpen
                  : ""
              }`}
              aria-hidden="true"
            />
          </button>
          {openMenu === "secretaria" && (
            <ul className={pageStyles.mobileDropdownMenu} role="listbox">
              <li>
                <button
                  type="button"
                  role="option"
                  aria-selected={!secretaria}
                  className={`${pageStyles.mobileDropdownOption} ${
                    !secretaria ? pageStyles.mobileDropdownOptionActive : ""
                  }`}
                  onClick={() => handleSecretariaSelect("")}
                >
                  {secretariaPadraoLabel}
                </button>
              </li>
              {secretariasDoEixo.map((sec) => (
                <li key={sec.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={secretaria === sec.id}
                    className={`${pageStyles.mobileDropdownOption} ${
                      secretaria === sec.id
                        ? pageStyles.mobileDropdownOptionActive
                        : ""
                    }`}
                    onClick={() => handleSecretariaSelect(sec.id)}
                  >
                    <strong>{sec.sigla}</strong> - {sec.nome}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className={pageStyles.filterField}>
        <label htmlFor="status-filtro-status" className={pageStyles.fieldLabel}>
          Status
        </label>
        <select
          id="status-filtro-status"
          name="status"
          value={status}
          onChange={(e) => handleStatusSelect(e.target.value)}
          className={pageStyles.desktopSelect}
        >
          {allStatusItems.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <div className={pageStyles.mobileDropdown}>
          <button
            type="button"
            className={pageStyles.mobileDropdownTrigger}
            aria-expanded={openMenu === "status"}
            onClick={() =>
              setOpenMenu((prev) => (prev === "status" ? null : "status"))
            }
          >
            <span className={pageStyles.mobileDropdownLabel}>
              {statusLabel}
            </span>
            <ChevronDown
              size={15}
              className={`${pageStyles.mobileDropdownChevron} ${
                openMenu === "status"
                  ? pageStyles.mobileDropdownChevronOpen
                  : ""
              }`}
              aria-hidden="true"
            />
          </button>
          {openMenu === "status" && (
            <ul className={pageStyles.mobileDropdownMenu} role="listbox">
              {allStatusItems.map((item) => (
                <li key={item.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={status === item.value}
                    className={`${pageStyles.mobileDropdownOption} ${
                      status === item.value
                        ? pageStyles.mobileDropdownOptionActive
                        : ""
                    }`}
                    onClick={() => handleStatusSelect(item.value)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <button className={pageStyles.filterButton} type="submit">
        Aplicar filtros
      </button>
    </form>
  );
}

