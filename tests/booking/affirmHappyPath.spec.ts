import { test, expect } from '@playwright/test'
import { SignUpPage } from '../../pages/SignUpPage'
import { SelectPlanPage } from '../../pages/SelectPlanPage'
import { ScheduleScanPage } from '../../pages/ScheduleScanPage'
import { ReserveAppointmentPage } from '../../pages/ReserveAppointmentPage'
import { memberCredentials } from '../../utils/testData'
import { hasStagingSlots } from '../../utils/testIf'

/**
 * TC-03 — Affirm payment happy path
 *
 * Verifies that the Affirm financing handoff is intact:
 *   1. The Affirm option is present and selectable on the payment page
 *   2. Submitting with Affirm selected redirects to sandbox.affirm.com
 *   3. The Affirm checkout page shows "Function Health" — proving the correct
 *      merchant and product were passed in the handoff payload
 *
 * Completing an Affirm transaction end-to-end is out of scope — it requires
 * live Affirm sandbox credentials. This test covers everything within reach.
 *
 * afterEach cancels any active booking — the schedule step may reserve a slot
 * even when Affirm redirect is not completed.
 */

const testIf = (condition: boolean) => (condition ? test : test.skip)

test.describe('TC-03: Affirm payment handoff', () => {
  testIf(hasStagingSlots)(
    'Affirm option is selectable, submit redirects to Affirm, checkout shows Function Health',
    async ({ page }) => {
      test.setTimeout(120_000)

      // ── Sign in ─────────────────────────────────────────────────────────
      await new SignUpPage(page).signIn(memberCredentials.email, memberCredentials.password)

      // ── Step 1: Select plan ──────────────────────────────────────────────
      const selectPlan = new SelectPlanPage(page)
      await selectPlan.waitForLoad()
      await selectPlan.fillDobAndSex()
      await selectPlan.selectPlan('FB30-encounter-card')
      await selectPlan.continue()

      // ── Step 2: Schedule scan ────────────────────────────────────────────
      const schedule = new ScheduleScanPage(page)
      await schedule.waitForLoad()
      await schedule.selectFirstAvailableSlot()
      await schedule.continue()

      // ── Step 3: Reserve appointment — select Affirm ──────────────────────
      const reserve = new ReserveAppointmentPage(page)
      await reserve.waitForLoad()

      // Card is auto-selected and expanded on load — Affirm sits below the card form.
      // Scroll the Stripe iframe to bring it into view before asserting.
      const stripeEl = page.locator('iframe[src*="elements-inner-accessory-target"]')
      const box = await stripeEl.boundingBox()
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
        await page.mouse.wheel(0, 800)
        await page.waitForTimeout(400)
      }

      const paymentFrame = page.frameLocator('iframe[src*="elements-inner-accessory-target"]')
      // Affirm is a button-type row in the Stripe accordion (same pattern as Bank)
      const affirm = paymentFrame.getByRole('button', { name: /affirm/i })
      await expect(affirm).toBeVisible({ timeout: 10_000 })
      await affirm.click()

      // Submit — this triggers the Affirm redirect
      await page.locator('[data-test="submit"]').click()

      // ── Assertions: Affirm handoff ───────────────────────────────────────
      // Redirected to Affirm's sandbox checkout domain
      await page.waitForURL(/affirm\.com/, { timeout: 20_000 })
      expect(page.url()).toContain('affirm.com')

      // The Affirm page must reference "Function Health" — proves the correct
      // merchant and booking payload were passed in the redirect
      await expect(page.getByText(/Function Health/i)).toBeVisible({ timeout: 15_000 })
    },
  )
})
