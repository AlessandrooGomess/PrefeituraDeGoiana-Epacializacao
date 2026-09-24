import { describe, expect, it } from "vitest";
import { createObraSchema, listObrasQuerySchema } from "./obra";

const validObra = {
  titulo: "Reforma da UBS Central",
  endereco: "Rua Central",
  bairro: "Centro",
  latitude: -7.55,
  longitude: -35,
  secretariaId: "550e8400-e29b-41d4-a716-446655440000",
};

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

describe("createObraSchema", () => {
  it("rejeita previsão de conclusão anterior à ordem de serviço", () => {
    const result = createObraSchema.safeParse({
      ...validObra,
      dataOrdemServico: "2026-06-10",
      previsaoConclusao: "2026-05-10",
    });

    expect(result.success).toBe(false);
  });

  it("rejeita conclusão real anterior à ordem de serviço", () => {
    const result = createObraSchema.safeParse({
      ...validObra,
      dataOrdemServico: "2026-06-10",
      dataConclusaoReal: "2026-05-10",
    });

    expect(result.success).toBe(false);
  });

  it("exige data de conclusão real para obra concluída", () => {
    const result = createObraSchema.safeParse({
      ...validObra,
      status: "CONCLUIDA",
    });

    expect(result.success).toBe(false);
  });

  it("rejeita data de ordem de serviço anterior a 2020", () => {
    const resultAnoAntigo = createObraSchema.safeParse({
      ...validObra,
      dataOrdemServico: "1966-01-24",
    });
    expect(resultAnoAntigo.success).toBe(false);

    const result2019 = createObraSchema.safeParse({
      ...validObra,
      dataOrdemServico: "2019-12-31",
    });
    expect(result2019.success).toBe(false);
  });

  it("rejeita previsão de conclusão anterior a 2020", () => {
    const resultAnoAntigo = createObraSchema.safeParse({
      ...validObra,
      previsaoConclusao: "1966-01-24",
    });
    expect(resultAnoAntigo.success).toBe(false);

    const result2019 = createObraSchema.safeParse({
      ...validObra,
      previsaoConclusao: "2019-12-31",
    });
    expect(result2019.success).toBe(false);
  });

  it("aceita datas válidas a partir de 2020", () => {
    const result = createObraSchema.safeParse({
      ...validObra,
      dataOrdemServico: "2020-01-15",
      previsaoConclusao: "2021-12-31",
    });

    expect(result.success).toBe(true);
  });
});