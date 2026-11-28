import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

let errors: string[];
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("https://ssquareengg.com/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "image/jpeg",
      body: "unavailable-photo",
    }),
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

test("aperture hero keeps division selection, gear first impression and contextual RFQs", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Your Trusted Partner",
  );
  const hero = page.getByTestId("original-slideshow-hero");
  const choices = hero.getByRole("group", {
    name: "Explore manufacturing divisions",
  });
  // The intro is its own station; the three divisions follow it.
  const slides = [
    ["00", "INTRO", "intro", "industrial-gear-hero", "S SQUARE"],
    ["01", "RUBBER", "rubber", "division-rubber", "RUBBER"],
    ["02", "STEEL", "steel", "division-steel", "STEEL"],
    ["03", "ALUMINIUM", "aluminium", "division-aluminium", "ALUMINIUM"],
  ];
  for (const [number, label, id, image, title] of slides) {
    const button = choices.getByRole("button", {
      name: `${number} ${label}`,
      exact: true,
    });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(hero).toHaveAttribute("data-active-slide", id);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      title,
    );
    await expect(hero.locator('img[aria-hidden="false"]')).toHaveAttribute(
      "src",
      `/images/${image}.jpg`,
    );
  }
  await expect(hero.locator(".ar-gear-backdrop")).toHaveCount(1);
  await expect(page.locator(".ar-footer-wordmark")).toHaveCount(0);
  await expect(page.locator(".studio-material-card")).toHaveCount(3);
  await expect(
    page
      .locator(".studio-material-card")
      .getByTestId("illustrative-visual-label"),
  ).toHaveCount(1);
  await hero
    .getByRole("button", { name: "Request a Quote", exact: true })
    .click();
  const quote = page.getByRole("dialog", {
    name: "Request a Quote",
    exact: true,
  });
  await expect(quote.getByLabel("Material / product interest")).toHaveValue(
    "Aluminium Products",
  );
  await page.keyboard.press("Escape");
  await expect(quote).not.toBeVisible();
  await expect(
    page
      .locator("footer.site-footer")
      .getByRole("link", { name: "3D material experience" }),
  ).toHaveAttribute("href", "/material-experience");
  await noOverflow(page);
});

test("the hero has no pause control and stays put until the reader moves it", async ({
  page,
}) => {
  await page.goto("/");
  const hero = page.getByTestId("original-slideshow-hero");
  // The autoplay/pause pill was removed; nothing advances the stations.
  await expect(
    hero.getByRole("button", { name: /pause visual motion/i }),
  ).toHaveCount(0);
  await expect(hero).toHaveAttribute("data-autoplay", "false");
  await expect(hero).toHaveAttribute("data-active-slide", "intro");
  await page.waitForTimeout(6500);
  await expect(hero).toHaveAttribute("data-active-slide", "intro");

  await hero.getByRole("button", { name: "01 RUBBER", exact: true }).click();
  await expect(hero).toHaveAttribute("data-active-slide", "rubber");
  await expect(hero).toHaveAttribute("data-autoplay", "false");
  await hero.getByRole("button", { name: "Next slide", exact: true }).click();
  await expect(hero).toHaveAttribute("data-active-slide", "steel");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(hero).toHaveAttribute("data-reduced", "true");
  await expect(hero).toHaveAttribute("data-autoplay", "false");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("STEEL");
});

test("without JavaScript the home exposes products and direct contact links", async ({
  browser,
  page,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: page.viewportSize()!,
  });
  const staticPage = await context.newPage();
  await staticPage.goto("/");
  await expect(staticPage.getByRole("heading", { level: 1 })).toContainText(
    "Your Trusted Partner",
  );
  await expect(staticPage.locator(".studio-material-card")).toHaveCount(3);
  await expect(
    staticPage.locator('main a[href="tel:+917530080040"]').first(),
  ).toBeAttached();
  await expect(
    staticPage.locator('footer a[href^="https://wa.me/"]').first(),
  ).toBeAttached();
  await noOverflow(staticPage);
  await staticPage
    .getByRole("link", { name: "View Rubber Products", exact: true })
    .click();
  await expect(staticPage).toHaveURL(/\/products\/rubber$/);
  await expect(staticPage.getByRole("heading", { level: 1 })).toContainText(
    "Rubber products.",
  );
  await noOverflow(staticPage);
  await context.close();
});

test("refreshed inner pages retain zero automated WCAG A/AA violations", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const path of [
    "/about",
    "/categories",
    "/infrastructure",
    "/products/rubber",
    "/material-experience",
  ]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      result.violations,
      `${path}: ${JSON.stringify(result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })))}`,
    ).toEqual([]);
  }
});

test("inner-page layouts keep their content within the five target viewports", async ({
  page,
}, info) => {
  test.skip(
    info.project.name !== "desktop",
    "The supplemental viewport matrix only needs one invocation.",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [width, height] of [
    [1440, 900],
    [390, 844],
    [320, 844],
    [844, 390],
    [768, 1024],
  ]) {
    await page.setViewportSize({ width, height });
    for (const route of ["/products/steel", "/contact"]) {
      await page.goto(route);
      await noOverflow(page);
      const heading = await page
        .getByRole("heading", { level: 1 })
        .boundingBox();
      expect(heading!.x).toBeGreaterThanOrEqual(0);
      expect(heading!.x + heading!.width).toBeLessThanOrEqual(width + 1);
    }
  }
});
