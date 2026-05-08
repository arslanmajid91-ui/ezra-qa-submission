/**
 * Environment flags for conditional test execution.
 *
 * Usage — in any spec file:
 *
 *   import { hasStagingSlots } from '../../utils/testIf'
 *   const testIf = (condition: boolean) => condition ? test : test.skip
 *   testIf(hasStagingSlots)('my test', async ({ page }) => { ... })
 *
 * The local `testIf` wrapper uses each spec's own `test` import (plain or fixture),
 * so fixture-provided variables like `cachedAuthPage` are fully typed and available.
 * Skipped tests appear in the report as pending — gaps are visible, not silent.
 */

/** False when STAGING_HAS_SLOTS=false — set in CI when the staging calendar is empty. */
export const hasStagingSlots = process.env.STAGING_HAS_SLOTS !== 'false'

/** True when running inside a CI environment (GitHub Actions sets this automatically). */
export const isCI = !!process.env.CI
