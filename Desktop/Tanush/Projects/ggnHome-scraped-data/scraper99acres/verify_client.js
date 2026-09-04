const { chromium } = require("playwright-core");

async function main() {
  const browser = await chromium.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(`pageerror: ${err.message}`));

  const failedRequests = [];
  page.on("requestfailed", (req) => {
    failedRequests.push(`${req.failure()?.errorText} -> ${req.url()}`);
  });

  await page.goto("http://localhost:3000/", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500); // let the page-transition animation settle

  await page.screenshot({ path: `${__dirname}/dashboard_check.png`, fullPage: true });
  console.log("Screenshot saved to dashboard_check.png");

  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 300));
  console.log("Body text preview:", JSON.stringify(bodyText));

  const hasReactErrorOverlay = await page.evaluate(() =>
    !!document.getElementById("webpack-dev-server-client-overlay") ||
    !!document.querySelector("iframe#webpack-dev-server-client-overlay")
  );
  console.log("React/webpack error overlay present:", hasReactErrorOverlay);

  console.log("Console errors:", consoleErrors.length ? consoleErrors : "none");
  console.log("Failed requests:", failedRequests.length ? failedRequests.slice(0, 15) : "none");

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
