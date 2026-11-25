import { test, expect, type Page } from "@playwright/test";

let errors: string[];
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
});
test.afterEach(() => expect(errors, "Application runtime errors").toEqual([]));

async function enter(page: Page) {
  await page.goto("/");
  const hero = page.getByTestId("material-carousel-hero");
  await expect(hero).toHaveAttribute("data-webgl", "ready");
  const autoplay = hero.getByRole("button", { name: "Autoplay materials" });
  if ((await autoplay.getAttribute("aria-pressed")) === "true")
    await autoplay.click();
  return { hero, canvas: page.getByTestId("material-carousel-canvas") };
}

async function settled(page: Page) {
  await expect
    .poll(() =>
      page.getByTestId("material-carousel-canvas").evaluate((c) => {
        const index = ["rubber", "steel", "aluminium"].indexOf(
          c.parentElement!.dataset.activeMaterial!,
        );
        const position = Number(c.dataset.renderedPosition);
        const current = Number(c.dataset.position);
        // A previous integer GPU frame can coexist with a newer in-flight tween.
        // Wait for both the simulation and its rendered frame before dragging.
        return Math.max(
          Math.abs(current - position),
          Math.abs(current - Math.round(current)),
          Math.abs(position - Math.round(position)),
          Number(c.dataset.renderedSelected) === index &&
            Number(c.dataset.selected) === index &&
            ((Math.round(position) % 3) + 3) % 3 === index
            ? 0
            : 1,
        );
      }),
    )
    .toBeLessThan(0.002);
}

test("only the earlier hero returns; the canvas stays contained and the lower study is independent", async ({
  page,
}) => {
  const { hero, canvas } = await enter(page);
  await expect(page.locator(".studio-home > :first-child")).toHaveAttribute(
    "data-testid",
    "material-carousel-hero",
  );
  await expect(
    page.locator(
      ".journey-intro,.journey-inside,.journey-rail,.journey-builder",
    ),
  ).toHaveCount(0);
  await expect(page.getByTestId("inspector-canvas")).toHaveCount(0);
  await expect(canvas).toHaveCSS("position", "absolute");
  await expect(hero).toHaveCSS("overflow", "hidden");
  await expect
    .poll(async () =>
      Number(await canvas.getAttribute("data-visible-components")),
    )
    .toBeGreaterThanOrEqual(7);
  const id = await canvas.getAttribute("data-traveller-id");
  expect(id).toBeTruthy();
  await hero.getByRole("button", { name: "03 Aluminium", exact: true }).click();
  await expect(hero.getByRole("heading", { level: 1 })).toHaveAccessibleName(
    "Aluminium",
  );
  await expect(hero.locator(".material-carousel-count")).toHaveText("03");
  await expect
    .poll(() => hero.evaluate((n) => getComputedStyle(n).backgroundColor))
    .toBe("rgb(171, 198, 187)");
  await expect(canvas).toHaveAttribute("data-traveller-id", id!);
  await page.getByTestId("component-inspector").scrollIntoViewIfNeeded();
  await expect(
    page
      .getByRole("group", { name: "3D material study" })
      .getByRole("button", { name: "Steel", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(hero).toHaveAttribute("data-suspended", "true");
  const geometry = await canvas.evaluate((c) => ({
    bottom: c.getBoundingClientRect().bottom,
    header: document.querySelector("header")!.getBoundingClientRect().bottom,
  }));
  expect(geometry.bottom).toBeLessThanOrEqual(geometry.header + 1);
  const renders = await canvas.getAttribute("data-render-count");
  await page.waitForTimeout(400);
  await expect(canvas).toHaveAttribute("data-render-count", renders!);
});

test("fractional drag snaps, raycast selection and keyboard controls retain the same 3D object", async ({
  page,
}) => {
  const { hero, canvas } = await enter(page);
  await hero.getByRole("button", { name: "01 Rubber", exact: true }).click();
  await settled(page);
  const id = await canvas.getAttribute("data-traveller-id");
  const start = Number(await canvas.getAttribute("data-position"));
  const arc = hero.locator(".material-carousel-arc");
  const box = (await hero.boundingBox())!;
  const x = box.width / 2,
    y = box.y + box.height * (box.width < 820 ? 0.36 : 0.4);
  await expect(arc).toHaveCSS("touch-action", "pan-y");
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 90, y, { steps: 8 });
  await expect(arc).toHaveAttribute("data-dragging", "true");
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-position")))
    .toBeGreaterThan(start + 0.1);
  await page.mouse.up();
  await expect(arc).not.toHaveAttribute("data-dragging");
  await settled(page);
  await arc.focus();
  await page.keyboard.press("Home");
  await expect(hero).toHaveAttribute("data-active-material", "rubber");
  await page.keyboard.press("ArrowLeft");
  await expect(hero).toHaveAttribute("data-active-material", "aluminium");
  await page.keyboard.press("ArrowRight");
  await expect(hero).toHaveAttribute("data-active-material", "rubber");
  await page.keyboard.press("End");
  await expect(hero).toHaveAttribute("data-active-material", "aluminium");
  await expect(canvas).toHaveAttribute("data-traveller-id", id!);
  await page.keyboard.press("ArrowDown");
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  await expect(hero).toHaveAttribute("data-active-material", "aluminium");
  await page.evaluate(() => scrollTo(0, 0));
  await hero.getByRole("button", { name: "01 Rubber", exact: true }).click();
  await settled(page);
  // Pick the adjacent steel flange via its actual rendered geometry.
  await page.mouse.move(0, 0);
  const scale = Math.min(
    box.width < 820 ? box.width / 560 : box.width / 1440,
    box.width < 820 ? box.height / 980 : box.height / 900,
  );
  const sideX = x + 278 * scale * (box.width < 820 ? 1.02 : 1);
  const rim = 265 * scale * 0.32;
  // At very narrow widths only a slice is visible. Pointer selection is supplemented
  // by the explicit controls; raycast the desktop/tablet geometry where fully visible.
  if (sideX + rim < box.width) {
    await page.mouse.click(sideX + rim, y + 25 * scale);
    await expect(hero).toHaveAttribute("data-active-material", "steel");
  }
});

test("autoplay waits during focus, an open quote or navigation, then resumes", async ({
  page,
}, info) => {
  test.setTimeout(65000);
  const { hero } = await enter(page);
  const autoplay = hero.getByRole("button", { name: "Autoplay materials" });
  await hero.getByRole("button", { name: "01 Rubber", exact: true }).click();
  await settled(page);
  await autoplay.click();
  await hero.locator(".material-carousel-arc").focus();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(3500);
  await expect(hero).toHaveAttribute("data-active-material", "rubber");
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
  await expect(hero).not.toHaveAttribute("data-active-material", "rubber", {
    timeout: 15000,
  });
  await hero
    .getByRole("button", { name: "Request a Quote", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Request a Quote", exact: true }),
  ).toBeVisible();
  await expect(hero).toHaveAttribute("data-suspended", "true");
  const selected = await hero.getAttribute("data-active-material");
  await page.waitForTimeout(3500);
  await expect(hero).toHaveAttribute("data-active-material", selected!);
  await page.keyboard.press("Escape");
  await expect(hero).toHaveAttribute("data-suspended", "false");
  const menu =
    info.project.name === "desktop"
      ? page.getByRole("button", { name: "Products", exact: true })
      : page.getByRole("button", { name: "Open navigation" });
  await menu.click();
  await expect(hero).toHaveAttribute("data-suspended", "true");
  await page.waitForTimeout(3500);
  await expect(hero).toHaveAttribute("data-active-material", selected!);
  await page.keyboard.press("Escape");
  await expect(hero).toHaveAttribute("data-suspended", "false");
});

test("pause keeps deliberate material selection and all contextual RFQs available", async ({
  page,
}) => {
  const { hero, canvas } = await enter(page);
  await hero
    .getByRole("button", { name: "Pause visual motion", exact: true })
    .click();
  await expect(canvas).toHaveAttribute("data-paused", "true");
  await expect(
    hero.getByRole("button", { name: "Autoplay materials" }),
  ).toBeDisabled();
  for (const [index, name] of ["Rubber", "Steel", "Aluminium"].entries()) {
    await hero
      .getByRole("button", { name: `0${index + 1} ${name}`, exact: true })
      .click();
    await expect(hero.getByRole("heading", { level: 1 })).toHaveAccessibleName(
      name,
    );
    await hero
      .getByRole("button", { name: "Request a Quote", exact: true })
      .click();
    const dialog = page.getByRole("dialog", {
      name: "Request a Quote",
      exact: true,
    });
    await expect(dialog.getByLabel("Material / product interest")).toHaveValue(
      `${name} Products`,
    );
    await page.keyboard.press("Escape");
    await expect(
      hero.getByRole("button", { name: "Request a Quote", exact: true }),
    ).toBeFocused();
  }
});

test("reduced motion and live preference changes retain selected material without WebGL", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const hero = page.getByTestId("material-carousel-hero");
  await expect(hero).toHaveAttribute("data-webgl", "static");
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(hero.locator(".material-carousel-flat-2 svg")).toBeVisible();
  await hero.getByRole("button", { name: "03 Aluminium", exact: true }).click();
  await expect(hero.getByRole("heading", { level: 1 })).toHaveAccessibleName(
    "Aluminium",
  );
  await hero
    .getByRole("button", { name: "Next material", exact: true })
    .click();
  await expect(hero).toHaveAttribute("data-active-material", "rubber");
  await hero
    .getByRole("button", { name: "Previous material", exact: true })
    .click();
  await expect(hero).toHaveAttribute("data-active-material", "aluminium");
  await expect(hero.locator(".material-fragment").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(
    hero.getByRole("button", { name: "Autoplay materials" }),
  ).toBeDisabled();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(hero).toHaveAttribute("data-webgl", "ready");
  await expect(hero).toHaveAttribute("data-active-material", "aluminium");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(hero).toHaveAttribute("data-webgl", "static");
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(hero.locator(".material-carousel-flat-2 svg")).toBeVisible();
});

test("unavailable WebGL preserves static selection and quotation", async ({
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
  const hero = page.getByTestId("material-carousel-hero");
  await expect(hero).toHaveAttribute("data-webgl", "unavailable");
  await expect(hero.locator(".material-carousel-flat-2 svg")).toBeVisible();
  await expect(page.getByTestId("material-carousel-canvas")).not.toBeVisible();
  await expect(hero.locator(".material-carousel-provenance")).toContainText(
    "Static view — WebGL unavailable.",
  );
  await hero.getByRole("button", { name: "03 Aluminium", exact: true }).click();
  await hero
    .getByRole("button", { name: "Request a Quote", exact: true })
    .click();
  await expect(
    page
      .getByRole("dialog", { name: "Request a Quote", exact: true })
      .getByLabel("Material / product interest"),
  ).toHaveValue("Aluminium Products");
});

test("a lost context and hidden-tab lifecycle do not strand the hero or its controls", async ({
  page,
}) => {
  const { hero, canvas } = await enter(page);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(hero).toHaveAttribute("data-suspended", "true");
  const renders = await canvas.getAttribute("data-render-count");
  await page.waitForTimeout(400);
  await expect(canvas).toHaveAttribute("data-render-count", renders!);
  await page.evaluate(() => {
    delete (document as unknown as Record<string, unknown>).hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(hero).toHaveAttribute("data-suspended", "false");
  await canvas.evaluate((c) =>
    c.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
  );
  await expect(hero).toHaveAttribute("data-webgl", "unavailable");
  await expect(hero.locator(".material-carousel-flat-2 svg")).toBeVisible();
  await hero
    .getByRole("button", { name: "Next material", exact: true })
    .click();
  await expect(hero.getByRole("heading", { level: 1 })).toBeVisible();
  await hero
    .getByRole("button", { name: "Request a Quote", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Request a Quote", exact: true }),
  ).toBeVisible();
});

test("no-JavaScript hero has a still illustration and a working contact-page quote link", async ({
  browser,
  page,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: page.viewportSize()!,
  });
  const staticPage = await context.newPage();
  await staticPage.goto("/");
  const hero = staticPage.getByTestId("material-carousel-hero");
  await expect(hero.getByRole("heading", { level: 1 })).toHaveAccessibleName(
    "Rubber",
  );
  await expect(hero.locator(".material-carousel-flat-2 svg")).toBeVisible();
  await expect(
    hero.getByRole("button", { name: "Next material" }),
  ).not.toBeVisible();
  await hero
    .getByRole("link", { name: "Request a Quote", exact: true })
    .click();
  await expect(staticPage).toHaveURL(/\/contact#quote$/);
  await expect(
    staticPage.locator('main a[href="mailto:sales@ssquareengg.com"]').first(),
  ).toBeAttached();
  await context.close();
});

test("restored hero titles and controls fit the five target layouts", async ({
  page,
}, info) => {
  test.skip(
    info.project.name !== "desktop",
    "Run the supplemental viewport matrix once.",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [width, height] of [
    [1440, 900],
    [390, 844],
    [320, 844],
    [768, 1024],
    [844, 390],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    const hero = page.getByTestId("material-carousel-hero");
    for (const [index, material] of [
      "Rubber",
      "Steel",
      "Aluminium",
    ].entries()) {
      await hero
        .getByRole("button", { name: `0${index + 1} ${material}`, exact: true })
        .click();
      const word = (await hero
        .locator(".material-carousel-word")
        .boundingBox())!;
      expect(word.x, `${width}px ${material}`).toBeGreaterThanOrEqual(0);
      expect(word.x + word.width, `${width}px ${material}`).toBeLessThanOrEqual(
        width + 1,
      );
    }
    const controls = await hero.locator("button,a").evaluateAll((nodes) =>
      nodes
        .filter((n) => n.getBoundingClientRect().width)
        .map((n) => {
          const box = n.getBoundingClientRect();
          const host = n.closest("section")!.getBoundingClientRect();
          return {
            name: n.getAttribute("aria-label") || n.textContent,
            x: box.left,
            right: box.right,
            y: box.top - host.top,
            bottom: box.bottom - host.top,
            hostHeight: host.height,
          };
        }),
    );
    for (const box of controls) {
      expect(box.x, `${width}px ${box.name}`).toBeGreaterThanOrEqual(0);
      expect(box.right, `${width}px ${box.name}`).toBeLessThanOrEqual(
        width + 1,
      );
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.bottom).toBeLessThanOrEqual(box.hostHeight + 1);
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width + 1);
  }
});
