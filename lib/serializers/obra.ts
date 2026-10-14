export function serializeDate(date: Date | null): string | null {
  return date?.toISOString() ?? null;
}