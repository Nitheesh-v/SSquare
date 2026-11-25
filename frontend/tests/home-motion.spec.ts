import { createHash } from "node:crypto";
import { test, expect, type Page } from "@playwright/test";

const contentBeforeAnimation = {
  text: "3c614d65235480a826bff278d2afc13274e7ea245b2c1c7ac8e0c0a6c67ae539",
  headings: "34698746f52fd287187dddaead0883940413df792866c64691f8136b792c5f41",
  links: "f2502bcaa3aa3558612de87be46f09c16fc3fbd6bb0f9dd637991115f2fe8741",
  images: "182a0b214c6f4534b39d7b5061ce6cca657698f1893580e9ffdd889d651339ad",
  buttons: "dc686593e9383308fcce1a346d2383b887d946e4b8abd183b036570ddb4df09a",
};

let errors: string[];
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
});
test.afterEach(() => expect(errors, "Application runtime errors").toEqual([]));

async function ready(page: Page) {
  await page.goto("/");
  await expect(page.getByTestId("component-inspector")).toHaveAttribute(
    "data-state",
    "ready",
    { timeout: 20000 },
  );
  const canvas = page.getByTestId("inspector-canvas");
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-render-count")))
    .toBeGreaterThan(0);
  await expect(page.locator("canvas")).toHaveCount(1);
  return canvas;
}

async function centerStudy(page: Page) {
  await page.locator(".inspector-viewport").evaluate((node) => {
    const r = node.getBoundingClientRect();
    const header = document
      .querySelector(".site-header")!
      .getBoundingClientRect().height;
    scrollTo(
      0,
      scrollY +
        r.top +
        r.height * 0.48 -
        (header + (innerHeight - header) * 0.5) +
        2,
    );
  });
}

async function noOverflow(page: Page) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
}

test("animation-only change preserves all original copy, headings, links, photos and controls", async ({
  browser,
}, info) => {
  test.skip(
    info.project.name !== "desktop",
    "One fixed-size source-content comparison.",
  );
  // Captured from f8533d6 BEFORE this animation work. No JavaScript means no
  // autoplay, duplicate transition image or transient accessibility label.
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(process.env.QA_BASE_URL || "http://127.0.0.1:3000/");
  const content = await page.locator("main").evaluate((el) => ({
    text: (el as HTMLElement).innerText,
    headings: Array.from(el.querySelectorAll("h1,h2,h3"), (n) => [
      n.tagName,
      n.textContent,
    ]),
    links: Array.from(el.querySelectorAll("a"), (n) => [
      n.getAttribute("href"),
      n.textContent,
      n.getAttribute("aria-label"),
    ]),
    images: Array.from(el.querySelectorAll("img"), (n) => [
      n.getAttribute("src"),
      n.getAttribute("alt"),
    ]),
    buttons: Array.from(el.querySelectorAll("button"), (n) => [
      n.textContent,
      n.getAttribute("aria-label"),
    ]),
  }));
  for (const [key, value] of Object.entries(content)) {
    expect(
      createHash("sha256").update(JSON.stringify(value)).digest("hex"),
      `${key} must remain identical to the pre-animation photographic homepage`,
    ).toBe(contentBeforeAnimation[key as keyof typeof contentBeforeAnimation]);
  }
  await context.close();
});

test("reference carousel floats, dwells, autoplays, accepts keyboard and horizontal drag", async ({
  page,
}) => {
  test.setTimeout(60000);
  const canvas = await ready(page);
  const id = await canvas.getAttribute("data-traveller-id");
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const r = document
            .querySelector(".home-carousel-gesture")!
            .getBoundingClientRect();
          const c = document.querySelector("canvas")!;
          return Math.abs(
            Number(c.dataset.travellerX) - (r.left + r.width / 2),
          );
        }),
      { timeout: 20000 },
    )
    .toBeLessThan(1);
  const initial = await canvas.getAttribute("data-selected");
  const renders = Number(await canvas.getAttribute("data-render-count"));
  await page.waitForTimeout(950);
  await expect(canvas).toHaveAttribute("data-selected", initial!);
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-render-count")))
    .toBeGreaterThan(renders);
  await expect
    .poll(() => canvas.getAttribute("data-selected"), { timeout: 15000 })
    .not.toBe(initial);
  await expect(canvas).toHaveAttribute("data-traveller-id", id!);

  const choices = page.getByRole("group", {
    name: "Explore manufacturing materials",
  });
  await choices
    .getByRole("button", { name: "03 Aluminium", exact: true })
    .focus();
  await page.keyboard.press("Home");
  await expect(
    choices.getByRole("button", { name: "01 Rubber", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(
    choices.getByRole("button", { name: "02 Steel", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(async () => {
      const p = Number(await canvas.getAttribute("data-position"));
      return Math.abs(p - Math.round(p));
    })
    .toBeLessThan(0.001);
  const arc = (await page.getByTestId("home-carousel-gesture").boundingBox())!;
  await page.mouse.move(arc.x + arc.width * 0.76, arc.y + arc.height * 0.55);
  await page.mouse.down();
  await page.mouse.move(arc.x + arc.width * 0.46, arc.y + arc.height * 0.55, {
    steps: 10,
  });
  await page.mouse.up();
  await expect(
    choices.getByRole("button", { name: "03 Aluminium", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(canvas).toHaveAttribute("data-traveller-id", id!);
  const phone = page.locator(".hero-phone");
  if (await phone.isVisible()) {
    await phone.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(phone).toBeFocused();
    await expect(
      choices.getByRole("button", { name: "03 Aluminium", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
  }
  await noOverflow(page);
});

test("one traveller lands on the existing photo, passes through particles and flips in the study", async ({
  page,
}) => {
  const canvas = await ready(page);
  await page.getByRole("button", { name: "02 Steel", exact: true }).click();
  const id = await canvas.getAttribute("data-traveller-id");
  const stops = await page.evaluate(() => {
    const header = document
      .querySelector(".site-header")!
      .getBoundingClientRect().height;
    const hero = document
      .querySelector(".precision-hero")!
      .getBoundingClientRect();
    const photo = document
      .querySelectorAll(".studio-material-photo")[1]
      .getBoundingClientRect();
    const study = document
      .querySelector(".inspector-viewport")!
      .getBoundingClientRect();
    const exit = scrollY + hero.bottom - innerHeight * 0.73;
    const card = Math.max(
      exit + 160,
      scrollY + photo.top + photo.height * 0.24 - innerHeight * 0.48,
    );
    const arrival =
      scrollY +
      study.top +
      study.height * 0.48 -
      (header + (innerHeight - header) * 0.5);
    return { card, particles: card + 50 + (arrival - card - 50) * 0.55 };
  });
  await page.evaluate((y) => scrollTo(0, y + 1), stops.card);
  await expect(canvas).toHaveAttribute("data-stage", "card");
  await expect(canvas).toHaveAttribute("data-traveller-id", id!);
  await page.evaluate((y) => scrollTo(0, y), stops.particles);
  await expect
    .poll(() =>
      page
        .locator(".home-motion-particles > span")
        .evaluateAll(
          (nodes) =>
            nodes.filter((n) => getComputedStyle(n).visibility === "visible")
              .length,
        ),
    )
    .toBeGreaterThan(0);
  await centerStudy(page);
  await expect(canvas).toHaveAttribute("data-stage", "study");
  // Stage metadata is updated before a GPU frame completes. Wait for the
  // settled 180° frame, not the previous card's (also >179°) 360° pose.
  await expect(canvas).toHaveAttribute("data-angle", "180.00");
  const before = Number(await canvas.getAttribute("data-angle"));
  await page.evaluate(() => scrollBy(0, 250));
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-angle")))
    .toBeGreaterThan(before + 150);
  await expect(canvas).toHaveAttribute("data-traveller-id", id!);
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(page.locator(".studio-material-card")).toHaveCount(3);
  await expect(
    page.locator('.studio-process-image img[aria-hidden="false"]'),
  ).toHaveAttribute("src", "/images/quality-metrology.jpg");
  await noOverflow(page);
});

test("perspective hover and quote-flight feedback do not change links, prefill or form delivery", async ({
  page,
}) => {
  await ready(page);
  const card = page.locator(".studio-material-card").first();
  await card.scrollIntoViewIfNeeded();
  const r = (await card.boundingBox())!;
  await page.mouse.move(
    r.x + r.width * 0.8,
    Math.max(130, r.y + r.height * 0.3),
  );
  await expect
    .poll(() => card.evaluate((n) => n.style.transform))
    .toContain("perspective(950px)");
  await expect(
    card.getByRole("link", { name: "Explore Rubber Products", exact: true }),
  ).toHaveAttribute("href", "/products/rubber");
  await page.evaluate(() => scrollTo(0, 0));
  await page.getByRole("button", { name: "03 Aluminium", exact: true }).click();
  const photo = page.getByTestId("hero-photo-plane");
  await expect(photo).toHaveAttribute("data-revealing", "true");
  await expect(photo).toHaveCSS("animation-name", "home-photo-radial");
  let submissions = 0;
  page.on("request", (request) => {
    if (request.url().endsWith("/api/quote") && request.method() === "POST")
      submissions++;
  });
  await page
    .locator(".precision-hero")
    .getByRole("button", { name: "Request a Quote", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Request a Quote",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Material / product interest")).toHaveValue(
    "Aluminium Products",
  );
  await expect.poll(() => page.locator(".home-quote-flight").count()).toBe(1);
  await expect(page.locator(".home-quote-flight")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
  expect(submissions).toBe(0);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await noOverflow(page);
});

test("touch swipes change the carousel without trapping native vertical scrolling", async ({
  page,
}, info) => {
  test.skip(
    !info.project.use.hasTouch,
    "Touch-emulated projects exercise native pan gestures.",
  );
  const canvas = await ready(page);
  await page.getByRole("button", { name: "02 Steel", exact: true }).click();
  await expect
    .poll(async () =>
      Math.abs(Number(await canvas.getAttribute("data-position")) - 1),
    )
    .toBeLessThan(0.001);
  const client = await page.context().newCDPSession(page);
  const arc = (await page.getByTestId("home-carousel-gesture").boundingBox())!;
  const x = arc.x + arc.width * 0.76,
    y = arc.y + arc.height * 0.6;
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  for (let i = 1; i <= 8; i++)
    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: x - (arc.width * 0.29 * i) / 8, y }],
    });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect(
    page.getByRole("button", { name: "03 Aluminium", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  for (let i = 1; i <= 8; i++)
    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x, y: y - (120 * i) / 8 }],
    });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(30);
  await expect(
    page.getByRole("button", { name: "03 Aluminium", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await noOverflow(page);
  await client.detach();
});
