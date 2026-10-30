import { ChevronRight } from 'lucide-react'
import type { Inscricao } from '../../../api/schemas'
import { SeloStatus } from '../../../components/ui/SeloStatus'
import { formatarData } from '../../../lib/format'

type Props = {
  inscricoes: Inscricao[]
  onVerDetalhes: (id: string) => void
}

export function CartoesInscricoes({ inscricoes, onVerDetalhes }: Props) {
  return (
    <ul className="divide-y divide-tinta-100">
      {inscricoes.map((inscricao) => (
        <li key={inscricao.id}>
          <button
            type="button"
            onClick={() => onVerDetalhes(inscricao.id)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-superficie-sutil focus-visible:-outline-offset-2"
          >
            <span className="min-w-0 flex-1">
              <span className="flex items-start justify-between gap-2">
                <span className="truncate text-corpo font-semibold">
                  <span className="sr-only">Ver detalhes de</span> {inscricao.nome}
                </span>
                <SeloStatus status={inscricao.status} />
              </span>
              <span className="block truncate text-corpo text-tinta-500">{inscricao.email}</span>
              <time dateTime={inscricao.criadoEm} className="block text-legenda text-tinta-500">
                {formatarData(inscricao.criadoEm)}
              </time>
            </span>
            <ChevronRight aria-hidden className="size-5 shrink-0 text-tinta-500" />
          </button>
        </li>
      ))}
    </ul>
  )
}
