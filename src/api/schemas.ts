import { z } from 'zod'

export const ORIGENS = ['site', 'evento', 'redes_sociais'] as const
const STATUS = ['pendente', 'aprovado'] as const

const origemSchema = z.enum(ORIGENS)
const statusSchema = z.enum(STATUS)

export const inscricaoSchema = z.object({
  id: z.string(),
  nome: z.string(),
  email: z.string(),
  origem: origemSchema,
  status: statusSchema,
  criadoEm: z.string(),
})

export type Inscricao = z.infer<typeof inscricaoSchema>
export type Origem = z.infer<typeof origemSchema>
export type Status = z.infer<typeof statusSchema>

export const listaInscricoesSchema = z.union([
  z.array(inscricaoSchema),
  z.object({ data: z.array(inscricaoSchema) }).transform((r) => r.data),
  z.object({ inscricoes: z.array(inscricaoSchema) }).transform((r) => r.inscricoes),
])

export const inscricaoRespostaSchema = z.union([
  inscricaoSchema,
  z.object({ data: inscricaoSchema }).transform((r) => r.data),
])

export const novaInscricaoSchema = z.object({
  nome: z.string().trim().min(1, { error: 'Informe o nome completo.' }),
  email: z
    .string()
    .trim()
    .min(1, { error: 'Informe o e-mail.' })
    .pipe(z.email({ error: 'Informe um e-mail válido, como nome@exemplo.com.' })),
  origem: z.enum(ORIGENS, { error: 'Selecione a origem do cadastro.' }),
})

export type NovaInscricao = z.infer<typeof novaInscricaoSchema>

export const apiErroSchema = z.object({
  erro: z.string().optional(),
  mensagem: z.string().optional(),
  campos: z.record(z.string(), z.union([z.string(), z.array(z.string())])).optional(),
})
