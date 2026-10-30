import { Search } from 'lucide-react'
import type { FiltroStatus } from '../filtrar'
import { estiloControle } from '../../../components/ui/campoAria'

const OPCOES: { valor: FiltroStatus; rotulo: string }[] = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'pendente', rotulo: 'Pendente' },
  { valor: 'aprovado', rotulo: 'Aprovado' },
]

type Props = {
  busca: string
  onBusca: (valor: string) => void
  status: FiltroStatus
  onStatus: (valor: FiltroStatus) => void
}

export function BarraFiltros({ busca, onBusca, status, onStatus }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <label htmlFor="busca" className="sr-only">
          Buscar por nome ou e-mail
        </label>
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-tinta-500" />
        <input
          id="busca"
          type="search"
          value={busca}
          onChange={(e) => onBusca(e.target.value)}
          placeholder="Buscar por nome ou e-mail"
          autoComplete="off"
          className={`${estiloControle} pl-10`}
        />
      </div>

      <fieldset>
        <legend className="sr-only">Filtrar por status</legend>
        <div className="grid grid-cols-3 rounded-campo border border-tinta-100 bg-superficie-sutil p-1 sm:inline-grid">
          {OPCOES.map(({ valor, rotulo }) => (
            <label
              key={valor}
              className="relative flex min-h-9 cursor-pointer items-center justify-center rounded-[4px] px-3 text-corpo font-medium text-tinta-500 transition-colors hover:text-tinta-900 has-checked:bg-tinta-900 has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-foco"
            >
              <input
                type="radio"
                name="filtro-status"
                value={valor}
                checked={status === valor}
                onChange={() => onStatus(valor)}
                className="sr-only"
              />
              {rotulo}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  )
}
