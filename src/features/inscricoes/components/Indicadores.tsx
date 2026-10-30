import type { Totais } from '../filtrar'
import { Skeleton } from '../../../components/ui/Skeleton'

type Props = {
  totais: Totais | null
  carregando: boolean
}

const itens = [
  { chave: 'total', rotulo: 'Total', complemento: ' de inscrições' },
  { chave: 'pendentes', rotulo: 'Pendentes', complemento: '' },
  { chave: 'aprovadas', rotulo: 'Aprovadas', complemento: '' },
] as const

export function Indicadores({ totais, carregando }: Props) {
  return (
    <section aria-labelledby="titulo-indicadores">
      <h2 id="titulo-indicadores" className="sr-only">
        Indicadores
      </h2>
      <dl className="grid grid-cols-3 gap-2 sm:gap-4">
        {itens.map(({ chave, rotulo, complemento }) => (
          <div key={chave} className="rounded-card border border-tinta-100 bg-superficie-card p-3 sm:p-5">
            <dt className="text-legenda text-tinta-500 sm:text-rotulo">
              {rotulo}
              {complemento && <span className="max-sm:sr-only">{complemento}</span>}
            </dt>
            <dd className="mt-1 text-[28px] leading-[34px] font-bold sm:text-indicador">
              {carregando ? (
                <>
                  <Skeleton className="h-8 w-14" />
                  <span className="sr-only">Carregando</span>
                </>
              ) : totais ? (
                totais[chave]
              ) : (
                <>
                  <span aria-hidden>—</span>
                  <span className="sr-only">Indisponível</span>
                </>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
