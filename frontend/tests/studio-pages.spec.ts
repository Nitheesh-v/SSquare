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

async function inspect(page: Page) {
  await page.goto("/");
  // The reference-style traveller now starts in the existing hero and lands here.
  await expect(page.locator("canvas")).toHaveCount(1);
  await page.getByTestId("component-inspector").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("component-inspector")).toHaveAttribute(
    "data-state",
    "ready",
  );
  const canvas = page.getByTestId("inspector-canvas");
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-render-count")))
    .toBeGreaterThan(0);
  return canvas;
}
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

test("photographic home keeps material selection, provenance and contextual RFQs", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Small parts.",
  );
  const choices = page.getByRole("group", {
    name: "Explore manufacturing materials",
  });
  for (const [i, name] of ["Rubber", "Steel", "Aluminium"].entries()) {
    const button = choices.getByRole("button", {
      name: `0${i + 1} ${name}`,
      exact: true,
    });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".precision-hero")).toHaveAttribute(
      "data-active-material",
      name.toLowerCase(),
    );
    await expect(
      page.getByTestId("hero-photo-plane").locator("img"),
    ).toHaveAttribute("src", `/images/division-${name.toLowerCase()}.jpg`);
  }
  await expect(page.locator(".hero-photo-provenance")).toContainText(
    "ILLUSTRATIVE",
  );
  await expect(page.locator(".studio-material-card")).toHaveCount(3);
  await expect(
    page
      .locator(".studio-material-card")
      .getByTestId("illustrative-visual-label"),
  ).toHaveCount(3);
  await page
    .locator(".precision-hero")
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
    page.getByRole("link", { name: "Enter the full 3D material journey" }),
  ).toHaveAttribute("href", "/material-experience");
  await noOverflow(page);
});

test("hero photo responds to scroll and pause also freezes the material photo planes", async ({
  page,
}) => {
  await page.goto("/");
  const hero = page.locator(".precision-hero");
  await page.evaluate(() => scrollTo(0, 230));
  await expect
    .poll(() =>
      hero.evaluate((n) => Number(n.style.getPropertyValue("--photo-depth"))),
    )
    .toBeGreaterThan(0.15);
  await expect(page.getByTestId("hero-photo-plane")).toHaveCSS(
    "transform",
    /matrix3d/,
  );
  await page.evaluate(() => scrollTo(0, 0));
  await page
    .getByRole("button", { name: "Pause visual motion", exact: true })
    .click();
  await expect(page.getByTestId("industrial-home")).toHaveAttribute(
    "data-motion-paused",
    "true",
  );
  const transform = await page
    .getByTestId("hero-photo-plane")
    .evaluate((n) => getComputedStyle(n).transform);
  await page.evaluate(() => scrollTo(0, 240));
  await page.waitForTimeout(150);
  await expect(page.getByTestId("hero-photo-plane")).toHaveCSS(
    "transform",
    transform,
  );
  await page.locator("#material-divisions").scrollIntoViewIfNeeded();
  const plane = page
    .locator(".studio-material-card [data-depth-image] > div")
    .first();
  await expect(plane).toHaveCSS("transform", "none");
  await page.evaluate(() => scrollTo(0, 0));
  await page
    .getByRole("button", { name: "Resume visual motion", exact: true })
    .click();
  await page.evaluate(() => scrollTo(0, 200));
  await expect
    .poll(() =>
      hero.evaluate((n) => Number(n.style.getPropertyValue("--photo-depth"))),
    )
    .toBeGreaterThan(0.15);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.getByTestId("hero-photo-plane")).toHaveCSS(
    "transform",
    "none",
  );
});

test("the shared 3D study keeps one persistent part with keyboard and drag rotation", async ({
  page,
}) => {
  const canvas = await inspect(page);
  await expect(page.locator("canvas")).toHaveCount(1);
  const id = await canvas.getAttribute("data-traveller-id");
  expect(id).toBeTruthy();
  const initial = Number(await canvas.getAttribute("data-angle"));
  const right = page.getByRole("button", { name: "Rotate component right" });
  await expect(right).toBeVisible();
  await right.focus();
  await page.keyboard.press("Enter");
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-angle")))
    .toBeGreaterThan(initial + 29);
  const study = page.getByRole("group", { name: "3D material study" });
  await study.getByRole("button", { name: "Rubber", exact: true }).click();
  await expect(
    page.getByRole("img", { name: /Illustrative Rubber component/ }),
  ).toBeVisible();
  await expect(canvas).toHaveAttribute("data-traveller-id", id!);
  const before = Number(await canvas.getAttribute("data-angle"));
  const gesture = (await page.locator(".inspector-gesture").boundingBox())!;
  await page.mouse.move(
    gesture.x + gesture.width * 0.3,
    gesture.y + gesture.height * 0.5,
  );
  await page.mouse.down();
  await page.mouse.move(
    gesture.x + gesture.width * 0.3 + 80,
    gesture.y + gesture.height * 0.5,
    { steps: 8 },
  );
  await page.mouse.up();
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-angle")))
    .toBeGreaterThan(before + 34);
  const progress = Number(await canvas.getAttribute("data-progress"));
  await page.evaluate(() => scrollBy(0, 70));
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-progress")))
    .toBeGreaterThan(progress + 0.03);
  await expect(canvas).toHaveAttribute("data-traveller-id", id!);
  await noOverflow(page);
});

test("paused 3D does not render on scroll but explicit rotation remains available", async ({
  page,
}) => {
  const canvas = await inspect(page);
  await page
    .getByRole("button", { name: "Pause 3D motion", exact: true })
    .click();
  await expect(canvas).toHaveAttribute("data-mode", "contained");
  await expect(canvas).toHaveAttribute("data-angle", "0.00");
  // A hero frame can also be at zero degrees. Wait for the paused, local
  // inspector pose to finish drawing before measuring scroll redraws.
  const center = await page
    .locator(".inspector-viewport")
    .evaluate((node) => ((node as HTMLElement).clientWidth / 2).toFixed(2));
  await expect(canvas).toHaveAttribute("data-traveller-x", center);
  const renders = await canvas.getAttribute("data-render-count");
  await page.evaluate(() => scrollBy(0, 45));
  await page.waitForTimeout(200);
  await expect(canvas).toHaveAttribute("data-render-count", renders!);
  await page.getByRole("button", { name: "Rotate component right" }).click();
  await expect(canvas).toHaveAttribute("data-angle", "30.00");
  await expect(
    page.getByRole("button", { name: "Resume 3D motion", exact: true }),
  ).toBeVisible();
});

test("reduced motion keeps still illustrations, readable content and usable study controls", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByTestId("component-inspector").scrollIntoViewIfNeeded();
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator(".inspector-fallback svg")).toBeVisible();
  await page
    .getByRole("group", { name: "3D material study" })
    .getByRole("button", { name: "Aluminium", exact: true })
    .click();
  await expect(
    page.getByRole("img", { name: /Illustrative Aluminium component/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Rotate component left" }).click();
  await expect(page.locator(".inspector-fallback")).toHaveAttribute(
    "style",
    /rotateY\(-30deg\)/,
  );
  await expect(page.locator(".inspector-provenance")).toContainText(
    "ILLUSTRATIVE CONCEPT MODEL",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.getByTestId("component-inspector")).toHaveAttribute(
    "data-state",
    "ready",
  );
  await expect(page.locator("canvas")).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("canvas")).toHaveCount(0);
  await noOverflow(page);
});

test("WebGL-unavailable study retains the fallback and direct quotation", async ({
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
  await page.getByTestId("component-inspector").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("component-inspector")).toHaveAttribute(
    "data-state",
    "unavailable",
  );
  await expect(page.locator(".inspector-fallback svg")).toBeVisible();
  await expect(page.getByTestId("inspector-canvas")).not.toBeVisible();
  await expect(page.locator(".inspector-provenance")).toContainText(
    "Static view — WebGL unavailable.",
  );
  await page
    .locator(".precision-hero")
    .getByRole("button", { name: "Request a Quote", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Request a Quote", exact: true }),
  ).toBeVisible();
});

test("context loss returns to a labelled static view without blocking material controls", async ({
  page,
}) => {
  const canvas = await inspect(page);
  await canvas.evaluate((c) =>
    c.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
  );
  await expect(page.getByTestId("component-inspector")).toHaveAttribute(
    "data-state",
    "unavailable",
  );
  await expect(page.locator(".inspector-fallback svg")).toBeVisible();
  await page
    .getByRole("group", { name: "3D material study" })
    .getByRole("button", { name: "Aluminium", exact: true })
    .click();
  await expect(
    page.getByRole("img", { name: /Illustrative Aluminium component/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Rotate component right" }).click();
  await expect(page.locator(".inspector-fallback")).toHaveAttribute(
    "style",
    /rotateY\(30deg\)/,
  );
});

test("without JavaScript the new home still exposes products and direct contact links", async ({
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
    "Small parts.",
  );
  await expect(staticPage.locator(".studio-material-card")).toHaveCount(3);
  await expect(
    staticPage.locator('main a[href="tel:+917530080040"]').first(),
  ).toBeAttached();
  await expect(
    staticPage.locator('main a[href^="https://wa.me/"]').first(),
  ).toBeAttached();
  await expect(staticPage.locator(".inspector-fallback svg")).toBeAttached();
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

test("refreshed layouts keep content and every study control within the five target viewports", async ({
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
    for (const route of ["/", "/products/steel", "/contact"]) {
      await page.goto(route);
      await noOverflow(page);
      const heading = await page
        .getByRole("heading", { level: 1 })
        .boundingBox();
      expect(heading!.x).toBeGreaterThanOrEqual(0);
      expect(heading!.x + heading!.width).toBeLessThanOrEqual(width + 1);
      if (route === "/") {
        await page.getByTestId("component-inspector").scrollIntoViewIfNeeded();
        for (const name of [
          "Rotate component left",
          "Rotate component right",
        ]) {
          const button = page.getByRole("button", { name });
          await expect(button).toBeVisible();
          const box = (await button.boundingBox())!;
          expect(box.x).toBeGreaterThanOrEqual(0);
          expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
        }
        await noOverflow(page);
      }
    }
  }
});
