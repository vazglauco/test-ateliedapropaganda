import { useDeferredValue, useMemo, useState } from 'react'
import { useInscricoes } from './hooks'
import { calcularTotais, filtrarInscricoes, type FiltroStatus } from './filtrar'
import { Indicadores } from './components/Indicadores'
import { BarraFiltros } from './components/BarraFiltros'
import { ListaInscricoes } from './components/ListaInscricoes'
import { FormularioCadastro } from './components/FormularioCadastro'
import { DetalhesInscricaoModal } from './components/DetalhesInscricaoModal'

export function PainelInscricoes() {
  const consulta = useInscricoes()
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState<FiltroStatus>('todos')
  const [selecionada, setSelecionada] = useState<string | null>(null)
  const buscaAdiada = useDeferredValue(busca)

  const todas = consulta.data
  const totais = useMemo(() => (todas ? calcularTotais(todas) : null), [todas])
  const filtradas = useMemo(
    () => (todas ? filtrarInscricoes(todas, buscaAdiada, status) : []),
    [todas, buscaAdiada, status],
  )

  return (
    <>
      <Indicadores totais={totais} carregando={consulta.isPending} />

      <div className="mt-4 grid items-start gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section
          aria-labelledby="titulo-lista"
          className="overflow-hidden rounded-card border border-tinta-100 bg-superficie-card"
        >
          <h2 id="titulo-lista" className="sr-only">
            Lista de inscrições
          </h2>
          <div className="p-4 pb-3">
            <BarraFiltros busca={busca} onBusca={setBusca} status={status} onStatus={setStatus} />
          </div>
          <ListaInscricoes
            todas={todas}
            filtradas={filtradas}
            carregando={consulta.isPending}
            atualizando={consulta.isFetching && !consulta.isPending}
            erro={consulta.error}
            onTentarNovamente={() => consulta.refetch()}
            busca={buscaAdiada}
            status={status}
            onLimparFiltros={() => {
              setBusca('')
              setStatus('todos')
            }}
            onVerDetalhes={setSelecionada}
          />
        </section>

        <FormularioCadastro />
      </div>

      {selecionada && (
        <DetalhesInscricaoModal
          key={selecionada}
          id={selecionada}
          daListagem={todas?.find((i) => i.id === selecionada)}
          onFechar={() => setSelecionada(null)}
        />
      )}
    </>
  )
}
