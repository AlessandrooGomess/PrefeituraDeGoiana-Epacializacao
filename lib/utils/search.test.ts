import { describe, expect, it } from "vitest";
import {
  MAX_SEARCH_LENGTH,
  matchesSearch,
  normalizeSearchText,
  sanitizeSearchInput,
} from "./search";

describe("sanitizeSearchInput", () => {
  it("retorna string vazia para entradas vazias", () => {
    expect(sanitizeSearchInput("")).toBe("");
  });

  it("limita a string ao tamanho padrão máximo de 100 caracteres", () => {
    const inputLonga = "a".repeat(150);
    const resultado = sanitizeSearchInput(inputLonga);
    expect(resultado.length).toBe(MAX_SEARCH_LENGTH);
    expect(resultado).toBe("a".repeat(100));
  });

  it("respeita um limite customizado passado por parâmetro", () => {
    const resultado = sanitizeSearchInput("Prefeitura de Goiana", 10);
    expect(resultado).toBe("Prefeitura");
    expect(resultado.length).toBe(10);
  });

  it("remove caracteres de controle invisíveis e zero-width spaces", () => {
    // \u200B é zero-width space, \u0000 é null byte, \u0007 é bell control char
    const entradaComLixo = "Obra\u200B \u0000no\u0007 Centro";
    const resultado = sanitizeSearchInput(entradaComLixo);
    expect(resultado).toBe("Obra no Centro");
  });

  it("preserva caracteres acentuados válidos e pontuações comuns", () => {
    const texto = "Reforma & Pavimentação - Goiana/PE nº 123";
    expect(sanitizeSearchInput(texto)).toBe(texto);
  });
});

describe("normalizeSearchText", () => {
  it("retorna string vazia para valores falsy", () => {
    expect(normalizeSearchText("")).toBe("");
  });

  it("converte para minúsculas", () => {
    expect(normalizeSearchText("SECRETARIA DE INFRAESTRUTURA")).toBe(
      "secretaria de infraestrutura",
    );
  });

  it("remove acentos e diacríticos variados da língua portuguesa", () => {
    expect(normalizeSearchText("Ângelo")).toBe("angelo");
    expect(normalizeSearchText("Pátio de Feira")).toBe("patio de feira");
    expect(normalizeSearchText("Açude")).toBe("acude");
    expect(normalizeSearchText("Pavimentação e Drenagem")).toBe(
      "pavimentacao e drenagem",
    );
    expect(normalizeSearchText("Água, Esgoto & Iluminação")).toBe(
      "agua, esgoto & iluminacao",
    );
  });

  it("colapsa múltiplos espaços em branco consecutivos e remove espaços nas pontas", () => {
    expect(normalizeSearchText("   asfalto     em   cbuq   ")).toBe(
      "asfalto em cbuq",
    );
  });
});

describe("matchesSearch", () => {
  const camposExemplo = [
    "Reforma e Ampliação da Escola Municipal Prefeito Ângelo Jordão",
    "Av. Marechal Deodoro",
    "Centro",
    "Educação e Inovação Pedagógica",
  ];

  it("retorna true quando a query for vazia ou apenas espaços", () => {
    expect(matchesSearch(camposExemplo, "")).toBe(true);
    expect(matchesSearch(camposExemplo, "   ")).toBe(true);
  });

  it("encontra o registro com correspondência exata", () => {
    expect(matchesSearch(camposExemplo, "Escola")).toBe(true);
  });

  it("encontra o registro ignorando acentos na busca e nos campos", () => {
    // Busca sem acento para campo com acento
    expect(matchesSearch(camposExemplo, "angelo")).toBe(true);
    expect(matchesSearch(camposExemplo, "educacao")).toBe(true);
    expect(matchesSearch(camposExemplo, "ampliacao")).toBe(true);

    // Busca com acento diferente ou desnecessário
    expect(matchesSearch(camposExemplo, "Àngelo")).toBe(true);
  });

  it("encontra o registro ignorando diferenças de maiúsculas e minúsculas", () => {
    expect(matchesSearch(camposExemplo, "CENTRO")).toBe(true);
    expect(matchesSearch(camposExemplo, "marechal DEODORO")).toBe(true);
  });

  it("suporta busca tokenizada (multi-termo) em campos diferentes", () => {
    // 'escola' está no título, 'centro' está no bairro, 'marechal' está no endereço
    expect(matchesSearch(camposExemplo, "escola centro")).toBe(true);
    expect(matchesSearch(camposExemplo, "angelo marechal centro")).toBe(true);
  });

  it("retorna false quando ao menos um dos termos pesquisados não existir em nenhum campo", () => {
    // 'escola' existe, mas 'hospital' não
    expect(matchesSearch(camposExemplo, "escola hospital")).toBe(false);
    expect(matchesSearch(camposExemplo, "ponta de pedras")).toBe(false);
  });

  it("trata campos nulos, indefinidos ou números com segurança", () => {
    const camposComNulos = [
      null,
      undefined,
      "Pavimentação de Ruas",
      null,
      12345,
    ];
    expect(matchesSearch(camposComNulos, "pavimentacao")).toBe(true);
    expect(matchesSearch(camposComNulos, "12345")).toBe(true);
    expect(matchesSearch(camposComNulos, "inexistente")).toBe(false);
  });

  it("retorna false se todos os campos forem vazios ou nulos", () => {
    expect(matchesSearch([null, undefined, ""], "obra")).toBe(false);
  });

  it("lida perfeitamente com múltiplos espaços entre termos na busca", () => {
    expect(matchesSearch(camposExemplo, "  escola    angelo   centro  ")).toBe(
      true,
    );
  });
});

