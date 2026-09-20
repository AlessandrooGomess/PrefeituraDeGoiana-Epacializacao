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
  titulo: z
  .string()
  .trim()
  .min(3, "O título deve ter pelo menos 3 caracteres.")
  .max(255, "O título da obra não pode ultrapassar 255 caracteres."),

  descricao: z
  .string()
  .trim()
  .max(5000, "A descrição do escopo não pode ultrapassar 5000 caracteres.")
  .optional()
  .nullable(),

  endereco: z
  .string()
  .trim()
  .min(3, "Informe um endereço ou logradouro válido (ao menos 3 caracteres).")
  .max(255, "O endereço não pode ultrapassar 255 caracteres."),

  bairro: z
  .string()
  .trim()
  .min(2, "O nome do bairro ou distrito deve ter ao menos 2 caracteres.")
  .max(255, "O nome do bairro não pode ultrapassar 255 caracteres."),  

  latitude: z
  .number("A cordenada de latitude é obrigatória.")
  .finite("A latitude deve ser um número decimal válido.")
  .min(GOIANA_BOUNDS.latMin, `Latitude fora dos limites de Goiana (mínimo permitido: ${GOIANA_BOUNDS.latMin})`)
  .max(GOIANA_BOUNDS.latMax, `Latitude fora dos limites de Goiana (máximo permitido: ${GOIANA_BOUNDS.latMax})`),

  longitude: z
  .number("A cordenada de longitude é obrigatória.")
  .finite("A longitude deve ser um número decimal válido.")
  .min(GOIANA_BOUNDS.lngMin, `Longitude fora dos limites de Goiana (mínimo permitido: ${GOIANA_BOUNDS.lngMin})`)
  .max(GOIANA_BOUNDS.lngMax, `Longitude fora dos limites de Goiana (máximo permitido: ${GOIANA_BOUNDS.lngMax})`),

  valorContrato: z
  .number("O valor contratual deve ser um número válido.")
  .finite("O valor contratual deve ser um número válido.")
  .nonnegative("O valor contratual não pode ser negativo.")
  .max(9_999_999_999.99, "O valor do contrato ultrapassa o teto máximo permitido.")
  .optional()
  .nullable(),

  empresaContratada: z
  .string()
  .trim()
  .max(255, "A razão social da empresa contratada não pode ultrapassar 255 caracteres.")
  .optional()
  .nullable(),
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