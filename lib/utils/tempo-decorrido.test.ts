import { describe, expect, it } from "vitest";
import { formatarTempoDecorrido } from "./tempo-decorrido";

const AGORA = new Date("2026-09-30T12:00:00Z");

function diasAtras(dias: number): Date {
  return new Date(AGORA.getTime() - dias * 24 * 60 * 60 * 1000);
}

describe("formatarTempoDecorrido", () => {
  it("descreve o mesmo dia como hoje", () => {
    expect(formatarTempoDecorrido(diasAtras(0), AGORA)).toBe("hoje");
  });

  it("descreve o dia anterior como ontem", () => {
    expect(formatarTempoDecorrido(diasAtras(1), AGORA)).toBe("ontem");
  });

  it("conta dias até completar um mês", () => {
    expect(formatarTempoDecorrido(diasAtras(5), AGORA)).toBe("há 5 dias");
  });

  it("conta meses até completar um ano", () => {
    expect(formatarTempoDecorrido(diasAtras(95), AGORA)).toBe("há 3 meses");
  });

  it("conta anos a partir de um ano", () => {
    expect(formatarTempoDecorrido(diasAtras(800), AGORA)).toBe("há 2 anos");
  });

  it("trata datas futuras como hoje", () => {
    expect(formatarTempoDecorrido(diasAtras(-3), AGORA)).toBe("hoje");
  });
});
