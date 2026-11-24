import { test, expect, type Page } from "@playwright/test";

let errors: string[];
test.beforeEach(async ({ page }, info) => {
  errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  if (!info.title.includes("intro"))
    await page.addInitScript(() =>
      sessionStorage.setItem("ssquare-journey-intro", "seen"),
    );
});
test.afterEach(() => expect(errors, "Application runtime errors").toEqual([]));

async function enter(page: Page) {
  await page.goto("/material-experience");
  await expect(page.getByTestId("material-journey")).toHaveAttribute(
    "data-entered",
    "true",
  );
  await expect(page.getByTestId("material-journey")).toHaveAttribute(
    "data-webgl",
    "ready",
  );
  const auto = page.getByRole("button", {
    name: "Autoplay materials",
    exact: true,
  });
  if ((await auto.getAttribute("aria-pressed")) === "true") await auto.click();
  await expect
    .poll(async () => {
      const p = Number(
        await page
          .getByTestId("material-journey")
          .getAttribute("data-position"),
      );
      return Math.abs(p - Math.round(p));
    })
    .toBeLessThan(0.002);
}
async function jump(page: Page, progress: number) {
  await page.evaluate((p) => {
    const s = document.querySelector<HTMLElement>("#inside")!,
      h = document.querySelector("header")!.getBoundingClientRect().height;
    scrollTo(
      0,
      scrollY +
        s.getBoundingClientRect().top -
        h +
        p * (s.offsetHeight - (innerHeight - h)),
    );
  }, progress);
}
async function overflow(page: Page) {
  const layout = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth,
    viewport: innerWidth,
  }));
  expect(layout.document).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
  expect(layout.viewport).toBe(page.viewportSize()!.width);
}

test("one WebGL canvas renders the carousel, changes material and supports pause and live reduced motion", async ({
  page,
}) => {
  await enter(page);
  const root = page.getByTestId("material-journey"),
    canvas = page.getByTestId("journey-canvas");
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect
    .poll(async () =>
      Number(await canvas.getAttribute("data-visible-components")),
    )
    .toBeGreaterThanOrEqual(7);
  const id = await canvas.getAttribute("data-traveller-id");
  await page.getByRole("button", { name: "03 Aluminium", exact: true }).click();
  await expect(page.locator("h1")).toHaveAccessibleName("Aluminium");
  await expect(root).toHaveAttribute("data-material", "aluminium");
  await expect
    .poll(() =>
      root.evaluate((n) =>
        getComputedStyle(n).getPropertyValue("--flav").trim(),
      ),
    )
    .toBe("#abc6bb");
  await expect(page.locator("#material-count")).toHaveText("03");
  await expect(canvas).toHaveAttribute("data-traveller-id", id!);
  await page
    .getByRole("button", { name: "Pause animations", exact: true })
    .click();
  await expect(root).toHaveAttribute("data-paused", "true");
  await expect
    .poll(async () => {
      const a = await canvas.getAttribute("data-render-count");
      await page.waitForTimeout(250);
      return a === (await canvas.getAttribute("data-render-count"));
    })
    .toBe(true);
  await page
    .getByRole("button", { name: "Resume animations", exact: true })
    .click();
  await expect(root).toHaveAttribute("data-paused", "false");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Autoplay materials" }),
  ).toBeDisabled();
  await expect(page.locator(".journey-static-story article")).toHaveCount(4);
  await overflow(page);
});

test("drag follows fractional positions, snaps after a flick, and keyboard selection works", async ({
  page,
}) => {
  await enter(page);
  const root = page.getByTestId("material-journey");
  await page.getByRole("button", { name: "01 Rubber", exact: true }).click();
  await expect(root).toHaveAttribute("data-selected", "0");
  await page.waitForTimeout(800);
  const bounds = (await page.locator("#materials").boundingBox())!;
  const x = page.viewportSize()!.width * 0.5,
    y = bounds.y + bounds.height * 0.4;
  const before = Number(await root.getAttribute("data-position"));
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 90, y, { steps: 6 });
  expect(Number(await root.getAttribute("data-position"))).toBeGreaterThan(
    before + 0.1,
  );
  await expect(page.locator("body")).toHaveClass(/journey-dragging/);
  await page.mouse.up();
  await expect(page.locator("body")).not.toHaveClass(/journey-dragging/);
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
  await page.keyboard.press("ArrowLeft");
  await expect(root).toHaveAttribute("data-selected", String(selected));
});

test("the same traveller flips at every pinned step and spins through one wave of material pieces", async ({
  page,
}) => {
  await enter(page);
  const root = page.getByTestId("material-journey"),
    canvas = page.getByTestId("journey-canvas");
  const id = await canvas.getAttribute("data-traveller-id");
  await page.getByRole("button", { name: "03 Aluminium", exact: true }).click();
  await expect(root).toHaveAttribute("data-selected", "2");
  for (const [p, step, angle] of [
    [0.1, 1, 0],
    [0.3, 2, 180],
    [0.5, 3, 360],
    [0.7, 4, 720],
  ]) {
    await jump(page, p);
    await expect(root).toHaveAttribute("data-step", String(step));
    await expect(canvas).toHaveAttribute("data-stage", "inside");
    await expect
      .poll(async () =>
        Math.abs(Number(await canvas.getAttribute("data-angle")) - angle),
      )
      .toBeLessThan(1);
    await expect(canvas).toHaveAttribute("data-traveller-id", id!);
  }
  await expect(page.locator(".in-head")).toContainText("Aluminium");
  await jump(page, 0.9);
  await expect
    .poll(async () => Number(await root.getAttribute("data-storm")))
    .toBeGreaterThan(0.5);
  await expect(page.locator(".storm-piece")).toHaveCount(20);
  await expect
    .poll(() =>
      page
        .locator(".storm-piece")
        .evaluateAll(
          (nodes) =>
            nodes.filter((n) => getComputedStyle(n).visibility === "visible")
              .length,
        ),
    )
    .toBeGreaterThan(0);
  await expect(page.locator(".in-front-frame")).toHaveCSS("opacity", "0");
  await page.locator("#range").scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page
        .locator(".storm-piece")
        .evaluateAll(
          (nodes) =>
            nodes.filter((n) => getComputedStyle(n).visibility === "visible")
              .length,
        ),
    )
    .toBe(0);
});

test("the traveller lands on exactly its selected card and follows the card tilt", async ({
  page,
}, info) => {
  await enter(page);
  const canvas = page.getByTestId("journey-canvas"),
    root = page.getByTestId("material-journey");
  const id = await canvas.getAttribute("data-traveller-id");
  await page.getByRole("button", { name: "02 Steel", exact: true }).click();
  await expect(root).toHaveAttribute("data-selected", "1");
  await page.evaluate(() => {
    const n = document.querySelector("#material-divisions")!;
    scrollTo(0, scrollY + n.getBoundingClientRect().top - 100);
  });
  await expect(canvas).toHaveAttribute("data-stage", "card");
  const anchor = page.locator(
    '.journey-card[data-material="steel"] .component-anchor',
  );
  async function error() {
    return page.evaluate(() => {
      const c = document.querySelector<HTMLCanvasElement>("#gl")!,
        r = document
          .querySelector(".journey-card.live .component-anchor")!
          .getBoundingClientRect();
      return Math.max(
        Math.abs(Number(c.dataset.travellerX) - r.left - r.width / 2),
        Math.abs(Number(c.dataset.travellerY) - r.top - r.height / 2),
        Math.abs(Number(c.dataset.travellerHeight) - r.height),
      );
    });
  }
  await expect.poll(error).toBeLessThan(1);
  await expect(anchor.locator("svg")).toHaveCSS("visibility", "hidden");
  await expect(canvas).toHaveAttribute("data-traveller-id", id!);
  if (info.project.name === "desktop") {
    const card = page.locator('.journey-card[data-material="steel"]'),
      r = (await card.boundingBox())!;
    await page.mouse.move(r.x + r.width * 0.7, r.y + r.height * 0.4);
    await expect
      .poll(() => card.evaluate((n) => getComputedStyle(n).transform))
      .not.toBe("none");
    await expect.poll(error).toBeLessThan(1);
  }
  await anchor.click();
  await expect(canvas).toHaveAttribute("data-traveller-id", id!);
  await overflow(page);
});

test("cards fly components into the brief and carry the real selection into a quote", async ({
  page,
}) => {
  await enter(page);
  await page
    .getByRole("button", { name: "Add Rubber to your brief", exact: true })
    .click();
  await expect(page.locator(".brief-badge")).toHaveText("1");
  await expect(page.getByRole("status")).toContainText("Rubber added");
  await expect(page.locator(".journey-flight")).toHaveCount(0, {
    timeout: 5000,
  });
  await page.locator('.journey-rail a[href="#range"]').click();
  await expect(page.locator("#brief-buy")).toBeDisabled();
  await page
    .getByRole("button", { name: "Add Steel to brief", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add Aluminium to brief", exact: true })
    .click();
  await expect(page.locator(".brief-badge")).toHaveText("3");
  await expect(page.locator(".journey-flight")).toHaveCount(0);
  await page.getByRole("button", { name: "Request this combination" }).click();
  await expect(page.locator(".journey-flight")).toHaveCount(3);
  const dialog = page.getByRole("dialog", {
    name: "Request a Quote",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Material / product interest")).toHaveValue(
    "Rubber Products, Steel Products, Aluminium Products",
  );
  await expect(dialog.getByLabel("Requirements / drawing notes")).toHaveValue(
    /1\. Rubber Products[\s\S]*2\. Steel Products[\s\S]*3\. Aluminium Products/,
  );
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(page.locator("#brief-buy")).toBeFocused();
  await overflow(page);
});

test("the brief initially fills, allows removal and repeated material choices without inventing a cart", async ({
  page,
}) => {
  await enter(page);
  await page.locator('.journey-rail a[href="#range"]').click();
  await expect(page.locator(".brief-badge")).toHaveText("3");
  await expect(page.locator(".brief-slot.filled")).toHaveCount(3);
  await page.locator(".brief-slot.filled button").first().click();
  await expect(page.locator(".brief-badge")).toHaveText("2");
  await expect(page.locator("#brief-buy")).toHaveText("Pick 1 more2 / 3");
  await page
    .getByRole("button", { name: "Add Steel to brief", exact: true })
    .click();
  await expect(page.locator(".brief-badge")).toHaveText("3");
  await expect(page.locator(".brief-disclaimer")).toContainText(
    "No online payment",
  );
  await expect(page.locator('a[href="/cart"],a[href="/checkout"]')).toHaveCount(
    0,
  );
});

test("intro skip unlocks the page and all four requested font faces load locally", async ({
  page,
}) => {
  await page.goto("/material-experience", { waitUntil: "commit" });
  const skip = page.getByRole("button", { name: "Skip intro" });
  await expect(skip).toBeVisible();
  await skip.click();
  await expect(page.locator("body")).not.toHaveClass(/journey-locked/);
  await expect(page.getByTestId("material-journey")).toHaveAttribute(
    "data-entered",
    "true",
  );
  const fonts = await page.evaluate(async () => {
    const faces = [
      '400 24px "Archivo Black"',
      '400 14px "DM Mono"',
      '500 14px "DM Mono"',
      '700 14px "Inter Variable"',
    ];
    await Promise.all(faces.map((face) => document.fonts.load(face)));
    return faces.map((face) => document.fonts.check(face));
  });
  expect(fonts).toEqual([true, true, true, true]);
});

test("unavailable WebGL retains labelled component views and usable selection and quotation", async ({
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
  await page.goto("/material-experience");
  await expect(page.getByTestId("material-journey")).toHaveAttribute(
    "data-webgl",
    "unavailable",
  );
  await expect(page.locator(".hero-flat-2 svg")).toBeVisible();
  await page.getByRole("button", { name: "03 Aluminium", exact: true }).click();
  await expect(page.locator("h1")).toHaveAccessibleName("Aluminium");
  await page
    .locator("main")
    .getByRole("button", { name: "Request a Quote", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Request a Quote", exact: true }),
  ).toBeVisible();
});

test("context loss restores the fallback without blocking the quote action", async ({
  page,
}) => {
  await enter(page);
  await page.getByTestId("journey-canvas").dispatchEvent("webglcontextlost");
  await expect(page.getByTestId("material-journey")).toHaveAttribute(
    "data-webgl",
    "unavailable",
  );
  await expect(page.locator(".hero-flat-2 svg")).toBeVisible();
  await page
    .locator("main")
    .getByRole("button", { name: "Request a Quote", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Request a Quote", exact: true }),
  ).toBeVisible();
});

test("reduced motion skips intro, exposes all four steps and keeps the new rubber image labelled", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/material-experience");
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator(".journey-intro")).toHaveCount(0);
  await expect(page.locator(".journey-static-story article")).toHaveCount(4);
  await expect(
    page.getByRole("button", { name: "Autoplay materials" }),
  ).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "03 Aluminium", exact: true }).click();
  await expect(page.locator("h1")).toHaveAccessibleName("Aluminium");
  const rubber = page.locator('.journey-card[data-material="rubber"]');
  await expect(
    rubber.locator('img[src="/images/division-rubber.jpg"]').first(),
  ).toBeAttached();
  await expect(rubber).toContainText("ILLUSTRATIVE VISUAL · REPLACEABLE");
  for (const path of ["/categories", "/products/rubber"]) {
    await page.goto(path);
    await expect(
      page.locator('main img[src="/images/division-rubber.jpg"]').first(),
    ).toBeAttached();
    await expect(page.locator("main")).toContainText(
      "Illustrative Visual · Replaceable",
    );
  }
  await overflow(page);
});

test("prescribed viewport layouts keep title, quote action and document within bounds", async ({
  page,
}, info) => {
  test.skip(
    info.project.name !== "desktop",
    "This supplemental matrix only needs to run once.",
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
    await page.goto("/material-experience");
    await page
      .getByRole("button", { name: "03 Aluminium", exact: true })
      .click();
    await expect(page.locator("h1")).toHaveAccessibleName("Aluminium");
    await overflow(page);
    const title = (await page.locator("h1").boundingBox())!,
      quote = (await page
        .locator("main")
        .getByRole("button", { name: "Request a Quote", exact: true })
        .boundingBox())!;
    expect(title.x).toBeGreaterThanOrEqual(0);
    expect(title.x + title.width).toBeLessThanOrEqual(width + 1);
    expect(quote.x).toBeGreaterThanOrEqual(0);
    expect(quote.x + quote.width).toBeLessThanOrEqual(width + 1);
    expect(quote.y + quote.height).toBeLessThanOrEqual(height + 1);
  }
});
