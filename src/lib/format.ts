import type { Origem, Status } from '../api/schemas'

const FUSO = 'America/Sao_Paulo'

const formatoData = new Intl.DateTimeFormat('pt-BR', {
  timeZone: FUSO,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const formatoHora = new Intl.DateTimeFormat('pt-BR', {
  timeZone: FUSO,
  hour: '2-digit',
  minute: '2-digit',
})

export function formatarData(iso: string) {
  const data = new Date(iso)
  return Number.isNaN(data.getTime()) ? '—' : formatoData.format(data)
}

export function formatarDataHora(iso: string) {
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return '—'
  return `${formatoData.format(data)} às ${formatoHora.format(data)}`
}

export const ROTULO_ORIGEM: Record<Origem, string> = {
  site: 'Site',
  evento: 'Evento',
  redes_sociais: 'Redes sociais',
}

export const ROTULO_STATUS: Record<Status, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
}
