import { screen, waitFor, within } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
import { server } from '../../../test/setup'
import { API, db, inscricao } from '../../../test/handlers'
import type { Inscricao } from '../../api/schemas'
import { renderizarApp } from '../../../test/renderizar'

function indicador(rotulo: string) {
  const regiao = screen.getByRole('region', { name: 'Indicadores' })
  const termo = within(regiao)
    .getAllByRole('term')
    .find((el) => el.textContent?.startsWith(rotulo))
  return termo?.nextElementSibling?.textContent
}

function nomesNaTabela() {
  const linhas = within(screen.getByRole('table')).getAllByRole('row').slice(1)
  return linhas.map((linha) => within(linha).getAllByRole('cell')[0]!.textContent)
}

async function esperarLista() {
  await screen.findByRole('table')
}

describe('Formulário de cadastro', () => {
  it('mostra as mensagens junto aos campos e não envia dados inválidos', async () => {
    const post = vi.fn()
    server.use(
      http.post(`${API}/inscricoes`, () => {
        post()
        return HttpResponse.json({}, { status: 201 })
      }),
    )
    const { usuario } = renderizarApp()

    await usuario.click(screen.getByRole('button', { name: 'Cadastrar participante' }))

    expect(screen.getByText('Informe o nome completo.')).toBeInTheDocument()
    expect(screen.getByText('Informe o e-mail.')).toBeInTheDocument()
    expect(screen.getByText('Selecione a origem do cadastro.')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome completo')).toHaveFocus()
    expect(screen.getByLabelText('Nome completo')).toHaveAccessibleDescription('Informe o nome completo.')

    await usuario.type(screen.getByLabelText('E-mail'), 'rafael.tanaka@exemplo')
    expect(screen.getByLabelText('E-mail')).toHaveAccessibleDescription(
      'Informe um e-mail válido, como nome@exemplo.com.',
    )

    await usuario.type(screen.getByLabelText('Nome completo'), 'Rafael Tanaka')
    expect(screen.queryByText('Informe o nome completo.')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Nome completo')).not.toHaveAttribute('aria-invalid')

    await usuario.click(screen.getByRole('button', { name: 'Cadastrar participante' }))
    expect(screen.getByLabelText('E-mail')).toHaveFocus()
    expect(post).not.toHaveBeenCalled()
  })

  it('cadastra, impede envio duplicado e atualiza lista e indicadores sem recarregar', async () => {
    const post = vi.fn()
    server.use(
      http.post(`${API}/inscricoes`, async ({ request }) => {
        post()
        await delay(100)
        const corpo = (await request.json()) as Pick<Inscricao, 'nome' | 'email' | 'origem'>
        const criada = inscricao({ ...corpo, criadoEm: '2026-10-30T12:00:00-03:00' })
        db.inscricoes = [criada, ...db.inscricoes]
        return HttpResponse.json(criada, { status: 201 })
      }),
    )
    const { usuario } = renderizarApp()
    await esperarLista()
    expect(indicador('Total')).toBe('4')
    expect(indicador('Pendentes')).toBe('2')

    await usuario.type(screen.getByLabelText('Nome completo'), 'Paula Mendes')
    await usuario.type(screen.getByLabelText('E-mail'), 'paula.mendes@exemplo.com')
    await usuario.selectOptions(screen.getByLabelText('Origem'), 'Evento')
    await usuario.click(screen.getByRole('button', { name: 'Cadastrar participante' }))

    const botao = screen.getByRole('button', { name: /Cadastrando/ })
    expect(botao).toBeDisabled()
    await usuario.click(botao)
    await usuario.keyboard('{Enter}')

    expect(await screen.findByText('Participante cadastrado com sucesso.')).toBeInTheDocument()
    expect(post).toHaveBeenCalledTimes(1)
    expect(nomesNaTabela()).toContain('Paula Mendes')
    expect(indicador('Total')).toBe('5')
    expect(indicador('Pendentes')).toBe('3')
    expect(screen.getByLabelText('Nome completo')).toHaveValue('')
  })

  it('mantém os dados e aponta o campo quando o e-mail já está inscrito (409)', async () => {
    server.use(
      http.post(`${API}/inscricoes`, () =>
        HttpResponse.json({ erro: 'conflito', mensagem: 'E-mail já inscrito', campos: {} }, { status: 409 }),
      ),
    )
    const { usuario } = renderizarApp()

    await usuario.type(screen.getByLabelText('Nome completo'), 'Marina Albuquerque')
    await usuario.type(screen.getByLabelText('E-mail'), 'marina.albuquerque@exemplo.com')
    await usuario.selectOptions(screen.getByLabelText('Origem'), 'Site')
    await usuario.click(screen.getByRole('button', { name: 'Cadastrar participante' }))

    const email = await screen.findByLabelText('E-mail')
    await waitFor(() => expect(email).toHaveAccessibleDescription('Este e-mail já está inscrito na campanha.'))
    expect(email).toHaveFocus()
    expect(email).toHaveValue('marina.albuquerque@exemplo.com')
    expect(screen.getByLabelText('Nome completo')).toHaveValue('Marina Albuquerque')
  })

  it('informa a falha do servidor e preserva o que foi digitado', async () => {
    server.use(http.post(`${API}/inscricoes`, () => HttpResponse.json({}, { status: 500 })))
    const { usuario } = renderizarApp()

    await usuario.type(screen.getByLabelText('Nome completo'), 'Caio Ferraz')
    await usuario.type(screen.getByLabelText('E-mail'), 'caio.ferraz@exemplo.com')
    await usuario.selectOptions(screen.getByLabelText('Origem'), 'Redes sociais')
    await usuario.click(screen.getByRole('button', { name: 'Cadastrar participante' }))

    expect(await screen.findByText(/Não foi possível cadastrar agora/)).toBeInTheDocument()
    expect(screen.getByLabelText('Nome completo')).toHaveValue('Caio Ferraz')
    expect(screen.getByLabelText('Origem')).toHaveValue('redes_sociais')
    expect(screen.getByRole('button', { name: 'Cadastrar participante' })).toBeEnabled()
  })
})

describe('Listagem', () => {
  it('filtra por status e busca sem alterar os indicadores', async () => {
    const { usuario } = renderizarApp()
    await esperarLista()

    await usuario.click(screen.getByRole('radio', { name: 'Aprovado' }))
    expect(nomesNaTabela()).toEqual(['Rafael Tanaka', 'Joana Prado'])
    expect(screen.getByText('Mostrando 2 de 4 inscrições')).toBeInTheDocument()
    expect(indicador('Total')).toBe('4')
    expect(indicador('Pendentes')).toBe('2')

    await usuario.click(screen.getByRole('radio', { name: 'Todos' }))
    await usuario.type(screen.getByRole('searchbox', { name: 'Buscar por nome ou e-mail' }), 'JOAO')
    expect(nomesNaTabela()).toEqual(['João Conceição'])

    await usuario.clear(screen.getByRole('searchbox'))
    await usuario.type(screen.getByRole('searchbox'), 'ninguém')
    expect(await screen.findByText('Nenhuma inscrição encontrada')).toBeInTheDocument()
    expect(screen.queryByText('Ainda não há inscrições')).not.toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Limpar busca e filtro' }))
    expect(nomesNaTabela()).toHaveLength(4)
    expect(screen.getByRole('searchbox')).toHaveValue('')
  })

  it('mostra erro ao carregar e recupera com "Tentar novamente"', async () => {
    server.use(http.get(`${API}/inscricoes`, () => HttpResponse.json({}, { status: 500 }), { once: true }))
    const { usuario } = renderizarApp()

    expect(await screen.findByText('Não foi possível carregar as inscrições')).toBeInTheDocument()
    expect(indicador('Total')).toContain('Indisponível')

    await usuario.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    await esperarLista()
    expect(nomesNaTabela()).toHaveLength(4)
    expect(indicador('Total')).toBe('4')
  })

  it('diferencia a lista vazia do "nenhum resultado"', async () => {
    server.use(http.get(`${API}/inscricoes`, () => HttpResponse.json([])))
    renderizarApp()

    expect(await screen.findByText('Ainda não há inscrições')).toBeInTheDocument()
    expect(indicador('Total')).toBe('0')
  })

  it('abre os detalhes em um modal acessível e devolve o foco ao fechar', async () => {
    const { usuario } = renderizarApp()
    await esperarLista()

    const abrir = screen.getByRole('button', { name: 'Ver detalhes de Marina Albuquerque' })
    await usuario.click(abrir)

    const modal = await screen.findByRole('dialog', { name: 'Detalhes da inscrição' })
    expect(within(modal).getByText('Evento')).toBeInTheDocument()
    expect(within(modal).getByText('14/10/2026 às 09:12')).toBeInTheDocument()
    expect(within(modal).getByText('insc_marina.albuquerque')).toBeInTheDocument()

    await usuario.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(abrir).toHaveFocus()
  })
})
