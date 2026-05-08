import { BasePage } from './BasePage'
import { Selectors } from '../utils/selectors'

export class ConfirmationPage extends BasePage {
  async waitForLoad() {
    await this.waitForURL(/scan-confirm/, 30_000)
    await this.assertVisible(this.page.locator(Selectors.confirmation.container))
  }

  /**
   * Nested locator group for confirmed booking details.
   * Assertions against these prove a real booking was created — not just
   * that we arrived at a generic success screen.
   */
  get booking() {
    return {
      container: this.page.locator(Selectors.confirmation.container),
      date: this.page.getByText(Selectors.confirmation.appointmentDate),
      scanType: this.page.getByText(Selectors.confirmation.scanType),
      questionnaireButton: this.page.getByRole('button', {
        name: Selectors.confirmation.questionnaireButton,
      }),
    }
  }

  async assertBookingDetails() {
    await this.assertVisible(this.booking.container)
    // Appointment date/time must be shown — not just a generic success page
    await this.assertVisible(this.booking.date)
    // Scan type must match what was selected
    await this.assertVisible(this.booking.scanType)
  }

  getMedicalQuestionnaireButton() {
    return this.booking.questionnaireButton
  }
}
