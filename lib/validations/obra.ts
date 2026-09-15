import { z } from "zod";

const optionalText = z.string().trim().optional().nullable();

const dateInput = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: "Informe uma data válida.",
  })
  .optional()
  .nullable();

const obraFields = {
  titulo: z.string().trim().min(1, "O título é obrigatório."),
  descricao: optionalText,
  endereco: z.string().trim().min(1, "O endereço é obrigatório."),
  bairro: z.string().trim().min(1, "O bairro é obrigatório."),
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  valorContrato: z.number().finite().nonnegative().optional().nullable(),
  empresaContratada: optionalText,
  numeroOrdemServico: optionalText,
  dataOrdemServico: dateInput,
  previsaoConclusao: dateInput,
  dataConclusaoReal: dateInput,
  status: z.enum([
    "PLANEJADA",
    "ORDEM_EMITIDA",
    "EM_ANDAMENTO",
    "PARALISADA",
    "CONCLUIDA",
  ]).optional(),
  secretariaId: z.string().trim().min(1, "A secretaria é obrigatória."),
  eixoId: z.string().trim().optional().nullable(),
  areaTematicaId: z.string().trim().optional().nullable(),
  engenheiroId: z.string().trim().optional().nullable(),
};

export const createObraSchema = z.object(obraFields).strict();

export const updateObraSchema = createObraSchema.partial().strict();

export type CreateObraInput = z.infer<typeof createObraSchema>;
export type UpdateObraInput = z.infer<typeof updateObraSchema>;