/// <reference types="vite/client" />

declare module 'qrcode' {
  export function toDataURL(text: string, options?: any): Promise<string>
  export function toCanvas(canvas: HTMLCanvasElement, text: string, options?: any): Promise<void>
  export function toString(text: string, options?: any): Promise<string>
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
