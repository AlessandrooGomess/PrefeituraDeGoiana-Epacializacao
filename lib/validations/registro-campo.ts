import { z } from "zod";

const dateInput = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: "Informe uma data válida.",
  })
  .optional()
  .nullable();

const fotoUrl = z
  .string()
  .trim()
  .min(1, "Informe a referência da foto.")
  .max(2048, "A referência da foto não pode ultrapassar 2048 caracteres.")
  .refine(
    (value) =>
      (value.startsWith("/") && !value.startsWith("//")) ||
      /^https?:\/\//i.test(value),
    "A referência da foto deve ser um caminho local ou uma URL HTTP(S).",
  );

export const fotoRegistroSchema = z
  .object({
    url: fotoUrl,
    descricao: z.string().trim().max(1000).optional().nullable(),
    latitude: z
      .number({ message: "Latitude deve ser um número válido." })
      .min(-90, "Latitude deve estar entre -90 e 90.")
      .max(90, "Latitude deve estar entre -90 e 90.")
      .optional()
      .nullable(),
    longitude: z
      .number({ message: "Longitude deve ser um número válido." })
      .min(-180, "Longitude deve estar entre -180 e 180.")
      .max(180, "Longitude deve estar entre -180 e 180.")
      .optional()
      .nullable(),
  })
  .strict();

export const tipoIntercorrenciaEnum = z.enum([
  "CHUVA",
  "ATRASO_MATERIAL",
  "FALTA_PESSOAL",
  "ACIDENTE_TRABALHO",
  "PROBLEMA_FORNECEDOR",
  "OUTROS",
]);

export const statusRegistroEnum = z.enum(["RASCUNHO", "ENVIADO"]);

export const createRegistroCampoSchema = z
  .object({
    dataVistoria: dateInput,
    status: statusRegistroEnum.default("RASCUNHO"),
    intercorrencias: z.array(tipoIntercorrenciaEnum).default([]),
    observacoes: z
      .string()
      .trim()
      .max(5000, "As observações não podem ultrapassar 5000 caracteres.")
      .optional()
      .nullable(),
    fotos: z.array(fotoRegistroSchema).default([]),
  })
  .strict()
  .refine(
    (data) => {
      if (data.status === "ENVIADO") {
        return Array.isArray(data.fotos) && data.fotos.length > 0;
      }
      return true;
    },
    {
      message:
        "Pelo menos uma foto com registro fotográfico é obrigatória para envio da medição.",
      path: ["fotos"],
    },
  );

export type CreateRegistroCampoInput = z.infer<typeof createRegistroCampoSchema>;
