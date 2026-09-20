import { describe, expect, it } from "vitest";
import { listObrasQuerySchema } from "./obra";

describe("listObrasQuerySchema", () => {
  it("aceita paginação e converte valores da URL para números", () => {
    const result = listObrasQuerySchema.safeParse({
      page: "2",
      pageSize: "10",
      status: "EM_ANDAMENTO",
      search: "  centro  ",
    });

    expect(result.success).toBe(true);

    if (!result.success) return;

    expect(result.data).toEqual({
      page: 2,
      pageSize: 10,
      status: "EM_ANDAMENTO",
      search: "centro",
    });
  });

  it("aceita uma consulta sem parâmetros", () => {
    const result = listObrasQuerySchema.safeParse({});

    expect(result.success).toBe(true);
  });

  it("rejeita página menor que 1", () => {
    const result = listObrasQuerySchema.safeParse({
      page: "0",
    });

    expect(result.success).toBe(false);
  });

  it("rejeita pageSize maior que 100", () => {
    const result = listObrasQuerySchema.safeParse({
      pageSize: "101",
    });

    expect(result.success).toBe(false);
  });

  it("rejeita status inexistente", () => {
    const result = listObrasQuerySchema.safeParse({
      status: "INVALIDO",
    });

    expect(result.success).toBe(false);
  });

  it("rejeita busca com mais de 100 caracteres", () => {
    const result = listObrasQuerySchema.safeParse({
      search: "a".repeat(101),
    });

    expect(result.success).toBe(false);
  });
});