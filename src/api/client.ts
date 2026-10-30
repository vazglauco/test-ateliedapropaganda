import type { z } from 'zod'
import { apiErroSchema } from './schemas'

const API_URL = import.meta.env.VITE_API_URL || 'https://api-teste.ateliedepropaganda.com.br/'
const CANDIDATO = import.meta.env.VITE_CANDIDATO_CODE?.trim() ?? ''

const CENARIOS = ['lento', 'erro', 'vazio', 'conflito'] as const

function cenarioAtivo(): string | null {
  const daUrl = new URLSearchParams(window.location.search).get('cenario')
  const valor = daUrl ?? import.meta.env.VITE_API_CENARIO ?? ''
  return (CENARIOS as readonly string[]).includes(valor) ? valor : null
}

export type CodigoErro =
  | 'codigo_ausente'
  | 'rede'
  | 'resposta_invalida'
  | 'conflito'
  | 'nao_encontrado'
  | 'validacao'
  | 'servidor'

export class ApiError extends Error {
  readonly status: number
  readonly codigo: CodigoErro
  readonly campos: Record<string, string>

  constructor(opcoes: { status: number; codigo: CodigoErro; mensagem: string; campos?: Record<string, string> }) {
    super(opcoes.mensagem)
    this.name = 'ApiError'
    this.status = opcoes.status
    this.codigo = opcoes.codigo
    this.campos = opcoes.campos ?? {}
  }
}

function codigoPorStatus(status: number): CodigoErro {
  if (status === 401 || status === 403) return 'codigo_ausente'
  if (status === 404) return 'nao_encontrado'
  if (status === 409) return 'conflito'
  if (status === 400 || status === 422) return 'validacao'
  return 'servidor'
}

async function erroDaResposta(resposta: Response): Promise<ApiError> {
  const corpo = apiErroSchema.safeParse(await resposta.json().catch(() => null))
  const dados = corpo.success ? corpo.data : {}
  const campos = Object.fromEntries(
    Object.entries(dados.campos ?? {}).map(([campo, msg]) => [campo, Array.isArray(msg) ? msg.join(' ') : msg]),
  )
  return new ApiError({
    status: resposta.status,
    codigo: codigoPorStatus(resposta.status),
    mensagem: dados.mensagem ?? `Erro ${resposta.status}`,
    campos,
  })
}

type Opcoes<S extends z.ZodType> = {
  metodo?: 'GET' | 'POST'
  corpo?: unknown
  schema: S
  signal?: AbortSignal
}

export async function requisitar<S extends z.ZodType>(
  caminho: string,
  { metodo = 'GET', corpo, schema, signal }: Opcoes<S>,
): Promise<z.output<S>> {
  if (!CANDIDATO) {
    throw new ApiError({
      status: 401,
      codigo: 'codigo_ausente',
      mensagem: 'Código do candidato não configurado (VITE_CANDIDATO_CODE).',
    })
  }

  const url = new URL(caminho, API_URL)
  const cenario = cenarioAtivo()
  if (cenario) url.searchParams.set('cenario', cenario)

  let resposta: Response
  try {
    resposta = await fetch(url, {
      method: metodo,
      signal,
      headers: {
        Accept: 'application/json',
        'X-Candidato': CANDIDATO,
        ...(corpo !== undefined && { 'Content-Type': 'application/json' }),
      },
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    })
  } catch (erro) {
    if (signal?.aborted) throw erro
    throw new ApiError({ status: 0, codigo: 'rede', mensagem: 'Falha de conexão com a API.' })
  }

  if (!resposta.ok) throw await erroDaResposta(resposta)

  const json: unknown = resposta.status === 204 ? null : await resposta.json().catch(() => null)
  const resultado = schema.safeParse(json)
  if (!resultado.success) {
    throw new ApiError({
      status: resposta.status,
      codigo: 'resposta_invalida',
      mensagem: 'A API respondeu em um formato inesperado.',
    })
  }
  return resultado.data
}
