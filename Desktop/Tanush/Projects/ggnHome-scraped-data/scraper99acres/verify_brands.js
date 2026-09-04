const { chromium } = require("playwright-core");

async function main() {
  const browser = await chromium.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);

  await page.waitForTimeout(3000); // let all logo <img> tags fail and swap to fallback badges
  const badge = page.locator('div[title="Godrej Properties"]');
  try {
    await badge.waitFor({ state: "attached", timeout: 8000 });
    await badge.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await badge.screenshot({ path: `${__dirname}/brands_section.png` });
    console.log("Saved brands_section.png (single badge)");
  } catch (e) {
    console.log("Badge not found/attached:", e.message);
  }

  // Also grab a wider shot of the whole brands strip for context
  const strip = page.locator('div[title="Godrej Properties"]').locator("..");
  try {
    await strip.screenshot({ path: `${__dirname}/brands_strip.png` });
    console.log("Saved brands_strip.png (parent row)");
  } catch (e) {
    console.log("Could not screenshot parent strip:", e.message);
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
