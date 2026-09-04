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

async function inspect(page, url) {
  console.log("\n=== Navigating:", url);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await sleep(2500);
  const html = await page.content();
  const data = extractInitialData(html);
  const pageData = data && data.srp && data.srp.pageData;
  const props = (pageData && pageData.properties) || [];
  console.log("Landed:", page.url());
  console.log("Properties:", props.length, "| count:", pageData && pageData.count, "| pageNumber:", data && data.srp && data.srp.pageNumber, "| isLastpage:", data && data.srp && data.srp.isLastpage);
  if (props[0]) console.log("First SPID:", props[0].SPID, "| heading:", props[0].PROP_HEADING);
  if (props.length) console.log("Last SPID:", props[props.length - 1].SPID);
  return props.map((p) => p.SPID);
}

async function main() {
  const browser = await chromium.connectOverCDP("http://localhost:9222");
  const context = browser.contexts()[0];
  const page = await context.newPage();

  const page1Ids = await inspect(page, "https://www.99acres.com/property-in-sector-45-gurgaon-ffid?preference=R&page=1");
  const page2Ids = await inspect(page, "https://www.99acres.com/property-in-sector-45-gurgaon-ffid?preference=R&page=2");
  const overlap = page1Ids.filter((id) => page2Ids.includes(id));
  console.log("\nOverlap between page1 and page2:", overlap.length, "(should be 0 if pagination works)");

  await inspect(page, "https://www.99acres.com/property-in-sector-45-gurgaon-ffid?preference=S");

  await page.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
