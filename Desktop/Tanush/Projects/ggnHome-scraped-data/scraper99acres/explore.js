const { chromium } = require("playwright-core");

async function main() {
  const browser = await chromium.connectOverCDP("http://localhost:9222");
  const contexts = browser.contexts();
  if (!contexts.length) {
    console.log("No browser contexts found — is Chrome running with --remote-debugging-port=9222?");
    process.exit(1);
  }

  const pages = contexts.flatMap((c) => c.pages());
  console.log(`Found ${pages.length} open tab(s):`);
  pages.forEach((p, i) => console.log(`  [${i}] ${p.url()}`));

  const target = pages.find((p) => p.url().includes("99acres.com")) || pages[0];
  if (!target) {
    console.log("No tabs at all.");
    process.exit(1);
  }

  console.log(`\nInspecting: ${target.url()}`);
  const title = await target.title();
  console.log("Title:", title);

  const html = await target.content();
  require("fs").writeFileSync(`${__dirname}/last_page.html`, html);
  console.log(`Saved rendered HTML (${html.length} bytes) to last_page.html`);

  // Deliberately not calling browser.close()/disconnecting via a method that
  // could tear down your real Chrome window — the script just exits.
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
