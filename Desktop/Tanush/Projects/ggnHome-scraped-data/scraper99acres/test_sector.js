const { chromium } = require("playwright-core");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function extractInitialData(html) {
  const marker = "window.__initialData__=";
  const idx = html.indexOf(marker);
  if (idx === -1) return null;
  const start = idx + marker.length;
  if (html[start] !== "{") return null;
  let i = start, depth = 0, inStr = false, strChar = "", escape = false, end = null;
  for (; i < html.length; i++) {
    const c = html[i];
    if (inStr) {
      if (escape) escape = false;
      else if (c === "\\") escape = true;
      else if (c === strChar) inStr = false;
    } else {
      if (c === '"' || c === "'") { inStr = true; strChar = c; }
      else if (c === "{") depth++;
      else if (c === "}") { depth--; if (depth === 0) { end = i + 1; break; } }
    }
  }
  if (end === null) return null;
  try { return JSON.parse(html.slice(start, end)); } catch (e) { return null; }
}

async function main() {
  const browser = await chromium.connectOverCDP("http://localhost:9222");
  const context = browser.contexts()[0];
  const page = await context.newPage();

  const url = "https://www.99acres.com/property-in-sector-45-gurgaon-ffid?preference=R";
  console.log("Navigating to:", url);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await sleep(3000);

  console.log("Landed on:", page.url());
  console.log("Title:", await page.title());

  const html = await page.content();
  require("fs").writeFileSync(`${__dirname}/sector45_test.html`, html);

  const data = extractInitialData(html);
  if (!data) {
    console.log("No __initialData__ found on this page.");
  } else {
    const pageData = data.srp && data.srp.pageData;
    const props = (pageData && pageData.properties) || [];
    console.log("Properties found:", props.length);
    console.log("count (total matches):", pageData && pageData.count);
    console.log("search_params.localityID:", JSON.stringify(pageData && pageData.search_params && pageData.search_params.localityID));
    console.log("search_params.primaryLocalityLabel:", pageData && pageData.search_params && pageData.search_params.primaryLocalityLabel);
    if (props[0]) {
      console.log("Sample LOCALITY:", props[0].LOCALITY, "| PROP_HEADING:", props[0].PROP_HEADING);
    }
  }

  await page.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
