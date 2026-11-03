const DIA_EM_MS = 24 * 60 * 60 * 1000;

const formatter = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

/**
 * Descreve há quanto tempo uma data ocorreu, em português ("hoje", "ontem", "há 5 dias", "há 3 meses").
 * Datas futuras são tratadas como "hoje".
 *
 * @param data Data do acontecimento
 * @param agora Referência de "agora" (parametrizada para testes)
 */
export function formatarTempoDecorrido(data: Date, agora: Date = new Date()): string {
  const dias = Math.max(0, Math.floor((agora.getTime() - data.getTime()) / DIA_EM_MS));

  if (dias < 30) return formatter.format(-dias, "day");

  const meses = Math.floor(dias / 30);
  if (meses < 12) return formatter.format(-meses, "month");

  return formatter.format(-Math.floor(dias / 365), "year");
}
