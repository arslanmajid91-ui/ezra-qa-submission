/* eslint-disable no-console */
import { chromium } from '@playwright/test'
import { memberCredentials } from '../utils/testData'
import { Selectors } from '../utils/selectors'
import { MemberDashboardPage } from '../pages/MemberDashboardPage'
import * as fs from 'fs'

/**
 * Runs once before all workers.
 * 1. Signs in (or reuses cached auth state) and persists storageState.
 * 2. Always cancels any active bookings left over from previous runs so
 *    every test suite starts with a clean account.
 */
export const AUTH_STATE_PATH = 'playwright/.auth/user.json'
const BASE_URL = process.env.BASE_URL ?? 'https://myezra-staging.ezra.com'
const AUTH_MAX_AGE_MS = 50 * 60 * 1000

export default async function globalSetup() {
  fs.mkdirSync('playwright/.auth', { recursive: true })

  const browser = await chromium.launch()
  let storageState: string | undefined

  const authExists = fs.existsSync(AUTH_STATE_PATH)
  const authAge = authExists ? Date.now() - fs.statSync(AUTH_STATE_PATH).mtimeMs : Infinity

  if (authExists && authAge < AUTH_MAX_AGE_MS) {
    console.log(`[global-setup] Reusing auth state (${Math.round(authAge / 60000)}m old)`)
    storageState = AUTH_STATE_PATH
  }

  const context = await browser.newContext({ baseURL: BASE_URL, storageState })
  const page = await context.newPage()

  if (!storageState) {
    await page.goto('/sign-in')
    const cookie = page.getByRole('button', { name: Selectors.signUp.cookieAccept })
    if (await cookie.isVisible()) await cookie.click()
    await page.getByRole('textbox', { name: Selectors.auth.email }).fill(memberCredentials.email)
    await page
      .getByRole('textbox', { name: Selectors.auth.password })
      .fill(memberCredentials.password)
    await page.getByRole('button', { name: Selectors.auth.submit }).click()
    await page.waitForURL((url) => !url.pathname.includes('sign-in'), { timeout: 15_000 })
    await context.storageState({ path: AUTH_STATE_PATH })
    console.log('[global-setup] Auth state refreshed')
  }

  // Always cancel leftover active bookings before the suite runs
  console.log('[global-setup] Cleaning up any active bookings...')
  await new MemberDashboardPage(page).cancelAllActiveBookings()
  console.log('[global-setup] Account cleanup complete')

  await browser.close()
}
