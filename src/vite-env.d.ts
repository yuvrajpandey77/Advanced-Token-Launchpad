/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USDT_MINT_ADDRESS?: string;
  readonly VITE_RPC_URL_DEVNET?: string;
  readonly VITE_RPC_URL_MAINNET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

