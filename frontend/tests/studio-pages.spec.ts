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
  const slides = [
    ["RUBBER", "rubber", "industrial-gear-hero", "RUBBER"],
    ["STEEL", "steel", "division-steel", "STEEL"],
    ["ALUMINIUM", "aluminium", "division-aluminium", "ALUMINIUM"],
  ];
  for (const [index, [label, id, image, title]] of slides.entries()) {
    const button = choices.getByRole("button", {
      name: `0${index + 1} ${label}`,
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
      .locator("footer")
      .getByRole("link", { name: "3D material experience" }),
  ).toHaveAttribute("href", "/material-experience");
  await noOverflow(page);
});

test("pause also keeps the material photo planes still", async ({ page }) => {
  await page.goto("/");
  const hero = page.getByTestId("original-slideshow-hero");
  await hero
    .getByRole("button", { name: "Pause visual motion", exact: true })
    .click();
  await expect(page.getByTestId("industrial-home")).toHaveAttribute(
    "data-motion-paused",
    "true",
  );
  await expect(hero).toHaveAttribute("data-paused", "true");
  await expect(hero).toHaveAttribute("data-autoplay", "false");
  await expect(hero.locator("img").first()).toHaveCSS(
    "transition-duration",
    "0s",
  );
  await hero.getByRole("button", { name: "Next slide", exact: true }).click();
  await expect(hero).toHaveAttribute("data-active-slide", "steel");
  await page.locator("#material-divisions").scrollIntoViewIfNeeded();
  const plane = page
    .locator(".studio-material-card [data-depth-image] > div")
    .first();
  await expect(plane).toHaveCSS("transform", "none");
  await hero
    .getByRole("button", { name: "Resume visual motion", exact: true })
    .click();
  await expect(hero).toHaveAttribute("data-paused", "false");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(hero).toHaveAttribute("data-reduced", "true");
  await expect(hero).toHaveAttribute("data-autoplay", "false");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "STEEL",
  );
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
    .getByRole("link", { name: "Explore Rubber Products", exact: true })
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
