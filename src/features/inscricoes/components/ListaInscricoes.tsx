import type { ReactNode } from 'react'
import { Inbox, RotateCw, SearchX } from 'lucide-react'
import type { Inscricao } from '../../../api/schemas'
import { ApiError } from '../../../api/client'
import { Alerta } from '../../../components/ui/Alerta'
import { Botao } from '../../../components/ui/Botao'
import { Skeleton } from '../../../components/ui/Skeleton'
import { ROTULO_STATUS } from '../../../lib/format'
import { useMediaQuery } from '../../../lib/useMediaQuery'
import type { FiltroStatus } from '../filtrar'
import { CartoesInscricoes } from './CartoesInscricoes'
import { TabelaInscricoes } from './TabelaInscricoes'

type Props = {
  todas: Inscricao[] | undefined
  filtradas: Inscricao[]
  carregando: boolean
  atualizando: boolean
  erro: Error | null
  onTentarNovamente: () => void
  busca: string
  status: FiltroStatus
  onLimparFiltros: () => void
  onVerDetalhes: (id: string) => void
}

function plural(n: number) {
  return n === 1 ? '1 inscrição' : `${n} inscrições`
}

function textoErroCarregar(erro: Error) {
  if (erro instanceof ApiError && erro.codigo === 'codigo_ausente') {
    return {
      titulo: 'Código do candidato ausente ou inválido',
      descricao:
        'Defina VITE_CANDIDATO_CODE no arquivo .env.local com o código recebido por e-mail e reinicie o servidor de desenvolvimento.',
    }
  }
  return {
    titulo: 'Não foi possível carregar as inscrições',
    descricao: 'Houve uma falha ao falar com o servidor. Verifique sua conexão e tente novamente.',
  }
}

function descricaoSemResultado(busca: string, status: FiltroStatus) {
  const comStatus = status !== 'todos' ? ` com status ${ROTULO_STATUS[status]}` : ''
  const comTermo = busca.trim() ? ` para “${busca.trim()}”` : ''
  return `Não há inscrições${comStatus}${comTermo}. Tente outro termo ou limpe a busca e o filtro.`
}

export function ListaInscricoes({
  todas,
  filtradas,
  carregando,
  atualizando,
  erro,
  onTentarNovamente,
  busca,
  status,
  onLimparFiltros,
  onVerDetalhes,
}: Props) {
  const desktop = useMediaQuery('(min-width: 1024px)')

  if (carregando) {
    return (
      <div aria-busy="true" className="px-4 py-2">
        <p className="sr-only" role="status">
          Carregando inscrições…
        </p>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-tinta-100 py-3 last:border-0">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  if (erro && !todas) {
    const { titulo, descricao } = textoErroCarregar(erro)
    return (
      <div role="alert" className="p-4">
        <Alerta
          tipo="erro"
          titulo={titulo}
          acao={
            <Botao variante="secundario" onClick={onTentarNovamente} carregando={atualizando}>
              {!atualizando && <RotateCw aria-hidden className="size-4" />}
              {atualizando ? 'Tentando novamente…' : 'Tentar novamente'}
            </Botao>
          }
        >
          {descricao}
        </Alerta>
      </div>
    )
  }

  const lista = todas ?? []

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 pb-2 text-legenda text-tinta-500">
        <p aria-live="polite">{lista.length > 0 && `Mostrando ${filtradas.length} de ${plural(lista.length)}`}</p>
        {atualizando && <p>Atualizando…</p>}
      </div>

      {erro && (
        <div role="alert" className="px-4 pb-3">
          <Alerta
            tipo="erro"
            titulo="Não foi possível atualizar a lista"
            acao={
              <Botao variante="secundario" onClick={onTentarNovamente} carregando={atualizando}>
                Tentar novamente
              </Botao>
            }
          >
            Os dados exibidos podem estar desatualizados.
          </Alerta>
        </div>
      )}

      {lista.length === 0 ? (
        <EstadoVazio
          icone={<Inbox aria-hidden className="size-8" />}
          titulo="Ainda não há inscrições"
          descricao={
            desktop
              ? 'Use o formulário ao lado para cadastrar o primeiro participante.'
              : 'Use o formulário abaixo para cadastrar o primeiro participante.'
          }
        />
      ) : filtradas.length === 0 ? (
        <EstadoVazio
          icone={<SearchX aria-hidden className="size-8" />}
          titulo="Nenhuma inscrição encontrada"
          descricao={descricaoSemResultado(busca, status)}
          acao={
            <Botao variante="secundario" onClick={onLimparFiltros}>
              Limpar busca e filtro
            </Botao>
          }
        />
      ) : desktop ? (
        <TabelaInscricoes inscricoes={filtradas} onVerDetalhes={onVerDetalhes} />
      ) : (
        <CartoesInscricoes inscricoes={filtradas} onVerDetalhes={onVerDetalhes} />
      )}
    </>
  )
}

function EstadoVazio({
  icone,
  titulo,
  descricao,
  acao,
}: {
  icone: ReactNode
  titulo: string
  descricao: string
  acao?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span className="mb-3 text-tinta-300">{icone}</span>
      <p className="text-titulo-secao font-semibold">{titulo}</p>
      <p className="mt-1 max-w-sm text-corpo text-tinta-500">{descricao}</p>
      {acao && <div className="mt-4">{acao}</div>}
    </div>
  )
}
