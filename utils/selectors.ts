/**
 * Centralized selector registry — all locator strings live here.
 * Update one entry when the UI changes rather than hunting across page objects.
 */
export const Selectors = {
  signUp: {
    firstName: 'Legal First Name',
    lastName: 'Legal Last Name',
    email: 'Email',
    phone: 'Phone Number',
    password: 'Password',
    termsButton: 'button.checkbox',
    submitButton: 'Submit',
    joinLink: 'Join',
    cookieAccept: 'Accept',
  },

  selectPlan: {
    fb30Card: 'FB30-encounter-card',
    fb60Card: 'FB60-encounter-card',
    continueButton: 'select-plan-submit-btn',
    dobField: 'Date of birth (MM-DD-YYYY)',
    sexDropdown: '.multiselect__tags',
    sexOption: '.multiselect__option',
  },

  scheduleScan: {
    findCentersButton: 'Find closest centers to me',
    preferredLocation: 'Park Ave', // target this center first on every run
    locationCard: '.location-cards > div',
    calendarTrigger: 'button.trigger-btn',
    // VueCal: cells that are not out-of-scope or disabled are bookable
    availableDate: '.vuecal__cell:not(.vuecal__cell--out-of-scope):not(.vuecal__cell--disabled)',
    timeSlot: 'div.b3--bold',
    timeSlotPattern: /^\d+:\d+ [AP]M$/,
    continueButton: '[data-test="submit"]',
  },

  reserveAppointment: {
    heading: 'Reserve your appointment',
    // Main payment element — card fields AND bank tab switcher live here
    stripeFrame: 'iframe[src*="elements-inner-accessory-target"]',
    card: {
      number: 'Card number',
      expiry: 'Expiration date',
      cvc: 'Security code',
      zip: 'ZIP code',
    },
    // Bank payment — Financial Connections via Stripe Link
    bank: {
      // "Bank $5 back" button lives in the main stripeFrame (elements-inner-accessory-target)
      tabButton: 'Bank $5 back',
      // After clicking Bank, "Success" test bank appears directly — no search combobox
      successBank: 'Success',
      // Stripe Link auth modal (second iframe, appears after bank selected)
      linkFrame: 'iframe[src*="universal-link-modal-inner"]',
      agreeButton: 'agree-button', // data-testid
      continueWithLink: /^Continue with Link$/,
      linkEmailInput: 'link-email-input', // data-testid
      linkPhoneInput: 'link-phone-number-input', // data-testid — phone-based Stripe Link signup
      linkSignupButton: 'link-signup-button', // data-testid
      accountPickerItem: 'account-picker-item', // data-testid — selects the connected bank
      selectButton: 'select-button', // data-testid
      doneButton: 'done-button', // data-testid
    },
    continueButton: '[data-test="submit"]',
    paymentError: '[class*="failure"], [class*="error"]',
  },

  confirmation: {
    container: '.scan-confirm__msg-container',
    appointmentDate: /\d{4}.*(EDT|EST)/,
    scanType: 'MRI Scan Appointment',
    questionnaireButton: 'Begin Medical Questionnaire',
  },

  auth: {
    email: 'Email',
    password: 'Password',
    submit: 'Submit',
  },

  dashboard: {
    activeCard: '.card.active',
    rescheduleCancel: 'Reschedule or Cancel',
    cancelAppointment: 'Cancel appointment',
    // In the cancel modal, click the appointment card then confirm with "Cancel"
    cancellationCard: '.schedule-card.cancellation-card .left-column',
    cancelConfirmButton: 'Cancel',
    reasonAnotherText: 'Another reason',
    reasonTextInput: 'Please enter your answer here',
    cancelScanButton: 'Cancel Scan',
  },
} as const

/**
 * Hub portal selector registry (staging-hub.ezra.com).
 *
 * Kept separate from the member portal Selectors object because the hub is a
 * different application with different HTML structure, different auth flow, and
 * different page lifecycle (SignalR, no networkidle). Separating them prevents
 * hub-specific selectors from polluting the member portal registry and makes
 * it obvious at a glance which app a given selector belongs to.
 *
 * Selectors were derived by running the diagnostic script against the live
 * staging hub and inspecting network traffic / page HTML. Verify against the
 * live hub before the first run if the app has been updated.
 */
export const HubSelectors = {
  signIn: {
    email: /email/i,
    password: /password/i,
    submit: /submit/i,
  },

  memberList: {
    // SignalR loads the member table asynchronously — wait for one of these
    tableOrRow: 'table, .data-row, [class*="member"]',
    searchPlaceholder: 'Search members',
    // After searching, member profile links appear as anchors to /members/{uuid}
    memberProfileLink: 'a[href*="/members/"]',
  },

  memberDetail: {
    // Selector to confirm the member page has loaded (at least one package area)
    packageCardOrLink: '[class*="package"], [class*="card"], a[href*="/package/"]',
    // Anchor links to specific package pages
    packageLink: 'a[href*="/package/"]',
  },

  packageDetail: {
    // The Cancel button is only present on "Scan Active" packages.
    // Text is matched case-insensitively to handle "Cancel" vs "Cancel Package".
    cancelButtonSelector: '[class*="status"] button, [class*="package"] button',
    cancelButtonText: /^cancel( package)?$/i,
    confirmButton: /confirm/i,
    // After cancellation the "Reactivate Package" button replaces Cancel.
    // Its presence proves the state change was persisted to the backend.
    reactivateButton: /reactivate/i,
  },
} as const
