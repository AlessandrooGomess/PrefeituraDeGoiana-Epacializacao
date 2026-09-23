import { z } from "zod";

const dateInput = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: "Informe uma data válida.",
  })
  .optional()
  .nullable();

export const createMedicaoSchema = z.object({
  dataVistoria: dateInput,
  percentualExecutado: z
    .number("O percentual executado deve ser um número válido.")
    .finite("O percentual executado deve ser um número válido.")
    .min(0, "O percentual executado não pode ser menor que 0.")
    .max(100, "O percentual executado não pode ser maior que 100."),
  observacoesTecnicas: z
    .string()
    .trim()
    .max(
      5000,
      "As observações técnicas não podem ultrapassar 5000 caracteres.",
    )
    .optional()
    .nullable(),
  engenheiroId: z.uuid(
    "O engenheiro vinculado deve possuir um identificador UUID válido.",
  ),
}).strict();

export type CreateMedicaoInput = z.infer<typeof createMedicaoSchema>;
