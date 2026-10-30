import { calcularTotais, filtrarInscricoes } from './filtrar'
import { inscricao } from '../../../test/handlers'

const lista = [
  inscricao({ nome: 'João Conceição', status: 'pendente' }),
  inscricao({ nome: 'Débora Lins', status: 'aprovado', email: 'debora@exemplo.com' }),
]

describe('filtrarInscricoes', () => {
  it('busca por nome ou e-mail ignorando acentos e maiúsculas', () => {
    expect(filtrarInscricoes(lista, 'joao', 'todos').map((i) => i.nome)).toEqual(['João Conceição'])
    expect(filtrarInscricoes(lista, 'DEBORA@', 'todos').map((i) => i.nome)).toEqual(['Débora Lins'])
  })

  it('combina busca e status', () => {
    expect(filtrarInscricoes(lista, 'joão', 'aprovado')).toEqual([])
    expect(filtrarInscricoes(lista, '', 'aprovado').map((i) => i.nome)).toEqual(['Débora Lins'])
  })
})

describe('calcularTotais', () => {
  it('conta total, pendentes e aprovadas', () => {
    expect(calcularTotais(lista)).toEqual({ total: 2, pendentes: 1, aprovadas: 1 })
  })
})
