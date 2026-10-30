import { http, HttpResponse } from 'msw'
import type { Inscricao } from '../src/api/schemas'

export const API = 'https://api.teste.local'

export function inscricao(dados: Partial<Inscricao> & Pick<Inscricao, 'nome'>): Inscricao {
  const slug = dados.nome
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, '.')
  return {
    id: `insc_${slug}`,
    email: `${slug}@exemplo.com`,
    origem: 'site',
    status: 'pendente',
    criadoEm: '2026-10-14T09:12:00-03:00',
    ...dados,
  }
}

export const INICIAIS: Inscricao[] = [
  inscricao({ nome: 'Marina Albuquerque', origem: 'evento', criadoEm: '2026-10-14T09:12:00-03:00' }),
  inscricao({ nome: 'Rafael Tanaka', status: 'aprovado', criadoEm: '2026-10-14T08:00:00-03:00' }),
  inscricao({ nome: 'Joana Prado', status: 'aprovado', origem: 'redes_sociais', criadoEm: '2026-10-13T10:00:00-03:00' }),
  inscricao({ nome: 'João Conceição', criadoEm: '2026-10-12T10:00:00-03:00' }),
]

export const db = { inscricoes: [...INICIAIS] }

export function reiniciarDb() {
  db.inscricoes = [...INICIAIS]
}

export const handlers = [
  http.get(`${API}/inscricoes`, ({ request }) => {
    if (request.headers.get('X-Candidato') !== 'codigo-de-teste') {
      return HttpResponse.json({ erro: 'codigo_invalido', mensagem: 'Código inválido', campos: {} }, { status: 401 })
    }
    return HttpResponse.json(db.inscricoes)
  }),

  http.get(`${API}/inscricoes/:id`, ({ params }) => {
    const encontrada = db.inscricoes.find((i) => i.id === params.id)
    return encontrada
      ? HttpResponse.json(encontrada)
      : HttpResponse.json({ erro: 'nao_encontrado', mensagem: 'Não encontrada' }, { status: 404 })
  }),

  http.post(`${API}/inscricoes`, async ({ request }) => {
    const corpo = (await request.json()) as Pick<Inscricao, 'nome' | 'email' | 'origem'>
    const criada = inscricao({ ...corpo, status: 'pendente', criadoEm: '2026-10-30T12:00:00-03:00' })
    db.inscricoes = [criada, ...db.inscricoes]
    return HttpResponse.json(criada, { status: 201 })
  }),
]
