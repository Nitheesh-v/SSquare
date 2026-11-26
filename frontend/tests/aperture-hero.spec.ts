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
  await page.waitForTimeout(60);
}

const STATIONS = ["01 RUBBER", "02 STEEL", "03 ALUMINIUM"];

test("the three-station aperture hero stays first, branded as S SQUARE, with a live canvas field", async ({
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
  ).toHaveCount(3);
  // Three station plates plus the plates inside the (closed) inspector drawer.
  await expect(hero.locator(".ar-plate img")).toHaveCount(3);
  await expect(hero).toHaveAttribute("data-active-slide", "rubber");
  await expect(hero.locator(".ar-plate img").first()).toHaveAttribute(
    "src",
    "/images/industrial-gear-hero.jpg",
  );
  await expect(hero.locator(".ar-gear-backdrop")).toHaveCount(1);
  await expect(page.locator(".ar-disc")).toHaveCount(1);
  await expect(page.getByTestId("ar-ambient")).toHaveCount(1);
  await expect(page.locator(".ar-bench")).toHaveCount(0);
  await expect(page.locator(".ar-footer-wordmark")).toHaveCount(0);
  await expect(page.getByTestId("service-journey")).toHaveCount(1);
  await expect(page.getByTestId("service-film").locator("img")).toHaveCount(4);
  await expect(page.locator(".ssq-service-cards .home-service-card")).toHaveCount(3);
  await expect(
    page.locator(
      ".material-carousel-hero,.journey-intro,.journey-inside,.journey-rail,.journey-builder",
    ),
  ).toHaveCount(0);
  await expect(page.locator(".studio-material-card")).toHaveCount(3);
  await expect(page.locator("#who-we-are")).toHaveCount(1);
  await expect(page.locator("#what-we-do")).toHaveCount(1);
  await expect(page.locator("#our-services")).toHaveCount(1);
  await expect(page.locator("#quick-service")).toHaveCount(1);
  await expect(hero).toContainText("S SQUARE");
  await expect(hero).not.toContainText(
    /100%|Free Global|Free Door Delivery|3–4 Day Door/,
  );
});

test("arrows wrap, keyboard controls work, and the catalog destinations remain real links", async ({
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
    hero.getByRole("link", { name: "Explore Aluminium Products", exact: true }),
  ).toHaveAttribute("href", "/products/aluminium");
  await next.click();
  await expect(hero).toHaveAttribute("data-active-slide", "rubber");
  await expect(
    hero.getByRole("link", { name: "Explore All Products", exact: true }),
  ).toHaveAttribute("href", "/products");
  await next.focus();
  await page.keyboard.press("End");
  await expect(hero).toHaveAttribute("data-active-slide", "aluminium");
  await page.keyboard.press("ArrowRight");
  await expect(hero).toHaveAttribute("data-active-slide", "rubber");
  await page.keyboard.press("ArrowLeft");
  await expect(hero).toHaveAttribute("data-active-slide", "aluminium");
  await page.keyboard.press("Home");
  await expect(hero).toHaveAttribute("data-active-slide", "rubber");
});

test("station inspector opens from View Specs and closes on Escape", async ({
  page,
}) => {
  const hero = await enter(page);
  await hero.getByRole("button", { name: "View Specs", exact: true }).click();
  const drawer = page.getByTestId("ar-station-drawer");
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole("heading", { name: "RUBBER" })).toBeVisible();
  await expect(drawer.getByText("Format")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(drawer).not.toBeVisible();
});

test("all three stations open the existing quote with the selected division", async ({
  page,
}) => {
  const hero = await enter(page);
  const cases = [
    ["01 RUBBER", "Rubber Products"],
    ["02 STEEL", "Steel Products"],
    ["03 ALUMINIUM", "Aluminium Products"],
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

test("autoplay advances at 5.5 s and suspends for hover, focus and dialogs", async ({
  page,
}, info) => {
  await page.clock.install();
  const hero = await enter(page);
  await allowAutoplay(page);
  const settle = async () => {
    // Freeze the running autoplay before reading the current station.
    await page.locator(".ar-stage").hover();
    await expect(hero).toHaveAttribute("data-autoplay", "false");
    await page.mouse.move(0, 0);
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    return (await hero.getAttribute("data-active-slide")) ?? "";
  };

  await page.clock.fastForward(5600);
  const first = await settle();
  expect(first).not.toBe("rubber");

  await page.locator(".ar-stage").hover();
  await expect(hero).toHaveAttribute("data-autoplay", "false");
  await page.clock.fastForward(12000);
  await expect(hero).toHaveAttribute("data-active-slide", first);

  await hero.getByRole("button", { name: "Next slide", exact: true }).focus();
  await page.mouse.move(0, 0);
  await expect(hero).toHaveAttribute("data-autoplay", "false");
  await page.clock.fastForward(12000);
  await expect(hero).toHaveAttribute("data-active-slide", first);

  await hero
    .getByRole("button", { name: "Request a Quote", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Request a Quote", exact: true }),
  ).toBeVisible();
  const beforeDialog = await hero.getAttribute("data-active-slide");
  await page.clock.fastForward(12000);
  await expect(hero).toHaveAttribute("data-active-slide", beforeDialog ?? "");
  await page.keyboard.press("Escape");

  const menu =
    info.project.name === "desktop"
      ? page.getByRole("button", { name: "Products", exact: true })
      : page.getByRole("button", { name: "Open navigation", exact: true });
  await menu.click();
  await expect(hero).toHaveAttribute("data-autoplay", "false");
  const beforeMenu = await hero.getAttribute("data-active-slide");
  await page.clock.fastForward(12000);
  await expect(hero).toHaveAttribute("data-active-slide", beforeMenu ?? "");
  await page.keyboard.press("Escape");

  await allowAutoplay(page);
  const beforeResume = await hero.getAttribute("data-active-slide");
  await page.clock.fastForward(5600);
  await expect(hero).not.toHaveAttribute("data-active-slide", beforeResume ?? "");
});

test("autoplay turns the ring without hijacking the page scroll", async ({
  page,
}) => {
  await page.clock.install();
  const hero = await enter(page);
  await allowAutoplay(page);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.clock.fastForward(5600);
  await expect(hero).toHaveAttribute("data-active-slide", "steel");
  await page.clock.fastForward(5600);
  await expect(hero).toHaveAttribute("data-active-slide", "aluminium");
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test("offscreen and hidden-tab states suspend autoplay", async ({ page }) => {
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
  await expect(hero).toHaveAttribute("data-active-slide", "rubber");
  await page.evaluate(() => {
    delete (document as unknown as Record<string, unknown>).hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(hero).toHaveAttribute("data-autoplay", "true");
  // The hero is a tall pinned section: leave it completely before autoplay stops.
  await page.evaluate(() =>
    window.scrollTo(
      0,
      document.getElementById("material-divisions")!.offsetTop +
        window.innerHeight,
    ),
  );
  await expect(hero).not.toBeInViewport();
  await expect(hero).toHaveAttribute("data-autoplay", "false");
  await page.clock.fastForward(12000);
  await expect(hero).toHaveAttribute("data-active-slide", "rubber");
});

test("reduced motion keeps the hero still with no canvas and all three selectors usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const hero = await enter(page);
  await expect(hero).toHaveAttribute("data-autoplay", "false");
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(
    hero.getByRole("button", { name: "Pause visual motion", exact: true }),
  ).toBeDisabled();
  await hero.getByRole("button", { name: "03 ALUMINIUM", exact: true }).click();
  await expect(hero.getByRole("heading", { level: 1 })).toContainText(
    "ALUMINIUM",
  );
  await expect(hero.locator(".ar-plate img").first()).toHaveCSS(
    "transition-duration",
    "0s",
  );
  await hero.getByRole("button", { name: "Next slide", exact: true }).click();
  await expect(hero).toHaveAttribute("data-active-slide", "rubber");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await allowAutoplay(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(hero).toHaveAttribute("data-autoplay", "false");
});

test("hero selection leaves the reference content and company facts independent", async ({
  page,
}) => {
  const hero = await enter(page);
  await hero.getByRole("button", { name: "02 STEEL", exact: true }).click();
  await page.locator("#material-divisions").scrollIntoViewIfNeeded();
  await expect(page.locator(".studio-material-card h3")).toHaveText([
    "Aluminium Products",
    "Steel Products",
    "Rubber Products",
  ]);
  await expect(page.locator(".home-facts dd")).toHaveText([
    "20+",
    "03",
    "Coimbatore",
  ]);
  await expect(hero).toHaveAttribute("data-active-slide", "steel");
  await expect(page.getByTestId("component-inspector")).toHaveCount(0);
});

test("without JavaScript the hero has usable catalog, quote-page and phone links", async ({
  browser,
  page,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: page.viewportSize()!,
  });
  const staticPage = await context.newPage();
  await staticPage.goto("/");
  const hero = staticPage.getByTestId("original-slideshow-hero");
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

test("all three stations and controls stay within the five target layouts", async ({
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
    for (const name of STATIONS) {
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
        expect(control.left).toBeGreaterThanOrEqual(-1);
        expect(control.right).toBeLessThanOrEqual(width + 1);
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width + 1);
    }
  }
});

test("background chapters and the sticky service film change with scroll", async ({
  page,
}) => {
  await page.goto("/");
  const ambient = page.getByTestId("ar-ambient");
  await expect(ambient).toHaveAttribute("data-scroll-phase", "aperture");
  const grid = ambient.locator(".ar-ambient-grid");
  const initialGrid = await grid.evaluate(
    (node) => getComputedStyle(node).backgroundSize,
  );

  await page.evaluate(() =>
    document.getElementById("our-services")?.scrollIntoView({ block: "start" }),
  );
  await expect
    .poll(() => ambient.getAttribute("data-scroll-phase"))
    .toBe("services");
  await expect(page.getByTestId("service-journey")).toHaveCount(1);

  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  );
  await expect
    .poll(() => ambient.getAttribute("data-scroll-phase"))
    .toBe("dispatch");
  const finalGrid = await grid.evaluate(
    (node) => getComputedStyle(node).backgroundSize,
  );
  expect(finalGrid).not.toBe(initialGrid);
  expect(
    Number(await ambient.getAttribute("data-scroll-progress")),
  ).toBeGreaterThan(0.5);
  const section = page.locator("#our-services");
  await expect
    .poll(() => section.getAttribute("data-active-service"))
    .toBe("3");
  expect(
    Number(await section.getAttribute("data-service-progress")),
  ).toBeGreaterThan(0.5);
  await expect(page.getByTestId("service-card-delivery")).toHaveAttribute(
    "data-active",
    "true",
  );
});

test("the shared main-branch footer stays visible above the fixed atmosphere", async ({
  page,
}) => {
  await page.goto("/");
  const footer = page.locator("footer.site-footer");
  await expect(footer).toHaveCount(1);
  await expect(
    footer.getByRole("link", { name: "Rubber products", exact: true }),
  ).toHaveAttribute("href", "/products/rubber");
  await expect(
    footer.getByRole("link", { name: "3D material experience", exact: true }),
  ).toHaveAttribute("href", "/material-experience");
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  );
  await expect(footer).toBeInViewport();
  // The footer must paint above the fixed ambient field, not behind it.
  await expect(footer).toHaveCSS("z-index", "2");
  await expect(footer).toHaveCSS("background-color", "rgb(16, 27, 44)");
  // Every sampled row must resolve to the footer or one of its own children,
  // i.e. the fixed atmosphere must not paint over it.
  const paints = await footer.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    const x = Math.max(1, Math.min(rect.left + rect.width / 2, window.innerWidth - 1));
    const header =
      document.querySelector(".site-header")?.getBoundingClientRect().bottom ??
      0;
    const rows: boolean[] = [];
    for (let step = 1; step <= 6; step += 1) {
      const y = Math.min(rect.bottom - 12, rect.top + (rect.height * step) / 6);
      // Skip rows clipped by the viewport or by the sticky header above them.
      if (y <= header + 4 || y >= window.innerHeight - 1) continue;
      const top = document.elementsFromPoint(x, y)[0];
      rows.push(Boolean(top) && (top === node || node.contains(top)));
    }
    return rows;
  });
  expect(paints.length).toBeGreaterThan(0);
  expect(paints.every(Boolean)).toBe(true);
});
