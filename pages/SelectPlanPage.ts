import { BasePage } from './BasePage'
import { Selectors } from '../utils/selectors'

export class SelectPlanPage extends BasePage {
  async waitForLoad() {
    await this.waitForURL(/select-plan/)
    await this.assertVisible(this.page.getByTestId(Selectors.selectPlan.continueButton))
  }

  // DOB and sex at birth appear on this page if not previously collected during sign-up
  async fillDobAndSex(dob = '01-01-1990', sex = 'Male') {
    const dobField = this.page.getByRole('textbox', { name: Selectors.selectPlan.dobField })
    if (await dobField.isVisible()) {
      await dobField.fill(dob)
      await this.page.locator(Selectors.selectPlan.sexDropdown).click()
      await this.page
        .locator(Selectors.selectPlan.sexOption)
        .filter({ hasText: sex })
        .first()
        .click()
    }
  }

  async selectPlan(testId: 'FB30-encounter-card' | 'FB60-encounter-card' = 'FB30-encounter-card') {
    // Click the scan name text within the card — the recording shows this is more
    // reliable than clicking the card container for registering Vue.js selection
    const scanName = testId === 'FB60-encounter-card' ? 'MRI Scan with Spine' : 'MRI Scan'
    await this.page.getByTestId(testId).getByText(scanName, { exact: true }).click()
  }

  async continue() {
    await this.page.getByTestId(Selectors.selectPlan.continueButton).click()
  }

  getContinueButton() {
    return this.page.getByTestId(Selectors.selectPlan.continueButton)
  }
}
