import { type Frame } from '@playwright/test'
import { BasePage } from './BasePage'
import { Selectors } from '../utils/selectors'

export class ReserveAppointmentPage extends BasePage {
  async waitForLoad() {
    await this.waitForURL(/reserve-appointment/)
    await this.assertVisible(
      this.page.getByRole('heading', { name: Selectors.reserveAppointment.heading }),
    )
    // Wait for the Stripe iframe to mount AND for the card number field to be
    // interactive — Stripe renders the iframe shell before the fields are ready
    await this.page.waitForSelector(Selectors.reserveAppointment.stripeFrame, { timeout: 20_000 })
    await this.page
      .frameLocator(Selectors.reserveAppointment.stripeFrame)
      .getByRole('textbox', { name: Selectors.reserveAppointment.card.number })
      .waitFor({ state: 'visible', timeout: 20_000 })
  }

  /**
   * Nested locator group for the Stripe payment iframe.
   * Stripe renders 7+ iframes; card fields live in the accessory-target frame.
   * Fields are addressed by name attribute — aria-labels are unreliable on this integration.
   */
  get stripe() {
    const frame = this.page.frameLocator(Selectors.reserveAppointment.stripeFrame)
    const c = Selectors.reserveAppointment.card
    return {
      cardNumber: frame.getByRole('textbox', { name: c.number }),
      expiry: frame.getByRole('textbox', { name: c.expiry }),
      cvc: frame.getByRole('textbox', { name: c.cvc }),
      zip: frame.getByRole('textbox', { name: c.zip }),
    }
  }

  async fillStripeCard(cardNumber: string, expiry: string, cvc: string, zip: string) {
    // Click each field before filling — Stripe's JS needs focus events to
    // register the input, matching the pattern codegen records naturally
    await this.stripe.cardNumber.click()
    await this.stripe.cardNumber.fill(cardNumber)
    await this.stripe.expiry.click()
    await this.stripe.expiry.fill(expiry)
    await this.stripe.cvc.click()
    await this.stripe.cvc.fill(cvc)
    await this.stripe.zip.click()
    await this.stripe.zip.fill(zip)
  }

  /**
   * Completes the bank payment flow via Stripe Financial Connections + Stripe Link.
   *
   * Flow:
   * 1. Scroll iframe to reveal Bank tab (hidden below expanded Card form)
   * 2. Click "Bank $5 back" button (3 clicks + dblclick per recording)
   * 3. Click "Success" test bank
   * 4. Stripe opens a modal iframe — may be financial-connections-inner or universal-link-modal-inner
   *    depending on Stripe configuration; scan all Stripe frames to find agree-button
   * 5. agree → label → email + Enter → Continue with Link → phone → signup → account → done
   */
  async fillBankPayment(linkEmail: string, linkPhone: string) {
    const s = Selectors.reserveAppointment.bank

    await this.triggerBankFlow()

    const modalFrame = await this.waitForStripeModal()
    if (!modalFrame) throw new Error('Stripe agree-button not found in any frame after 15s')

    // Agree to terms
    await modalFrame.getByTestId(s.agreeButton).click()

    // Click label (focuses the email entry in the Stripe Link signup flow)
    await modalFrame.locator('label').click()

    // Enter email and continue
    await modalFrame.getByTestId(s.linkEmailInput).click()
    await modalFrame.getByTestId(s.linkEmailInput).fill(linkEmail)
    await modalFrame.getByTestId(s.linkEmailInput).press('Enter')
    await modalFrame.locator('div').filter({ hasText: s.continueWithLink }).nth(1).click()

    // After "Continue with Link", Stripe shows one of:
    // (a) OTP screen with "Autofill" — existing account, click Autofill
    // (b) Phone signup — new account, fill phone + click signup
    // (c) Account picker already visible — OTP was auto-handled, skip straight through
    // Autofill button sits next to "Fill with test data." — may be <button> or <a>
    const autofillBtn = modalFrame
      .locator('button, a')
      .filter({ hasText: /^Autofill$/i })
      .first()
    const accountPicker = modalFrame.getByTestId(s.accountPickerItem)

    const isOtp = await autofillBtn.isVisible({ timeout: 5_000 }).catch(() => false)
    const isPicker =
      !isOtp && (await accountPicker.isVisible({ timeout: 1_000 }).catch(() => false))

    if (isOtp) {
      // Try Autofill button; fall back to typing test OTP if not clickable
      const canAutofill = await autofillBtn.isEnabled().catch(() => false)
      if (canAutofill) {
        await autofillBtn.click()
      } else {
        const otpInput = modalFrame.locator('input').first()
        await otpInput.click()
        await otpInput.pressSequentially('000000')
      }
      // Wait for account picker to appear after OTP verification
      await accountPicker.waitFor({ state: 'visible', timeout: 15_000 })
    } else if (!isPicker) {
      // Phone signup path (new Stripe Link account)
      await modalFrame.getByTestId(s.linkPhoneInput).dblclick()
      await modalFrame.getByTestId(s.linkPhoneInput).fill(linkPhone)
      await modalFrame.getByTestId(s.linkSignupButton).click()
      await accountPicker.waitFor({ state: 'visible', timeout: 15_000 })
    }

    // Select the connected bank account and complete
    await accountPicker.click()
    await modalFrame.getByTestId(s.selectButton).click()
    await modalFrame.getByTestId(s.doneButton).click()
  }

  /** Scrolls the Stripe payment iframe so the Bank tab (below Card form) is in view. */
  async scrollToBankTab() {
    const stripeIframeEl = this.page.locator(Selectors.reserveAppointment.stripeFrame)
    const box = await stripeIframeEl.boundingBox()
    if (box) {
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
      await this.page.mouse.wheel(0, 500)
      await this.page.waitForTimeout(400)
    }
  }

  /** Clicks Bank tab (3 clicks + dblclick) and selects the Success test bank. */
  async triggerBankFlow() {
    const s = Selectors.reserveAppointment.bank
    const paymentFrame = this.page.frameLocator(Selectors.reserveAppointment.stripeFrame)
    await this.scrollToBankTab()
    const bankBtn = paymentFrame.getByRole('button', { name: s.tabButton })
    await bankBtn.scrollIntoViewIfNeeded()
    await bankBtn.click()
    await bankBtn.click()
    await bankBtn.click()
    await bankBtn.dblclick()
    const successOption = paymentFrame
      .locator('div')
      .filter({ hasText: /^Success$/ })
      .first()
    await successOption.waitFor({ state: 'visible', timeout: 20_000 })
    await successOption.click()
  }

  /** Polls all Stripe child frames until one has a visible element with the given testid. */
  async waitForStripeModal(timeoutMs = 15_000): Promise<Frame | null> {
    return this.findStripeFrame(Selectors.reserveAppointment.bank.agreeButton, timeoutMs)
  }

  /** Polls all Stripe child frames until one has a visible element with the given testid. */
  private async findStripeFrame(testId: string, timeoutMs: number): Promise<Frame | null> {
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      for (const frame of this.page.frames()) {
        if (!frame.url().includes('stripe.com')) continue
        const visible = await frame
          .getByTestId(testId)
          .isVisible({ timeout: 300 })
          .catch(() => false)
        if (visible) return frame
      }
      await this.page.waitForTimeout(300)
    }
    return null
  }

  getPaymentError() {
    return this.page.locator(Selectors.reserveAppointment.paymentError).first()
  }
}
