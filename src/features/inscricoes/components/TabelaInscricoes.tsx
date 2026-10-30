import { ChevronRight } from 'lucide-react'
import type { Inscricao } from '../../../api/schemas'
import { SeloStatus } from '../../../components/ui/SeloStatus'
import { formatarData } from '../../../lib/format'

type Props = {
  inscricoes: Inscricao[]
  onVerDetalhes: (id: string) => void
}

const th = 'px-4 py-3 text-left text-coluna font-semibold tracking-wide text-tinta-500 uppercase'

export function TabelaInscricoes({ inscricoes, onVerDetalhes }: Props) {
  return (
    <table className="w-full table-fixed border-collapse text-corpo">
      <caption className="sr-only">Inscrições da campanha</caption>
      <colgroup>
        <col className="w-[26%]" />
        <col />
        <col className="w-28" />
        <col className="w-32" />
        <col className="w-36" />
      </colgroup>
      <thead className="bg-superficie-sutil">
        <tr>
          <th scope="col" className={th}>Nome</th>
          <th scope="col" className={th}>E-mail</th>
          <th scope="col" className={th}>Data</th>
          <th scope="col" className={th}>Status</th>
          <th scope="col" className={th}>
            <span className="sr-only">Ações</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {inscricoes.map((inscricao) => (
          <tr key={inscricao.id} className="border-t border-tinta-100 hover:bg-superficie-sutil">
            <td className="truncate px-4 py-3 font-semibold" title={inscricao.nome}>
              {inscricao.nome}
            </td>
            <td className="truncate px-4 py-3 text-tinta-500" title={inscricao.email}>
              {inscricao.email}
            </td>
            <td className="px-4 py-3 tabular-nums">
              <time dateTime={inscricao.criadoEm}>{formatarData(inscricao.criadoEm)}</time>
            </td>
            <td className="px-4 py-3">
              <SeloStatus status={inscricao.status} />
            </td>
            <td className="px-2 py-2 text-right">
              <button
                type="button"
                onClick={() => onVerDetalhes(inscricao.id)}
                className="inline-flex min-h-9 items-center gap-1 rounded-campo px-2 font-medium text-tinta-900 hover:bg-tinta-100"
              >
                Ver detalhes <span className="sr-only">de {inscricao.nome}</span>
                <ChevronRight aria-hidden className="size-4" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
