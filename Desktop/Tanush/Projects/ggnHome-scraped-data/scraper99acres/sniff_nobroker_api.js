const { chromium } = require("playwright-core");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const browser = await chromium.connectOverCDP("http://localhost:9222");
  const context = browser.contexts()[0];
  const page = await context.newPage();

  const candidates = [];
  page.on("response", async (res) => {
    const url = res.url();
    const type = res.request().resourceType();
    if (type === "xhr" || type === "fetch") {
      let bodyPreview = "";
      try {
        const text = await res.text();
        bodyPreview = text.slice(0, 200);
      } catch (e) {}
      candidates.push({ url, status: res.status(), method: res.request().method(), bodyPreview });
    }
  });

  await page.goto("https://www.nobroker.in/", { waitUntil: "domcontentloaded", timeout: 30000 });
  await sleep(2500);

  const input = page.locator("#listPageSearchLocality");
  await input.click();
  await input.pressSequentially("Sector 45", { delay: 90 });
  await sleep(2000);

  const options = page.locator('#autocomplete-dropdown-container div[role="option"]');
  const texts = await options.allTextContents();
  console.log("Suggestions:", texts);

  // Click every suggestion in turn (new page tabs aren't needed; clicking
  // re-fills the same input) to see which interaction actually fires a
  // network request, regardless of whether the UI visibly "confirms" it.
  for (let i = 0; i < Math.min(texts.length, 3); i++) {
    console.log(`\nAttempting click on suggestion ${i}: ${texts[i]}`);
    const before = candidates.length;
    try {
      await options.nth(i).click({ force: true, timeout: 5000 });
    } catch (e) {
      console.log("click error:", e.message);
    }
    await sleep(1500);
    const searchBtn = page.locator(".prop-search-button");
    if (await searchBtn.count()) {
      await searchBtn.first().click({ force: true }).catch(() => {});
    }
    await sleep(2500);
    console.log(`New XHR/fetch requests since attempt: ${candidates.length - before}`);
    for (const c of candidates.slice(before)) {
      console.log(" ->", c.method, c.status, c.url);
    }
    // re-open the dropdown for the next attempt
    if (i < 2) {
      await input.click();
      await input.fill("");
      await input.pressSequentially("Sector 45", { delay: 90 });
      await sleep(2000);
    }
  }

  require("fs").writeFileSync(`${__dirname}/nobroker_network_log.json`, JSON.stringify(candidates, null, 2));
  console.log(`\nTotal XHR/fetch requests captured: ${candidates.length}`);

  await page.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
