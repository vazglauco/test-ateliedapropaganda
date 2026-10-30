import type { Status } from '../../api/schemas'
import { ROTULO_STATUS } from '../../lib/format'

const estilos: Record<Status, string> = {
  pendente: 'bg-pendente-fundo text-pendente-texto',
  aprovado: 'bg-aprovado-fundo text-aprovado-texto',
}

export function SeloStatus({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-legenda font-medium ${estilos[status]}`}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {ROTULO_STATUS[status]}
    </span>
  )
}
