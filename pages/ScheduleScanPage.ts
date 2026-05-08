import { BasePage } from './BasePage'
import { Selectors } from '../utils/selectors'

export class ScheduleScanPage extends BasePage {
  async waitForLoad() {
    await this.waitForURL(/schedule-scan/)
    await this.assertVisible(
      this.page.getByRole('button', { name: Selectors.scheduleScan.findCentersButton }),
    )
  }

  async selectFirstAvailableSlot() {
    await this.page.getByRole('button', { name: Selectors.scheduleScan.findCentersButton }).click()
    await this.page.waitForSelector(Selectors.scheduleScan.locationCard, { timeout: 20_000 })

    // Try Park Ave first — it's a known working location.
    // Fall back to the first available center if Park Ave has no open slots.
    const parkAve = this.page.getByText(Selectors.scheduleScan.preferredLocation, { exact: true })
    if (await parkAve.isVisible({ timeout: 3_000 }).catch(() => false)) {
      const booked = await this._trySelectSlotFromCard(parkAve)
      if (booked) return
    }

    // Fallback: loop remaining centers
    const cards = this.page
      .locator(Selectors.scheduleScan.locationCard)
      .filter({ hasNot: this.page.getByText(/Available instead/i) })
      .filter({ hasNot: this.page.getByText(/offline/i) })
      .filter({
        hasNot: this.page.getByText(Selectors.scheduleScan.preferredLocation, { exact: true }),
      })

    const count = await cards.count()
    for (let i = 0; i < count; i++) {
      const booked = await this._trySelectSlotFromCard(cards.nth(i))
      if (booked) return
    }

    throw new Error(
      'No imaging center with an available slot was found — staging may have no open slots',
    )
  }

  private async _trySelectSlotFromCard(
    card: ReturnType<typeof this.page.locator>,
  ): Promise<boolean> {
    try {
      await card.scrollIntoViewIfNeeded()
      await card.click({ timeout: 5_000 })
    } catch {
      return false
    }

    try {
      await this.page.waitForSelector(Selectors.scheduleScan.calendarTrigger, {
        state: 'visible',
        timeout: 15_000,
      })
    } catch {
      return false
    }

    await this.page.locator(Selectors.scheduleScan.availableDate).first().click()
    await this.page.waitForSelector(Selectors.scheduleScan.timeSlot, { timeout: 20_000 })
    await this.page.getByText(Selectors.scheduleScan.timeSlotPattern).first().click()
    return true
  }
}
