/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CANDIDATO_CODE?: string
  readonly VITE_API_URL?: string
  readonly VITE_API_CENARIO?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
