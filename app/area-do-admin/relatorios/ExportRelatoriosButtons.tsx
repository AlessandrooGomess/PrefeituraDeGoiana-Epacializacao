"use client";

import styles from "@/app/area-do-servidor/area-do-servidor.module.css";
import { Download, FileJson } from "lucide-react";
import Link from "next/link";

export interface ObraExportRow {
  id: string;
  titulo: string;
  status: string;
  percentualFisico: number;
  secretariaNome: string;
  secretariaSigla: string;
  eixoNome: string;
  areaTematicaNome: string;
  tipoObraNome: string;
  bairro: string;
  endereco: string;
  latitude: number;
  longitude: number;
  valorContrato: number | null;
  empresaContratada: string;
  numeroOrdemServico: string;
  dataOrdemServico: string;
  previsaoConclusao: string;
  dataConclusaoReal: string;
  engenheiroNome: string;
}

function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value).replace(/\r?\n|\r/g, " ").trim();
  if (str.includes(";") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export default function ExportRelatoriosButtons({
  obras,
}: {
  obras: ObraExportRow[];
}) {
  function handleDownloadCsv() {
    const headers = [
      "ID",
      "Título da Obra",
      "Status",
      "Avanço Físico (%)",
      "Secretaria",
      "Sigla",
      "Eixo Estratégico",
      "Área Temática",
      "Tipo de Obra",
      "Bairro",
      "Endereço",
      "Latitude",
      "Longitude",
      "Valor do Contrato (R$)",
      "Empresa Contratada",
      "Nº Ordem de Serviço",
      "Data da O.S.",
      "Previsão de Conclusão",
      "Data de Conclusão Real",
      "Engenheiro Fiscal",
    ];

    const rows = obras.map((o) =>
      [
        o.id,
        o.titulo,
        o.status,
        o.percentualFisico.toFixed(2).replace(".", ","),
        o.secretariaNome,
        o.secretariaSigla,
        o.eixoNome,
        o.areaTematicaNome,
        o.tipoObraNome,
        o.bairro,
        o.endereco,
        String(o.latitude).replace(".", ","),
        String(o.longitude).replace(".", ","),
        o.valorContrato !== null
          ? o.valorContrato.toFixed(2).replace(".", ",")
          : "",
        o.empresaContratada,
        o.numeroOrdemServico,
        o.dataOrdemServico,
        o.previsaoConclusao,
        o.dataConclusaoReal,
        o.engenheiroNome,
      ]
        .map(escapeCsvCell)
        .join(";"),
    );

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dataHoje = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `relatorio-obras-goiana-${dataHoje}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      <button
        type="button"
        onClick={handleDownloadCsv}
        className={styles.primaryButton}
      >
        <Download size={16} /> Baixar Planilha CSV (Excel)
      </button>
      <Link
        href="/api/obras"
        target="_blank"
        className={styles.secondaryButton}
      >
        <FileJson size={16} /> Baixar JSON Completo (API)
      </Link>
    </div>
  );
}

