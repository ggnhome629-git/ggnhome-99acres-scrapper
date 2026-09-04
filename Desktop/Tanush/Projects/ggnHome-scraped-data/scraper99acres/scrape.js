const { chromium } = require("playwright-core");
// Must be the exact same mongoose module instance that the models use
// internally (a sibling directory's own require("mongoose") would resolve to
// a different copy/singleton, so connecting this one wouldn't connect that one).
const mongoose = require("../../ggnHome/server/node_modules/mongoose");
const RentalProperty = require("../../ggnHome/server/models/Rentalproperty.model");
const SaleProperty = require("../../ggnHome/server/models/SaleProperty.model");
const { mapListingToRentalProperty, mapListingToSaleProperty } = require("./mapListing");

const MONGO_URI = process.env.MONGO_URI;
const PAGES_PER_SECTOR = process.env.PAGES_PER_SECTOR ? parseInt(process.env.PAGES_PER_SECTOR, 10) : 2;
const DRY_RUN = process.env.DRY_RUN === "1";
const SECTOR_LIMIT = process.env.SECTOR_LIMIT ? parseInt(process.env.SECTOR_LIMIT, 10) : null;
const SECTOR_ONLY = process.env.SECTOR_ONLY || null;
// "rent", "sale", or "both" (default) — controls which 99acres preference(s) to crawl.
const LISTING_TYPE = process.env.LISTING_TYPE || "both";

// Numbered sectors 1-115 cover Gurugram's full addressable range (including
// New Gurgaon's higher numbers); plus the two plain area names that also
// resolve through the same SEO URL pattern. Sectors with no live inventory
// just return an empty page and are skipped quickly — cheap to include even
// speculatively. Compound project-specific names (e.g.
// Signature_Global_Sector_36_Sohna, South_City_II_Sector_49) aren't included
// since their 99acres slug isn't guessable the same way.
const NUMBERED_SECTORS = Array.from({ length: 115 }, (_, i) => `sector-${i + 1}`);
const SECTOR_SLUGS = [...NUMBERED_SECTORS, "badshahpur", "sohna"];

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

async function highlightAndCapture(page, propId, label) {
  try {
    await page.evaluate(
      ({ id, label }) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.style.outline = "4px solid #00c853";
        el.style.outlineOffset = "3px";
        el.style.boxShadow = "0 0 0 4px rgba(0,200,83,0.25)";

        let badge = document.getElementById("scrape-badge-overlay");
        if (!badge) {
          badge = document.createElement("div");
          badge.id = "scrape-badge-overlay";
          badge.style.position = "fixed";
          badge.style.top = "12px";
          badge.style.right = "12px";
          badge.style.zIndex = "999999";
          badge.style.background = "#00c853";
          badge.style.color = "#fff";
          badge.style.padding = "8px 14px";
          badge.style.borderRadius = "6px";
          badge.style.fontFamily = "sans-serif";
          badge.style.fontSize = "13px";
          badge.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
          document.body.appendChild(badge);
        }
        badge.textContent = `Captured: ${label}`;
      },
      { id: propId, label }
    );
  } catch (e) {
    // element may not be mounted (virtualized list) — not fatal, data still comes from __initialData__
  }
  await sleep(180);
  try {
    await page.evaluate((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.style.outline = "";
        el.style.boxShadow = "";
      }
    }, propId);
  } catch (e) {}
}

async function scrollThroughPage(page, steps = 6) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let i = 1; i <= steps; i++) {
    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: "smooth" }),
      Math.floor((height / steps) * i)
    );
    await sleep(180);
  }
}

async function crawlListingType(page, { preference, model, mapFn, priceField, existingIds, seenThisRun, sectorSlugs }) {
  const summary = { scanned: 0, newListings: 0, alreadyKnown: 0, inserted: 0, errors: [] };

  for (const slug of sectorSlugs) {
    for (let p = 1; p <= PAGES_PER_SECTOR; p++) {
      const url = `https://www.99acres.com/property-in-${slug}-gurgaon-ffid?preference=${preference}&page=${p}`;
      try {
        console.log(`\n[${preference} ${slug} page ${p}] navigating...`);
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
        await sleep(1200);

        const html = await page.content();
        const data = extractInitialData(html);
        const pageData = data && data.srp && data.srp.pageData;
        const properties = (pageData && pageData.properties) || [];
        const featureLabelsById = {};
        ((pageData && pageData.facets && pageData.facets.FEATURES) || []).forEach((f) => {
          featureLabelsById[f.id] = f.label;
        });

        if (!properties.length) {
          console.log(`[${preference} ${slug} page ${p}] no listings found, skipping.`);
          continue;
        }

        await scrollThroughPage(page, Math.min(properties.length, 6));

        for (const prop of properties) {
          summary.scanned++;
          await highlightAndCapture(page, prop.PROP_ID, prop.PROP_HEADING || prop.PROP_ID);

          if (existingIds.has(prop.PROP_ID) || seenThisRun.has(prop.PROP_ID)) {
            summary.alreadyKnown++;
            continue;
          }
          seenThisRun.add(prop.PROP_ID);
          summary.newListings++;

          try {
            const doc = mapFn(prop, featureLabelsById);
            if (DRY_RUN) {
              console.log(`  [dry-run] would insert ${doc.sourceListingId}: ${doc.title} — Rs.${doc[priceField]}`);
            } else {
              await model.create(doc);
            }
            summary.inserted++;
          } catch (err) {
            console.log(`  [ERROR] ${prop.PROP_ID}: ${err.message}`);
            summary.errors.push({ spid: prop.PROP_ID, error: err.message });
          }
        }

        console.log(
          `[${preference} ${slug} page ${p}] scanned=${properties.length} new=${summary.newListings} inserted so far=${summary.inserted}`
        );
      } catch (err) {
        console.log(`[${preference} ${slug} page ${p}] FAILED: ${err.message}`);
        summary.errors.push({ slug, page: p, error: err.message });
      }
      await sleep(500 + Math.random() * 400);
    }
  }

  return summary;
}

async function run() {
  if (!MONGO_URI) throw new Error("MONGO_URI env var is required");
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB.");

  const browser = await chromium.connectOverCDP("http://localhost:9222");
  const context = browser.contexts()[0];
  const page = await context.newPage();

  let sectorSlugs = SECTOR_ONLY ? [SECTOR_ONLY] : SECTOR_SLUGS;
  if (SECTOR_LIMIT) sectorSlugs = sectorSlugs.slice(0, SECTOR_LIMIT);
  if (DRY_RUN) console.log("DRY RUN — no documents will be written.");
  console.log(`Crawling ${sectorSlugs.length} sector slug(s), ${PAGES_PER_SECTOR} page(s) each, type=${LISTING_TYPE}.`);

  const results = {};

  if (LISTING_TYPE === "rent" || LISTING_TYPE === "both") {
    const existingIds = new Set(
      (await RentalProperty.find({ sourcePortal: "99acres" }).select("sourceListingId").lean()).map(
        (d) => d.sourceListingId
      )
    );
    console.log(`\n=== RENT === Already have ${existingIds.size} 99acres rental listing(s).`);
    results.rent = await crawlListingType(page, {
      preference: "R",
      model: RentalProperty,
      mapFn: mapListingToRentalProperty,
      priceField: "monthlyRent",
      existingIds,
      seenThisRun: new Set(),
      sectorSlugs,
    });
  }

  if (LISTING_TYPE === "sale" || LISTING_TYPE === "both") {
    const existingIds = new Set(
      (await SaleProperty.find({ sourcePortal: "99acres" }).select("sourceListingId").lean()).map(
        (d) => d.sourceListingId
      )
    );
    console.log(`\n=== SALE === Already have ${existingIds.size} 99acres sale listing(s).`);
    results.sale = await crawlListingType(page, {
      preference: "S",
      model: SaleProperty,
      mapFn: mapListingToSaleProperty,
      priceField: "price",
      existingIds,
      seenThisRun: new Set(),
      sectorSlugs,
    });
  }

  console.log("\n=== DONE ===");
  console.log(JSON.stringify(results, null, 2));

  await mongoose.disconnect();
  // Deliberately not calling browser.close() — over a CDP-attached connection
  // that can tear down your real Chrome window. But the open CDP WebSocket
  // otherwise keeps this process alive forever, so exit explicitly once the
  // work (and the Mongo disconnect above) is actually done.
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
