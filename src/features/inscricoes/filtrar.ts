import type { Inscricao, Status } from '../../api/schemas'

export type FiltroStatus = Status | 'todos'

export type Totais = { total: number; pendentes: number; aprovadas: number }

function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

export function filtrarInscricoes(lista: Inscricao[], busca: string, status: FiltroStatus) {
  const termo = normalizar(busca)
  return lista.filter((inscricao) => {
    if (status !== 'todos' && inscricao.status !== status) return false
    if (!termo) return true
    return normalizar(inscricao.nome).includes(termo) || normalizar(inscricao.email).includes(termo)
  })
}

export function calcularTotais(lista: Inscricao[]): Totais {
  const pendentes = lista.filter((i) => i.status === 'pendente').length
  return { total: lista.length, pendentes, aprovadas: lista.length - pendentes }
}
