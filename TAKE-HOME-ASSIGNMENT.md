# Take-Home Assignment

---

## Question 1

### Part 1
The booking flow is integral to Ezra's business operation. Please go through the first three steps of the booking process including payment and devise 15 test cases throughout the entire process you think are the most important. When submitting the assignment, please return the test cases from the most important to the least important.

---

**TC-01: Complete a booking with a valid card**
*Priority: Critical*

As a registered member, I want to select an MRI Scan plan, choose an imaging center and time slot, and pay by card, so that I receive a confirmed appointment with my scan details.

**Acceptance criteria:**
- Member can select the MRI Scan ($999) plan
- Member can choose an available imaging center and time slot
- Payment is accepted for Visa, Mastercard, and American Express
- Confirmation page shows: appointment date, imaging center name, scan type, and "Begin Medical Questionnaire" button
- All three card brands must pass. Amex is the critical variant (15-digit number, 4-digit CVC) because a Stripe integration that silently rejects Amex passes every Visa test and fails every Amex holder in production

| Variant | Card number | Why it matters |
|---|---|---|
| Visa | 4242 4242 4242 4242 | 16-digit baseline; most common card type |
| Mastercard | 5555 5555 5555 4444 | 16-digit; different BIN range |
| American Express | 3714 496353 98431 | **15 digits, 4-digit CVC**, structurally different from Visa and Mastercard |

---

**TC-02: Complete a booking with bank payment and see the $5 credit before submitting**
*Priority: Critical*

As a member who prefers to pay by bank, I want to see the $5 credit applied to my total before I submit payment, so that I can verify my discount before committing.

**Acceptance criteria:**
- Bank payment option is available on the Reserve Appointment page
- The $5 credit appears in the displayed total before the member clicks submit, not only on the confirmation page
- The pre-submission total matches the total shown on the confirmation page
- Booking confirmation shows the same appointment details as a card payment

---

**TC-03: Select Affirm financing and be handed off correctly**
*Priority: Critical*

As a member who wants to finance my scan, I want to select Affirm on the payment page and be taken to the Affirm checkout, so that I can pay in installments without losing my booking details.

**Acceptance criteria:**
- Affirm option is visible and selectable on the Reserve Appointment page
- Clicking submit redirects to the Affirm checkout (sandbox.affirm.com)
- The correct merchant ("Function Health") appears on the Affirm page, confirming the right booking details were passed in the handoff

---

**TC-04: See a clear error when my card is declined (no false booking created)**
*Priority: Critical*

As a member whose card is declined, I want to see a payment error immediately, so that I know the booking was not created and I can try again.

**Acceptance criteria:**
- A visible payment error appears on the Reserve Appointment page
- The member is not redirected to the confirmation page
- No booking record is created in the backend
- Both assertions are checked independently: error visible AND confirmation URL never reached

---

**TC-05: See a clear error when my bank payment is blocked (no false booking created)**
*Priority: Critical*

As a member whose bank payment is blocked, I want to see a payment error immediately, so that I know the scan was not booked and I can choose another payment method.

**Acceptance criteria:**
- A visible error appears on the Reserve Appointment page
- The member is not redirected to the confirmation page
- No booking record is created

---

**TC-06: Apply a promo code and see the discount before I pay**
*Priority: High*

As a member with a promo code, I want to see my discounted total on the payment page before I submit, so that I can confirm the discount was applied before committing.

**Acceptance criteria:**
- Entering a valid promo code updates the displayed total immediately
- The discounted total is visible before the member clicks submit
- The pre-submission total matches the total on the confirmation page

---

**TC-07: Be redirected to sign-in when accessing booking pages without logging in**
*Priority: High*

As a visitor who is not logged in, I should not be able to access any step of the booking flow by typing a URL directly, so that member health and payment data is protected.

**Acceptance criteria:**
- Navigating directly to `/book-scan/select-plan` redirects to sign-in
- Navigating directly to `/book-scan/schedule-scan` redirects to sign-in
- Navigating directly to `/book-scan/reserve-appointment` redirects to sign-in
- All three must be tested via direct URL, not by clicking through the app (SPAs can apply guards only on initial load, missing direct-navigation attempts)

---

**TC-08: Book an MRI Scan with Spine and see the correct scan type confirmed**
*Priority: High*

As a member selecting the MRI Scan with Spine plan, I want my confirmation to show "MRI Scan with Spine", so that I know the imaging center will prepare the right procedure.

**Acceptance criteria:**
- Member selects the MRI Scan with Spine ($1,699) plan
- Booking completes successfully
- Confirmation page shows "MRI Scan with Spine", not "MRI Scan" or a generic label

---

**TC-09: Book the Skeletal and Neurological Assessment and see both appointments confirmed**
*Priority: High*

As a member booking the full Skeletal and Neurological Assessment, I want to schedule both required sessions and see both confirmed, so that I arrive knowing both appointments are set.

**Acceptance criteria:**
- Member can fill in two separate scheduling sections on the Schedule Scan page
- Payment completes successfully
- Confirmation page shows two distinct appointment dates and time slots
- If only one appointment appears, the test fails. The member paid $3,999 for an incomplete order

---

**TC-10: Age-eligible member can book a Heart CT and see the correct scan type**
*Priority: High*

As an age-eligible member, I want to select the Heart CT Scan plan and complete my booking, so that I receive a confirmed Heart CT appointment.

**Acceptance criteria:**
- Heart CT Scan ($349) is selectable for an age-eligible member
- Booking completes and confirmation shows "Heart CT Scan"

---

**TC-11: Age-eligible member can book a Lungs CT and see the correct scan type**
*Priority: High*

As an age-eligible member, I want to select the Lungs CT Scan plan and complete my booking, so that I receive a confirmed Lungs CT appointment.

**Acceptance criteria:**
- Lungs CT Scan ($399) is selectable for an age-eligible member
- Booking completes and confirmation shows "Lungs CT Scan"
- Lungs CT must be confirmed separately from Heart CT, as they may use different encounter types in the backend

---

**TC-12: Age-ineligible member sees CT plans grayed out and cannot select them**
*Priority: High*

As a member who is not yet age-eligible for CT scans, I want to see Heart CT and Lungs CT on the plan page but clearly marked as unavailable, so that I know they exist and can consider them when I become eligible.

**Acceptance criteria:**
- Heart CT and Lungs CT appear on the Select Plan page for an ineligible member
- Both plans are grayed out and non-interactive, clicking them does nothing
- MRI plans remain fully selectable

---

**TC-13: Cannot continue past scheduling without filling both appointments for the Skeletal plan**
*Priority: High*

As a member booking the Skeletal and Neurological Assessment, I want the Continue button to stay disabled until I've scheduled both sessions, so that I can't accidentally submit an incomplete booking.

**Acceptance criteria:**
- After selecting the $3,999 plan and reaching the Schedule Scan page, Continue is disabled
- Continue remains disabled after filling only the first appointment slot
- Continue becomes active only after both time slots are filled

---

**TC-14: Date of birth and sex at birth are required before selecting a plan**
*Priority: High*

As a new member who hasn't yet provided my date of birth or sex at birth, I want the Select Plan page to prompt me to fill those fields, so that I can see the right plans for my eligibility before I choose.

**Acceptance criteria:**
- The Select Plan page presents date of birth and sex at birth as required fields if not already on file
- Attempting to select a plan without filling them surfaces a validation message
- Progression to Schedule Scan is blocked (not just warned) until both fields are filled

---

**TC-15: Offline imaging centers are visible but cannot be booked**
*Priority: High*

As a member on the Schedule Scan page, I want to see offline imaging centers in the list but not be able to book them, so that I know my preferred location exists even if it's temporarily unavailable.

**Acceptance criteria:**
- Centers marked "Offline" appear in the imaging center list and are not hidden
- Selecting an offline center shows no available time slots
- The Continue button remains inactive when an offline center is selected

---

### Part 2

**TC-01: Why it is the most important**

TC-01 is ranked first because card payment is the primary revenue channel and it produces the most complete proof that the entire system is working: frontend, Stripe integration, and backend together.

In a cancer screening context the stakes extend beyond commercial impact. A member who cannot book may not reschedule. Delayed detection is a clinical risk, not a UX defect. This test must run against every release candidate.

**Why three card brands.** Amex is the critical variant. Its 15-digit number and 4-digit CVC mean the card input field, Luhn check, and CVC validation operate at different lengths than any 16-digit brand. A Stripe integration that silently rejects Amex (or caps the CVC at 3 digits) passes every Visa test and fails every Amex holder in production. Running all three brands as separate named variants means a CI failure is immediately attributed to a specific brand, not just "the payment step."

**Why content assertions, not just URL.** The appointment date, imaging center, and scan type on the confirmation page can only appear if a real encounter was persisted and returned by the backend. A confirmation shell rendered client-side without a backend record passes a URL check and fails all three content checks. Both layers must be verified independently.

---

**TC-02: Why it is the second most important**

TC-02 is the bank payment analog of TC-01, but it is not a duplicate. Card and bank flow through entirely different Stripe integration surfaces: different iframe hierarchies, different authentication flows (Stripe Financial Connections + Stripe Link), different webhook chains in the backend. TC-01 passing tells you nothing about whether the bank channel works. A failure here means every member who selects bank cannot book, with no fallback.

**Two bank-specific behaviors must be verified beyond the confirmation page.** First, the $5 credit must appear in the displayed total before the member submits, not only afterward. A credit surfaced post-payment is a transparency failure: the member cannot verify the discount before committing. Second, the pre-submission total must match the confirmation page total. A mismatch means the discount was either shown but not applied, or applied but not shown. Both are defects on the payment surface that TC-01 cannot catch.

---

**TC-03: Why it is the third most important**

TC-03 completes the payment surface. TC-01 and TC-02 cover card and bank; TC-03 covers Affirm, the only financing option on the platform. For members booking the $3,999 Skeletal and Neurological Assessment, Affirm is sometimes the only viable path. A broken Affirm handoff does not produce a failed payment. It closes off the channel entirely, silently, with no error on the booking side.

**What the test proves.** The testable boundary in staging is the handoff: correct merchant, correct scan type, correct total passed to the Affirm SDK at the moment of redirect. Completing a full Affirm transaction requires live sandbox credentials outside the scope of this assignment. Confirming the handoff payload is intact is sufficient. A broken handoff that passes data to the wrong merchant, or truncates the total, fails silently from the booking UI's perspective. This test makes that class of failure visible before it reaches production.

---

## Question 2

### Part 1
Being privacy focused is integral to our culture and business model. Please devise an integration test case that prevents members from accessing other's medical data. Hint: Begin Medical Questionnaire.

---

**Scenario**

Member B, authenticated with their own valid session, attempts to access Member A's medical questionnaire by obtaining the questionnaire's resource identifier, either by observing it in network traffic, guessing a sequential ID, or being given it. The system must reject Member B's request regardless of their authentication status.

**Why the questionnaire is the right target**

The "Begin Medical Questionnaire" button appears on the booking confirmation page after a successful payment. Clicking it opens a health intake form collecting weight, height, medical history, current medications, implants, pacemakers, claustrophobia, and cancer screening eligibility answers. This is the most sensitive data in the entire platform, more sensitive than the member profile, more sensitive than the booking record. An IDOR vulnerability here means any authenticated member can read another person's full health history using nothing but their own valid login and a resource ID.

**Preconditions**
- Two separate member accounts can be registered on the staging environment
- Member A has completed a booking and has a confirmed encounter

---

### Part 2
Please devise HTTP requests from Part 1 to implement your test case. Submitting written HTTP requisitions is fine, you do not need to submit a postman project.

---

All requests target `stage-api.ezra.com`. Values in `<angle brackets>` are captured from preceding responses.

---

**Step 1: Register Member A**

```http
POST /individuals/api/members HTTP/1.1
Host: stage-api.ezra.com
Content-Type: application/json

{
  "firstName": "Alice",
  "lastName": "Test",
  "email": "alice.test+<timestamp>@gmail.com",
  "password": "Pumpkin7@",
  "phoneNumber": "+1 212-555-0001",
  "legal": ["privacyPolicy", "telehealthConsent", "termsAndConditions"],
  "optInEmailNotifications": false,
  "optInPhoneNotifications": false
}

-> 201 Created
Body: "f27a690a-b48c-40d3-bc8d-a17314e49fcc"   (capture as <memberA_uuid>)
```

---

**Step 2: Authenticate as Member A**

```http
POST /individuals/member/connect/token HTTP/1.1
Host: stage-api.ezra.com
Content-Type: application/x-www-form-urlencoded

grant_type=password
&scope=openid%20offline_access%20profile%20roles%20email
&username=alice.test%2B<timestamp>%40gmail.com
&password=Pumpkin7%40
&client_id=F59A84B4-6E6B-4678-97A0-11C0F6E0719F

-> 200 OK
Body: { "access_token": "eyJ..." }   (capture as <tokenA>)
```

---

**Step 3: Member A completes booking, capture encounter ID**

Member A goes through the three booking steps on the member portal. The `encounterId` is surfaced in a tracking call made automatically when the Select Plan page loads:

```http
POST /individuals/api/members/bookingstage HTTP/1.1
Host: stage-api.ezra.com
Authorization: Bearer <tokenA>
Content-Type: application/json

{
  "memberId": "<memberA_uuid>",
  "encounterId": "929d43df-3fd1-4327-9d3e-4797ae25c997",
  "stage": "PACKAGE_SELECTED",
  "details": "FB30",
  "visitedOn": "2026-05-06T10:00:00.000Z"
}
```

Capture `encounterId` from this request body as `<encounterA_id>`. This ID is the key to the questionnaire resource.

---

**Step 4: Member A clicks "Begin Medical Questionnaire"**

After payment confirmation, Member A clicks the button. This initiates a questionnaire session scoped to their encounter:

```http
POST /packages/api/encounter/<encounterA_id>/questionnaire HTTP/1.1
Host: stage-api.ezra.com
Authorization: Bearer <tokenA>
Content-Type: application/json

{}

-> 201 Created
Body: { "id": "<questionnaire_id>", ... }   (capture as <questionnaireA_id>)
```

> **Before running this test:** open DevTools Network tab and click "Begin Medical Questionnaire" on a real confirmation page to capture the exact questionnaire endpoint path. The path above (`/packages/api/encounter/{id}/questionnaire`) is inferred from the encounter-scoped resource pattern observed across the packages service and has not been confirmed from a live network capture. Steps 1, 2, 3, 5, and 6 are confirmed from live traffic interception. The `encounterId` and ownership model are confirmed. Do not run Steps 7 and 8 until Step 4's path is verified.

---

**Step 5: Register Member B**

```http
POST /individuals/api/members HTTP/1.1
Host: stage-api.ezra.com
Content-Type: application/json

{
  "firstName": "Bob",
  "lastName": "Test",
  "email": "bob.test+<timestamp>@gmail.com",
  "password": "Pumpkin7@",
  "phoneNumber": "+1 212-555-0002",
  "legal": ["privacyPolicy", "telehealthConsent", "termsAndConditions"],
  "optInEmailNotifications": false,
  "optInPhoneNotifications": false
}

-> 201 Created
```

---

**Step 6: Authenticate as Member B**

```http
POST /individuals/member/connect/token HTTP/1.1
Host: stage-api.ezra.com
Content-Type: application/x-www-form-urlencoded

grant_type=password
&scope=openid%20offline_access%20profile%20roles%20email
&username=bob.test%2B<timestamp>%40gmail.com
&password=Pumpkin7%40
&client_id=F59A84B4-6E6B-4678-97A0-11C0F6E0719F

-> 200 OK
Body: { "access_token": "eyJ..." }   (capture as <tokenB>)
```

---

**Step 7: IDOR attempt: Member B reads Member A's questionnaire**

```http
GET /packages/api/encounter/<encounterA_id>/questionnaire/<questionnaireA_id> HTTP/1.1
Host: stage-api.ezra.com
Authorization: Bearer <tokenB>

-> 403 Forbidden   (PASS: server enforces member-scoped ownership)
   or
-> 404 Not Found   (PASS: encounter not visible to Member B's token)

-> 200 OK          (FAIL: IDOR vulnerability, Member B can read Member A's health data)
```

---

**Step 8: IDOR attempt: Member B writes to Member A's questionnaire**

```http
PATCH /packages/api/encounter/<encounterA_id>/questionnaire/<questionnaireA_id> HTTP/1.1
Host: stage-api.ezra.com
Authorization: Bearer <tokenB>
Content-Type: application/json

{
  "answers": { "medicalHistory": "tampered by Member B" }
}

-> 403 Forbidden   (PASS)
-> 200 OK          (FAIL: Member B can overwrite Member A's health intake answers)
```

---

**Pass criteria:** Steps 7 and 8 both return 403 or 404.

**Fail criteria:** Either returns 200. Member B has read or written another member's health screening data. This is a HIPAA violation and must be treated as a critical severity defect regardless of how the ID was obtained.

---

### Part 3
At Ezra, we have over 100 endpoints that transfer sensitive data. What is your thought process around managing the security quality of these endpoints? What are the tradeoffs and potential risks of your solution?

---

**Thought process**

With 100+ endpoints transferring sensitive data, no single technique covers everything. I would layer three approaches, each catching what the others miss.

---

**Layer 1: Automated auth matrix (run on every PR)**

For every endpoint, assert correct behavior under four token conditions:

| Token state | Expected response |
|---|---|
| No token | 401 |
| Malformed token | 401 |
| Valid token, wrong member | 403 |
| Valid token, correct scope | 200 |

This is the minimum bar. Any endpoint returning 200 without a valid token is an immediate critical defect. A parameterised test suite can cover all 100+ endpoints with a shared helper. New endpoints get coverage by adding one row to a data table. This runs in seconds per endpoint and catches the most obvious class of failure: missing authentication middleware entirely.

---

**Layer 2: IDOR ownership checks (run nightly)**

For every resource type that has a member-scoped ID in the URL (encounters, questionnaires, reports, appointments, packages), run a two-member ownership test: Member A creates the resource, Member B attempts to read and write it with their own valid token. The assertion is always 403 or 404.

This is the pattern from Part 1. The auth matrix cannot catch this class of bug because Member B has a valid token. They pass authentication. The ownership check is what tests authorization. Both layers are necessary because they guard against completely different failure modes.

---

**Layer 3: Periodic manual review (quarterly)**

Automated tests assert known expectations. A human review of new endpoints looks for things no matrix will catch: fields accidentally included in a response body that should be omitted, insecure defaults, authorization logic that works in isolation but breaks under a specific combination of roles, or a new endpoint added without going through the same review process as existing ones. One engineer doing a focused review per quarter catches the class of issue where the implementation is technically correct but the design decision was wrong.

---
