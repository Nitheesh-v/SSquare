import { test, expect, type Page } from "@playwright/test";

let errors: string[];
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
});
test.afterEach(() => expect(errors, "Application runtime errors").toEqual([]));

async function enter(page: Page) {
  await page.goto("/");
  const hero = page.getByTestId("original-slideshow-hero");
  await expect(hero.getByRole("heading", { level: 1 })).toContainText(
    "Your Trusted Partner in Custom Metal & Rubber Solutions",
  );
  return hero;
}

async function allowAutoplay(page: Page) {
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
  await page.mouse.move(0, 0);
  await expect(page.getByTestId("original-slideshow-hero")).toHaveAttribute(
    "data-autoplay",
    "true",
  );
  // Let the passive timeout effect run after its React state commit.
  await page.waitForTimeout(60);
}

test("the original four-slide hero is first, without restoring any old page sections or 3D hero", async ({
  page,
}) => {
  const hero = await enter(page);
  await expect(page.locator(".studio-home > :first-child")).toHaveAttribute(
    "data-testid",
    "original-slideshow-hero",
  );
  await expect(
    hero
      .getByRole("group", { name: "Explore manufacturing divisions" })
      .getByRole("button"),
  ).toHaveCount(4);
  await expect(hero.locator("img")).toHaveCount(4);
  await expect(hero.getByRole("heading", { level: 1 })).toHaveCSS(
    "font-family",
    /Poppins/,
  );
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(
    page.locator(
      ".material-carousel-hero,.journey-intro,.journey-inside,.journey-rail,.journey-builder",
    ),
  ).toHaveCount(0);
  await expect(page.locator(".studio-material-card")).toHaveCount(3);
  await expect(page.locator(".studio-process")).toHaveCount(1);
  await expect(page.locator(".studio-quote-section")).toHaveCount(1);
  await expect(hero).not.toContainText(
    /100%|Free Global|Free Door Delivery|3–4 Day Door/,
  );
});

test("arrows wrap, keyboard controls work, and the original catalog destinations remain real links", async ({
  page,
}) => {
  const hero = await enter(page);
  const previous = hero.getByRole("button", {
    name: "Previous slide",
    exact: true,
  });
  const next = hero.getByRole("button", { name: "Next slide", exact: true });
  await previous.click();
  await expect(hero).toHaveAttribute("data-active-slide", "aluminium");
  await expect(
    hero.getByRole("link", { name: "Browse Aluminium Products", exact: true }),
  ).toHaveAttribute("href", "/products/aluminium");
  await next.click();
  await expect(hero).toHaveAttribute("data-active-slide", "overview");
  await expect(
    hero.getByRole("link", { name: "Explore Full Catalog", exact: true }),
  ).toHaveAttribute("href", "/products");
  await next.focus();
  await page.keyboard.press("End");
  await expect(hero).toHaveAttribute("data-active-slide", "aluminium");
  await page.keyboard.press("ArrowRight");
  await expect(hero).toHaveAttribute("data-active-slide", "overview");
  await page.keyboard.press("ArrowLeft");
  await expect(hero).toHaveAttribute("data-active-slide", "aluminium");
  await page.keyboard.press("Home");
  await expect(hero).toHaveAttribute("data-active-slide", "overview");
});

test("all four slides open the existing quote with the selected division and restore focus", async ({
  page,
}) => {
  const hero = await enter(page);
  const cases = [
    [
      "01 Multi-Material OEM",
      "Rubber Products, Steel Products, Aluminium Products",
    ],
    ["02 Rubber & Bonded Seals", "Rubber Products"],
    ["03 Stainless & Alloy Steel", "Steel Products"],
    ["04 Aluminium & Die Molds", "Aluminium Products"],
  ];
  for (const [name, division] of cases) {
    await hero.getByRole("button", { name, exact: true }).click();
    const button = hero.getByRole("button", {
      name: "Request a Quote",
      exact: true,
    });
    await button.click();
    const dialog = page.getByRole("dialog", {
      name: "Request a Quote",
      exact: true,
    });
    await expect(dialog.getByLabel("Material / product interest")).toHaveValue(
      division,
    );
    await page.keyboard.press("Escape");
    await expect(button).toBeFocused();
  }
});

test("autoplay advances at the original interval and suspends for hover, focus and dialogs", async ({
  page,
}, info) => {
  await page.clock.install();
  const hero = await enter(page);
  await allowAutoplay(page);
  await page.clock.fastForward(5600);
  await expect(hero).toHaveAttribute("data-active-slide", "rubber");
  await hero.hover();
  await expect(hero).toHaveAttribute("data-autoplay", "false");
  await page.clock.fastForward(12000);
  await expect(hero).toHaveAttribute("data-active-slide", "rubber");
  await hero.getByRole("button", { name: "Next slide", exact: true }).focus();
  await page.mouse.move(0, 0);
  await expect(hero).toHaveAttribute("data-autoplay", "false");
  await page.clock.fastForward(12000);
  await expect(hero).toHaveAttribute("data-active-slide", "rubber");
  await hero
    .getByRole("button", { name: "Request a Quote", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Request a Quote", exact: true }),
  ).toBeVisible();
  await page.clock.fastForward(12000);
  await expect(hero).toHaveAttribute("data-active-slide", "rubber");
  await page.keyboard.press("Escape");
  const menu =
    info.project.name === "desktop"
      ? page.getByRole("button", { name: "Products", exact: true })
      : page.getByRole("button", { name: "Open navigation", exact: true });
  await menu.click();
  await expect(hero).toHaveAttribute("data-autoplay", "false");
  await page.clock.fastForward(12000);
  await expect(hero).toHaveAttribute("data-active-slide", "rubber");
  await page.keyboard.press("Escape");
  await allowAutoplay(page);
  await page.clock.fastForward(5600);
  await expect(hero).toHaveAttribute("data-active-slide", "steel");
});

test("offscreen and hidden-tab states suspend autoplay without a rendering loop", async ({
  page,
}) => {
  await page.clock.install();
  const hero = await enter(page);
  await allowAutoplay(page);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(hero).toHaveAttribute("data-autoplay", "false");
  await page.clock.fastForward(12000);
  await expect(hero).toHaveAttribute("data-active-slide", "overview");
  await page.evaluate(() => {
    delete (document as unknown as Record<string, unknown>).hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(hero).toHaveAttribute("data-autoplay", "true");
  await page.locator("#material-divisions").scrollIntoViewIfNeeded();
  await expect(hero).toHaveAttribute("data-autoplay", "false");
  await page.clock.fastForward(12000);
  await expect(hero).toHaveAttribute("data-active-slide", "overview");
});

test("reduced motion keeps the original overview still while all four selectors remain usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const hero = await enter(page);
  await expect(hero).toHaveAttribute("data-autoplay", "false");
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(
    hero.getByRole("button", { name: "Pause visual motion", exact: true }),
  ).toBeDisabled();
  await hero
    .getByRole("button", { name: "04 Aluminium & Die Molds", exact: true })
    .click();
  await expect(hero.getByRole("heading", { level: 1 })).toHaveText(
    "Precision 6061 Aluminium Parts & Custom Die Molds",
  );
  await expect(hero.locator("img").first()).toHaveCSS(
    "transition-duration",
    "0s",
  );
  await hero.getByRole("button", { name: "Next slide", exact: true }).click();
  await expect(hero).toHaveAttribute("data-active-slide", "overview");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await allowAutoplay(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(hero).toHaveAttribute("data-autoplay", "false");
});

test("the independent lower study keeps its original selection when the hero changes", async ({
  page,
}) => {
  const hero = await enter(page);
  await hero
    .getByRole("button", { name: "02 Rubber & Bonded Seals", exact: true })
    .click();
  await page.getByTestId("component-inspector").scrollIntoViewIfNeeded();
  const study = page.getByRole("group", { name: "3D material study" });
  await expect(
    study.getByRole("button", { name: "Steel", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(hero).toHaveAttribute("data-active-slide", "rubber");
});

test("without JavaScript the original hero has usable catalog, quote-page and phone links", async ({
  browser,
  page,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: page.viewportSize()!,
  });
  const staticPage = await context.newPage();
  const hero = await enter(staticPage);
  await expect(
    hero.getByRole("button", { name: "Next slide", exact: true }),
  ).not.toBeVisible();
  await expect(
    hero.getByRole("link", { name: "Explore Full Catalog", exact: true }),
  ).toHaveAttribute("href", "/products");
  await expect(
    hero.getByRole("link", { name: "+91 75300 80040", exact: true }),
  ).toHaveAttribute("href", "tel:+917530080040");
  await hero
    .getByRole("link", { name: "Request a Quote", exact: true })
    .click();
  await expect(staticPage).toHaveURL(/\/contact#quote$/);
  await expect(
    staticPage.locator('main a[href="mailto:sales@ssquareengg.com"]').first(),
  ).toBeAttached();
  await context.close();
});

test("all original slide headings and controls stay within the five target layouts", async ({
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
    const hero = await enter(page);
    for (const name of [
      "01 Multi-Material OEM",
      "02 Rubber & Bonded Seals",
      "03 Stainless & Alloy Steel",
      "04 Aluminium & Die Molds",
    ]) {
      await hero.getByRole("button", { name, exact: true }).click();
      const box = (await hero
        .getByRole("heading", { level: 1 })
        .boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
      const controls = await hero.locator("button,a").evaluateAll((nodes) =>
        nodes
          .map((n) => n.getBoundingClientRect())
          .filter((r) => r.width)
          .map((r) => ({ left: r.left, right: r.right })),
      );
      for (const control of controls) {
        expect(control.left).toBeGreaterThanOrEqual(0);
        expect(control.right).toBeLessThanOrEqual(width + 1);
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width + 1);
    }
  }
});
