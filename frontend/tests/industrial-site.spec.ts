import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

let errors: string[];
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  // Deliberately unavailable third-party photos exercise the labelled fallback.
  // Local copies of official S Square photos still load normally.
  await page.route("https://ssquareengg.com/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "image/jpeg",
      body: "unavailable-photo",
    }),
  );
});
test.afterEach(() => expect(errors, "Application runtime errors").toEqual([]));

async function noHorizontalOverflow(page: Page) {
  const expectedWidth = page.viewportSize()!.width;
  const layout = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth,
    viewport: innerWidth,
  }));
  expect(layout.document, JSON.stringify(layout)).toBeLessThanOrEqual(
    expectedWidth + 1,
  );
  expect(layout.viewport, JSON.stringify(layout)).toBeLessThanOrEqual(
    expectedWidth + 1,
  );
}

test("public pages, legacy redirects and enquiry-only routes", async ({
  page,
  request,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const path of [
    "/",
    "/about",
    "/infrastructure",
    "/categories",
    "/products",
    "/products/rubber",
    "/products/steel",
    "/products/aluminium",
    "/faq",
    "/contact",
  ]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(page.locator("main")).not.toContainText(
      /Free Door Delivery|100%\s*(?:QC|quality|conformity)/i,
    );
    await noHorizontalOverflow(page);
    await expect(
      page.locator(
        'a[href="/cart"], a[href="/checkout"], a[href="/login"], a[href="/admin"]',
      ),
    ).toHaveCount(0);
  }
  for (const path of [
    "/cart",
    "/checkout",
    "/login",
    "/register",
    "/account",
    "/admin",
    "/categories/unknown",
  ]) {
    expect((await request.get(path)).status(), path).toBe(404);
  }
  for (const division of ["rubber", "steel", "aluminium"]) {
    const response = await request.get(`/categories/${division}`, {
      maxRedirects: 0,
    });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe(`/products/${division}`);
  }
});

test("navigation, hero controls, and quote dialog keyboard access", async ({
  page,
}, info) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to main content" }),
  ).toBeFocused();
  if (info.project.name === "desktop") {
    const products = page.getByRole("button", {
      name: "Products",
      exact: true,
    });
    await products.focus();
    await page.keyboard.press("Enter");
    await expect(products).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "All components", exact: true }),
    ).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(products).toBeFocused();
    await expect(products).toHaveAttribute("aria-expanded", "false");
  } else {
    const toggle = page.getByRole("button", { name: "Open navigation" });
    await toggle.click();
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(toggle).toBeFocused();
  }
  await page.getByRole("button", { name: /04 Aluminium/ }).click();
  await expect(page.locator("h1")).toContainText("Less weight.");
  await expect(
    page.getByRole("button", { name: /04 Aluminium/ }),
  ).toHaveAttribute("aria-pressed", "true");
  const quote = page
    .locator("main")
    .getByRole("button", { name: "Request a Quote", exact: true })
    .first();
  await quote.click();
  const dialog = page.getByRole("dialog", {
    name: "Request a Quote",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Material / product interest")).toHaveValue(
    "Aluminium Products",
  );
  await dialog.getByRole("button", { name: "Close quote form" }).focus();
  await page.keyboard.press("Shift+Tab");
  expect(
    await page.evaluate(() =>
      document.querySelector("dialog[open]")?.contains(document.activeElement),
    ),
  ).toBeTruthy();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(quote).toBeFocused();
});

test("catalog filters, quick details and contextual quotation", async ({
  page,
}) => {
  await page.goto("/products");
  const total = await page.locator("main article").count();
  expect(total).toBeGreaterThan(25);
  await page
    .getByRole("group", { name: "Filter by manufacturing division" })
    .getByRole("button", { name: "Steel", exact: true })
    .click();
  await expect(page.locator("main article")).toHaveCount(8);
  await page
    .getByLabel("Search components by name, material or application")
    .fill("no-such-part-qa");
  await expect(
    page.getByRole("heading", { name: "No components matched your filters." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset all filters" }).click();
  await expect(page.locator("main article")).toHaveCount(total);
  const quick = page.getByRole("button", { name: /Quick specs for/ }).first();
  await quick.focus();
  await page.keyboard.press("Enter");
  const details = page.getByRole("dialog");
  await expect(details).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(details).not.toBeVisible();
  await expect(quick).toBeFocused();
  await quick.click();
  await details
    .getByRole("button", { name: "Request a Quote", exact: true })
    .click();
  const quote = page.getByRole("dialog", {
    name: "Request a Quote",
    exact: true,
  });
  await expect(quote).toBeVisible();
  await expect(quote.getByLabel("Material / product interest")).toHaveValue(
    /Rubber Products.*Silicone Gaskets/,
  );
  await noHorizontalOverflow(page);
});

test("enquiry form reports storage honestly and offers direct dispatch", async ({
  page,
}) => {
  test.skip(
    process.env.QA_ALLOW_RFQ_WRITES !== "1",
    "Enable only against a test instance with email/webhooks disabled.",
  );
  await page.goto("/contact");
  await page.getByLabel("Full name").fill("ARENA_QA Buyer");
  await page.getByLabel("Company name").fill("QA Test — Not a real enquiry");
  await page.getByLabel("Work email").fill("qa@example.invalid");
  await page.getByLabel("Estimated quantity").fill("100 pieces");
  await page
    .getByLabel("Material / product interest")
    .fill("Aluminium Products");
  await page
    .getByLabel("Requirements / drawing notes")
    .fill(
      "ARENA_QA_ONLY: test enquiry, do not manufacture. Drawing review test.",
    );
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/quote") &&
      response.request().method() === "POST",
  );
  await page
    .locator("main")
    .getByRole("button", { name: "Request a Quote", exact: true })
    .click();
  const response = await responsePromise;
  expect(response.status()).toBe(201);
  const data = await response.json();
  expect(data.savedToBackend || data.savedLocally).toBeTruthy();
  if (!data.emailDispatched && !data.webhookDispatched)
    await expect(page.getByRole("status")).toContainText(
      "NOT been automatically emailed or delivered",
    );
  await expect(
    page.getByRole("link", { name: "Send via WhatsApp" }),
  ).toHaveAttribute("href", /wa\.me\/917530080040\?text=/);
  await expect(
    page.getByRole("link", {
      name: "Email sales@ssquareengg.com",
      exact: true,
    }),
  ).toHaveAttribute("href", /ARENA_QA/);
  await noHorizontalOverflow(page);
});

test("failed enquiries preserve details and offer direct-contact alternatives", async ({
  page,
}) => {
  await page.route("**/api/quote", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        error: "Test delivery is unavailable. Send directly.",
      }),
    }),
  );
  await page.goto("/");
  await page
    .locator("main")
    .getByRole("button", { name: "Request a Quote", exact: true })
    .first()
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Request a Quote",
    exact: true,
  });
  await dialog.getByLabel("Full name").fill("ARENA_QA Buyer");
  await dialog.getByLabel("Work email").fill("qa@example.invalid");
  const message = "ARENA_QA_ONLY: retain these drawing notes after an error.";
  await dialog.getByLabel("Requirements / drawing notes").fill(message);
  await dialog
    .getByRole("button", { name: "Request a Quote", exact: true })
    .click();
  await expect(dialog.getByRole("alert")).toContainText("Send directly.");
  await expect(dialog.getByRole("alert")).toBeFocused();
  await expect(dialog.getByLabel("Full name")).toHaveValue("ARENA_QA Buyer");
  await expect(dialog.getByLabel("Requirements / drawing notes")).toHaveValue(
    message,
  );
  await expect(
    dialog.getByRole("link", { name: "Send by email" }),
  ).toHaveAttribute("href", /ARENA_QA/);
  await expect(
    dialog.getByRole("link", { name: "Send by WhatsApp" }),
  ).toHaveAttribute("href", /ARENA_QA/);
  const width = await dialog.evaluate((node) => ({
    scroll: node.scrollWidth,
    client: node.clientWidth,
  }));
  expect(width.scroll).toBeLessThanOrEqual(width.client + 1);
  await noHorizontalOverflow(page);
});

test("reduced motion exposes all story content without loading WebGL", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator("#engineering-story").scrollIntoViewIfNeeded();
  await expect(page.locator("#engineering-story")).toContainText(
    "Reduced motion is respected",
  );
  await expect(page.locator("#engineering-story article")).toHaveCount(4);
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator("#engineering-story svg").first()).toBeAttached();
  await noHorizontalOverflow(page);
});

test("3D loads near the story and respects live preference changes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  // The hero now has its own genuine 3D backdrop; the aluminium scene is still lazy.
  await expect(page.locator("#engineering-story canvas")).toHaveCount(0);
  await page.locator("#aluminium-stage-1").scrollIntoViewIfNeeded();
  await expect(page.locator("#engineering-story canvas")).toHaveCount(1);
  await page.locator("#aluminium-stage-3").scrollIntoViewIfNeeded();
  await expect(page.locator("#engineering-story figcaption")).toContainText(
    "Illustrative Concept Model",
  );
  await noHorizontalOverflow(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator("#engineering-story")).toContainText(
    "STATIC TECHNICAL VIEW",
  );
});

test("WebGL-unavailable devices retain the technical drawing", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type === "webgl2" || type === "webgl") return null;
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  await page.goto("/");
  await page.locator("#aluminium-stage-1").scrollIntoViewIfNeeded();
  await expect(page.locator("#engineering-story")).toContainText(
    "WebGL is unavailable",
  );
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator("#engineering-story figcaption")).toBeVisible();
});

test("WCAG A/AA checks on core pages and the quote dialog", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const path of ["/", "/products", "/contact", "/faq"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      result.violations,
      `${path}: ${JSON.stringify(result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })))}`,
    ).toEqual([]);
  }
  if (
    !(await page
      .locator("header")
      .getByRole("button", { name: "Request a Quote", exact: true })
      .count())
  )
    await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .locator("header")
    .getByRole("button", { name: "Request a Quote", exact: true })
    .click();
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});

test("RFQ API validates input and preserves truthful status flags", async ({
  request,
}, info) => {
  test.skip(
    process.env.QA_ALLOW_RFQ_WRITES !== "1",
    "Enable only against a test instance with email/webhooks disabled.",
  );
  const headers = {
    "x-forwarded-for": `qa-api-${info.project.name}-${Date.now()}`,
  };
  const valid = {
    name: "ARENA_QA Buyer",
    email: "qa@example.invalid",
    message: "ARENA_QA_ONLY: validation and storage test.",
  };
  for (const data of [
    {},
    { ...valid, email: "invalid" },
    { ...valid, phone: "xx" },
    { ...valid, name: ["bad"] },
    { ...valid, message: "short" },
    { ...valid, website: "spam" },
  ]) {
    expect((await request.post("/api/quote", { headers, data })).status()).toBe(
      400,
    );
  }
  const response = await request.post("/api/quote", {
    headers,
    data: { ...valid, email: "", phone: "+91 75300 80040" },
  });
  expect(response.status()).toBe(201);
  const data = await response.json();
  expect(data.referenceId).toMatch(/^SSQ-RFQ-/);
  expect(data.savedToBackend || data.savedLocally).toBeTruthy();
  expect(typeof data.emailDispatched).toBe("boolean");
  expect(typeof data.webhookDispatched).toBe("boolean");
});

test("hero background is real scroll-driven 3D with pause and reduced-motion controls", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const canvas = page.getByTestId("hero-depth-canvas");
  const backdrop = page.getByTestId("hero-depth-backdrop");
  await expect(backdrop).toHaveAttribute("data-renderer", "webgl");
  await expect(canvas).toHaveCount(1);
  const before = Number(await canvas.getAttribute("data-scroll-progress"));
  const photo = page.getByTestId("hero-photo-plane");
  const photoBefore = await photo.evaluate(
    (node) => getComputedStyle(node).transform,
  );
  await page.evaluate(() => window.scrollBy(0, 190));
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-scroll-progress")))
    .toBeGreaterThan(before + 0.04);
  const photoAfter = await photo.evaluate(
    (node) => getComputedStyle(node).transform,
  );
  expect(photoAfter).not.toBe(photoBefore);
  await page.waitForTimeout(400);
  const count = await canvas.getAttribute("data-render-count");
  await page.waitForTimeout(250);
  expect(
    await canvas.getAttribute("data-render-count"),
    "No endless GPU render loop while idle",
  ).toBe(count);
  await noHorizontalOverflow(page);
  await page.getByRole("button", { name: "Pause background motion" }).click();
  await expect(canvas).toHaveCount(0);
  await expect(backdrop).toHaveAttribute("data-motion", "still");
  await page.getByRole("button", { name: "Play background motion" }).click();
  await expect(backdrop).toHaveAttribute("data-renderer", "webgl");
  await expect(canvas).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(canvas).toHaveCount(0);
  await expect(backdrop).toHaveAttribute("data-motion", "still");
  await expect(
    page.getByRole("button", { name: "Reduced motion enabled" }),
  ).toBeDisabled();
});

test("rubber hero and division photography use the new labelled elastomer assortment", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: /02 Rubber/ }).click();
  const image = page
    .getByTestId("hero-photo-plane")
    .locator('img[aria-hidden="false"]');
  await expect(image).toHaveAttribute("src", "/images/division-rubber.jpg");
  await expect(image).toHaveAttribute(
    "alt",
    /Rubber gaskets, O-rings, bellows/,
  );
  await expect(page.getByTestId("hero-photo-plane")).toContainText(
    "Illustrative Visual · Replaceable",
  );
  for (const path of ["/", "/categories", "/products/rubber"]) {
    await page.goto(path);
    const material =
      path === "/products/rubber"
        ? page.locator("main section").first()
        : page.getByRole("link", {
            name: "Explore Rubber Products",
            exact: true,
          });
    const source = material
      .locator('img[src="/images/division-rubber.jpg"]')
      .last();
    await source.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        source.evaluate((node: HTMLImageElement) => node.naturalWidth),
      )
      .toBeGreaterThan(0);
    await expect(material).toContainText("Illustrative Visual · Replaceable");
  }
});

test("material image planes change depth with native scrolling", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const planes = page.locator('[data-depth-image="true"]');
  await expect(planes).toHaveCount(3);
  const first = planes.first();
  await first.scrollIntoViewIfNeeded();
  // Provenance stays outside the moving/cropped image plane.
  const badge = first.locator("..").getByTestId("illustrative-visual-label");
  await expect(badge).toBeVisible();
  const frame = (await first.boundingBox())!;
  const label = (await badge.boundingBox())!;
  expect(label.x).toBeGreaterThanOrEqual(frame.x);
  expect(label.y).toBeGreaterThanOrEqual(frame.y);
  expect(label.x + label.width).toBeLessThanOrEqual(frame.x + frame.width);
  expect(label.y + label.height).toBeLessThanOrEqual(frame.y + frame.height);
  const surface = first.locator(":scope > div");
  await expect
    .poll(() => surface.getAttribute("style"))
    .toContain("perspective");
  await page.waitForTimeout(750);
  const before = await surface.evaluate(
    (node) => getComputedStyle(node).transform,
  );
  await page.evaluate(() => window.scrollBy(0, 170));
  await page.waitForTimeout(850);
  expect(
    await surface.evaluate((node) => getComputedStyle(node).transform),
  ).not.toBe(before);
  await noHorizontalOverflow(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() => surface.evaluate((node) => getComputedStyle(node).transform))
    .toBe("none");
});

test("a lost hero WebGL context restores the non-blocking background artwork", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const canvas = page.getByTestId("hero-depth-canvas");
  await expect(page.getByTestId("hero-depth-backdrop")).toHaveAttribute(
    "data-renderer",
    "webgl",
  );
  await canvas.evaluate((node) =>
    node.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
  );
  await expect(canvas).toHaveCount(0);
  await expect(page.getByTestId("hero-depth-backdrop")).toHaveAttribute(
    "data-renderer",
    "fallback",
  );
  await expect(page.getByTestId("hero-depth-backdrop")).toHaveAttribute(
    "data-webgl",
    "unavailable",
  );
  await expect(page.locator(".hero-gear-fallback")).toHaveCSS("opacity", "1");
  await page
    .locator("main")
    .getByRole("button", { name: "Request a Quote", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("dialog", { name: "Request a Quote", exact: true }),
  ).toBeVisible();
});
