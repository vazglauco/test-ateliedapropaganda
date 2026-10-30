# Especificação — Painel de Inscrições · Conexão Ateliê

> Documento de especificação escrito **antes** do código. Fontes: enunciado do teste
> (apresentacao.ateliedepropaganda.com.br/testes-vagas/teste-vaga-front-end-atelie), layout no Figma
> (páginas *Telas*, *Folha de estilo* e *Componentes*) e o pacote `materiais-teste-frontend.zip`.
> Status: **aprovada** · 30/10/2026

---

## 1. Objetivo e limites

Painel web (React + TypeScript) para a equipe da campanha fictícia **Conexão Ateliê** consultar
inscrições e cadastrar participantes.

O que o avaliador vai olhar, na ordem dele: escopo funcionando → integração/estados assíncronos →
organização do código → fidelidade ao layout, responsividade e acessibilidade → qualidade dos testes →
capacidade de priorizar e explicar.

**Fora de escopo:** backend, autenticação, mobile nativo, envio do CSV para a API, edição/aprovação de
inscrições, paginação no servidor.

**Restrições:** até ~4 h de dedicação, prazo de 3 dias corridos, entrega via GitHub + README.

---

## 2. API

| Item | Valor |
|---|---|
| Base | `https://api-teste.ateliedepropaganda.com.br/` |
| Header obrigatório | `X-Candidato: <código do candidato>` (em **todas** as requisições) |
| CORS | `Access-Control-Allow-Origin: *` (verificado) |

### Endpoints

| Método | Rota | Uso no painel |
|---|---|---|
| GET | `/inscricoes` | lista completa → cards + listagem |
| GET | `/inscricoes/{id}` | detalhes no modal |
| POST | `/inscricoes` | cadastro (`{ nome, email, origem }`) → cria com status `pendente` |

### Modelo

```ts
type Origem = 'site' | 'evento' | 'redes_sociais'
type Status = 'pendente' | 'aprovado'

interface Inscricao {
  id: string          // "insc_1042"
  nome: string
  email: string
  origem: Origem
  status: Status
  criadoEm: string    // ISO 8601 com offset, ex. "2026-10-14T09:12:00-03:00"
}
```

### Erros

Formato observado (resposta 401 sem o header):

```json
{ "erro": "codigo_invalido", "mensagem": "Código de candidato ausente ou inválido. Envie o header X-Candidato.", "campos": {} }
```

| Status | Situação | Tratamento na UI |
|---|---|---|
| 401 | código ausente/inválido | mensagem específica: "Configure o código do candidato" (erro de configuração, não do usuário) |
| 409 | e-mail já inscrito (`?cenario=conflito`) | erro **no campo e-mail**: "Este e-mail já está inscrito na campanha." |
| 400/422 | validação no servidor | mapear `campos` para os campos do formulário; fallback para `mensagem` |
| 500 / rede | falha genérica (`?cenario=erro`) | alerta com mensagem compreensível + ação de tentar de novo |

### Cenários simulados (`?cenario=`)

`lento` (atraso), `erro` (500), `vazio` (lista vazia), `conflito` (409 no POST).

**Decisão:** o app repassa para a API o `?cenario=` da **própria URL do app**
(ex.: `http://localhost:5173/?cenario=lento`). Assim o avaliador reproduz cada estado sem mexer no
código. Opcionalmente, `VITE_API_CENARIO` define um cenário fixo em desenvolvimento.

### Configuração do código do candidato

- `.env.local` (fora do git) → `VITE_CANDIDATO_CODE=...`
- `.env.example` versionado, com a variável vazia e um comentário.
- Se a variável estiver vazia, a UI mostra um aviso claro ("código do candidato não configurado") em vez
  de um erro genérico.

> ⚠️ O código vai no bundle do front-end, o que é aceitável aqui (é um identificador de sandbox, não um
> segredo). Vou registrar isso no README.

### Validação na fronteira

As respostas passam por `schema.parse` do Zod (lista, detalhe e POST). Se o formato vier diferente do
esperado, cai num erro tratado e não quebra a renderização mais adiante.

**A confirmar quando o código chegar:**
1. se `GET /inscricoes` devolve um array puro ou um envelope (`{ data: [...] }`, paginação);
2. o que o POST devolve (o objeto criado?);
3. a ordem da lista. Se não houver ordem, ordeno por `criadoEm` decrescente.

---

## 3. Funcionalidades

### 3.1 Indicadores (cards)

- **Total de inscrições**, **Pendentes**, **Aprovadas**.
- Calculados sobre o conjunto **completo** retornado por `GET /inscricoes`. **Não** mudam com busca nem
  com filtro (regra explícita do enunciado).
- Durante o carregamento: skeleton. Em caso de erro: "—" (o alerta de erro fica na listagem).
- Cada valor fica no mesmo elemento que o rótulo (`<dl>` ou rótulo associado), para o leitor de tela
  anunciar "Pendentes, 46".

### 3.2 Listagem

- Colunas: **Nome**, **E-mail**, **Data** (`dd/mm/aaaa`), **Status** (selo) e a ação **Ver detalhes**.
- Contador acima da lista: "Mostrando N de M inscrições", com `aria-live="polite"`, para anunciar o
  resultado da busca ou do filtro.
- Desktop (≥ `lg`): `<table>` semântica, com `<caption>` visualmente oculta e `scope="col"`. E-mail
  longo é truncado com reticências e tem o valor completo em `title`.
- Celular (< `lg`): `<ul>` de cartões (nome + selo / e-mail / data / chevron). O cartão inteiro é um
  `<button>` que abre os detalhes.
- Ordem: `criadoEm` decrescente (mais recentes primeiro).
- Sem paginação: lista tudo. "Mostrando 8 de 128" no Figma é só o recorte do frame. *(Ver seção 11.)*

### 3.3 Busca

- Um campo para **nome ou e-mail**. Filtra no cliente, sem diferenciar maiúsculas de minúsculas **nem
  acentos** ("joao" encontra "João").
- Filtra enquanto o usuário digita, com `useDeferredValue` (sem debounce manual, já que não há request).
- O campo é `type="search"`, tem `<label>` (pode ser visualmente oculto) e o ícone de lupa é decorativo
  (`aria-hidden`).

### 3.4 Filtro por status

- Opções: **Todos**, **Pendente**, **Aprovado**, como controle segmentado.
- Implementação acessível: `<fieldset>` com `<legend>` oculta e **radio buttons nativos** estilizados
  (as setas do teclado funcionam sem JS extra).
- Busca e filtro se combinam (E lógico).

### 3.5 Detalhes da inscrição

- Abre ao clicar em **Ver detalhes** (desktop) ou no cartão (celular).
- Busca `GET /inscricoes/{id}`. Enquanto carrega, mostra os dados já conhecidos da lista
  (`placeholderData`), então o modal não fica vazio. Se a busca falhar, mostra erro dentro do modal com
  "Tentar novamente".
- Campos: Nome, E-mail, Origem do cadastro (rótulo legível), Status (selo), Data da inscrição
  (`dd/mm/aaaa às HH:mm`) e Código (`id`).
- Modal com `<dialog>` nativo + `showModal()`:
  - foco inicial no botão de fechar ou no título;
  - **Esc** fecha;
  - o fundo fica inerte (nativo);
  - fecha também pelo **X** (com `aria-label="Fechar"`), pelo botão **Fechar** e por clique no backdrop;
  - ao fechar, o **foco volta** ao botão que abriu;
  - `aria-labelledby` aponta para o título "Detalhes da inscrição".

### 3.6 Cadastro de participante

| Campo | Controle | Regra (Zod) | Mensagem |
|---|---|---|---|
| Nome completo | `input text`, `autocomplete="name"` | obrigatório (após `trim`) | "Informe o nome completo." |
| E-mail | `input email`, `autocomplete="email"`, `inputmode="email"` | obrigatório + formato válido (após `trim`) | "Informe o e-mail." / "Informe um e-mail válido, como nome@exemplo.com." |
| Origem | `<select>` nativo, placeholder "Selecione a origem" | um de `site`, `evento`, `redes_sociais` | "Selecione a origem do cadastro." |

Comportamento:

1. **Validação:** no submit. Depois do primeiro submit, revalida a cada mudança, para o erro sumir assim
   que o usuário corrige. Não mostra erro antes de o usuário tentar enviar.
2. **Mensagem junto ao campo:** ícone + texto em `feedback/erro`, ligada ao campo por
   `aria-describedby`, com `aria-invalid="true"` e borda vermelha. Cor não é o único sinal.
3. **Foco no primeiro campo inválido** ao submeter com erro.
4. **Envio único:** com `mutation.isPending`, o botão fica `disabled` + `aria-busy`, o texto vira
   "Cadastrando…" e o handler ignora submits extras (guarda dupla: botão + checagem no handler, para
   cobrir Enter repetido).
5. **Sucesso:** mensagem "Participante cadastrado com sucesso." em `role="status"`, o formulário é
   limpo e o foco volta ao primeiro campo. A lista e os cards são atualizados **sem recarregar**
   (`invalidateQueries(['inscricoes'])`; com o objeto retornado pelo POST, também `setQueryData` para
   aparecer na hora).
6. **Falha:** os dados digitados são **preservados**.
   - 409 → erro no campo e-mail.
   - 400/422 com `campos` → erros nos campos correspondentes.
   - 500/rede → alerta `role="alert"` acima do botão: "Não foi possível cadastrar agora. Seus dados
     foram mantidos; tente novamente."
7. Texto fixo: "Todos os campos são obrigatórios." e, abaixo do botão, "Novos cadastros entram com
   status Pendente."

O mesmo schema Zod serve para a validação do formulário e para tipar o payload do POST.

---

## 4. Estados da interface

| # | Estado | Como reproduzir | O que a UI mostra |
|---|---|---|---|
| A | Carregamento inicial | `?cenario=lento` | Skeleton nos cards e nas linhas da lista; região com `aria-busy="true"` e texto oculto "Carregando inscrições…". O formulário já fica usável. |
| B | Erro ao buscar | `?cenario=erro` | Alerta na área da lista: título "Não foi possível carregar as inscrições", descrição e botão **Tentar novamente** (`refetch`). O botão fica em estado de carregamento durante a nova tentativa. Cards com "—". |
| C | Nenhuma inscrição | `?cenario=vazio` | Mensagem própria: "Ainda não há inscrições" + "Use o formulário ao lado para cadastrar o primeiro participante." Cards com 0. |
| D | Nenhum resultado | busca ou filtro sem correspondência | "Nenhuma inscrição encontrada para "termo"" (inclui o filtro ativo) + botão **Limpar busca e filtro**. Cards inalterados. |
| E | Erro no envio | `?cenario=erro` ou `?cenario=conflito` no POST | Ver 3.6, item 6. Os campos continuam preenchidos. |
| — | Código ausente/401 | sem `.env.local` | Aviso de configuração (seção 2). |
| — | Atualização em segundo plano | refetch após cadastro | Indicador discreto ("Atualizando…") sem esconder a lista atual. |

C e D são estados **diferentes** e precisam de textos diferentes, ponto que o enunciado cobra
explicitamente.

---

## 5. Layout (do Figma)

Larguras de referência: **desktop 1440 px** (conteúdo com no máximo **1200 px**) e **celular 390 px**.
O Leia-me do Figma diz que não é preciso acertar cada pixel, mas que é preciso seguir estrutura,
hierarquia e tokens.

### Desktop

```
┌ header escuro (tinta/900) ─ logo negativo ─────────── "Painel da equipe · Conexão Ateliê" ┐
│ Inscrições  (Título/Página)                                                               │
│ Campanha Conexão Ateliê. Acompanhe as inscrições e cadastre novos participantes.          │
│ [Total de inscrições 128] [Pendentes 46] [Aprovadas 82]        ← 3 cards em linha          │
│ ┌ card listagem (~2/3) ────────────────────────┐ ┌ card formulário (~1/3) ─┐               │
│ │ [🔍 Buscar por nome ou e-mail] [Todos|Pend|Apr]│ │ Cadastrar participante  │               │
│ │ Mostrando 8 de 128 inscrições                 │ │ Todos os campos são obr.│               │
│ │ NOME | E-MAIL | DATA | STATUS | Ver detalhes >│ │ Nome / E-mail / Origem  │               │
│ │ …                                             │ │ [Cadastrar participante]│               │
│ └───────────────────────────────────────────────┘ │ Novos cadastros entram… │               │
│                                                   └─────────────────────────┘               │
```

### Celular (390 px)

O header mostra só o logo. Depois vêm o título e o subtítulo curto "Campanha Conexão Ateliê", os 3 cards
compactos em linha (Total / Pendentes / Aprovadas), a busca em largura total e o filtro segmentado em
largura total. Em seguida, a lista em cartões (nome + selo, e-mail, data, chevron) e, **abaixo da
lista**, o formulário.

### Modal de detalhes

Título "Detalhes da inscrição" + X, depois linhas rótulo/valor separadas por divisores e, no rodapé, o
botão secundário **Fechar**. Backdrop escurecido.

---

## 6. Design tokens (Folha de estilo do Figma → `@theme` do Tailwind v4)

### Cores

| Token | Hex | Uso |
|---|---|---|
| `tinta-900` | `#111A17` | base escura: header, botão primário, texto principal |
| `tinta-700` | `#2A3531` | hover/pressionado dos botões escuros |
| `tinta-500` | `#586661`* | texto secundário (contraste 5,9:1 sobre branco) |
| `tinta-300` | `#A9B1AD` | bordas de campo e divisores fortes |
| `tinta-100` | `#E8E9E7` | bordas de card e divisores de linha |
| `superficie-pagina` | `#F4F5F2` | fundo da página |
| `superficie-card` | `#FFFFFF` | cards, tabela, formulário |
| `superficie-sutil` | `#F8F9F7` | cabeçalho da tabela e hover de linha |
| `marca-coral` | `#FF5C39` | destaque/marca. **Nunca para texto pequeno** |
| `status-pendente-fundo` | `#FFF1D6` | fundo do selo Pendente |
| `status-pendente-texto` | `#8A5300` | texto e ponto do selo Pendente |
| `status-aprovado-fundo` | `#E2F2E8` | fundo do selo Aprovado |
| `status-aprovado-texto` | `#1D6B42` | texto e ponto do selo Aprovado |
| `feedback-erro` | `#B42318` | mensagens e bordas de erro |
| `feedback-erro-fundo` | `#FDECEA` | fundo de alerta de erro |
| `feedback-sucesso` | `#1D6B42` | mensagens de sucesso |
| `feedback-sucesso-fundo` | `#E2F2E8` | fundo de alerta de sucesso |
| `foco` | `#111A17` | contorno de foco |

\* Valores lidos visualmente do Figma em modo visitante. O coral foi confirmado pelo SVG do logo
(`#FF5C39`). Antes de fechar o tema, vou conferir os outros hex com um conta-gotas.

### Tipografia (Inter: 400, 500, 600, 700)

| Estilo | Spec |
|---|---|
| Título/Página | Bold 28/34 |
| Título/Seção | Semi Bold 16/24 |
| Número/Indicador | Bold 32/36 |
| Texto/Corpo | Regular 14/20 |
| Texto/Corpo forte | Semi Bold 14/20 |
| Texto/Rótulo | Medium 13/18 |
| Texto/Legenda | Regular 12/16 |
| Texto/Cabeçalho de coluna | Semi Bold 11/16, maiúsculas |

A fonte vem de `@fontsource-variable/inter` (self-hosted, sem depender do Google Fonts em runtime).

### Espaçamento e raios

- Escala de 4 px: 4, 8, 12, 16, 24, 32, 48. Bate com a escala padrão do Tailwind (`1, 2, 3, 4, 6, 8,
  12`).
- Raios: `campo` 6 px, `card` 10 px, `pilula` full (selos e filtro).

### Ícones, logo e foco

- **Ícones:** Lucide (`lucide-react`), 20 px, traço 2, cor `tinta-500`. Os usados são `Search`,
  `ChevronRight`, `ChevronDown`, `X` e `CircleAlert`. Todos são decorativos (`aria-hidden`), e o texto
  acessível fica no controle.
- **Logo:** `Negativo.svg` no header escuro, `Positivo.svg` em fundo claro. O `alt` é "Conexão Ateliê".
- **Foco visível:** contorno de **2 px `tinta-900`, afastado 2 px**, em **todos** os itens clicáveis,
  via `focus-visible:outline-2 outline-offset-2 outline-foco`. No header escuro uso uma variante clara,
  para o contorno não sumir.

### Componentes (página *Componentes* do Figma)

- **Botão:** primário (fundo `tinta-900`, texto branco) e secundário (contorno). Os estados hover,
  foco e desabilitado não estão desenhados, e o Leia-me pede que eu os defina com os tokens.
- **Selo de status:** pílula com ponto + texto ("Pendente" / "Aprovado"). O texto sempre aparece.
- **Campo de texto:** padrão e erro (borda `feedback-erro` + ícone + mensagem).
- **Seleção** com chevron, **Campo de busca** com lupa, **Indicador**, **Filtro de status**,
  **Linha da tabela** e **Item da lista (celular)**.

---

## 7. Acessibilidade (checklist que vira critério de aceite)

- [ ] Landmarks: `<header>`, `<main>` e `<h1>` "Inscrições". Seções com `<h2>` (visível ou oculto):
      "Indicadores", "Lista de inscrições", "Cadastrar participante".
- [ ] Link "Pular para o conteúdo".
- [ ] Todos os campos com `<label>` associado. Os placeholders não substituem rótulos.
- [ ] Erros com `aria-invalid` + `aria-describedby`, texto claro e ícone. Cor não é o único sinal.
- [ ] Status sempre como texto ("Pendente"/"Aprovado"), não só cor.
- [ ] Ordem de tabulação lógica. Tudo operável por teclado (filtro via setas, modal via Esc).
- [ ] Foco visível em tudo (token `foco`). Nenhum `outline: none` sem substituto.
- [ ] Modal: foco preso (o `<dialog>` nativo cuida disso), Esc fecha e o foco é devolvido.
- [ ] `aria-live`: contador de resultados (polite), sucesso do formulário (`role="status"`), erros
      (`role="alert"`).
- [ ] Botões "Ver detalhes" com nome único: "Ver detalhes de Marina Albuquerque".
- [ ] Contraste AA (coral só como destaque, nunca em texto pequeno).
- [ ] `lang="pt-BR"` e `<title>` descritivo.
- [ ] Alvos de toque ≥ 44 px no celular.
- [ ] Respeito a `prefers-reduced-motion` nos skeletons e transições.

---

## 8. Arquitetura

### Stack (exigida pelo enunciado + escolhas)

| Uso | Escolha | Motivo |
|---|---|---|
| Base | React 19 + TypeScript + Vite | exigido |
| Estilo | Tailwind CSS v4 (`@tailwindcss/vite`) | exigido; tokens em `@theme` |
| Dados | TanStack Query v5 | exigido; cache, `refetch` e invalidação |
| Validação | Zod | exigido; o mesmo schema para formulário e API |
| Requisições | `fetch` nativo + wrapper fino | menos dependências; erro tipado próprio |
| Formulário | estado controlado + Zod (sem React Hook Form) | são 3 campos; menos uma lib para justificar |
| Ícones | `lucide-react` | definido no Figma |
| Testes | Vitest + Testing Library + user-event + MSW | testes de comportamento com a rede simulada (sem mockar hooks) |
| Node | 24.x (`.nvmrc`) | versão local: v24.19.0 |

Não uso biblioteca de componentes: o `<dialog>` e os inputs nativos resolvem a acessibilidade com
pouco código.

### Estrutura de pastas

```
src/
  api/
    client.ts          # fetch + baseURL + X-Candidato + ?cenario= + ApiError
    inscricoes.ts      # listar, obter, criar
    schemas.ts         # Zod: inscrição, lista, nova inscrição, erro da API
  features/inscricoes/
    PainelInscricoes.tsx
    hooks.ts           # useInscricoes, useInscricao(id), useCriarInscricao
    filtrar.ts         # funções puras: busca normalizada, status, totais
    components/
      Indicadores.tsx
      BarraFiltros.tsx
      ListaInscricoes.tsx      # estados A–D + escolhe tabela ou cartões
      TabelaInscricoes.tsx
      CartoesInscricoes.tsx
      DetalhesInscricaoModal.tsx
      FormularioCadastro.tsx
  components/ui/       # Botao, Campo, SeloStatus, Alerta, Skeleton
  lib/                 # format (datas e rótulos), queryClient, useMediaQuery
  App.tsx
  main.tsx
  index.css            # @import "tailwindcss" + @theme com os tokens
test/
  setup.ts             # jest-dom, MSW, matchMedia e <dialog> para o jsdom
  handlers.ts          # handlers MSW + fábrica de dados
  renderizar.tsx       # render com QueryClientProvider + userEvent
```

### Decisões

- **Um único `useQuery(['inscricoes'])`** alimenta os cards e a lista. Busca e filtro são estado local
  e derivados com `useMemo`, então os cards ficam naturalmente fora do filtro.
- O estado de busca e filtro fica no `App` (ou no componente de painel). Não precisa de contexto nem de
  store.
- **Datas** são formatadas com `Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' })`, para
  o resultado não depender do fuso da máquina (e os testes ficarem determinísticos).
- **Rótulos:** `site → Site`, `evento → Evento`, `redes_sociais → Redes sociais`;
  `pendente → Pendente`, `aprovado → Aprovado`.
- **Query client:** `retry: 1` nas queries (no teste, `retry: false`) e `refetchOnWindowFocus` mantido.
  As mutations **não** fazem retry automático, para não haver cadastro duplicado.

---

## 9. Testes automatizados

O mínimo exigido são 2. O plano tem 5 testes em ordem de prioridade, todos descrevendo o que o usuário
faz e vê, com a rede simulada por MSW:

1. **Validação do formulário** *(exigido)*: ao enviar vazio, aparecem as 3 mensagens junto aos campos,
   o foco vai para "Nome completo" e **nenhum POST** é feito. Um e-mail inválido mostra a mensagem de
   formato.
2. **Cadastro bem-sucedido**: o usuário preenche e envia, o botão fica desabilitado durante o envio, a
   mensagem de sucesso aparece, a nova pessoa surge na lista e os cards "Total" e "Pendentes" sobem
   em 1.
3. **Busca e filtro**: filtrar "Aprovado" mostra só aprovados, os cards não mudam e uma busca sem
   correspondência mostra "Nenhuma inscrição encontrada" (estado D, diferente de C).
4. **Erro ao carregar + tentar novamente**: com 500, aparece o alerta, e o clique em "Tentar novamente"
   (com o handler agora OK) mostra a lista.
5. **Conflito 409**: o erro aparece no campo e-mail e os dados continuam preenchidos.

Se sobrar tempo, entram testes unitários de `filtrar.ts` (acentos) e um teste de teclado do modal (Esc
devolve o foco).

---

## 10. Opcional: importação de CSV

Só entra se sobrar tempo dentro das 4 h. Leitura **local** (`FileReader`), sem envio à API.

- Prévia em tabela das linhas, com o status de validade por linha e o motivo.
- Contadores: válidos / inválidos.
- O parser precisa respeitar **aspas com vírgula** (`"Fernanda Souza, Jr."`). Uso o `papaparse` ou um
  parser pequeno próprio.

Casos que o arquivo de exemplo realmente contém e a regra para cada um:

| Linha | Problema | Regra |
|---|---|---|
| Rafael Tanaka | `rafael.tanaka@exemplo` | e-mail inválido |
| (sem nome) | nome vazio | campo obrigatório ausente |
| Caio Ferraz | origem vazia | campo obrigatório ausente |
| Eduardo Sá | `@@` | e-mail inválido |
| "Fernanda Souza, Jr." | vírgula entre aspas | **válida** (o parser precisa lidar) |
| Gustavo Ribeiro | e-mail vazio | campo obrigatório ausente |
| Igor Pacheco | espaço no e-mail | e-mail inválido |
| Leonardo Assis | origem `whatsapp` | origem fora dos valores aceitos (inválido) |
| Mariana Teixeira | e-mail MAIÚSCULO | **válido** (normalizar para minúsculas) |
| Beatriz Passos | mesmo e-mail de Beatriz Nogueira | duplicado no arquivo (sinalizar como aviso) |

O mesmo schema Zod do formulário valida cada linha.

---

## 11. Pontos em aberto / premissas

1. **Formato real da lista** (array ou envelope, paginação): confirmo com o código do candidato. O
   schema Zod se ajusta em um único lugar.
2. **Paginação:** premissa de **não** paginar, porque o enunciado não pede. Se a API devolver centenas
   de itens, avalio um "Carregar mais" no cliente.
3. **Hex exatos dos tokens:** conferir com conta-gotas (seção 6).
4. **Duplicado no CSV:** tratar como aviso ou inválido? Premissa: **aviso** (o servidor é quem
   decide, via 409).
5. **Publicar demo** (Vercel/Netlify) é opcional. Exige colocar o código do candidato numa env da
   plataforma, e ele ficaria exposto no bundle público. Premissa: não publicar, ou publicar só com a sua
   autorização.

---

## 12. Ordem de execução (prioridade dentro de 4 h)

| # | Etapa | Tempo |
|---|---|---|
| 1 | Scaffold + tokens + layout estático (header, título, grid) | ~30 min |
| 2 | Camada de API + schemas + hooks | ~30 min |
| 3 | Cards + listagem (tabela e cartões) + busca/filtro + estados A–D | ~60 min |
| 4 | Formulário completo + estado E + 409 | ~45 min |
| 5 | Modal de detalhes com foco | ~20 min |
| 6 | Testes 1–3 (depois 4–5) | ~30 min |
| 7 | Passada de acessibilidade/responsividade + README | ~15 min |
| 8 | *(opcional)* CSV | se sobrar |

---

## 13. Entrega: README deve conter

- [ ] Como executar (`npm i`, criar `.env.local`, `npm run dev`) e como reproduzir os cenários
      (`?cenario=`)
- [ ] Como executar os testes (`npm test`)
- [ ] Versão do Node (24.x) + `.nvmrc`
- [ ] Tempo aproximado dedicado
- [ ] Principais decisões técnicas (seção 8, resumida)
- [ ] O que foi concluído / o que ficou pendente
- [ ] O que melhoraria com mais tempo
- [ ] **Uso de IA:** quais ferramentas, em quais partes, como verificou o resultado

Envio: link do repositório para **atelie@ateliedepropaganda.com.br**, com o assunto
**"Teste Front-End — Seu nome"**.
