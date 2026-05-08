import { BasePage } from './BasePage'
import { Selectors } from '../utils/selectors'

export class MemberDashboardPage extends BasePage {
  async waitForLoad() {
    await this.page.waitForURL(/myezra-staging\.ezra\.com\/?$|\/home/, { timeout: 15_000 })
    await this.page
      .locator(Selectors.dashboard.activeCard)
      .first()
      .waitFor({ state: 'visible', timeout: 10_000 })
  }

  async cancelActiveBooking(reasonText = 'Cancelled by automated test teardown') {
    await this.page.goto('/')
    await this.page
      .locator(Selectors.dashboard.activeCard)
      .first()
      .waitFor({ state: 'visible', timeout: 15_000 })

    await this.page.locator(Selectors.dashboard.activeCard).first().click()
    await this.page
      .getByRole('button', { name: Selectors.dashboard.rescheduleCancel })
      .first()
      .click()
    await this.page
      .getByRole('heading', { name: Selectors.dashboard.cancelAppointment })
      .first()
      .waitFor({ state: 'visible' })

    await this.page.locator(Selectors.dashboard.cancellationCard).first().click()
    await this.page
      .getByRole('button', { name: Selectors.dashboard.cancelConfirmButton })
      .first()
      .click()

    await this.page.getByText(Selectors.dashboard.reasonAnotherText).first().click()
    await this.page
      .getByRole('textbox', { name: Selectors.dashboard.reasonTextInput })
      .first()
      .fill(reasonText)
    await this.page
      .getByRole('button', { name: Selectors.dashboard.cancelScanButton })
      .first()
      .click()

    // Wait for the modal to close — confirms the server accepted the cancellation
    await this.page
      .locator(Selectors.dashboard.cancellationCard)
      .first()
      .waitFor({ state: 'hidden', timeout: 8_000 })
  }

  async cancelAllActiveBookings(reasonText = 'Cancelled by automated test teardown') {
    while (true) {
      await this.page.goto('/')
      // Poll up to 10s for the card — gives the Vue SPA time to make its
      // bookings API call after navigation. No card = no bookings to cancel.
      const hasActive = await this.page
        .locator(Selectors.dashboard.activeCard)
        .first()
        .waitFor({ state: 'visible', timeout: 10_000 })
        .then(() => true)
        .catch(() => false)
      if (!hasActive) break
      await this.cancelActiveBooking(reasonText)
    }
  }
}
