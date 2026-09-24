/**
 * Utilitários para normalização, sanitização e correspondência de buscas.
 * Projetado para suportar buscas em linguagem natural em português com tratamento rigoroso
 * de exceções, acentuação, espaços e caracteres especiais.
 */

export const MAX_SEARCH_LENGTH = 100;

/**
 * Remove caracteres de controle invisíveis, barras (/ e \), caracteres especiais inseguros,
 * remove espaços no início, colapsa espaços duplicados e limita o tamanho máximo do texto.
 */
export function sanitizeSearchInput(raw: string, maxLength: number = MAX_SEARCH_LENGTH): string {
  if (!raw) return "";

  const sanitized = raw
    .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, "")
    .replace(/[\\/<>{}[\];"'|^~`]/g, "")
    .replace(/^\s+/, "")
    .replace(/\s{2,}/g, " ")
    .slice(0, maxLength);

  return sanitized;
}

/**
 * Normaliza um texto para busca:
 * - Converte para minúsculas
 * - Remove acentos e diacríticos (ex: "Ângelo" -> "angelo", "Pátio" -> "patio", "Açude" -> "acude")
 * - Colapsa múltiplos espaços em branco em um único espaço e aplica trim
 */
export function normalizeSearchText(text: string): string {
  if (!text) return "";

  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .toLocaleLowerCase("pt-BR")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Verifica se os campos textuais fornecidos (haystack) atendem a todos os termos pesquisados (query).
 * A busca é tokenizada: cada palavra digitada pelo usuário deve estar presente em ao menos um dos campos.
 *
 * @param fields Array de campos textuais da entidade (título, bairro, endereço, secretaria, etc.)
 * @param query Termo digitado pelo usuário
 * @returns true se a entidade corresponde à busca, ou true se query estiver vazia
 */
export function matchesSearch(
  fields: (string | number | null | undefined)[],
  query: string,
): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  // Quebra a busca em tokens (ex: "escola angelo" -> ["escola", "angelo"])
  const queryTokens = normalizedQuery.split(" ").filter(Boolean);
  if (queryTokens.length === 0) return true;

  // Normaliza e consolida todos os campos em uma única string de busca
  const normalizedHaystack = fields
    .filter((field): field is string | number => field !== null && field !== undefined)
    .map((field) => normalizeSearchText(String(field)))
    .filter(Boolean)
    .join(" ");

  if (!normalizedHaystack) return false;

  // Cada token pesquisado precisa existir no haystack consolidado
  return queryTokens.every((token) => normalizedHaystack.includes(token));
}

