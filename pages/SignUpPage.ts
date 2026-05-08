import { expect } from '@playwright/test'
import { BasePage } from './BasePage'
import { Selectors } from '../utils/selectors'
import type { Member } from '../utils/testData'

export class SignUpPage extends BasePage {
  async waitForLoad() {
    await this.assertVisible(this.page.getByRole('textbox', { name: Selectors.signUp.firstName }))
  }

  async goto() {
    await this.page.goto('/sign-in')
    const cookieBanner = this.page.getByRole('button', { name: Selectors.signUp.cookieAccept })
    if (await cookieBanner.isVisible()) await cookieBanner.click()
    await this.page.getByRole('link', { name: Selectors.signUp.joinLink }).click()
    await this.waitForLoad()
  }

  async fillForm(member: Member) {
    await this.page
      .getByRole('textbox', { name: Selectors.signUp.firstName })
      .fill(member.firstName)
    await this.page.getByRole('textbox', { name: Selectors.signUp.lastName }).fill(member.lastName)
    await this.page.getByRole('textbox', { name: Selectors.signUp.email }).fill(member.email)
    await this.page.getByRole('textbox', { name: Selectors.signUp.phone }).fill(member.phone)
    await this.page.getByRole('textbox', { name: Selectors.signUp.password }).fill(member.password)

    // Terms is a Vue-managed styled button — click, wait for DOM class update,
    // then flush Vue's reactive state before submit
    const termsBtn = this.page.locator(Selectors.signUp.termsButton).first()
    await termsBtn.scrollIntoViewIfNeeded()
    await termsBtn.click()
    await expect(termsBtn).toHaveClass(/checked/)
    await this.page.waitForTimeout(600)
  }

  async submit() {
    await this.page.getByRole('button', { name: Selectors.signUp.submitButton }).click()
  }

  async signUp(member: Member) {
    await this.goto()
    await this.fillForm(member)
    await this.submit()
    await this.waitForURL(/select-plan/)
  }

  async signIn(email: string, password: string) {
    await this.page.goto('/sign-in')
    const cookieBanner = this.page.getByRole('button', { name: Selectors.signUp.cookieAccept })
    if (await cookieBanner.isVisible()) await cookieBanner.click()

    await this.page.getByRole('textbox', { name: Selectors.auth.email }).fill(email)
    await this.page.getByRole('textbox', { name: Selectors.auth.password }).fill(password)
    await this.page.getByRole('button', { name: Selectors.auth.submit }).click()
    // Returning members redirect to / rather than /select-plan — wait for any
    // navigation away from /sign-in then drive to select-plan explicitly
    await this.page.waitForURL((url) => !url.pathname.includes('sign-in'), { timeout: 15_000 })
    await this.page.goto('/book-scan/select-plan')
  }

  getSubmitButton() {
    return this.page.getByRole('button', { name: Selectors.signUp.submitButton })
  }
}
