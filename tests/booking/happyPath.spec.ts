import { test, expect } from '@playwright/test'
import { SignUpPage } from '../../pages/SignUpPage'
import { SelectPlanPage } from '../../pages/SelectPlanPage'
import { ScheduleScanPage } from '../../pages/ScheduleScanPage'
import { ReserveAppointmentPage } from '../../pages/ReserveAppointmentPage'
import { ConfirmationPage } from '../../pages/ConfirmationPage'
import { MemberDashboardPage } from '../../pages/MemberDashboardPage'
import { memberCredentials, cardVariants } from '../../utils/testData'
import { hasStagingSlots } from '../../utils/testIf'

/**
 * TC-01 — Member completes full booking with valid card payment
 *
 * Runs parametrically across Visa, Mastercard, and Amex. Amex is the critical
 * variant — 15-digit number and 4-digit CVC exercise different Stripe field
 * validation than 16-digit brands. Each card gets its own named test entry in
 * the HTML report so a failure is immediately attributable to a specific brand.
 *
 * afterAll cancels the booking to return the staging slot for subsequent runs.
 */

const testIf = (condition: boolean) => (condition ? test : test.skip)

test.describe('TC-01: member completes full booking with valid card payment', () => {
  for (const card of cardVariants) {
    testIf(hasStagingSlots)(`books MRI Scan with ${card.brand} card`, async ({ page }) => {
      // Extra time budget for afterEach cancellation — up to 3 bookings × ~35s each
      test.setTimeout(240_000)
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

      // ── Step 3: Reserve appointment + pay ───────────────────────────────
      const reserve = new ReserveAppointmentPage(page)
      await reserve.waitForLoad()
      await reserve.fillStripeCard(card.number, card.expiry, card.cvc, card.zip)
      await reserve.continue()

      // ── Assertions ──────────────────────────────────────────────────────
      const confirmation = new ConfirmationPage(page)
      await confirmation.waitForLoad()
      await confirmation.assertBookingDetails()
      await expect(confirmation.getMedicalQuestionnaireButton()).toBeVisible()
    })
  }

  // Cancels ALL active bookings after each variant — clears both the new booking
  // and any leftover bookings from previous runs so subsequent tests can book fresh.
  test.afterEach(async ({ page }) => {
    if (!hasStagingSlots) return
    await new MemberDashboardPage(page).cancelAllActiveBookings()
  })
})
