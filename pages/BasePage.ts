import { Page, Locator, expect } from '@playwright/test'

/**
 * Base class for all page objects.
 * Provides shared wait helpers and common interaction patterns so each page
 * object only needs to define what makes it different.
 */
export abstract class BasePage {
  constructor(protected page: Page) {}

  /** Every page must declare how to confirm it has fully loaded. */
  abstract waitForLoad(): Promise<void>

  /** Wait for the URL to match a pattern, with a configurable timeout. */
  protected async waitForURL(pattern: RegExp, timeout = 15_000) {
    await this.page.waitForURL(pattern, { timeout })
  }

  /** Assert a locator is visible, with a configurable timeout. */
  protected async assertVisible(locator: Locator, timeout = 10_000) {
    await expect(locator).toBeVisible({ timeout })
  }

  /**
   * Click the shared `[data-test="submit"]` continue button used across
   * schedule-scan and reserve-appointment pages.
   * Override in pages that use a different button.
   */
  async continue() {
    await this.page.locator('[data-test="submit"]').click()
  }
}
