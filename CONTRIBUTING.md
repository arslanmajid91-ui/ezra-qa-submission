# Contributing

## Prerequisites

- Node.js 22 (use `nvm use` to switch automatically)
- Chromium: `npx playwright install chromium`

## Setup

```bash
npm install        # installs deps and sets up the pre-commit hook
cp .env.example .env
# Fill in MEMBER_EMAIL, MEMBER_PASSWORD, MEMBER_PHONE, MEMBER_LINK_PHONE
```

## Running tests

```bash
npm test                          # all specs, headless
npm run test:headed               # watch in browser
npm run test:booking              # booking specs only
STAGING_HAS_SLOTS=false npm test  # skip slot-dependent tests
npm run report                    # open last HTML report
```

## Before you commit

A pre-commit hook runs `eslint` + `prettier` on staged `.ts` files automatically. You can also run manually:

```bash
npm run lint         # check all files
npm run lint:fix     # auto-fix where possible
npm run format       # reformat all files
npm run format:check # check without writing
```

---

## Adding a test

### 1. File location and naming

Put new specs in `tests/booking/`. Name files after the feature, not a ticket number.

```
tests/booking/passwordReset.spec.ts   ✓
tests/booking/EZRA-123.spec.ts        ✗
```

### 2. Guard slot-dependent tests

Any test that navigates to schedule or payment pages must use `testIf(hasStagingSlots)`:

```ts
import { hasStagingSlots } from '../../utils/testIf'
const testIf = (condition: boolean) => condition ? test : test.skip

testIf(hasStagingSlots)('...', async ({ page }) => { ... })
```

### 3. Cancel bookings after tests that complete a booking

If your test reaches the confirmation page, add an `afterEach` that cancels:

```ts
test.afterEach(async ({ page }) => {
  if (!hasStagingSlots) return
  await new MemberDashboardPage(page).cancelAllActiveBookings()
})
```

Tests that stop before completing a booking (TC-02, TC-03) do not need teardown.

### 4. Selectors go in `utils/selectors.ts`

Never inline a locator string in a page object or spec. Add it to the `Selectors` registry:

```ts
// utils/selectors.ts
export const Selectors = {
  myFeature: {
    submitButton: '[data-test="my-submit"]',
    heading: 'My Feature Heading',
  },
  ...
}
```

### 5. Page objects extend BasePage

New pages must extend `BasePage` and implement `waitForLoad()`:

```ts
import { BasePage } from './BasePage'
import { Selectors } from '../utils/selectors'

export class MyPage extends BasePage {
  async waitForLoad() {
    await this.waitForURL(/my-page/)
    await this.assertVisible(
      this.page.getByRole('heading', { name: Selectors.myFeature.heading })
    )
  }
}
```

### 6. Assertions must prove the right thing happened

Confirming a URL change is not enough. Every test should assert on content that can only be correct if the backend processed the action:

```ts
// Weak — only proves you navigated somewhere
await page.waitForURL(/scan-confirm/)

// Strong — proves a real booking was created with correct data
await confirmation.assertBookingDetails()   // date, center, scan type
await expect(confirmation.getMedicalQuestionnaireButton()).toBeVisible()
```

---

## Architecture overview

```
pages/          Page Object Model — one class per page, extends BasePage
utils/
  selectors.ts  All locator strings — single source of truth
  testData.ts   Credentials (from .env) and card variants
  testIf.ts     Environment flags (hasStagingSlots)
tests/
  global-setup.ts   Cancels leftover bookings before the suite runs
  booking/          Spec files — one per feature/flow
```

**Key constraint:** `utils/selectors.ts` is the only place locator strings should live. When the UI changes, one entry in this file is the only update needed.

---

## Stripe test cards

| Brand | Number | CVC |
|---|---|---|
| Visa | `4242 4242 4242 4242` | 3 digits |
| Mastercard | `5555 5555 5555 4444` | 3 digits |
| Amex | `3714 496353 98431` | 4 digits (15-digit number) |

Full reference: https://docs.stripe.com/testing
