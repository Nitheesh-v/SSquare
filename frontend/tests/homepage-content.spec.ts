import { expect, test, type Locator, type Page } from "@playwright/test";

let errors: string[];
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
});
test.afterEach(() => expect(errors, "Application runtime errors").toEqual([]));

const FACTS = ["20+", "03", "Coimbatore"];
const PRODUCTS = ["Aluminium Products", "Steel Products", "Rubber Products"];
const CAPABILITIES = [
  "Custom Rubber Components & Molded Products",
  "Steel Fabricated Parts & Structures",
  "Aluminium Profiles, Sheets & Machined Components",
  "Industrial Assemblies & Special-Purpose Parts",
];

async function loaded(image: Locator) {
  await expect(image).toBeVisible();
  await expect
    .poll(() =>
      image.evaluate(
        (node) =>
          (node as HTMLImageElement).complete &&
          (node as HTMLImageElement).naturalWidth > 0,
      ),
    )
    .toBe(true);
}

async function noOverflow(page: Page) {
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
}

test("reference sections appear in order with the chosen company facts and project-specific terms", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("main h1")).toHaveCount(1);
  await expect(page.locator("main h1")).toContainText("Your Trusted Partner");
  const sections = await page
    .getByTestId("industrial-home")
    .locator(":scope > section")
    .evaluateAll((nodes) =>
      nodes.map((node) =>
        node.classList.contains("original-slideshow-hero")
          ? "hero"
          : node.id || node.getAttribute("aria-label"),
      ),
    );
  expect(sections).toEqual([
    "hero",
    "who-we-are",
    "material-divisions",
    "what-we-do",
    "our-services",
    "S Square at a glance",
    "quick-service",
  ]);
  await expect(page.locator("#who-we-are")).toContainText(
    "serving industrial, commercial, and OEM clients",
  );
  await expect(page.locator("#who-we-are")).toContainText(
    "tailor-made solutions",
  );
  await expect(page.locator("#who-we-are")).toContainText(
    "reliability, precision, and long-term partnerships",
  );
  await expect(page.locator(".studio-material-card h3")).toHaveText(PRODUCTS);
  await expect(page.locator(".home-capability-list li")).toHaveText(
    CAPABILITIES,
  );
  await expect(page.locator(".home-service-card h3")).toHaveText([
    "Customization",
    "Quality Assurance",
    "Door Delivery",
  ]);
  await expect(page.locator(".home-service-card").nth(1)).toContainText(
    "Inspection scope and acceptance criteria are agreed during quotation",
  );
  await expect(page.locator(".home-service-card").nth(2)).toContainText(
    "shipping charges and the project schedule are confirmed in your quotation",
  );
  await expect(page.locator(".home-facts dd")).toHaveText(FACTS);
  await expect(page.locator("main")).not.toContainText(
    /Free Door Delivery|100%|13\+|4\+|50\+|15\+|Factory industrial/i,
  );
  await page.locator(".home-facts").scrollIntoViewIfNeeded();
  await expect(page.locator(".home-facts dd")).toHaveText(FACTS);
  expect(
    await page
      .locator(".home-facts")
      .evaluate((node) => node.getAnimations({ subtree: true }).length),
  ).toBe(0);
  await noOverflow(page);
});

test("the reference's machining and tooling photos load locally with honest illustration labels", async ({
  page,
}) => {
  await page.goto("/");
  for (const [section, source] of [
    ["#who-we-are", "/images/ssquare/machined-components.jpg"],
    ["#what-we-do", "/images/ssquare/aluminium-tooling.jpg"],
  ]) {
    await page.locator(section).scrollIntoViewIfNeeded();
    const image = page.locator(`${section} img[aria-hidden="false"]`);
    await loaded(image);
    await expect(image).toHaveAttribute("src", source);
    await expect(
      page.locator(section).getByTestId("illustrative-visual-label"),
    ).toHaveCount(0);
  }
  await page.locator("#material-divisions").scrollIntoViewIfNeeded();
  await expect(
    page
      .locator(".studio-material-card")
      .getByTestId("illustrative-visual-label"),
  ).toHaveCount(1);
  for (const card of await page.locator(".studio-material-card").all()) {
    await loaded(card.locator('img[aria-hidden="false"]'));
  }
  await page.locator("#quick-service").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("component-inspector")).toHaveCount(0);
  await expect(page.locator("canvas")).toHaveCount(0);
  await noOverflow(page);
});

test("both About links and all three product cards lead to the existing pages", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const about = page
    .locator("main")
    .getByRole("link", { name: "More About Us", exact: true });
  await expect(about).toHaveCount(2);
  for (const link of await about.all())
    await expect(link).toHaveAttribute("href", "/about");
  await about.first().click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator("main h1")).toContainText(
    "A partner in the parts.",
  );
  for (const [name, slug] of [
    ["Aluminium", "aluminium"],
    ["Steel", "steel"],
    ["Rubber", "rubber"],
  ]) {
    await page.goto("/");
    const card = page.locator(".studio-material-card").filter({
      has: page.getByRole("heading", {
        name: `${name} Products`,
        exact: true,
      }),
    });
    await expect(
      card.getByRole("link", { name: `View ${name} Products`, exact: true }),
    ).toHaveAttribute("href", `/products/${slug}`);
    await card
      .getByRole("link", { name: `Explore ${name} Products`, exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`/products/${slug}$`));
    await expect(page.locator("main h1")).toContainText(new RegExp(name, "i"));
    await noOverflow(page);
  }
});

test("quick service retains genuine contacts and opens the real editable RFQ without submitting", async ({
  page,
}) => {
  let submissions = 0;
  await page.route("**/api/quote", async (route) => {
    submissions++;
    await route.abort();
  });
  await page.goto("/");
  const quick = page.locator("#quick-service");
  await expect(quick.getByRole("heading", { level: 2 })).toHaveText(
    "Call Monday – Saturday",
  );
  await expect(
    quick.getByRole("link", { name: "+91 75300 80040", exact: true }),
  ).toHaveAttribute("href", "tel:+917530080040");
  await expect(
    quick.getByRole("link", { name: "sales@ssquareengg.com", exact: true }),
  ).toHaveAttribute("href", "mailto:sales@ssquareengg.com");
  const trigger = quick.getByRole("link", {
    name: "Request a Quote",
    exact: true,
  });
  await expect(trigger).toHaveAttribute("href", "/contact#quote");
  await trigger.click();
  const dialog = page.getByRole("dialog", {
    name: "Request a Quote",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Material / product interest")).toHaveValue(
    "Rubber Products, Steel Products, Aluminium Products",
  );
  await dialog
    .getByLabel("Material / product interest")
    .fill("Steel Products — custom bracket");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  expect(submissions).toBe(0);
  await expect(page.locator("footer address")).toContainText(
    "58, Jeganathapuram, Avarampalayam Road",
  );
  await expect(page.locator("footer")).toContainText(
    "Peelamedu, Coimbatore 641004",
  );
  await expect(
    page
      .locator("footer")
      .getByRole("link", { name: "3D material experience", exact: true }),
  ).toHaveAttribute("href", "/material-experience");
  await noOverflow(page);
});

test("unavailable official photos retain labelled local fallbacks and all homepage content", async ({
  page,
}) => {
  await page.route("**/images/ssquare/*.jpg", (route) =>
    route.fulfill({
      status: 200,
      contentType: "image/jpeg",
      body: "unavailable-photo",
    }),
  );
  await page.goto("/");
  for (const section of [
    "#who-we-are",
    "#material-divisions",
    "#what-we-do",
    "#quick-service",
  ]) {
    await page.locator(section).scrollIntoViewIfNeeded();
    for (const image of await page
      .locator(`${section} img[aria-hidden="false"]`)
      .all())
      await loaded(image);
  }
  await expect(
    page
      .locator(".studio-material-card")
      .getByTestId("illustrative-visual-label"),
  ).toHaveCount(3);
  await expect(
    page
      .locator(".home-editorial-figure")
      .getByTestId("illustrative-visual-label"),
  ).toHaveCount(2);
  await expect(page.locator(".home-facts dd")).toHaveText(FACTS);
  await expect(page.locator("canvas")).toHaveCount(0);
  await noOverflow(page);
});

test("without JavaScript every reference section and the native quick-service quotation path remain usable", async ({
  browser,
  page,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: page.viewportSize()!,
  });
  const staticPage = await context.newPage();
  const errors: string[] = [];
  staticPage.on("pageerror", (error) => errors.push(error.message));
  await staticPage.goto("/");
  for (const heading of [
    "Who We Are",
    "Explore Our Products",
    "What We Do",
    "Our Services",
    "Call Monday – Saturday",
  ])
    await expect(
      staticPage.getByRole("heading", { level: 2, name: heading, exact: true }),
    ).toBeVisible();
  await expect(staticPage.locator(".home-capability-list li")).toHaveText(
    CAPABILITIES,
  );
  await expect(staticPage.locator(".home-facts dd")).toHaveText(FACTS);
  await expect(staticPage.locator(".studio-material-card h3")).toHaveText(
    PRODUCTS,
  );
  await noOverflow(staticPage);
  await staticPage
    .locator("#quick-service")
    .getByRole("link", { name: "Request a Quote", exact: true })
    .click();
  await expect(staticPage).toHaveURL(/\/contact#quote$/);
  await expect(
    staticPage.locator('main a[href="mailto:sales@ssquareengg.com"]').first(),
  ).toBeAttached();
  expect(errors).toEqual([]);
  await context.close();
});

test("all new content, static facts and contact actions fit the five target layouts with reduced motion", async ({
  page,
}, info) => {
  test.skip(
    info.project.name !== "desktop",
    "Run the supplemental viewport matrix once.",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [width, height] of [
    [1440, 900],
    [768, 1024],
    [390, 844],
    [320, 844],
    [844, 390],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    for (const section of [
      "#who-we-are",
      "#material-divisions",
      "#what-we-do",
      "#our-services",
      ".home-facts",
      "#quick-service",
    ]) {
      const block = page.locator(section);
      await block.scrollIntoViewIfNeeded();
      await noOverflow(page);
      const bounds = await block.locator("h2,h3,a,dt,dd").evaluateAll((nodes) =>
        nodes.map((node) => {
          const rect = node.getBoundingClientRect();
          return {
            left: rect.left,
            right: rect.right,
            scroll: node.scrollWidth,
            client: node.clientWidth,
          };
        }),
      );
      for (const rect of bounds) {
        expect(rect.left, `${width}px ${section}`).toBeGreaterThanOrEqual(0);
        expect(rect.right, `${width}px ${section}`).toBeLessThanOrEqual(
          width + 1,
        );
        expect(
          rect.scroll,
          `${width}px ${section} unclipped text`,
        ).toBeLessThanOrEqual(rect.client + 1);
      }
      expect(
        await block.evaluate(
          (node) => node.getAnimations({ subtree: true }).length,
        ),
      ).toBe(0);
    }
    await expect(page.locator("canvas")).toHaveCount(0);
  }
});
