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

export const createFotoSchema = z
  .object({
    url: fotoUrl,
    tipo: z
      .enum(["RENDER_PROJETO", "ANTES", "EM_ANDAMENTO", "CONCLUIDO"])
      .optional(),
    descricao: z
      .string()
      .trim()
      .max(5000, "A descrição da foto não pode ultrapassar 5000 caracteres.")
      .optional()
      .nullable(),
    dataFoto: dateInput,
  })
  .strict();

export type CreateFotoInput = z.infer<typeof createFotoSchema>;