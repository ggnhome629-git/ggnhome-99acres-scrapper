const { chromium } = require("playwright-core");

async function main() {
  const browser = await chromium.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(4000);

  const html = await page.content();
  const brokenImgCount = (html.match(/logo\.clearbit\.com/g) || []).length;
  const badgeCount = (html.match(/003366 0%, #4A6A8A 100%/g) || []).length;
  console.log("Remaining <img src=logo.clearbit.com> in DOM:", brokenImgCount);
  console.log("Fallback gradient badges rendered:", badgeCount);

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
