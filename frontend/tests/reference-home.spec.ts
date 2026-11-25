import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

let errors: string[];
test.beforeEach(async ({ page }, info) => {
  errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  if (!info.title.includes("intro"))
    await page.addInitScript(() =>
      sessionStorage.setItem("ssquare-journey-intro", "seen"),
    );
});
test.afterEach(() => expect(errors, "Application runtime errors").toEqual([]));

async function noOverflow(page: Page) {
  const layout = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth,
    viewport: innerWidth,
  }));
  expect(layout.document, JSON.stringify(layout)).toBeLessThanOrEqual(
    page.viewportSize()!.width + 1,
  );
  expect(layout.viewport).toBe(page.viewportSize()!.width);
}
async function enter(page: Page) {
  await page.goto("/");
  const root = page.getByTestId("material-journey");
  await expect(root).toHaveAttribute("data-webgl", "ready");
  const auto = page.getByRole("button", {
    name: "Autoplay materials",
    exact: true,
  });
  if ((await auto.getAttribute("aria-pressed")) === "true") await auto.click();
  await expect
    .poll(async () => {
      const p = Number(await root.getAttribute("data-position"));
      return Math.abs(p - Math.round(p));
    })
    .toBeLessThan(0.002);
  return page.getByTestId("journey-canvas");
}
async function still(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByTestId("material-journey")).toHaveAttribute(
    "data-entered",
    "true",
  );
}
async function progress(page: Page, selector: string, p: number) {
  await page.locator(selector).evaluate((s, p) => {
    const h = document.querySelector("header")!.getBoundingClientRect().height;
    scrollTo(
      0,
      scrollY +
        s.getBoundingClientRect().top -
        h +
        p * ((s as HTMLElement).offsetHeight - (innerHeight - h)),
    );
  }, p);
}
async function contact(
  page: Page,
  notes = "ARENA_QA_ONLY: please review the drawing, material and quantity. Not a real enquiry.",
) {
  const form = page.getByTestId("inline-quote");
  await form.getByLabel("Full name").fill("ARENA_QA Buyer");
  await form.getByLabel("Work email").fill("qa@example.invalid");
  await form.getByLabel("Requirements / drawing notes").fill(notes);
  return form;
}
const saved = {
  referenceId: "SSQ-RFQ-QA-MOCK",
  submittedAt: "2026-11-23T12:00:00Z",
  savedLocally: true,
  savedToBackend: false,
  emailDispatched: false,
  webhookDispatched: false,
};

test("reference hero uses the dark material palette, local type, genuine identity and contextual quotation", async ({
  page,
}) => {
  const canvas = await enter(page);
  const id = await canvas.getAttribute("data-traveller-id");
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(page.locator("header img")).toHaveAttribute(
    "src",
    "/images/ssquare-logo-dark.png",
  );
  for (const [i, name, color] of [
    [0, "Rubber", "#111a2b"],
    [1, "Steel", "#22364d"],
    [2, "Aluminium", "#4b5968"],
  ] as const) {
    const tab = page.getByRole("button", {
      name: `0${i + 1} ${name}`,
      exact: true,
    });
    await tab.click();
    await expect(tab).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("h1")).toHaveAccessibleName(name);
    await expect
      .poll(() =>
        page
          .getByTestId("material-journey")
          .evaluate((n) => n.style.getPropertyValue("--flav").trim()),
      )
      .toBe(color);
    await expect(canvas).toHaveAttribute("data-traveller-id", id!);
  }
  await expect(page.locator("h1")).toHaveCSS("font-family", /Barlow Condensed/);
  await expect(page.locator(".journey-card")).toHaveCount(3);
  await expect(page.locator(".reference-product")).toHaveCount(3);
  await page
    .locator("#home")
    .getByRole("button", { name: "Request a Quote", exact: true })
    .click();
  await expect(
    page.getByRole("dialog").getByLabel("Material / product interest"),
  ).toHaveValue("Aluminium Products");
  await page.keyboard.press("Escape");
  await noOverflow(page);
});

test("reference carousel drags, snaps, autoplays and pauses without intercepting native wheel scrolling", async ({
  page,
}) => {
  await enter(page);
  const root = page.getByTestId("material-journey");
  const area = (await page.locator(".journey-arc").boundingBox())!;
  const x = area.x + area.width * 0.5,
    y = area.y + Math.min(area.height * 0.25, 90);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 85, y, { steps: 7 });
  await expect(page.locator("body")).toHaveClass(/journey-dragging/);
  expect(Number(await root.getAttribute("data-position"))).toBeGreaterThan(0.1);
  await page.mouse.up();
  await expect
    .poll(async () => {
      const p = Number(await root.getAttribute("data-position"));
      return Math.abs(p - Math.round(p));
    })
    .toBeLessThan(0.002);
  const selected = Number(await root.getAttribute("data-selected"));
  await page.keyboard.press("ArrowRight");
  await expect(root).toHaveAttribute(
    "data-selected",
    String((selected + 1) % 3),
  );
  const prevented = await page.locator(".journey-hero").evaluate((n) => {
    const e = new WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      deltaY: 40,
    });
    n.dispatchEvent(e);
    return e.defaultPrevented;
  });
  expect(prevented).toBe(false);
  await page
    .getByRole("button", { name: "Autoplay materials", exact: true })
    .click();
  await expect
    .poll(() => root.getAttribute("data-selected"), { timeout: 8000 })
    .not.toBe(String((selected + 1) % 3));
  await page
    .getByRole("button", { name: "Pause animations", exact: true })
    .click();
  await expect(root).toHaveAttribute("data-paused", "true");
  const canvas = page.getByTestId("journey-canvas");
  await expect
    .poll(async () => {
      const a = await canvas.getAttribute("data-render-count");
      await page.waitForTimeout(180);
      return a === (await canvas.getAttribute("data-render-count"));
    })
    .toBe(true);
  await page
    .getByRole("button", { name: "Next material", exact: true })
    .click();
  await expect(root).not.toHaveAttribute(
    "data-selected",
    String((selected + 1) % 3),
  );
  await noOverflow(page);
});

test("one traveller flips through precision, lands on its material card, then rotates in the pinned spotlight", async ({
  page,
}) => {
  test.setTimeout(75000);
  const canvas = await enter(page),
    root = page.getByTestId("material-journey");
  const id = await canvas.getAttribute("data-traveller-id");
  await page.getByRole("button", { name: "03 Aluminium", exact: true }).click();
  await expect(root).toHaveAttribute("data-selected", "2");
  for (const [p, step, angle] of [
    [0.1, 1, 0],
    [0.3, 2, 180],
    [0.5, 3, 360],
    [0.7, 4, 720],
  ]) {
    await progress(page, "#inside", p);
    await expect(root).toHaveAttribute("data-step", String(step));
    await expect(canvas).toHaveAttribute("data-stage", "inside");
    await expect
      .poll(async () =>
        Math.abs(Number(await canvas.getAttribute("data-angle")) - angle),
      )
      .toBeLessThan(1);
  }
  await progress(page, "#inside", 0.9);
  await expect
    .poll(async () => Number(await root.getAttribute("data-storm")))
    .toBeGreaterThan(0.5);
  await expect(page.locator(".storm-piece")).toHaveCount(20);
  await page
    .locator("#materials")
    .evaluate((s) => scrollTo(0, scrollY + s.getBoundingClientRect().top - 88));
  await expect(canvas).toHaveAttribute("data-stage", "card");
  const distance = () =>
    page.evaluate(() => {
      const c = document.querySelector<HTMLCanvasElement>("canvas")!,
        a = document
          .querySelector(".journey-card.live .component-anchor")!
          .getBoundingClientRect();
      return Math.hypot(
        Number(c.dataset.travellerX) - (a.left + a.width / 2),
        Number(c.dataset.travellerY) - (a.top + a.height / 2),
      );
    });
  await expect.poll(distance).toBeLessThan(3);
  await progress(page, "#components", 0.2);
  await expect(canvas).toHaveAttribute("data-stage", "spotlight");
  await expect(canvas).toHaveAttribute("data-traveller-id", id!);
  const before = Number(await canvas.getAttribute("data-angle"));
  const gear = await page.locator(".spotlight-gear-a").getAttribute("style");
  await progress(page, "#components", 0.65);
  await expect
    .poll(async () =>
      Number(await root.getAttribute("data-spotlight-progress")),
    )
    .toBeGreaterThan(0.64);
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-angle")))
    .toBeGreaterThan(before + 300);
  await expect(page.locator(".spotlight-gear-a")).not.toHaveAttribute(
    "style",
    gear!,
  );
  await expect(canvas).toHaveAttribute("data-traveller-id", id!);
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect
    .poll(async () => {
      const a = await canvas.getAttribute("data-render-count");
      await page.waitForTimeout(250);
      return a === (await canvas.getAttribute("data-render-count"));
    })
    .toBe(true);
  await noOverflow(page);
});

test("comparison filters all seven families and adds the exact family without replacing typed notes", async ({
  page,
}) => {
  await still(page);
  const filters = page.getByRole("group", {
    name: "Filter material comparison",
  });
  for (const [name, count] of [
    ["All materials", 7],
    ["Rubber", 4],
    ["Steel", 2],
    ["Aluminium", 1],
  ] as const) {
    await filters.getByRole("button", { name: new RegExp(`^${name}`) }).click();
    await expect(page.locator(".reference-table-scroll tbody tr")).toHaveCount(
      count,
    );
  }
  await filters.getByRole("button", { name: /^All materials/ }).click();
  await page
    .getByRole("button", {
      name: "Add Viton (FKM) Elastomer to enquiry",
      exact: true,
    })
    .click();
  const notes = "ARENA_QA_ONLY: retain my own drawing and compound notes.";
  const form = await contact(page, notes);
  await expect(form.getByTestId("quote-selection")).toContainText(
    "Viton (FKM) Elastomer",
  );
  await page
    .getByRole("button", { name: "Add Steel to brief", exact: true })
    .click();
  await expect(form.getByLabel("Requirements / drawing notes")).toHaveValue(
    notes,
  );
  await expect(form.getByTestId("quote-selection")).toContainText(
    "Steel Products",
  );
  await expect(page.locator(".reference-pack .brief-slot.filled")).toHaveCount(
    2,
  );
  await noOverflow(page);
});

test("suggested pack fills once, supports removal and duplicate choices, and prepares the inline form", async ({
  page,
}) => {
  await still(page);
  await page.locator(".reference-pack").scrollIntoViewIfNeeded();
  await expect(page.locator(".reference-pack .brief-slot.filled")).toHaveCount(
    3,
  );
  await page
    .getByRole("button", { name: /Remove Rubber from position/ })
    .click();
  await page
    .getByRole("button", { name: "Add Steel to brief", exact: true })
    .click();
  await expect(page.getByTestId("quote-selection").locator("li")).toHaveCount(
    3,
  );
  await expect(
    page
      .getByTestId("quote-selection")
      .locator("li")
      .filter({ hasText: "Steel Products" }),
  ).toHaveCount(2);
  await page
    .getByRole("button", { name: "Use this enquiry pack", exact: true })
    .click();
  await expect(
    page
      .getByTestId("inline-quote")
      .getByRole("heading", { name: "Request a Quote", exact: true }),
  ).toBeFocused();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page
    .getByRole("button", { name: /Remove Steel from position 1/ })
    .click();
  await page.evaluate(() => scrollTo(0, 0));
  await page.locator(".reference-pack").scrollIntoViewIfNeeded();
  await expect(page.locator(".reference-pack .brief-slot.filled")).toHaveCount(
    2,
  );
  await noOverflow(page);
});

test("inline failure retains the pack and fields and offers a complete direct-dispatch draft", async ({
  page,
}) => {
  let payload: Record<string, string> | undefined;
  await page.route("**/api/quote", async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        error: "Test delivery unavailable. Send directly.",
      }),
    });
  });
  await still(page);
  await page
    .getByRole("button", {
      name: "Add Viton (FKM) Elastomer to enquiry",
      exact: true,
    })
    .click();
  const form = await contact(page);
  const notes = await form
    .getByLabel("Requirements / drawing notes")
    .inputValue();
  await form
    .getByRole("button", { name: "Request a Quote", exact: true })
    .click();
  await expect(form.getByRole("alert")).toBeFocused();
  await expect(form.getByRole("alert")).toContainText("Send directly.");
  await expect(form.getByLabel("Full name")).toHaveValue("ARENA_QA Buyer");
  await expect(form.getByLabel("Requirements / drawing notes")).toHaveValue(
    notes,
  );
  expect(payload?.message).toContain("1. Viton (FKM) Elastomer");
  expect(payload?.message).toContain(notes);
  await expect(
    form.getByRole("link", { name: "Send by email" }),
  ).toHaveAttribute("href", /Viton/);
  await expect(
    form.getByRole("link", { name: "Send by WhatsApp" }),
  ).toHaveAttribute("href", /ARENA_QA/);
  await expect(page.locator(".reference-pack .brief-slot.filled")).toHaveCount(
    1,
  );
  await noOverflow(page);
});

test("a submitted pack snapshot stays with its reference even when the editable pack changes in flight", async ({
  page,
}) => {
  let release!: () => void;
  const responseGate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/quote", async (route) => {
    await responseGate;
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify(saved),
    });
  });
  await still(page);
  await page
    .getByRole("button", {
      name: "Add Viton (FKM) Elastomer to enquiry",
      exact: true,
    })
    .click();
  const form = await contact(page);
  const request = page.waitForRequest("**/api/quote");
  await form
    .getByRole("button", { name: "Request a Quote", exact: true })
    .click();
  expect((await request).postDataJSON().message).toContain("Viton (FKM)");
  await page
    .getByRole("button", { name: "Remove Rubber from position 1", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add Steel to brief", exact: true })
    .click();
  release();
  await expect(form.getByRole("status")).toContainText(
    "NOT been automatically emailed or delivered",
  );
  const href = await form
    .getByRole("link", { name: "Send via WhatsApp" })
    .getAttribute("href");
  expect(decodeURIComponent(href!)).toContain("Viton (FKM) Elastomer");
  expect(decodeURIComponent(href!)).not.toContain("Steel Products");
  await form.getByRole("button", { name: "Prepare another enquiry" }).click();
  await expect(form.getByTestId("quote-selection")).toContainText(
    "Steel Products",
  );
  await noOverflow(page);
});

test("inline enquiry reaches the real API and reports storage versus delivery truthfully", async ({
  page,
}) => {
  test.skip(
    process.env.QA_ALLOW_RFQ_WRITES !== "1",
    "Enable only on an isolated test instance with outbound delivery disabled.",
  );
  await still(page);
  await page
    .getByRole("button", {
      name: "Add Silicone Elastomer to enquiry",
      exact: true,
    })
    .click();
  const form = await contact(page);
  const response = page.waitForResponse(
    (r) => r.url().endsWith("/api/quote") && r.request().method() === "POST",
  );
  await form
    .getByRole("button", { name: "Request a Quote", exact: true })
    .click();
  const r = await response;
  expect(r.status()).toBe(201);
  const data = await r.json();
  expect(data.savedLocally || data.savedToBackend).toBeTruthy();
  if (!data.emailDispatched && !data.webhookDispatched)
    await expect(form.getByRole("status")).toContainText(
      "NOT been automatically emailed or delivered",
    );
  await expect(
    form.getByRole("link", { name: "Send via WhatsApp" }),
  ).toHaveAttribute("href", /Silicone/);
  await noOverflow(page);
});

test("combined notes and pack respect the server bound without truncating the visitor’s details", async ({
  page,
}) => {
  let requests = 0;
  await page.route("**/api/quote", async (route) => {
    requests++;
    await route.abort();
  });
  await still(page);
  await page
    .getByRole("button", {
      name: "Add Silicone Elastomer to enquiry",
      exact: true,
    })
    .click();
  const notes = "Q".repeat(5995),
    form = await contact(page, notes);
  await form
    .getByRole("button", { name: "Request a Quote", exact: true })
    .click();
  await expect(form.getByRole("alert")).toContainText(
    "exceed 6,000 characters",
  );
  await expect(form.getByLabel("Requirements / drawing notes")).toHaveValue(
    notes,
  );
  expect(requests).toBe(0);
});

test("reduced motion removes pinning and WebGL while retaining every section and live material selection", async ({
  page,
}) => {
  await still(page);
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator(".journey-static-story article")).toHaveCount(4);
  await expect(
    page.locator(".journey-static-story article").first(),
  ).toBeVisible();
  await expect(page.locator(".spotlight-pin")).toHaveCSS(
    "position",
    "relative",
  );
  await page.getByRole("button", { name: "03 Aluminium", exact: true }).click();
  await expect(page.locator("h1")).toHaveAccessibleName("Aluminium");
  await expect(
    page.getByRole("button", { name: "Autoplay materials", exact: true }),
  ).toBeDisabled();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.getByTestId("material-journey")).toHaveAttribute(
    "data-webgl",
    "ready",
  );
  await expect(page.getByTestId("material-journey")).toHaveAttribute(
    "data-selected",
    "2",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("canvas")).toHaveCount(0);
  await noOverflow(page);
});

test("unavailable and lost WebGL keep labelled still views, controls and enquiries", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type === "webgl" || type === "webgl2") return null;
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.getByTestId("material-journey")).toHaveAttribute(
    "data-webgl",
    "unavailable",
  );
  await expect(page.locator(".reference-webgl-label")).toBeVisible();
  await expect(page.locator(".hero-flat-2 svg")).toBeVisible();
  await page.getByRole("button", { name: "02 Steel", exact: true }).click();
  await expect(page.locator("h1")).toHaveAccessibleName("Steel");
  await page
    .locator("#home")
    .getByRole("button", { name: "Request a Quote", exact: true })
    .click();
  await expect(
    page.getByRole("dialog").getByLabel("Material / product interest"),
  ).toHaveValue("Steel Products");
  await noOverflow(page);
});

test("context loss restores the reference fallback without replacing the selected material", async ({
  page,
}) => {
  const canvas = await enter(page);
  await page.getByRole("button", { name: "02 Steel", exact: true }).click();
  await expect(page.getByTestId("material-journey")).toHaveAttribute(
    "data-selected",
    "1",
  );
  await canvas.evaluate((c) =>
    c.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
  );
  await expect(page.getByTestId("material-journey")).toHaveAttribute(
    "data-webgl",
    "unavailable",
  );
  await expect(page.locator(".reference-webgl-label")).toBeVisible();
  await expect(page.locator(".hero-flat-2 svg")).toBeVisible();
  await page.getByRole("button", { name: "03 Aluminium", exact: true }).click();
  await expect(page.locator("h1")).toHaveAccessibleName("Aluminium");
});

test("intro is skippable, defers WebGL compilation and loads the reference’s local fonts", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "commit" });
  const skip = page.getByRole("button", { name: /Skip intro/ });
  await expect(skip).toBeVisible();
  await expect(page.getByTestId("material-journey")).toHaveAttribute(
    "data-webgl",
    "static",
  );
  await skip.click();
  await expect(page.locator("body")).not.toHaveClass(/journey-locked/);
  await expect(page.getByTestId("material-journey")).toHaveAttribute(
    "data-entered",
    "true",
  );
  await page.evaluate(() => document.fonts.ready);
  for (const font of [
    '600 32px "Barlow Condensed"',
    '700 32px "Barlow Condensed"',
    '400 12px "Inter Variable"',
    '400 12px "DM Mono"',
    '500 12px "DM Mono"',
  ])
    expect(await page.evaluate((f) => document.fonts.check(f), font)).toBe(
      true,
    );
  const remoteFonts = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((e) => e.name)
      .filter((url) => /fonts\.googleapis|fonts\.gstatic/.test(url)),
  );
  expect(remoteFonts).toEqual([]);
});

test("without JavaScript the reference still exposes material views, comparison and direct contact", async ({
  browser,
  page,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: page.viewportSize()!,
    isMobile: page.viewportSize()!.width < 820,
  });
  const p = await context.newPage();
  await p.goto(process.env.QA_BASE_URL || "http://127.0.0.1:3000/");
  await expect(p.locator("h1")).toHaveAccessibleName("Rubber");
  await expect(p.locator(".journey-card")).toHaveCount(3);
  await expect(p.locator(".journey-static-story article")).toHaveCount(4);
  await expect(p.locator(".reference-table-scroll tbody tr")).toHaveCount(7);
  await expect(
    p.locator('main a[href="tel:+917530080040"]').first(),
  ).toBeAttached();
  await expect(
    p.locator('main a[href="mailto:sales@ssquareengg.com"]').first(),
  ).toBeAttached();
  await noOverflow(p);
  await p.locator('.journey-card a[href="/products/rubber"]').click();
  await expect(p).toHaveURL(/\/products\/rubber$/);
  await context.close();
});

test("all reference palettes, the menu and inline form have zero automated WCAG A/AA violations", async ({
  page,
}) => {
  test.setTimeout(90000);
  await still(page);
  for (const name of ["01 Rubber", "02 Steel", "03 Aluminium"]) {
    await page.getByRole("button", { name, exact: true }).click();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      result.violations,
      JSON.stringify(
        result.violations.map((v) => ({
          id: v.id,
          targets: v.nodes.map((n) => n.target),
        })),
      ),
    ).toEqual([]);
  }
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open navigation", exact: true }),
  ).toBeFocused();
});
