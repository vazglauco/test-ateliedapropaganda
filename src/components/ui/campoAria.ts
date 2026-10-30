export const estiloControle =
  'block min-h-10 w-full rounded-campo border border-tinta-300 bg-superficie-card px-3 text-corpo text-tinta-900 placeholder:text-tinta-500 transition-colors aria-invalid:border-erro'

export function ariaDoCampo(id: string, erro?: string) {
  return {
    id,
    'aria-invalid': erro ? true : undefined,
    'aria-describedby': erro ? `${id}-erro` : undefined,
  } as const
}
