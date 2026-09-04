const { chromium } = require("playwright-core");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const browser = await chromium.connectOverCDP("http://localhost:9222");
  const context = browser.contexts()[0];
  const page = await context.newPage();

  console.log("Navigating to nobroker.in homepage...");
  await page.goto("https://www.nobroker.in/", { waitUntil: "domcontentloaded", timeout: 30000 });
  await sleep(3000);

  console.log("Page title:", await page.title());

  // Try to find a search input
  const inputSelectors = [
    'input[placeholder*="Search"]',
    'input[placeholder*="locality"]',
    'input[type="text"]',
    '#google_pac_input',
  ];
  let found = null;
  for (const sel of inputSelectors) {
    const count = await page.locator(sel).count();
    if (count > 0) {
      found = sel;
      console.log(`Found input via selector "${sel}" (count=${count})`);
      break;
    }
  }

  if (!found) {
    console.log("No obvious search input found. Dumping visible input elements:");
    const inputs = await page.locator("input").all();
    for (const inp of inputs.slice(0, 15)) {
      const ph = await inp.getAttribute("placeholder").catch(() => null);
      const id = await inp.getAttribute("id").catch(() => null);
      const cls = await inp.getAttribute("class").catch(() => null);
      console.log(`  input id=${id} placeholder=${ph} class=${cls}`);
    }
  } else {
    await page.locator(found).first().click();
    await page.locator(found).first().fill("Sector 45, Gurugram");
    await sleep(2000);
    console.log("Typed search text, checking for suggestions...");
    const suggestions = await page.locator("li, div[class*='suggest'], div[class*='option']").allTextContents();
    console.log("Possible suggestions (first 10):", suggestions.slice(0, 10));
  }

  await page.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
