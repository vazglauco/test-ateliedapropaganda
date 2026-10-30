import type { ButtonHTMLAttributes } from 'react'
import { LoaderCircle } from 'lucide-react'

type Variante = 'primario' | 'secundario'

const estilos: Record<Variante, string> = {
  primario:
    'bg-tinta-900 text-white hover:bg-tinta-700 active:bg-tinta-700 disabled:bg-tinta-300 disabled:text-white',
  secundario:
    'border border-tinta-300 bg-superficie-card text-tinta-900 hover:bg-superficie-sutil disabled:text-tinta-500',
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante
  carregando?: boolean
}

export function Botao({ variante = 'primario', carregando = false, disabled, className = '', children, ...props }: Props) {
  return (
    <button
      type="button"
      {...props}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-campo px-4 text-corpo font-semibold transition-colors disabled:cursor-not-allowed ${estilos[variante]} ${className}`}
    >
      {carregando && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
      {children}
    </button>
  )
}
