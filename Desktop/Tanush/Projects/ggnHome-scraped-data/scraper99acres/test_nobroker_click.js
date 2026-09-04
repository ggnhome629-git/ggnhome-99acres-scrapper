const { chromium } = require("playwright-core");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const browser = await chromium.connectOverCDP("http://localhost:9222");
  const context = browser.contexts()[0];
  const page = await context.newPage();

  await page.goto("https://www.nobroker.in/", { waitUntil: "domcontentloaded", timeout: 30000 });
  await sleep(2500);

  const input = page.locator('input[placeholder*="Search"]').first();
  await input.click();
  await input.pressSequentially("Sector 45, Gurugram", { delay: 80 });
  await sleep(2500);

  const options = page.locator("li, div[class*='suggest'], div[class*='option']");
  const texts = await options.allTextContents();
  console.log("Suggestions:", texts.slice(0, 10));

  const matchIdx = texts.findIndex((t) => /sector\s*45/i.test(t));
  console.log("Matching suggestion index:", matchIdx, texts[matchIdx]);

  if (matchIdx >= 0) {
    await options.nth(matchIdx).click();
    await sleep(3000);
    console.log("URL after clicking suggestion:", page.url());
    console.log("Title:", await page.title());
  } else {
    console.log("No exact Sector 45 match in suggestions; trying first suggestion anyway.");
    if (texts.length) {
      await options.nth(0).click();
      await sleep(3000);
      console.log("URL after clicking first suggestion:", page.url());
    }
  }

  await page.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
