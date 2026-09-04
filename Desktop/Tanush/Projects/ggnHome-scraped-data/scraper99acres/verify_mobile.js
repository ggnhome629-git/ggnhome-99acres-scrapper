const { chromium } = require("playwright-core");

async function shot(browser, width, height, filename) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${__dirname}/${filename}` });

  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  console.log(`${filename} (${width}x${height}): horizontal overflow = ${overflow}`);
  await page.close();
}

async function main() {
  const browser = await chromium.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
  });

  await shot(browser, 1440, 900, "desktop_hero.png");
  await shot(browser, 390, 844, "mobile_hero.png"); // iPhone 12/13/14 size
  await shot(browser, 375, 667, "mobile_hero_se.png"); // iPhone SE, smallest common

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
