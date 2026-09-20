import { z } from "zod";

const optionalText = z.string().trim().optional().nullable();
const optionalUuid = z.uuid().optional().nullable();
const statusInput = z.enum([
  "PLANEJADA",
  "ORDEM_EMITIDA",
  "EM_ANDAMENTO",
  "PARALISADA",
  "CONCLUIDA",
]);

const GOIANA_BOUNDS = {
  latMin: -7.80,
  latMax: -7.40,
  lngMin: -35.25,
  lngMax: -35.80,
}

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
  status: statusInput.default("PLANEJADA"),
  secretariaId: z.uuid("A secretaria deve ter um identificador válido."),
  eixoId: optionalUuid,
  areaTematicaId: optionalUuid,
  engenheiroId: optionalUuid,
};

export const createObraSchema = z.object(obraFields).strict();

export const updateObraSchema = z.object({
  ...obraFields,
  status: statusInput.optional(),
}).partial().strict().refine((data) => Object.keys(data).length > 0, {
  message: "Informe ao menos um campo para atualizar.",
});

export type CreateObraInput = z.infer<typeof createObraSchema>;
export type UpdateObraInput = z.infer<typeof updateObraSchema>;