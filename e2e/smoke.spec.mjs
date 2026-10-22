import { test, expect } from "@playwright/test";
import { readFileSync, statSync } from "node:fs";

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
  "/tools/passport-photo-maker",
  "/tools/meeting-time-planner",
  "/tools/fuel-cost-calculator",
  "/tools/uuid-ulid-generator",
  "/tools/pregnancy-due-date-calculator",
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

async function createPortraitJpeg(page) {
  const base64 = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 1200;
    const ctx = canvas.getContext("2d");

    // Plain studio background with a softly lit head-and-shoulders portrait.
    ctx.fillStyle = "#f3f3f1";
    ctx.fillRect(0, 0, 900, 1200);

    ctx.fillStyle = "#243447";
    ctx.beginPath();
    ctx.ellipse(450, 1230, 330, 340, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#d7a072";
    ctx.fillRect(390, 840, 120, 190);
    ctx.beginPath();
    ctx.ellipse(450, 850, 90, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(450, 640, 225, 285, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(230, 660, 34, 58, 0, 0, Math.PI * 2);
    ctx.ellipse(670, 660, 34, 58, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#1f2933";
    ctx.beginPath();
    ctx.ellipse(450, 455, 236, 155, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(214, 455, 46, 170);
    ctx.fillRect(640, 455, 46, 170);

    ctx.fillStyle = "#2d2a28";
    ctx.beginPath();
    ctx.ellipse(365, 645, 26, 15, 0, 0, Math.PI * 2);
    ctx.ellipse(535, 645, 26, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#8b5e3c";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(330, 595);
    ctx.quadraticCurveTo(365, 580, 400, 595);
    ctx.moveTo(500, 595);
    ctx.quadraticCurveTo(535, 580, 570, 595);
    ctx.stroke();

    ctx.strokeStyle = "#b98158";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(452, 660);
    ctx.quadraticCurveTo(438, 750, 468, 760);
    ctx.stroke();

    ctx.strokeStyle = "#8d4f4a";
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(390, 812);
    ctx.quadraticCurveTo(450, 850, 510, 812);
    ctx.stroke();

    return canvas.toDataURL("image/jpeg", 0.92).split(",")[1];
  });

  return Buffer.from(base64, "base64");
}

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

    test("keeps the airport dropdown compact and readable on desktop", async ({
      page,
    }) => {
      const errors = trackErrors(page);
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto("/tools/flight-duration-calculator");

      const trigger = page.locator("#seg-1-arr-airport");
      await expect(trigger).toHaveCSS("font-size", "16px");
      const triggerBox = await trigger.boundingBox();

      await trigger.click();
      const dropdownBox = await page
        .getByRole("listbox", { name: "To" })
        .locator("xpath=..")
        .boundingBox();

      expect(dropdownBox.width).toBeLessThanOrEqual(320);
      expect(Math.abs(dropdownBox.x - triggerBox.x)).toBeLessThanOrEqual(1);
      expect(dropdownBox.x + dropdownBox.width).toBeLessThanOrEqual(1440);

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

  test.describe("passport / ID photo maker", () => {
    test("accepts a portrait and runs every readiness check", async ({
      page,
    }) => {
      const errors = trackErrors(page);
      await page.goto("/tools/passport-photo-maker");
      const portrait = await createPortraitJpeg(page);

      await page.locator('input[type="file"]').first().setInputFiles({
        name: "studio-portrait.jpg",
        mimeType: "image/jpeg",
        buffer: portrait,
      });

      await expect(page.getByText("studio-portrait.jpg")).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Readiness check" }),
      ).toBeVisible();
      await expect(page.getByText("Print resolution")).toBeVisible();
      await expect(page.getByText("Background evenness")).toBeVisible();
      await expect(page.getByText("Lighting", { exact: true })).toBeVisible();
      await expect(page.getByText("Subject contrast")).toBeVisible();
      await expect(page.getByText("Centring")).toBeVisible();
      await expect(
        page.getByRole("button", { name: /Download JPEG photo/ }),
      ).toBeEnabled();

      expect(errors, errors.join("\n")).toEqual([]);
    });

    test("switches to UK dimensions and exports a PDF print sheet", async ({
      page,
    }) => {
      const errors = trackErrors(page);
      await page.goto("/tools/passport-photo-maker");
      const portrait = await createPortraitJpeg(page);

      await page.locator('input[type="file"]').first().setInputFiles({
        name: "studio-portrait.jpg",
        mimeType: "image/jpeg",
        buffer: portrait,
      });

      await page.getByLabel("More document formats").selectOption("uk-passport");
      await expect(page.getByText("UK Passport · 35 × 45 mm")).toBeVisible();

      await page.getByRole("button", { name: "Advanced photo options" }).click();
      await page.getByRole("button", { name: "PDF", exact: true }).click();
      await expect(
        page.getByRole("button", { name: /Download 6-copy PDF/ }),
      ).toBeEnabled();

      const downloadPromise = page.waitForEvent("download");
      await page.getByRole("button", { name: /Download 6-copy PDF/ }).click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain("35x45mm-sheet.pdf");
      const path = await download.path();
      expect(statSync(path).size).toBeGreaterThan(1000);

      expect(errors, errors.join("\n")).toEqual([]);
    });

    test("shows a clear error for an unsupported file and fits a phone screen", async ({
      page,
    }) => {
      const errors = trackErrors(page);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto("/tools/passport-photo-maker");

      await expect(
        page.getByRole("heading", { name: "Passport / ID Photo Maker" }),
      ).toBeVisible();
      const scrollWidth = await page.evaluate(
        () => document.documentElement.scrollWidth,
      );
      expect(scrollWidth).toBeLessThanOrEqual(391);

      await page.locator('input[type="file"]').first().setInputFiles({
        name: "notes.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("not an image"),
      });
      await expect(
        page.getByText(/Please choose a JPEG, PNG or WebP image/).first(),
      ).toBeVisible();

      expect(errors, errors.join("\n")).toEqual([]);
    });
  });

  test.describe("meeting time planner", () => {
    test("recommends a slot for the default four-person team", async ({
      page,
    }) => {
      const errors = trackErrors(page);
      await page.goto("/tools/meeting-time-planner");

      await expect(
        page.getByRole("heading", { level: 1, name: "Meeting Time Planner" }),
      ).toBeVisible();
      await expect(page.getByText("Recommended slot")).toBeVisible();
      await expect(
        page.getByText("3/4 in working hours").first(),
      ).toBeVisible();
      await expect(page.getByText(/No perfect overlap/).first()).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Calendar .ics" }),
      ).toBeEnabled();

      expect(errors, errors.join("\n")).toEqual([]);
    });

    test("downloads a valid .ics invite for the selected slot", async ({
      page,
    }) => {
      const errors = trackErrors(page);
      await page.goto("/tools/meeting-time-planner");

      const downloadPromise = page.waitForEvent("download");
      await page.getByRole("button", { name: "Calendar .ics" }).click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toBe(
        "global-product-sync-2026-11-10.ics",
      );

      const path = await download.path();
      expect(statSync(path).size).toBeGreaterThan(200);
      const content = readFileSync(path, "utf8");
      expect(content).toContain("BEGIN:VCALENDAR");
      expect(content).toContain("DTSTART:20261110T150000Z");
      expect(content).toContain("Amara: 10:00");
      expect(content).toContain("SUMMARY:Global product sync");

      expect(errors, errors.join("\n")).toEqual([]);
    });

    test("filters perfect overlaps, switches clocks and adds a participant", async ({
      page,
    }) => {
      const errors = trackErrors(page);
      await page.goto("/tools/meeting-time-planner");

      await page
        .getByRole("button", { name: "Advanced scheduling options" })
        .click();
      await page.getByRole("switch", { name: "Only perfect overlaps" }).click();
      await expect(
        page.getByText(/No slot puts everyone inside/),
      ).toBeVisible();

      await page
        .getByRole("button", { name: "Show all slots" })
        .first()
        .click();
      await expect(page.getByText("Recommended slot")).toBeVisible();

      await page.getByRole("button", { name: "12-hour" }).click();
      await expect(page.getByText("10:00 AM").first()).toBeVisible();

      await page.getByRole("button", { name: "Add person" }).click();
      await expect(page.getByText("Participants (5/8)")).toBeVisible();
      await page.getByLabel("Search window").selectOption("next7");
      await expect(page.getByText("7 days searched")).toBeVisible();

      expect(errors, errors.join("\n")).toEqual([]);
    });

    test("explains invalid working hours and fits a phone screen", async ({
      page,
    }) => {
      const errors = trackErrors(page);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto("/tools/meeting-time-planner");

      const scrollWidth = await page.evaluate(
        () => document.documentElement.scrollWidth,
      );
      expect(scrollWidth).toBeLessThanOrEqual(391);

      await page
        .getByRole("button", { name: "Advanced scheduling options" })
        .click();
      await page.getByLabel("Workday starts").fill("18:00");
      await page.getByLabel("Workday ends").fill("09:00");
      await expect(
        page.getByText("The working day must end after it starts."),
      ).toBeVisible();

      expect(errors, errors.join("\n")).toEqual([]);
    });
  });

  test.describe("fuel cost & road trip calculator", () => {
    test("prices the default round trip and splits it per person", async ({
      page,
    }) => {
      const errors = trackErrors(page);
      await page.goto("/tools/fuel-cost-calculator");

      await expect(
        page.getByRole("heading", {
          level: 1,
          name: "Fuel Cost & Road Trip Calculator",
        }),
      ).toBeVisible();
      await expect(page.getByTestId("total-trip-cost")).toHaveText("$123.75");
      await expect(page.getByTestId("per-person-cost")).toHaveText("$61.88");
      await expect(page.getByTestId("fuel-used")).toHaveText("75 L");
      await expect(page.getByTestId("fuel-cost")).toHaveText("$123.75");
      await expect(page.getByText("Cost breakdown")).toBeVisible();
      await expect(page.getByText("$61.88").first()).toBeVisible();

      expect(errors, errors.join("\n")).toEqual([]);
    });

    test("adds extra costs, flags an over-budget trip and downloads a CSV", async ({
      page,
    }) => {
      const errors = trackErrors(page);
      await page.goto("/tools/fuel-cost-calculator");

      await page
        .getByRole("button", { name: "Advanced trip options" })
        .click();
      await page.getByLabel("Tolls & road fees (USD)").fill("25");
      await page.getByLabel("Parking (USD)").fill("5");
      await page.getByLabel("Trip budget (USD, optional)").fill("100");

      await expect(page.getByTestId("total-trip-cost")).toHaveText("$153.75");
      await expect(page.getByTestId("per-person-cost")).toHaveText("$76.88");
      await expect(page.getByText("Over budget", { exact: true })).toBeVisible();
      await expect(page.getByText("$53.75 over", { exact: false })).toBeVisible();

      const downloadPromise = page.waitForEvent("download");
      await page.getByRole("button", { name: "Download CSV" }).click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toBe(
        "coastal-weekend-fuel-cost.csv",
      );

      const path = await download.path();
      expect(statSync(path).size).toBeGreaterThan(200);
      const content = readFileSync(path, "utf8");
      expect(content).toContain("Fuel used (L),75");
      expect(content).toContain("Fuel cost,123.75");
      expect(content).toContain("Total cost,153.75");
      expect(content).toContain("Cost per person,76.88");
      expect(content).toContain("Budget difference,-53.75");

      expect(errors, errors.join("\n")).toEqual([]);
    });

    test("converts to imperial units, validates distance and fits a phone screen", async ({
      page,
    }) => {
      const errors = trackErrors(page);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto("/tools/fuel-cost-calculator");

      const scrollWidth = await page.evaluate(
        () => document.documentElement.scrollWidth,
      );
      expect(scrollWidth).toBeLessThanOrEqual(391);

      await page.getByRole("button", { name: "Imperial · mi / gal" }).click();
      await expect(page.getByLabel(/One-way distance/)).toHaveValue("310.69");
      await expect(page.getByLabel("Fuel efficiency")).toHaveValue("31.36");
      await expect(page.getByLabel(/Fuel price/)).toHaveValue("6.246");

      await page.getByLabel(/One-way distance/).fill("0");
      await expect(
        page.getByText("Enter a one-way distance greater than zero.").first(),
      ).toBeVisible();
      await expect(page.getByText("Check the trip details")).toBeVisible();

      expect(errors, errors.join("\n")).toEqual([]);
    });
  });

  test.describe("uuid / ulid generator", () => {
    test("generates a valid UUID v4 batch with secure formatting", async ({
      page,
    }) => {
      const errors = trackErrors(page);
      await page.goto("/tools/uuid-ulid-generator");

      await expect(
        page.getByRole("heading", {
          level: 1,
          name: "UUID / ULID Generator",
        }),
      ).toBeVisible();

      const output = page.getByLabel("Generated identifiers");
      await expect
        .poll(async () => (await output.inputValue()).split("\n").filter(Boolean).length)
        .toBe(5);

      const values = (await output.inputValue()).split("\n").filter(Boolean);
      const uuidV4 =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
      values.forEach((value) => expect(value).toMatch(uuidV4));
      expect(new Set(values).size).toBe(5);
      await expect(page.getByText("122 bits", { exact: true }).first()).toBeVisible();

      expect(errors, errors.join("\n")).toEqual([]);
    });

    test("makes deterministic UUID v5 values and generates sortable ULIDs", async ({
      page,
    }) => {
      const errors = trackErrors(page);
      await page.goto("/tools/uuid-ulid-generator");

      await page.getByRole("button", { name: /^UUID v5/ }).click();
      const output = page.getByLabel("Generated identifiers");
      await expect(output).toHaveValue(
        "cfbff0d1-9375-5685-968c-48ce8b15ae17",
      );

      await page.getByRole("button", { name: /^ULID/ }).click();
      await expect
        .poll(async () => (await output.inputValue()).split("\n").filter(Boolean).length)
        .toBe(5);
      const ulids = (await output.inputValue()).split("\n").filter(Boolean);
      ulids.forEach((value) =>
        expect(value).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/),
      );
      expect([...ulids].sort()).toEqual(ulids);
      expect(new Set(ulids).size).toBe(5);

      expect(errors, errors.join("\n")).toEqual([]);
    });

    test("inspects UUIDs and ULIDs and explains invalid input", async ({
      page,
    }) => {
      const errors = trackErrors(page);
      await page.goto("/tools/uuid-ulid-generator");

      const inspector = page.getByLabel("Identifier to inspect");
      await inspector.fill("01ARZ3NDEKTSV4RRFFQ69G5FAV");
      await expect(page.getByText("Valid ULID")).toBeVisible();
      await expect(page.getByText(/2016/).first()).toBeVisible();
      await expect(page.getByText("80 bits").first()).toBeVisible();

      await page.getByRole("button", { name: "Sample UUID" }).click();
      await expect(page.getByText("Valid UUID")).toBeVisible();
      await expect(
        page.getByText("UUID v5 (SHA-1 name-based)").first(),
      ).toBeVisible();
      await expect(
        page.getByText("cfbff0d1-9375-5685-968c-48ce8b15ae17").last(),
      ).toBeVisible();

      await inspector.fill("not-a-real-identifier");
      await expect(page.getByText("Not a valid UUID or ULID")).toBeVisible();

      expect(errors, errors.join("\n")).toEqual([]);
    });

    test("generates a 25-value batch, downloads it and fits a phone screen", async ({
      page,
    }) => {
      const errors = trackErrors(page);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto("/tools/uuid-ulid-generator");

      const scrollWidth = await page.evaluate(
        () => document.documentElement.scrollWidth,
      );
      expect(scrollWidth).toBeLessThanOrEqual(391);

      await page.getByLabel("How many identifiers?").fill("25");
      await page.getByRole("button", { name: "Generate IDs" }).click();

      const output = page.getByLabel("Generated identifiers");
      await expect
        .poll(async () => (await output.inputValue()).split("\n").filter(Boolean).length)
        .toBe(25);

      const downloadPromise = page.waitForEvent("download");
      await page.getByRole("button", { name: ".txt" }).click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(
        /^uuidv4-25-ids-\d{4}-\d{2}-\d{2}\.txt$/,
      );

      const path = await download.path();
      const content = readFileSync(path, "utf8");
      expect(content.split(/\r?\n/).filter(Boolean)).toHaveLength(25);

      expect(errors, errors.join("\n")).toEqual([]);
    });
  });

  test.describe("pregnancy due date calculator", () => {
    test("estimates a due date from LMP and adjusts for cycle length", async ({
      page,
    }) => {
      const errors = trackErrors(page);
      await page.goto("/tools/pregnancy-due-date-calculator");

      await expect(
        page.getByRole("heading", {
          level: 1,
          name: "Pregnancy Due Date Calculator",
        }),
      ).toBeVisible();
      await expect(page.getByTestId("due-date")).toHaveText(
        "Sunday, November 8, 2026",
      );

      await page.getByLabel("First day of last period").fill("2026-01-01");
      await expect(page.getByTestId("due-date")).toHaveText(
        "Thursday, October 8, 2026",
      );

      await page.getByLabel("Average cycle length (days)").fill("30");
      await expect(page.getByTestId("due-date")).toHaveText(
        "Saturday, October 10, 2026",
      );

      expect(errors, errors.join("\n")).toEqual([]);
    });

    test("supports conception, ultrasound and IVF dating methods", async ({
      page,
    }) => {
      const errors = trackErrors(page);
      await page.goto("/tools/pregnancy-due-date-calculator");

      await page
        .getByRole("button", { name: "Use Conception date" })
        .click();
      await page.getByRole("textbox", { name: "Conception date" }).fill("2026-01-15");
      await expect(page.getByTestId("due-date")).toHaveText(
        "Thursday, October 8, 2026",
      );

      await page
        .getByRole("button", { name: "Use Ultrasound scan" })
        .click();
      await page.getByLabel("Ultrasound scan date").fill("2026-03-01");
      await page.getByLabel("Weeks at scan").fill("8");
      await page.getByLabel("Days at scan").fill("2");
      await expect(page.getByTestId("due-date")).toHaveText(
        "Friday, October 9, 2026",
      );

      await page.getByRole("button", { name: "Use IVF transfer" }).click();
      await page.getByLabel("Embryo transfer date").fill("2026-01-20");
      await page
        .getByLabel("Embryo stage at transfer")
        .selectOption("5");
      await expect(page.getByTestId("due-date")).toHaveText(
        "Thursday, October 8, 2026",
      );

      expect(errors, errors.join("\n")).toEqual([]);
    });

    test("validates future dates and downloads a milestone calendar", async ({
      page,
    }) => {
      const errors = trackErrors(page);
      await page.goto("/tools/pregnancy-due-date-calculator");

      await expect(page.getByTestId("due-date")).toHaveText(
        "Sunday, November 8, 2026",
      );
      await page.getByLabel("First day of last period").fill("2026-01-01");
      await expect(page.getByTestId("due-date")).toHaveText(
        "Thursday, October 8, 2026",
      );

      const downloadPromise = page.waitForEvent("download");
      await page.getByRole("button", { name: "Download .ics" }).click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toBe(
        "pregnancy-milestones-2026-10-08.ics",
      );

      const path = await download.path();
      expect(statSync(path).size).toBeGreaterThan(400);
      const content = readFileSync(path, "utf8");
      expect(content).toContain("BEGIN:VCALENDAR");
      expect(content).toContain("DTSTART;VALUE=DATE:20261008");
      expect(content).toContain("SUMMARY:Estimated due date");
      expect(content).toContain("SUMMARY:Anatomy scan window");
      expect(content).toContain("SUMMARY:Post-term threshold");

      await page.getByLabel("First day of last period").fill("2027-01-01");
      await expect(
        page
          .getByText("Last period date cannot be after the assessment date.")
          .first(),
      ).toBeVisible();
      await expect(page.getByText("Check the dates")).toBeVisible();

      expect(errors, errors.join("\n")).toEqual([]);
    });

    test("checks progress at a custom date and fits a phone screen", async ({
      page,
    }) => {
      const errors = trackErrors(page);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto("/tools/pregnancy-due-date-calculator");

      await expect(page.getByTestId("due-date")).toBeVisible();
      const initialWidth = await page.evaluate(
        () => document.documentElement.scrollWidth,
      );
      expect(initialWidth).toBeLessThanOrEqual(391);

      await page.getByLabel("First day of last period").fill("2026-01-01");
      await page
        .getByRole("button", { name: /Advanced options/ })
        .click();
      await page.getByLabel("Calculate progress as of").fill("2026-06-01");
      await expect(page.getByTestId("gestational-age")).toHaveText("21w 4d");

      const expandedWidth = await page.evaluate(
        () => document.documentElement.scrollWidth,
      );
      expect(expandedWidth).toBeLessThanOrEqual(391);

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
