import { test, expect } from '@playwright/test'
import { SignUpPage } from '../../pages/SignUpPage'
import { SelectPlanPage } from '../../pages/SelectPlanPage'
import { ScheduleScanPage } from '../../pages/ScheduleScanPage'
import { ReserveAppointmentPage } from '../../pages/ReserveAppointmentPage'
import { memberCredentials } from '../../utils/testData'
import { hasStagingSlots } from '../../utils/testIf'

/**
 * TC-02 — Bank payment happy path (MRI Scan with Spine / FB60)
 *
 * Asserts that the bank payment flow initiates correctly:
 * selects the Bank tab, picks the "Success" test bank, and confirms the
 * Stripe Link authentication modal appears (OTP screen). Full payment
 * completion is intentionally not tested here — the modal appearing proves
 * Stripe Financial Connections integration is wired up end-to-end.
 *
 * No booking is created so no afterEach teardown is needed.
 */

const testIf = (condition: boolean) => (condition ? test : test.skip)

test.describe('TC-02: bank payment flow initiates correctly', () => {
  testIf(hasStagingSlots)(
    'Bank tab shows $5 credit and Stripe Link OTP modal appears after selecting Success bank',
    async ({ page }) => {
      test.setTimeout(120_000)

      // ── Sign in ─────────────────────────────────────────────────────────
      await new SignUpPage(page).signIn(memberCredentials.email, memberCredentials.password)

      // ── Step 1: Select plan (FB60 — MRI Scan with Spine) ─────────────────
      const selectPlan = new SelectPlanPage(page)
      await selectPlan.waitForLoad()
      await selectPlan.fillDobAndSex()
      await selectPlan.selectPlan('FB60-encounter-card')
      await selectPlan.continue()

      // ── Step 2: Schedule scan ────────────────────────────────────────────
      const schedule = new ScheduleScanPage(page)
      await schedule.waitForLoad()
      await schedule.selectFirstAvailableSlot()
      await schedule.continue()

      // ── Step 3: Reserve appointment ─────────────────────────────────────
      const reserve = new ReserveAppointmentPage(page)
      await reserve.waitForLoad()

      // Assert the Bank tab advertises $5 credit before the member commits
      const paymentFrame = page.frameLocator('iframe[src*="elements-inner-accessory-target"]')
      await reserve.scrollToBankTab()
      const bankTab = paymentFrame.getByRole('button', { name: /bank/i })
      await expect(bankTab).toContainText('$5', { timeout: 10_000 })

      // Trigger bank flow: click Bank tab → select Success test bank
      await reserve.triggerBankFlow()

      // ── Assertion: Stripe Link modal appears ─────────────────────────────
      // The modal lives in the 'linked-accounts-inner' Stripe iframe.
      // Its presence proves Financial Connections is wired up end-to-end.
      const modalFrame = await reserve.waitForStripeModal()
      expect(modalFrame).not.toBeNull()

      const agreeBtn = modalFrame!.getByTestId('agree-button')
      await expect(agreeBtn).toBeVisible({ timeout: 5_000 })
    },
  )
})
