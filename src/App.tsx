import { PainelInscricoes } from './features/inscricoes/PainelInscricoes'

export function App() {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-campo focus:bg-superficie-card focus:px-4 focus:py-2 focus:font-semibold focus:shadow-lg"
      >
        Pular para o conteúdo
      </a>

      <header className="bg-tinta-900 text-white">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
          <img src="/logo-negativo.svg" alt="Conexão Ateliê" width={132} height={40} className="h-10 w-auto" />
          <p className="hidden text-rotulo text-tinta-300 sm:block">Painel da equipe · Conexão Ateliê</p>
        </div>
      </header>

      <main id="conteudo" tabIndex={-1} className="mx-auto max-w-[1200px] px-4 py-6 focus:outline-none sm:px-6 sm:py-8">
        <h1 className="text-titulo-pagina font-bold">Inscrições</h1>
        <p className="mt-1 mb-5 text-corpo text-tinta-500 sm:mb-6">
          Campanha Conexão Ateliê
          <span className="max-sm:sr-only">. Acompanhe as inscrições e cadastre novos participantes.</span>
        </p>
        <PainelInscricoes />
      </main>
    </>
  )
}
