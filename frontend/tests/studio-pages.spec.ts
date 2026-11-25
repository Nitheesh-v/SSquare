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

test("reference home and inner layouts keep content and controls within the five target viewports", async ({
  page,
}, info) => {
  test.skip(
    info.project.name !== "desktop",
    "The supplemental viewport matrix only needs one invocation.",
  );
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [width, height] of [
    [1440, 900],
    [390, 844],
    [320, 844],
    [844, 390],
    [768, 1024],
  ]) {
    await page.setViewportSize({ width, height });
    for (const route of ["/", "/products/steel", "/contact"]) {
      await page.goto(route);
      await noOverflow(page);
      const heading = (await page
        .getByRole("heading", { level: 1 })
        .boundingBox())!;
      expect(heading.x).toBeGreaterThanOrEqual(0);
      expect(heading.x + heading.width).toBeLessThanOrEqual(width + 1);
      if (route === "/") {
        for (const name of ["01 Rubber", "02 Steel", "03 Aluminium"]) {
          const button = page.getByRole("button", { name, exact: true });
          await button.click();
          const box = (await page.locator("h1").boundingBox())!;
          expect(box.x).toBeGreaterThanOrEqual(0);
          expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
        }
        for (const control of [
          page
            .locator("#home")
            .getByRole("button", { name: "Request a Quote", exact: true }),
          page.getByRole("button", { name: "Open navigation", exact: true }),
          ...(await page.locator(".journey-rail a").all()),
        ]) {
          const box = (await control.boundingBox())!;
          expect(box.x).toBeGreaterThanOrEqual(0);
          expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
        }
        await page.getByTestId("inline-quote").scrollIntoViewIfNeeded();
        const box = (await page.getByTestId("inline-quote").boundingBox())!;
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
        await noOverflow(page);
      }
    }
  }
});
