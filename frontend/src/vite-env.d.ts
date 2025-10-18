/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV?: string;
}
interface ImportMetaEnv {
  readonly VITE_API_DOMAIN?: string;
}

interface ImportMetaEnv {
  readonly VITE_BACKEND_PORT?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

