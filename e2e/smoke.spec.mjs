import { test, expect } from "@playwright/test";
import { statSync } from "node:fs";

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
  "/tools/country-visited-map",
  "/tools/age-on-other-planets",
  "/tools/dog-cat-age-calculator",
  "/tools/image-compressor",
  "/tools/percentage-calculator",
  "/tools/text-diff",
  "/tools/flight-duration-calculator",
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

  test("image compressor accepts an image and produces a download", async ({
    page,
  }) => {
    const errors = trackErrors(page);
    await page.goto("/tools/image-compressor");

    // 1×1 transparent PNG — small enough to make the test fast, but still goes
    // through the real decode, compression and blob-download pipeline.
    const pixelPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      "base64",
    );
    await page.locator('input[type="file"]').setInputFiles({
      name: "pixel.png",
      mimeType: "image/png",
      buffer: pixelPng,
    });

    await expect(page.getByText("pixel.png")).toBeVisible();
    await page.getByRole("button", { name: /Compress 1 image/ }).click();
    await expect(
      page.getByRole("link", { name: /Download/ }).first(),
    ).toBeVisible({ timeout: 60000 });

    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("image compressor compresses a nine-image batch in one run", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const errors = trackErrors(page);

    // Generate a real JPEG with a full decode/encode cycle, then upload nine
    // copies with mixed MIME spellings to catch batch memory and MIME bugs.
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.setContent(`
      <main style="min-height:100vh;padding:48px;background:linear-gradient(135deg,#064e3b,#0ea5e9 55%,#7c3aed);color:white;font-family:Arial,sans-serif">
        <h1 style="font-size:64px;margin:0">Batch photo test</h1>
        <p style="font-size:28px">Nine images should compress without a codec error.</p>
      </main>
    `);
    const jpeg = await page.screenshot({ type: "jpeg", quality: 90 });

    await page.goto("/tools/image-compressor");
    await page.getByLabel("Max width / height").fill("640");
    const files = Array.from({ length: 9 }, (_, index) => ({
      name: `batch-${index + 1}.jpg`,
      mimeType:
        index % 3 === 1
          ? "image/jpg"
          : index % 3 === 2
            ? "application/octet-stream"
            : "image/jpeg",
      buffer: jpeg,
    }));
    await page.locator('input[type="file"]').setInputFiles(files);

    await expect(
      page.getByRole("heading", { name: "Your images (9)" }),
    ).toBeVisible();
    await page.getByRole("button", { name: /Compress 9 images/ }).click();

    await expect(page.getByText(/9 compressed/)).toBeVisible({
      timeout: 120_000,
    });
    await expect(page.getByRole("link", { name: /Download/ })).toHaveCount(9);
    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("image compressor does not cap the upload queue at 50 images", async ({
    page,
  }) => {
    const errors = trackErrors(page);
    await page.goto("/tools/image-compressor");

    const pixelPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      "base64",
    );
    const files = Array.from({ length: 51 }, (_, index) => ({
      name: `pixel-${index + 1}.png`,
      mimeType: "image/png",
      buffer: pixelPng,
    }));
    await page.locator('input[type="file"]').setInputFiles(files);

    await expect(
      page.getByRole("heading", { name: "Your images (51)" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Compress 51 images/ }),
    ).toBeEnabled();

    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("percentage calculator updates the result as values change", async ({
    page,
  }) => {
    const errors = trackErrors(page);
    await page.goto("/tools/percentage-calculator");

    await page.getByLabel("Percentage (X)").fill("15");
    await page.getByLabel("Value (Y)").fill("200");
    await expect(page.getByTestId("percentage-result")).toHaveText("30");

    await page.getByLabel("Value (Y)").fill("400");
    await expect(page.getByTestId("percentage-result")).toHaveText("60");

    expect(errors, errors.join("\n")).toEqual([]);
  });

  test.describe("flight duration calculator", () => {
    test("calculates the sample DAC to DXB itinerary", async ({ page }) => {
      const errors = trackErrors(page);
      await page.goto("/tools/flight-duration-calculator");

      await expect(
        page.getByRole("heading", {
          level: 1,
          name: "Flight Duration Calculator",
        }),
      ).toBeVisible();
      await expect(page.getByText("7h 30m").first()).toBeVisible();
      await expect(page.getByText("4h 45m").first()).toBeVisible();
      await expect(page.getByText("Door-to-door").first()).toBeVisible();

      expect(errors, errors.join("\n")).toEqual([]);
    });

    test("shows a helpful error when arrival is before departure", async ({
      page,
    }) => {
      const errors = trackErrors(page);
      await page.goto("/tools/flight-duration-calculator");

      await page.getByLabel("Flight 1 arrival time").fill("00:00");
      await expect(
        page.getByText(/arrives before it departs/i).first(),
      ).toBeVisible();

      await page.getByLabel("Flight 1 arrival time").fill("05:15");
      await expect(
        page.getByText(/We couldn't calculate this trip yet/i),
      ).toHaveCount(0);

      expect(errors, errors.join("\n")).toEqual([]);
    });

    test("arrival mode computes the local landing time", async ({ page }) => {
      const errors = trackErrors(page);
      await page.goto("/tools/flight-duration-calculator");

      await page
        .getByRole("button", { name: "Arrival", exact: true })
        .click();
      await expect(page.getByText("Arrives at destination").first()).toBeVisible();
      await expect(page.getByText("05:15").first()).toBeVisible();

      expect(errors, errors.join("\n")).toEqual([]);
    });

    test("adds a connection and calculates the layover", async ({ page }) => {
      const errors = trackErrors(page);
      await page.goto("/tools/flight-duration-calculator");

      await page.getByRole("button", { name: "Add connection" }).click();
      await expect(page.getByText(/Layover in Dubai/i).first()).toBeVisible();
      await expect(page.getByText(/International transfer · minimum 90 min/i)).toBeVisible();
      await expect(page.getByText(/2h/).first()).toBeVisible();

      expect(errors, errors.join("\n")).toEqual([]);
    });

    test("exports a PDF itinerary report", async ({ page }) => {
      const errors = trackErrors(page);
      await page.goto("/tools/flight-duration-calculator");

      const downloadPromise = page.waitForEvent("download");
      await page.getByRole("button", { name: "PDF report" }).click();
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toBe("flight-duration-toolstrek.pdf");
      const path = await download.path();
      expect(path).toBeTruthy();
      expect(statSync(path).size).toBeGreaterThan(1000);

      expect(errors, errors.join("\n")).toEqual([]);
    });
  });

  test("text diff checker highlights additions in a loaded sample", async ({
    page,
  }) => {
    const errors = trackErrors(page);
    await page.goto("/tools/text-diff");

    await page.getByRole("button", { name: "Load sample" }).click();
    await expect(page.getByText(/New image compressor/).first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Copy .diff" }),
    ).toBeEnabled();

    await page.getByRole("button", { name: "Words" }).click();
    await expect(page.getByText(/% similar/)).toBeVisible();
    await page.getByRole("button", { name: "Characters" }).click();
    await expect(page.getByText(/% similar/)).toBeVisible();

    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("text diff checker shows a shared no-difference state in split view", async ({
    page,
  }) => {
    const errors = trackErrors(page);
    await page.goto("/tools/text-diff");

    await page
      .getByRole("textbox", { name: "Original text" })
      .fill("Identical content");
    await page
      .getByRole("textbox", { name: "Modified text" })
      .fill("Identical content");
    await page.getByRole("button", { name: "Split" }).click();

    await expect(page.getByText("No differences found")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Copy .diff" }),
    ).toBeDisabled();
    await expect(
      page.getByRole("button", { name: "Download", exact: true }),
    ).toBeDisabled();

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
