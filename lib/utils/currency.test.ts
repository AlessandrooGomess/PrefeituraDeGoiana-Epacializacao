import { describe, expect, it } from "vitest";
import { formatCurrencyBRL, parseCurrencyBRLToNumber } from "./currency";

describe("formatCurrencyBRL", () => {
  it("retorna string vazia para valores vazios, nulos ou indefinidos", () => {
    expect(formatCurrencyBRL("")).toBe("");
    expect(formatCurrencyBRL(null)).toBe("");
    expect(formatCurrencyBRL(undefined)).toBe("");
  });

  it("formata centavos corretamente ao digitar poucos números", () => {
    expect(formatCurrencyBRL("1")).toMatch(/R\$\s*0,01/);
    expect(formatCurrencyBRL("15")).toMatch(/R\$\s*0,15/);
    expect(formatCurrencyBRL("150")).toMatch(/R\$\s*1,50/);
  });

  it("formata valores grandes com separadores de milhar", () => {
    expect(formatCurrencyBRL("150000000")).toMatch(/R\$\s*1\.500\.000,00/);
    expect(formatCurrencyBRL("245000050")).toMatch(/R\$\s*2\.450\.000,50/);
  });

  it("ignora caracteres não numéricos durante a digitação", () => {
    expect(formatCurrencyBRL("R$ 1.500,00")).toMatch(/R\$\s*1\.500,00/);
    expect(formatCurrencyBRL("abc1234xyz")).toMatch(/R\$\s*12,34/);
  });

  it("formata números primitivos corretamente", () => {
    expect(formatCurrencyBRL(2500.5)).toMatch(/R\$\s*2\.500,50/);
    expect(formatCurrencyBRL(0)).toMatch(/R\$\s*0,00/);
  });
});

describe("parseCurrencyBRLToNumber", () => {
  it("retorna null para entradas vazias ou inválidas", () => {
    expect(parseCurrencyBRLToNumber("")).toBeNull();
    expect(parseCurrencyBRLToNumber(null)).toBeNull();
    expect(parseCurrencyBRLToNumber(undefined)).toBeNull();
    expect(parseCurrencyBRLToNumber("abc")).toBeNull();
  });

  it("converte valores formatados em string de volta para número decimal exato", () => {
    expect(parseCurrencyBRLToNumber("R$ 1.500.000,00")).toBe(1500000.0);
    expect(parseCurrencyBRLToNumber("R$ 2.450.000,50")).toBe(2450000.5);
    expect(parseCurrencyBRLToNumber("R$ 0,05")).toBe(0.05);
    expect(parseCurrencyBRLToNumber("R$ 10,00")).toBe(10.0);
  });

  it("lida com strings parciais ou sem o símbolo R$", () => {
    expect(parseCurrencyBRLToNumber("1.500,50")).toBe(1500.5);
    expect(parseCurrencyBRLToNumber("50000")).toBe(500.0);
  });
});

