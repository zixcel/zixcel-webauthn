import { defineConfig } from '@playwright/test'
delete process.env.NO_COLOR
process.env.FORCE_COLOR = '0'
export default defineConfig({ testDir: './test', testMatch: '*.e2e.mjs', workers: 1,
  timeout: 30_000, outputDir: '.artifacts/playwright', use: { browserName: 'chromium', headless: true } })
