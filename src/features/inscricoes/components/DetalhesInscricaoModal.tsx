import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react'
import { RotateCw, X } from 'lucide-react'
import type { Inscricao } from '../../../api/schemas'
import { Alerta } from '../../../components/ui/Alerta'
import { Botao } from '../../../components/ui/Botao'
import { SeloStatus } from '../../../components/ui/SeloStatus'
import { Skeleton } from '../../../components/ui/Skeleton'
import { ROTULO_ORIGEM, formatarDataHora } from '../../../lib/format'
import { useInscricao } from '../hooks'

type Props = {
  id: string
  daListagem?: Inscricao
  onFechar: () => void
}

export function DetalhesInscricaoModal({ id, daListagem, onFechar }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { data: inscricao, isError, isFetching, refetch } = useInscricao(id, daListagem)

  useEffect(() => {
    const dialog = dialogRef.current
    const quemAbriu = document.activeElement as HTMLElement | null
    if (dialog && !dialog.open) dialog.showModal()
    return () => quemAbriu?.focus()
  }, [])

  function cliqueNoFundo(evento: MouseEvent<HTMLDialogElement>) {
    if (evento.target === dialogRef.current) onFechar()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="titulo-detalhes"
      onClose={onFechar}
      onClick={cliqueNoFundo}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-card bg-superficie-card p-0 text-tinta-900 shadow-xl"
    >
      <div className="flex items-center justify-between border-b border-tinta-100 px-5 py-4">
        <h2 id="titulo-detalhes" className="text-titulo-secao font-semibold">
          Detalhes da inscrição
        </h2>
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar"
          className="-mr-2 inline-flex size-9 items-center justify-center rounded-campo text-tinta-500 hover:bg-superficie-sutil hover:text-tinta-900"
        >
          <X aria-hidden className="size-5" />
        </button>
      </div>

      <div className="px-5 py-2" aria-busy={isFetching && !inscricao}>
        {isError && (
          <div role="alert" className="py-3">
            <Alerta
              tipo="erro"
              titulo="Não foi possível carregar os detalhes"
              acao={
                <Botao variante="secundario" onClick={() => refetch()} carregando={isFetching}>
                  {!isFetching && <RotateCw aria-hidden className="size-4" />}
                  Tentar novamente
                </Botao>
              }
            >
              {inscricao ? 'Os dados abaixo vêm da listagem e podem estar incompletos.' : null}
            </Alerta>
          </div>
        )}

        {inscricao ? (
          <dl className="divide-y divide-tinta-100 text-corpo">
            <Linha rotulo="Nome">{inscricao.nome}</Linha>
            <Linha rotulo="E-mail">
              <span className="break-all">{inscricao.email}</span>
            </Linha>
            <Linha rotulo="Origem do cadastro">{ROTULO_ORIGEM[inscricao.origem]}</Linha>
            <Linha rotulo="Status">
              <SeloStatus status={inscricao.status} />
            </Linha>
            <Linha rotulo="Data da inscrição">
              <time dateTime={inscricao.criadoEm}>{formatarDataHora(inscricao.criadoEm)}</time>
            </Linha>
            <Linha rotulo="Código">
              <span className="font-mono text-rotulo font-normal">{inscricao.id}</span>
            </Linha>
          </dl>
        ) : (
          !isError && (
            <div className="space-y-4 py-3">
              <p className="sr-only" role="status">
                Carregando detalhes…
              </p>
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          )
        )}
      </div>

      <div className="flex justify-end border-t border-tinta-100 bg-superficie-sutil px-5 py-3">
        <Botao variante="secundario" onClick={onFechar}>
          Fechar
        </Botao>
      </div>
    </dialog>
  )
}

function Linha({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,9rem)_1fr] items-center gap-3 py-3">
      <dt className="text-tinta-500">{rotulo}</dt>
      <dd className="min-w-0 font-semibold">{children}</dd>
    </div>
  )
}
