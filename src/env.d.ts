/// <reference types="vite/client" />

/**
 * Type declarations for Vite environment variables
 * This tells TypeScript about import.meta.env and VITE_* variables
 */

interface ImportMetaEnv {
  /**
   * Backend API URL for the stock prediction service
   * Default: http://localhost:8000
   */
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
