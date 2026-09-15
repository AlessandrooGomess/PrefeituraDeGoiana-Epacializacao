import type { ObraItem, StatusObra } from "@/types/obra";

export const STATUS_PRESENTATION: Record<
  StatusObra,
  { label: string; color: string }
> = {
  PLANEJADA: { label: "Em planejamento", color: "#77869a" },
  ORDEM_EMITIDA: { label: "Ordem emitida", color: "#3879c6" },
  EM_ANDAMENTO: { label: "Em execução", color: "#ed7927" },
  PARALISADA: { label: "Paralisada", color: "#d34545" },
  CONCLUIDA: { label: "Concluída", color: "#2d9e61" },
};

export function formatWorkForecast(value: ObraItem["previsaoConclusao"]): string | null {
  if (!value) return null;

  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function getWorkProgress(value: ObraItem["percentualExecutado"]): number {
  return Math.max(0, Math.min(100, value ?? 0));
}
