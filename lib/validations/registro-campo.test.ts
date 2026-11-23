import { describe, expect, it } from "vitest";
import { createRegistroCampoSchema } from "./registro-campo";

describe("createRegistroCampoSchema", () => {
  it("aceita um rascunho válido sem fotos obrigatórias", () => {
    const input = {
      status: "RASCUNHO",
      intercorrencias: ["CHUVA", "ATRASO_MATERIAL"],
      observacoes: "Paralisação temporária por chuva forte pela manhã.",
      fotos: [],
    };

    const result = createRegistroCampoSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("RASCUNHO");
      expect(result.data.intercorrencias).toEqual(["CHUVA", "ATRASO_MATERIAL"]);
    }
  });

  it("aceita um envio definitivo com foto e coordenadas de GPS", () => {
    const input = {
      status: "ENVIADO",
      dataVistoria: "2026-09-26T10:00:00.000Z",
      intercorrencias: ["FALTA_PESSOAL"],
      observacoes: "Apenas 4 operários presentes.",
      fotos: [
        {
          url: "/fotos/obra-1.jpg",
          descricao: "Alvenaria do bloco A",
          latitude: -7.5619,
          longitude: -34.9317,
        },
      ],
    };

    const result = createRegistroCampoSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejeita envio definitivo sem fotos", () => {
    const input = {
      status: "ENVIADO",
      intercorrencias: [],
      fotos: [],
    };

    const result = createRegistroCampoSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        "Pelo menos uma foto com registro fotográfico é obrigatória",
      );
    }
  });

  it("rejeita latitude e longitude inválidas nas fotos", () => {
    const input = {
      status: "RASCUNHO",
      fotos: [
        {
          url: "https://exemplo.com/foto.jpg",
          latitude: 150,
          longitude: -34.9,
        },
      ],
    };

    const result = createRegistroCampoSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejeita tipo de intercorrência desconhecido", () => {
    const input = {
      status: "RASCUNHO",
      intercorrencias: ["INVASAO_ALIENIGENA"],
    };

    const result = createRegistroCampoSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejeita observações com mais de 5000 caracteres", () => {
    const input = {
      status: "RASCUNHO",
      observacoes: "a".repeat(5001),
    };

    const result = createRegistroCampoSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejeita script malicioso nas observações", () => {
    const input = {
      status: "RASCUNHO",
      observacoes: "Texto normal <script>alert('hack')</script>",
    };

    const result = createRegistroCampoSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        "Código de script malicioso não é permitido",
      );
    }
  });

  it("exige observações detalhadas (mínimo 10 caracteres) se marcar OUTROS", () => {
    const inputInvalido = {
      status: "RASCUNHO",
      intercorrencias: ["OUTROS"],
      observacoes: "curto",
    };

    const resultInvalido = createRegistroCampoSchema.safeParse(inputInvalido);
    expect(resultInvalido.success).toBe(false);
    if (!resultInvalido.success) {
      expect(resultInvalido.error.issues[0].message).toContain(
        "Ao selecionar a intercorrência 'Outros'",
      );
    }

    const inputValido = {
      status: "RASCUNHO",
      intercorrencias: ["OUTROS"],
      observacoes: "Manifestação comunitária na entrada da obra.",
    };

    const resultValido = createRegistroCampoSchema.safeParse(inputValido);
    expect(resultValido.success).toBe(true);
  });
  it("rejeita observações que iniciam com espaço em branco", () => {
    const input = {
      status: "RASCUNHO",
      observacoes: "  Texto iniciando com espaços",
    };

    const result = createRegistroCampoSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        "não podem iniciar com espaço em branco",
      );
    }
  });
});
