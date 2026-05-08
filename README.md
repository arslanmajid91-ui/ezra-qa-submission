# Ezra QA: Playwright Automation Suite

Playwright + TypeScript end-to-end tests for the Ezra member booking flow.  
**Target:** https://myezra-staging.ezra.com

**Adding tests?** See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Test Cases

| ID | Spec | What it covers | Slot needed |
|---|---|---|---|
| TC-01 | `tests/booking/happyPath.spec.ts` | Full booking with Visa, Mastercard, and Amex cards | Yes |
| TC-02 | `tests/booking/bankHappyPath.spec.ts` | Bank tab shows $5 credit; Stripe Financial Connections modal appears | Yes |
| TC-03 | `tests/booking/affirmHappyPath.spec.ts` | Affirm option selectable; submit redirects to affirm.com with correct merchant | Yes |

TC-01 runs three named variants (one per card brand). `afterEach` cancels the booking to return the staging slot. TC-02 and TC-03 do not create completed bookings so no teardown is needed.

---

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env
# Fill in MEMBER_EMAIL, MEMBER_PASSWORD, MEMBER_PHONE, MEMBER_LINK_PHONE
# (staging test account credentials, provided separately)
```

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `BASE_URL` | `https://myezra-staging.ezra.com` | Member portal under test |
| `STAGING_HAS_SLOTS` | `true` | Set `false` in CI when no open slots exist |
| `MEMBER_EMAIL` | required | Staging test account email |
| `MEMBER_PASSWORD` | required | Staging test account password |
| `MEMBER_PHONE` | required | Phone in `+1 XXX-XXX-XXXX` format |
| `MEMBER_LINK_PHONE` | required | Phone in `(XXX) XXX-XXXX` format (Stripe Link) |

---

## Running

```bash
npm test                     # all three specs
npx playwright test --headed # watch in a browser
npm run report               # open HTML report
```

Tests skip automatically when `STAGING_HAS_SLOTS=false`.

---

## Project Structure

```
ezra-qa/
├── playwright.config.ts
├── .env.example                    # variable names, fill with staging credentials
├── pages/
│   ├── BasePage.ts                 # shared helpers: waitForURL, assertVisible, continue()
│   ├── SignUpPage.ts               # /sign-in
│   ├── SelectPlanPage.ts           # /select-plan: DOB/sex + plan card
│   ├── ScheduleScanPage.ts         # /schedule-scan: imaging center + VueCal slot
│   ├── ReserveAppointmentPage.ts   # /reserve-appointment: Stripe iframe interactions
│   ├── ConfirmationPage.ts         # /scan-confirm: booking detail assertions
│   └── MemberDashboardPage.ts      # /: cancel active bookings (TC-01 teardown)
├── utils/
│   ├── selectors.ts                # all locator strings in one place
│   ├── testData.ts                 # card variants + credentials read from .env
│   └── testIf.ts                   # hasStagingSlots env flag
└── tests/
    ├── global-setup.ts             # cancels leftover bookings before suite runs
    └── booking/
        ├── happyPath.spec.ts       # TC-01
        ├── bankHappyPath.spec.ts   # TC-02
        └── affirmHappyPath.spec.ts # TC-03
```

---

## Key Implementation Notes

**Stripe accordion layout.** Card is auto-selected and expanded on page load, pushing Bank and Affirm below the viewport. TC-02 and TC-03 scroll the Stripe iframe into position with `page.mouse.wheel` before interacting with those tabs.

**Dynamic Stripe frame discovery.** After the Bank tab is activated, Stripe's agree-button can appear in any of several dynamically-created child iframes. `ReserveAppointmentPage.waitForStripeModal()` polls `page.frames()` for whichever Stripe frame has the element visible rather than hardcoding a frame URL.

**Amex card variant.** Amex uses a 15-digit number and a 4-digit CVC, which exercises structurally different Stripe field validation from 16-digit brands. Including it in TC-01 catches field-length edge cases.

---

## Trade-offs

**Staging slot dependency.** All three tests require available imaging center slots. If the staging calendar is empty, tests skip rather than fail. The `hasStagingSlots` flag makes the dependency explicit rather than producing cryptic timeouts.

**Payment completion scope.** Completing a bank transaction requires a Stripe Link account with a connected test bank. Completing an Affirm transaction requires live Affirm sandbox credentials. Neither is reproducible in a shared staging environment. TC-02 asserts the integration boundary (modal appears); TC-03 asserts the handoff boundary (redirect to the correct merchant). Everything reachable in staging is verified.

**Single staging account.** Tests run sequentially against one account. Global setup cancels leftover bookings before each run so tests start clean. Parallel execution would require one isolated account per worker, achievable with API-level account creation but out of scope here.

**Chromium only.** Safari and Firefox are relevant for a consumer health product but scoped out. Adding them is one line in `playwright.config.ts`.

**Selector stability.** Selectors use `data-test` attributes where available, role-based locators otherwise. CSS class selectors are used only for dashboard booking cards where no stable attribute exists. These are the most likely to need updating if the UI is redesigned.

**Hard-coded slot dates.** `slotRotation.ts` rotates across five specific July 2026 dates round-robin across tests. If those slots are already booked or staging re-populates with different dates, tests time out rather than skipping cleanly. A dynamic approach of discovering available dates from the calendar at runtime would self-heal but adds another point of failure to the setup step.

**Zero retries.** `playwright.config.ts` sets `retries: 0`. E2E tests against live staging can fail spuriously on Stripe iframe timing, Vue SPA async rendering, or network jitter. The current choice keeps the signal clean: every failure is a real failure. A single blip requires a full manual re-run. Setting `retries: 1` would absorb transient noise without masking real bugs.

**Happy path only.** The suite covers three successful booking flows. Failure states (declined card, blocked bank payment, validation errors) are documented in the test plan but not yet automated. The most dangerous unverified gap is a booking that renders a confirmation page without a real backend record being created.

**No mobile coverage.** Tests run on desktop Chromium only. A broken payment form on Safari iOS or Chrome Android would not be caught. For a consumer health product with significant mobile traffic this is a meaningful gap.

**Staging only.** Tests run against staging, not production. A lightweight post-deploy smoke test in production, checking that the booking flow loads and auth works without completing a real payment, would catch environment-specific issues such as misconfigured API keys that staging never surfaces.

---

## Future Considerations

1. **CI integration.** Add `MEMBER_EMAIL` and `MEMBER_PASSWORD` as GitHub Actions secrets and set `STAGING_HAS_SLOTS=true` in repo variables to run the full suite on every push.

2. **API-level test setup.** Rather than driving the full booking UI in each test, create the booking via API and navigate directly to the page under test. Faster, more isolated, and decoupled from UI changes in earlier steps.

3. **Declined and blocked payment.** Confirm a declined card shows a visible error and never reaches the confirmation page. The silent success failure mode (a confirmation screen rendered without a real booking) is the most dangerous outcome in a payment flow.

4. **Auth boundary.** Direct URL navigation to `/schedule-scan`, `/reserve-appointment`, and `/scan-confirm` without a session must redirect to sign-in. Direct navigation is essential. SPAs sometimes apply guards only on initial load and momentarily render protected content before a client-side redirect fires.

5. **Cross-browser.** Add Safari and Firefox projects to `playwright.config.ts`.

6. **Parallel execution.** Provision one isolated staging account per Playwright worker via API-level account creation. Cuts total run time proportionally to worker count.

---

## Stripe Test Cards

| Brand | Number | CVC |
|---|---|---|
| Visa | `4242 4242 4242 4242` | 3 digits |
| Mastercard | `5555 5555 5555 4444` | 3 digits |
| Amex | `3714 496353 98431` | 4 digits |

Full reference: https://docs.stripe.com/testing
