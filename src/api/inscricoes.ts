import { z } from 'zod'
import { requisitar } from './client'
import {
  inscricaoRespostaSchema,
  listaInscricoesSchema,
  type Inscricao,
  type NovaInscricao,
} from './schemas'

export function listarInscricoes(signal?: AbortSignal): Promise<Inscricao[]> {
  return requisitar('inscricoes', { schema: listaInscricoesSchema, signal })
}

export function obterInscricao(id: string, signal?: AbortSignal): Promise<Inscricao> {
  return requisitar(`inscricoes/${encodeURIComponent(id)}`, { schema: inscricaoRespostaSchema, signal })
}

export function criarInscricao(dados: NovaInscricao): Promise<Inscricao | null> {
  return requisitar('inscricoes', {
    metodo: 'POST',
    corpo: dados,
    schema: inscricaoRespostaSchema.or(z.unknown().transform(() => null)),
  })
}
