import { describe, expect, it } from "vitest";
import { createMedicaoSchema } from "./medicao";

describe("createMedicaoSchema", () => {
  const validInput = {
    percentualExecutado: 42.5,
    engenheiroId: "550e8400-e29b-41d4-a716-446655440000",
  };

  it("aceita uma medição válida", () => {
    const result = createMedicaoSchema.safeParse({
      ...validInput,
      dataVistoria: "2026-02-10",
      observacoesTecnicas: "Execução em andamento.",
    });

    expect(result.success).toBe(true);
  });

  it("rejeita percentual menor que 0", () => {
    const result = createMedicaoSchema.safeParse({
      ...validInput,
      percentualExecutado: -1,
    });

    expect(result.success).toBe(false);
  });

  it("rejeita percentual maior que 100", () => {
    const result = createMedicaoSchema.safeParse({
      ...validInput,
      percentualExecutado: 100.01,
    });

    expect(result.success).toBe(false);
  });

  it("rejeita engenheiro com identificador inválido", () => {
    const result = createMedicaoSchema.safeParse({
      ...validInput,
      engenheiroId: "engenheiro-invalido",
    });

    expect(result.success).toBe(false);
  });

  it("rejeita observações técnicas muito longas", () => {
    const result = createMedicaoSchema.safeParse({
      ...validInput,
      observacoesTecnicas: "a".repeat(5001),
    });

    expect(result.success).toBe(false);
  });
});
