import type { ReactNode } from 'react'
import { CircleAlert } from 'lucide-react'

type Props = {
  id: string
  rotulo: string
  erro?: string
  children: ReactNode
}

export function Campo({ id, rotulo, erro, children }: Props) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-rotulo font-medium text-tinta-900">
        {rotulo}
      </label>
      {children}
      {erro && (
        <p id={`${id}-erro`} className="mt-1.5 flex items-start gap-1.5 text-legenda text-erro">
          <CircleAlert aria-hidden className="mt-px size-3.5 shrink-0" />
          {erro}
        </p>
      )}
    </div>
  )
}
