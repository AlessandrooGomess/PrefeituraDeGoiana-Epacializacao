export interface ItemPonderado {
  percentual: number;
  peso: number;
}

export function calcularMediaPonderada(itens: ItemPonderado[]): number {
  let somaPonderada = 0;
  let somaPesos = 0;

  for (const { percentual, peso } of itens) {
    somaPonderada += percentual * peso;
    somaPesos += peso;
  }

  if (somaPesos === 0) return 0;
  return Math.round((somaPonderada / somaPesos) * 100) / 100;
}

export function statusPorPercentual(
  percentual: number,
): "CONCLUIDA" | "EM_ANDAMENTO" | "PENDENTE" {
  if (percentual === 100) return "CONCLUIDA";
  return percentual > 0 ? "EM_ANDAMENTO" : "PENDENTE";
}