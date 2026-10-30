import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { criarInscricao, listarInscricoes, obterInscricao } from '../../api/inscricoes'
import type { Inscricao } from '../../api/schemas'

const chaves = {
  todas: ['inscricoes'] as const,
  detalhe: (id: string) => ['inscricoes', id] as const,
}

function maisRecentesPrimeiro(lista: Inscricao[]) {
  return [...lista].sort((a, b) => Date.parse(b.criadoEm) - Date.parse(a.criadoEm))
}

export function useInscricoes() {
  return useQuery({
    queryKey: chaves.todas,
    queryFn: ({ signal }) => listarInscricoes(signal),
    select: maisRecentesPrimeiro,
  })
}

export function useInscricao(id: string | null, daListagem?: Inscricao) {
  return useQuery({
    queryKey: chaves.detalhe(id ?? ''),
    queryFn: ({ signal }) => obterInscricao(id!, signal),
    enabled: id !== null,
    placeholderData: daListagem,
  })
}

export function useCriarInscricao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: criarInscricao,
    onSuccess: (criada) => {
      if (criada) {
        queryClient.setQueryData<Inscricao[]>(chaves.todas, (atual) =>
          atual && !atual.some((i) => i.id === criada.id) ? [criada, ...atual] : atual,
        )
      }
      return queryClient.invalidateQueries({ queryKey: chaves.todas })
    },
  })
}
