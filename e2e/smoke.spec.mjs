import { test, expect } from "@playwright/test";

/**
 * ToolsTrek regression smoke suite.
 *
 * Scope: the routes whose components were refactored during the Next 16 /
 * ESLint flat-config migration. The primary assertion is that every page
 * renders with NO uncaught exceptions and NO console errors — this is what
 * catches broken imports, hook misuse and hydration regressions introduced by
 * the refactor — plus a few real interactions for the highest-risk pieces.
 */

const HIGH_RISK_ROUTES = [
  "/tools/bra-size-calculator",
  "/tools/pomodoro-timer",
  "/tools/regex-tester",
  "/tools/code-formatter",
  "/tools/unit-converter",
  "/tools/jwt-decoder",
  "/tools/task-prioritizer",
  "/tools/typing-test",
  "/tools/currency-converter",
  "/tools/calendar-generator",
  "/tools/random-number-generator",
  "/tools/dummy-text-generator",
  "/tools/csv-viewer",
  "/tools/binary-decoder",
  "/tools/braille-decoder",
  "/tools/roman-numeral-converter",
  "/tools/online-notepad",
  "/tools/daily-planner",
  "/tools/hash-generator",
  "/tools/json-editor",
  // Static page whose content is driven by lib/changelogData.js
  "/changelog",
];

// Console output that is environment noise, not an app regression.
// Matched against both the message text and the resource URL.
const IGNORED_CONSOLE = [
  /Download the React DevTools/i,
  /\[Fast Refresh\]/i,
  /favicon/i,
  /View transition animation failed/i, // benign fallback in the theme toggler
  // Vercel Analytics only serves these on Vercel's platform; a harmless 404 elsewhere.
  /\/_vercel\/(?:insights|speed-insights)\//i,
  // Header fetches the public GitHub repo (unauthenticated) for a star count;
  // it rate-limits with a 403. External service noise, not an app regression.
  /api\.github\.com/i,
];

function trackErrors(page) {
  const errors = [];
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    const url = msg.location()?.url ?? "";
    if (IGNORED_CONSOLE.some((re) => re.test(`${text} ${url}`))) return;
    errors.push(url ? `console.error: ${text} @ ${url}` : `console.error: ${text}`);
  });
  return errors;
}

const isDark = (page) =>
  page.locator("html").evaluate((el) => el.classList.contains("dark"));

test.describe("high-risk routes", () => {
  for (const route of HIGH_RISK_ROUTES) {
    test(`renders ${route} without runtime errors`, async ({ page }) => {
      const errors = trackErrors(page);

      const response = await page.goto(route);
      expect(response?.status(), `HTTP status for ${route}`).toBeLessThan(400);

      // Server metadata resolved through the root template.
      await expect(page).toHaveTitle(/ToolsTrek/);

      // Some real content painted.
      await expect(page.locator("h1, h2").first()).toBeVisible();

      // Let late effects (deferred hydration reads) settle before asserting.
      await page.waitForTimeout(400);
      expect(errors, `runtime errors on ${route}:\n${errors.join("\n")}`).toEqual(
        [],
      );
    });
  }
});

test.describe("interactions", () => {
  test("theme toggle flips the theme and persists across reload", async ({
    page,
  }) => {
    const errors = trackErrors(page);
    await page.goto("/");

    const toggle = page.locator('button[aria-label^="Switch to"]');
    await expect(toggle).toBeVisible();

    const before = await isDark(page);
    await toggle.click();
    await expect.poll(() => isDark(page)).toBe(!before);

    // Let the theme cross-fade view transition settle before reloading.
    await page.waitForTimeout(800);
    await page.reload();
    // Allow hydration + the theme store to re-apply the class before asserting.
    await expect.poll(() => isDark(page)).toBe(!before);

    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("global search opens on Ctrl+K and filters tools", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/");

    const input = page.getByPlaceholder("Search tools…");
    // The global keydown listener is attached on hydration, so an early keypress
    // can be missed. Retry — but never press while it is already open, since that
    // would toggle it shut again.
    await expect(async () => {
      if (await input.isVisible()) return;
      await page.keyboard.press("Control+k");
      await expect(input).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 20000 });

    await input.fill("regex");
    await expect(
      page.getByText("Regex Tester", { exact: false }).first(),
    ).toBeVisible();

    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("code formatter loads prefilled with a sample", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/tools/code-formatter");

    const editor = page.getByPlaceholder(/Paste or drag your .* code here/);
    await expect(editor).toBeVisible();
    await expect(editor).not.toHaveValue("");

    expect(errors, errors.join("\n")).toEqual([]);
  });

  // Sonner only mounts its toaster element while a toast is on screen, so each
  // case triggers one via the changelog "Copy anchor link" button. That button is
  // server-rendered, so the click is retried until a toast actually appears. The
  // toaster should track the app's own theme store, not the OS or a fixed default.
  const expectToastTheme = async (page, theme) => {
    await expect(async () => {
      await page
        .getByRole("button", { name: /^Copy link to / })
        .first()
        .click();
      await expect(page.locator("[data-sonner-toaster]")).toHaveAttribute(
        "data-sonner-theme",
        theme,
        { timeout: 2000 },
      );
    }).toPass({ timeout: 20000 });
  };

  test("toasts render with the light theme in light mode", async ({ page }) => {
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/changelog");

    await expectToastTheme(page, "light");
  });

  test("toasts follow the site theme when dark mode is active", async ({
    page,
  }) => {
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/changelog");
    // Seed the persisted preference, then reload so the app boots in dark mode.
    await page.evaluate(() => localStorage.setItem("theme", "dark"));
    await page.reload();
    await expect.poll(() => isDark(page)).toBe(true);

    await expectToastTheme(page, "dark");
  });

  test("changelog summaries clamp to 2 lines until expanded", async ({
    page,
  }) => {
    const lineClamp = (locator) =>
      locator.evaluate((el) => getComputedStyle(el).webkitLineClamp);

    await page.goto("/changelog");

    const cards = page.locator("article");
    const latestSummary = cards.first().locator("p").first();
    const olderSummary = cards.nth(1).locator("p").first();

    // The newest release is expanded by default → full summary.
    await expect.poll(() => lineClamp(latestSummary)).toBe("none");
    // Older releases are collapsed → summary clamped to two lines.
    await expect.poll(() => lineClamp(olderSummary)).toBe("2");

    // Expanding reveals the full summary…
    await cards.nth(1).getByRole("button", { name: /Show details/ }).click();
    await expect.poll(() => lineClamp(olderSummary)).toBe("none");

    // …and collapsing clamps it again.
    await cards.nth(1).getByRole("button", { name: /Hide details/ }).click();
    await expect.poll(() => lineClamp(olderSummary)).toBe("2");
  });
});
