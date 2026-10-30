import type { ReactNode } from 'react'
import { CircleAlert, CircleCheck } from 'lucide-react'

type Props = {
  tipo: 'erro' | 'sucesso'
  titulo?: string
  children?: ReactNode
  acao?: ReactNode
}

const estilos = {
  erro: { caixa: 'border-erro/30 bg-erro-fundo', icone: 'text-erro', Icone: CircleAlert },
  sucesso: { caixa: 'border-sucesso/30 bg-sucesso-fundo', icone: 'text-sucesso', Icone: CircleCheck },
}

export function Alerta({ tipo, titulo, children, acao }: Props) {
  const { caixa, icone, Icone } = estilos[tipo]
  return (
    <div className={`flex gap-3 rounded-card border p-4 text-corpo ${caixa}`}>
      <Icone aria-hidden className={`mt-0.5 size-5 shrink-0 ${icone}`} />
      <div className="min-w-0 flex-1">
        {titulo && <p className="font-semibold">{titulo}</p>}
        {children && <div className={titulo ? 'mt-1 text-tinta-700' : ''}>{children}</div>}
        {acao && <div className="mt-3">{acao}</div>}
      </div>
    </div>
  )
}
