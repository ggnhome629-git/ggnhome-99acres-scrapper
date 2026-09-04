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
  const box = await input.boundingBox();
  console.log("Input bounding box:", box);
  await input.click();
  await sleep(300);
  await input.pressSequentially("Sector 45", { delay: 100 });
  await sleep(2500);

  // Dump the HTML of the area right below the input (where a dropdown would render)
  const html = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input[placeholder*="Search"]'));
    if (!inputs.length) return "NO INPUT FOUND";
    const inp = inputs[0];
    // walk up to a reasonably-sized container and dump its outerHTML
    let el = inp;
    for (let i = 0; i < 4 && el.parentElement; i++) el = el.parentElement;
    return el.outerHTML;
  });

  require("fs").writeFileSync(`${__dirname}/nobroker_search_area.html`, html);
  console.log("Saved search-area HTML, length:", html.length);

  await page.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
