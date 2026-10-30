import { useRef, useState, type FormEvent } from 'react'
import { ChevronDown } from 'lucide-react'
import { ApiError } from '../../../api/client'
import { ORIGENS, novaInscricaoSchema } from '../../../api/schemas'
import { Alerta } from '../../../components/ui/Alerta'
import { Botao } from '../../../components/ui/Botao'
import { Campo } from '../../../components/ui/Campo'
import { ariaDoCampo, estiloControle } from '../../../components/ui/campoAria'
import { ROTULO_ORIGEM } from '../../../lib/format'
import { useCriarInscricao } from '../hooks'

const CAMPOS = ['nome', 'email', 'origem'] as const
type NomeCampo = (typeof CAMPOS)[number]
type Valores = Record<NomeCampo, string>
type Erros = Partial<Record<NomeCampo, string>>

const VAZIO: Valores = { nome: '', email: '', origem: '' }

function validar(valores: Valores) {
  const resultado = novaInscricaoSchema.safeParse(valores)
  if (resultado.success) return { dados: resultado.data, erros: {} as Erros }
  const erros: Erros = {}
  for (const issue of resultado.error.issues) {
    const campo = issue.path[0] as NomeCampo
    erros[campo] ??= issue.message
  }
  return { dados: null, erros }
}

function primeiroComErro(erros: Erros) {
  return CAMPOS.find((campo) => erros[campo])
}

function errosDoServidor(erro: Error): Erros {
  if (!(erro instanceof ApiError)) return {}
  if (erro.codigo === 'conflito') return { email: 'Este e-mail já está inscrito na campanha.' }
  const erros: Erros = {}
  for (const campo of CAMPOS) if (erro.campos[campo]) erros[campo] = erro.campos[campo]
  return erros
}

function mensagemFalhaEnvio(erro: Error) {
  if (erro instanceof ApiError && erro.codigo === 'codigo_ausente') {
    return 'O código do candidato não está configurado ou é inválido. Seus dados foram mantidos.'
  }
  return 'Não foi possível cadastrar agora. Seus dados foram mantidos; tente novamente.'
}

export function FormularioCadastro() {
  const criar = useCriarInscricao()
  const [valores, setValores] = useState<Valores>(VAZIO)
  const [erros, setErros] = useState<Erros>({})
  const [tentouEnviar, setTentouEnviar] = useState(false)
  const [falhaEnvio, setFalhaEnvio] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const nomeRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const origemRef = useRef<HTMLSelectElement>(null)

  function focar(campo: NomeCampo | undefined) {
    const alvo = { nome: nomeRef, email: emailRef, origem: origemRef }
    if (campo) alvo[campo].current?.focus()
  }

  function alterar(campo: NomeCampo, valor: string) {
    const novos = { ...valores, [campo]: valor }
    setValores(novos)
    setSucesso(null)
    if (tentouEnviar) setErros(validar(novos).erros)
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (criar.isPending) return

    setTentouEnviar(true)
    setFalhaEnvio(null)
    setSucesso(null)

    const { dados, erros: novosErros } = validar(valores)
    setErros(novosErros)
    if (!dados) {
      focar(primeiroComErro(novosErros))
      return
    }

    criar.mutate(dados, {
      onSuccess: () => {
        setValores(VAZIO)
        setErros({})
        setTentouEnviar(false)
        setSucesso(`${dados.nome} entrou na lista com status Pendente.`)
        focar('nome')
      },
      onError: (erro) => {
        const errosCampo = errosDoServidor(erro)
        const primeiro = primeiroComErro(errosCampo)
        if (primeiro) {
          setErros(errosCampo)
          focar(primeiro)
          return
        }
        setFalhaEnvio(mensagemFalhaEnvio(erro))
      },
    })
  }

  return (
    <section
      aria-labelledby="titulo-cadastro"
      className="rounded-card border border-tinta-100 bg-superficie-card p-4 sm:p-5"
    >
      <h2 id="titulo-cadastro" className="text-titulo-secao font-semibold">
        Cadastrar participante
      </h2>
      <p className="mt-0.5 text-legenda text-tinta-500">Todos os campos são obrigatórios.</p>

      <form noValidate onSubmit={enviar} className="mt-4 space-y-4">
        <Campo id="nome" rotulo="Nome completo" erro={erros.nome}>
          <input
            ref={nomeRef}
            {...ariaDoCampo('nome', erros.nome)}
            name="nome"
            type="text"
            autoComplete="name"
            aria-required="true"
            placeholder="Ex.: Marina Albuquerque"
            value={valores.nome}
            onChange={(e) => alterar('nome', e.target.value)}
            className={estiloControle}
          />
        </Campo>

        <Campo id="email" rotulo="E-mail" erro={erros.email}>
          <input
            ref={emailRef}
            {...ariaDoCampo('email', erros.email)}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            spellCheck={false}
            aria-required="true"
            placeholder="nome@exemplo.com"
            value={valores.email}
            onChange={(e) => alterar('email', e.target.value)}
            className={estiloControle}
          />
        </Campo>

        <Campo id="origem" rotulo="Origem" erro={erros.origem}>
          <div className="relative">
            <select
              ref={origemRef}
              {...ariaDoCampo('origem', erros.origem)}
              name="origem"
              aria-required="true"
              value={valores.origem}
              onChange={(e) => alterar('origem', e.target.value)}
              className={`${estiloControle} appearance-none pr-10 ${valores.origem ? '' : 'text-tinta-500'}`}
            >
              <option value="">Selecione a origem</option>
              {ORIGENS.map((origem) => (
                <option key={origem} value={origem} className="text-tinta-900">
                  {ROTULO_ORIGEM[origem]}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden
              className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-tinta-500"
            />
          </div>
        </Campo>

        <div role="alert">
          {falhaEnvio && <Alerta tipo="erro">{falhaEnvio}</Alerta>}
        </div>

        <Botao type="submit" carregando={criar.isPending} className="w-full">
          {criar.isPending ? 'Cadastrando…' : 'Cadastrar participante'}
        </Botao>

        <div role="status">
          {sucesso && (
            <Alerta tipo="sucesso" titulo="Participante cadastrado com sucesso.">
              {sucesso}
            </Alerta>
          )}
        </div>

        <p className="text-legenda text-tinta-500">Novos cadastros entram com status Pendente.</p>
      </form>
    </section>
  )
}
