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

  const input = page.locator("#listPageSearchLocality");
  await input.click();
  await input.pressSequentially("Sector 45", { delay: 90 });
  await sleep(2000);

  const options = page.locator('#autocomplete-dropdown-container div[role="option"]');
  const count = await options.count();
  const texts = await options.allTextContents();
  console.log(`Found ${count} suggestion(s):`, texts);

  let idx = texts.findIndex((t) => /sector\s*45\s*,\s*haryana/i.test(t));
  if (idx === -1) idx = 0;
  console.log("Clicking suggestion index", idx, "via mouse:", texts[idx]);
  await options.nth(idx).click({ force: true });
  await sleep(1000);

  const diag = await page.evaluate(() => {
    const sel = document.getElementById("selectedLocalities");
    const inp = document.getElementById("listPageSearchLocality");
    const btn = document.querySelector(".prop-search-button");
    return {
      selectedLocalitiesHTML: sel ? sel.innerHTML : null,
      inputValue: inp ? inp.value : null,
      btnDisabled: btn ? btn.disabled : null,
      btnHTML: btn ? btn.outerHTML.slice(0, 200) : null,
    };
  });
  console.log("Diagnostic after selection:", JSON.stringify(diag, null, 2));

  const searchBtn = page.locator(".prop-search-button");
  if (await searchBtn.count()) {
    await searchBtn.first().click();
  }

  console.log("Waiting for resultScreenReducer.loading to settle...");
  try {
    await page.waitForFunction(
      () => {
        const s = window.nb && window.nb.appState && window.nb.appState.resultScreenReducer;
        return s && s.loading === false && Array.isArray(s.propertySearchData);
      },
      { timeout: 20000, polling: 500 }
    );
    console.log("Results loaded.");
  } catch (e) {
    console.log("Timed out waiting for results:", e.message);
  }
  await sleep(1000);

  console.log("Final URL:", page.url());
  console.log("Title:", await page.title());

  // Read the LIVE object from JS memory, not page.content() — the inline
  // <script>window.nb.appState = {...}</script> text never updates after
  // the initial SSR load even though the app mutates that object in place
  // once the search XHR resolves.
  const liveState = await page.evaluate(() => {
    const s = window.nb && window.nb.appState && window.nb.appState.resultScreenReducer;
    if (!s) return null;
    return {
      loading: s.loading,
      count: Array.isArray(s.propertySearchData) ? s.propertySearchData.length : null,
      sample: Array.isArray(s.propertySearchData) ? s.propertySearchData[0] : null,
    };
  });
  require("fs").writeFileSync(`${__dirname}/nobroker_live_state.json`, JSON.stringify(liveState, null, 2));
  console.log("Live resultScreenReducer count:", liveState && liveState.count);

  await page.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
