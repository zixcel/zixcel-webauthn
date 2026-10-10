/** Test-only browser bridge exposes the exact compiled package API. */
declare global {
  interface Window { api: typeof import('../../dist/browser.mjs') }
}
export {};
