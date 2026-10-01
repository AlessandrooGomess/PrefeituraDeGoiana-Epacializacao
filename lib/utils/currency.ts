/**
 * Utilitários para formatação e conversão de valores monetários no padrão brasileiro (BRL).
 */

const formatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formata uma string de entrada para máscara de moeda brasileira (R$ 0,00).
 * Extrai somente os dígitos numéricos e calcula o valor considerando os 2 últimos dígitos como centavos.
 *
 * @param value String ou número com os dígitos digitados
 * @returns String formatada no padrão R$ 1.500.000,00 ou "" se vazio
 */
export function formatCurrencyBRL(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";

  // Se já for número, formata diretamente
  if (typeof value === "number") {
    if (Number.isNaN(value)) return "";
    return formatter.format(value);
  }

  // Remove tudo que não for dígito
  const digitsOnly = value.replace(/\D/g, "");
  if (!digitsOnly) return "";

  // Converte os dígitos inteiros em valor com centavos (dividido por 100)
  const numericValue = Number(digitsOnly) / 100;

  return formatter.format(numericValue);
}

/**
 * Converte uma string formatada em moeda BRL de volta para número decimal (float)
 * adequado para envio à API e gravação no banco de dados.
 *
 * Exemplo: "R$ 1.500.000,50" -> 1500000.50
 *
 * @param formatted String formatada em moeda
 * @returns Número float correspondente ou null se vazio/inválido
 */
export function parseCurrencyBRLToNumber(
  formatted: string | null | undefined,
): number | null {
  if (!formatted) return null;

  // Extrai somente os dígitos
  const digitsOnly = formatted.replace(/\D/g, "");
  if (!digitsOnly) return null;

  const numberValue = Number(digitsOnly) / 100;
  return Number.isFinite(numberValue) ? numberValue : null;
}

