import { describe, expect, it } from "vitest";
import { createFotoSchema } from "./foto";

describe("createFotoSchema", () => {
  it("aceita uma referência local válida", () => {
    const result = createFotoSchema.safeParse({
      url: "/fotos/obra-escola-angelo.jpg",
      tipo: "EM_ANDAMENTO",
      descricao: "Registro da obra.",
      dataFoto: "2026-02-10",
    });

    expect(result.success).toBe(true);
  });

  it("aceita uma URL HTTP válida", () => {
    const result = createFotoSchema.safeParse({
      url: "https://cdn.example.com/obra.jpg",
    });

    expect(result.success).toBe(true);
  });

  it("rejeita referências inseguras ou inválidas", () => {
    expect(createFotoSchema.safeParse({ url: "javascript:alert(1)" }).success).toBe(
      false,
    );
    expect(createFotoSchema.safeParse({ url: "foto.jpg" }).success).toBe(false);
    expect(createFotoSchema.safeParse({ url: "//cdn.example.com/foto.jpg" }).success).toBe(
      false,
    );
  });

  it("rejeita tipo desconhecido", () => {
    const result = createFotoSchema.safeParse({
      url: "/fotos/obra.jpg",
      tipo: "INVALIDO",
    });

    expect(result.success).toBe(false);
  });
});