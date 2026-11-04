/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WHATSAPP_NUMBER?: string;
  readonly VITE_PEN_PER_USD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
