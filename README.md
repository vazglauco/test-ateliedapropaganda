# Painel de Inscrições · Conexão Ateliê

Painel em React + TypeScript para a equipe da campanha fictícia **Conexão Ateliê** consultar inscrições
e cadastrar participantes. Teste técnico para a vaga de Desenvolvedor Front-End do Ateliê de Propaganda.

A especificação escrita antes do código está em [`docs/ESPECIFICACAO.md`](docs/ESPECIFICACAO.md).

## Como executar

Requisitos: **Node 24** (versão usada: `v24.19.0`, também em `.nvmrc`) e npm 11.

```bash
npm install
cp .env.example .env.local   # preencha VITE_CANDIDATO_CODE com o código recebido por e-mail
npm run dev                  # http://localhost:5173
```

O código do candidato vai no header `X-Candidato` de todas as requisições. Sem ele, a tela mostra um
aviso de configuração em vez de um erro genérico.

### Reproduzindo os estados da interface

O app repassa para a API o parâmetro `?cenario=` da **própria URL**, então dá para ver cada estado sem
mexer no código:

| URL | Estado |
|---|---|
| `http://localhost:5173/?cenario=lento` | carregamento inicial (skeleton) |
| `http://localhost:5173/?cenario=erro` | erro ao buscar, com "Tentar novamente"; também o erro ao enviar o formulário |
| `http://localhost:5173/?cenario=vazio` | nenhuma inscrição cadastrada |
| `http://localhost:5173/?cenario=conflito` | e-mail já inscrito (409) ao cadastrar |
| busca ou filtro sem resultado | "Nenhuma inscrição encontrada" + "Limpar busca e filtro" |

Também é possível fixar um cenário com `VITE_API_CENARIO` no `.env.local`.

## Como executar os testes

```bash
npm test            # Vitest, execução única
npm run test:watch  # modo observação
npm run typecheck   # TypeScript
npm run lint        # oxlint
npm run build       # typecheck + build de produção
```

São 11 testes de comportamento com Testing Library e MSW. A rede é simulada, sem mock de hooks ou
componentes:

- **Formulário:** mensagens junto aos campos, foco no primeiro inválido e nenhum POST com dados
  inválidos. O erro some ao corrigir o campo.
- **Cadastro com sucesso:** o botão trava durante o envio (cliques e Enter repetidos geram um único
  POST), a nova pessoa aparece na lista e os indicadores sobem, sem recarregar a página.
- **409:** a mensagem aparece no campo e-mail e os dados continuam no formulário.
- **500 no envio:** alerta compreensível, dados preservados e botão liberado para tentar de novo.
- **Busca e filtro:** a combinação funciona, a busca ignora acentos e maiúsculas, os indicadores não
  mudam, e o estado "nenhum resultado" é diferente de "lista vazia".
- **Erro ao carregar:** o alerta aparece e "Tentar novamente" recupera a lista.
- **Lista vazia:** mensagem própria e indicadores zerados.
- **Modal de detalhes:** abre com os dados e a origem, fecha com Esc e devolve o foco ao botão que o
  abriu.
- **Unitários de `filtrar.ts`:** busca, combinação de filtros e totais.

## Principais decisões técnicas

| Tema | Decisão |
|---|---|
| Stack | Vite + React 19 + TypeScript, Tailwind CSS v4, TanStack Query v5, Zod, `fetch` nativo, Vitest + Testing Library + MSW. Sem biblioteca de componentes. |
| Tokens | As cores, a tipografia, os espaçamentos e os raios da *Folha de estilo* do Figma viraram `@theme` do Tailwind, com os mesmos nomes (`tinta-900`, `superficie-card`, `pendente-fundo`…). Ícones Lucide e fonte Inter self-hosted. |
| Dados | Um único `useQuery(['inscricoes'])` alimenta os indicadores e a listagem. Busca e filtro são derivados no cliente, então os cards representam sempre o conjunto completo, como pede o enunciado. |
| Cadastro | `useMutation`. No sucesso, o registro devolvido entra no cache na hora (`setQueryData`) e a lista é invalidada para confirmar com o servidor. Mutations nunca fazem retry automático, para não duplicar o cadastro. |
| Envio único | Botão `disabled` + `aria-busy` enquanto `isPending`, e uma guarda no `onSubmit` para cobrir Enter repetido. |
| Validação | Um só schema Zod (`novaInscricaoSchema`) para o formulário e para o corpo do POST. Os erros aparecem depois da primeira tentativa de envio e somem assim que o campo é corrigido. |
| Fronteira da API | Respostas validadas com Zod (`listaInscricoesSchema` aceita array puro ou envelope `{ data }`). Erros viram `ApiError` tipado (`codigo_ausente`, `conflito`, `validacao`, `servidor`, `rede`…), e a UI decide a mensagem pelo código. Os `campos` de um 400/422 são mapeados para os campos do formulário. |
| Datas | `Intl.DateTimeFormat` com `America/Sao_Paulo` fixo, para não depender do fuso da máquina e manter os testes determinísticos. |
| Listagem responsiva | `useMediaQuery` renderiza **uma** versão por vez: tabela semântica (≥ 1024 px) ou lista de cartões. Assim o leitor de tela não ouve o conteúdo duplicado, como aconteceria se as duas versões ficassem no DOM escondidas por CSS. |
| Filtro de status | Radios nativos estilizados como controle segmentado: setas do teclado e o anúncio de "selecionado" funcionam sem JS extra. |
| Modal | `<dialog>` nativo com `showModal()`: fundo inerte, foco preso e Esc fecham sem biblioteca. Fecha também pelo X, pelo botão "Fechar" ou por clique no fundo, e o foco volta ao botão de origem. Enquanto o `GET /inscricoes/{id}` responde, mostra os dados que já vieram da listagem. |
| Acessibilidade | Link "Pular para o conteúdo", landmarks e hierarquia de títulos, `label` em todos os campos, `aria-invalid` + `aria-describedby` nos erros, `role="alert"` e `role="status"` nos feedbacks, contador de resultados com `aria-live`, status sempre em texto, foco visível conforme o Figma (2 px `tinta-900`, afastado 2 px) e respeito a `prefers-reduced-motion`. |
| Formulário sem React Hook Form | São 3 campos; estado controlado + Zod é pouco código e uma dependência a menos para justificar. |

## O que foi concluído

- [x] Indicadores (total, pendentes, aprovadas) sobre o conjunto completo
- [x] Listagem com nome, e-mail, data e status, com versão para celular
- [x] Busca por nome ou e-mail (sem diferenciar acentos e maiúsculas) e filtro por status
- [x] Detalhes de cada inscrição (modal com origem e código, via `GET /inscricoes/{id}`)
- [x] Cadastro com validação, envio único, sucesso/falha e atualização sem recarregar
- [x] Estados A–E do enunciado, mais código do candidato ausente e falha ao atualizar em segundo plano
- [x] Responsividade (desktop 1440 / celular 390) e acessibilidade
- [x] 11 testes automatizados

## O que ficou pendente

- [ ] Importação de CSV (opcional). Os casos do arquivo de exemplo já estão mapeados na seção 10 da
      especificação: vírgula entre aspas, origem `whatsapp`, e-mail duplicado, maiúsculas, `@@`.

## O que eu melhoraria com mais tempo

- Importação de CSV com prévia, validação por linha (reaproveitando o schema Zod) e contadores.
- Testes de acessibilidade automatizados (`vitest-axe`) e testes E2E com Playwright, incluindo o
  layout de celular.
- Busca e filtro sincronizados com a URL (`?busca=&status=`), para compartilhar e voltar ao estado.
- Paginação ou virtualização da lista, se o volume real crescer.
- Ordenação por coluna na tabela.

## Tempo aproximado dedicado

Cerca de **1h15**, da leitura do enunciado e montagem da especificação até a revisão final e os testes.

## Uso de inteligência artificial

Usei o **Claude Code** (Anthropic) durante todo o exercício.

**Como trabalhamos:**

1. **Especificação primeiro.** Antes de escrever código, fui construindo junto com o Claude Code o
   arquivo [`docs/ESPECIFICACAO.md`](docs/ESPECIFICACAO.md), a partir do enunciado e do layout de
   referência. Nele definimos o contrato da API, cada estado da interface, os tokens do Figma, os
   critérios de acessibilidade, a estrutura de pastas, os testes e a ordem de prioridade dentro das
   4 horas. Revisei e aprovei a especificação antes de seguir.
2. **Implementação guiada pela especificação.** Com ela aprovada, o Claude Code gerou a estrutura
   do projeto, a camada de API, os componentes e os testes, seguindo as decisões registradas.
3. **Revisão.** Li o código, pedi ajustes de organização e uma última rodada de limpeza antes da
   entrega.

**Como verifiquei o resultado:**

- `npm test` (11/11), `npm run typecheck`, `npm run lint` e `npm run build` passando;
- conferência no navegador, em desktop (1440 px) e celular (390 px): os estados via `?cenario=`, o
  fluxo de cadastro (botão travado durante o envio, lista e indicadores atualizados), o modal por
  teclado (Esc e devolução de foco) e a ausência de rolagem horizontal;
- comparação visual com as telas, a folha de estilo e os componentes do Figma.
