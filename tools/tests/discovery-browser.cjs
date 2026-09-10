const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("../../examples/spotlight/node_modules/playwright");
const root = path.resolve(__dirname, "../..");
const output = path.join(root, "examples/spotlight/output/site");
fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  try {
    for (const width of [1440, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.addInitScript(() => {
        Object.defineProperty(navigator, "clipboard", { configurable: true, value: {
          writeText: async text => { window.lastCopied = text; },
        } });
      });
      await page.goto(pathToFileURL(path.join(root, "index.html")).href, { waitUntil: "domcontentloaded" });
      await page.locator(".skill-spotlight").waitFor();
      assert.equal(await page.locator(".skill-spotlight .skill-result").count(), 6);
      assert(await page.locator(".skill-demo-image").evaluate(image => image.complete && image.naturalWidth === 1280));
      await page.screenshot({ path: path.join(output, `home-${width}.png`) });
      await page.locator("#sec-spotlight").scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(output, `spotlight-${width}.png`) });
      await page.evaluate(() => loadDoc("catalog"));
      assert.equal(await page.locator("#skill-results .skill-result").count(), 392);
      await page.locator("#skill-query").fill("transcode compress");
      assert.equal(await page.locator("#skill-results .skill-result").count(), 1);
      const copy = page.getByRole("button", { name: "Copy install command for ffmpeg", exact: true });
      assert.equal(await copy.locator("svg").count(), 1);
      await copy.click();
      assert.equal(await page.evaluate(() => window.lastCopied), "npx skills add alivirgo/Major-AI-Skills --skill ffmpeg");
      await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error("disabled"); }; });
      await copy.click();
      assert.equal(await page.evaluate(() => window.getSelection().toString()), "npx skills add alivirgo/Major-AI-Skills --skill ffmpeg");
      await page.screenshot({ path: path.join(output, `catalog-${width}.png`) });
      const overflow = await page.locator(".skill-result").evaluateAll(elements => elements.some(element => element.scrollWidth > element.clientWidth + 1));
      assert.equal(overflow, false, `Skill row overflow at ${width}px`);
      await page.locator("#skill-category").selectOption("cad");
      assert.match(await page.locator("#skill-results").textContent(), /No matching skills/);
      await page.locator("#skill-query").fill("");
      const expected = require("../../skills_index.json").filter(skill => skill.category === "cad").length;
      assert.equal(await page.locator("#skill-results .skill-result").count(), expected);
      await page.locator("#skill-query").fill("<script>alert(1)</script>");
      assert.equal(await page.locator("#skill-results script").count(), 0);
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`PASS discovery UI ${width}px`);
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
