import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '../api/client'

export function criarQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (falhas, erro) => {
          const erroDoCliente = erro instanceof ApiError && erro.status >= 400 && erro.status < 500
          return !erroDoCliente && falhas < 1
        },
      },
      mutations: {
        retry: false,
      },
    },
  })
}
