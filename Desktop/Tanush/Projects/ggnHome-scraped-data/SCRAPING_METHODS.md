# Scraping methods — 99acres and NoBroker

Working notes on how each portal was cracked, so we can turn this into a clean
production script later. Everything below is confirmed by hand today unless
marked otherwise.

---

## 99acres — FULLY WORKING (rent + sale, all sectors)

**The blocker:** 99acres sits behind Akamai's bot-detection edge. A plain
`curl`/`fetch` request gets an immediate "Access Denied" from
`errors.edgesuite.net` — no amount of header/UA spoofing gets past it. It
needs a real, visible Chrome browser.

**The workaround:** Launch the user's actual Google Chrome with
`--remote-debugging-port=9222` on a dedicated profile (`~/.99acres-scrape-profile`,
separate from the user's normal Chrome — never touches their real session).
Attach to it from Node with Playwright's `chromium.connectOverCDP('http://localhost:9222')`.
Because it's a real Chrome doing real navigations, Akamai never blocks it.

**The URL pattern** (no need to know internal locality IDs — the SEO slug
resolves them automatically):
```
https://www.99acres.com/property-in-<slug>-gurgaon-ffid?preference=R&page=<n>   (rent)
https://www.99acres.com/property-in-<slug>-gurgaon-ffid?preference=S&page=<n>   (sale)
```
`<slug>` = `sector-1` .. `sector-115`, or a plain area name like `badshahpur`,
`sohna`. Pagination via `&page=2`, `&page=3`... confirmed zero overlap between
pages, ~25 listings/page.

**The data — no per-listing page visits needed at all.** Every search-results
page embeds a huge Redux state dump directly in the raw HTML:
```html
<script>window.__initialData__={...huge JSON...}</script>
```
Extract it with a balanced-brace scan starting at the `window.__initialData__=`
marker (can't use a naive regex — the JSON is too large/nested). The listings
array is at:
```
data.srp.pageData.properties[]
```
Each entry is already rich enough to skip individual listing pages entirely —
title, full description, price, sqft, bedrooms/bathrooms, floor, furnishing,
facing, tenant preference, nearby landmarks, real image URLs, everything.

**Useful fields per listing object:**
- `PROP_ID` (e.g. `"L44442319"`) — the real id, also literally the DOM id of
  that card's outer container (`id="L44442319"`), so we can highlight the
  exact on-screen element matching each JSON entry.
- `PROP_DETAILS_URL` — slug for the detail page: `https://www.99acres.com/<PROP_DETAILS_URL>`
- `PROP_HEADING`, `DESCRIPTION`, `LOCALITY` (→ Sector, strip `, Gurgaon` suffix)
- `PROPERTY_TYPE` — already a human label ("Residential Apartment", "Builder
  Floor", "Independent House/Villa", "Studio Apartment", "Residential Land"
  for plots) — no numeric-code decoding needed.
- `BEDROOM_NUM`, `BATHROOM_NUM`, `BALCONY_NUM`, `TOTAL_FLOOR`, `FLOOR_NUM`
- `CARPET_SQFT` / `MIN_AREA_SQFT` / `MAX_AREA_SQFT`
- `MIN_PRICE` / `MAX_PRICE` — rent amount when `preference=R`, sale price when `preference=S`
- `FORMATTED.FURNISH_LABEL`, `FORMATTED.FURNISHING_ATTRIBUTES` (abbreviated
  csv like `Ac,Gey,Fan,Ref,Wtrpurfr,Kit,Chmny` — decode with a small lookup)
- `TOP_USPS` (array of readable strings, includes a "... Facing" entry)
- `RENTAL_ATTRIBUTES.occ_r` — tenant type codes: `FA`=Family, `SM`=Single Men,
  `SW`=Single Women, `CL`=Company Lease
- `FEATURES` — csv of numeric amenity codes. Decode against
  `pageData.facets.FEATURES[]` (`{id, label}`) present on the *same* page —
  but this only covers ~19 common ones, not exhaustive. Don't guess codes not
  in that list.
- `LANDMARK_DETAILS` — nearby places with `category` (Hospital/Shopping/
  Education/Transport/etc.) — good source for `localAmenities`/`transportation`.
- `RESERVED_PARKING` — JSON string like `{"C":2}` (C=Car, B=Bike)
- `DEPOSIT_TYPE`, `BROKERAGE` (flag, not amount), `AGE` (years)
- `PROPERTY_IMAGES` — real array of medium-res image URLs (confirmed non-empty)
- `CONTACT_NAME` / `CONTACT_COMPANY_NAME` — a name, never a real phone number

**Gotcha we hit and fixed:** don't set `ownerType: "Agent"` based on
`CONTACT_COMPANY_NAME` being present — nearly every 99acres listing has a
dealer name, and our schema *requires* a real `agentUserId` (an actual
registered ggnHome agent account) whenever `ownerType` is `"Agent"`. Scraped
listings never have one, so every insert failed validation until this was
changed to always store `ownerType: "Owner"`.

**Where the code lives:** `scraper99acres/scrape.js` (driver — sector loop,
CDP navigation, box-highlight visualization, page-scroll, Mongo writes) +
`scraper99acres/mapListing.js` (`mapListingToRentalProperty`,
`mapListingToSaleProperty` — pure field-mapping functions).

**Dedup:** before inserting, collect existing `sourceListingId` values for
`sourcePortal: "99acres"` already in the DB and skip anything already known.

---

## NoBroker

### Detail-page fetch — FULLY WORKING (used for enrichment + ongoing sync)

**No bot-blocking at all** for individual listing detail pages — plain HTTP
(`fetch`/`axios`/`curl`) gets a normal 200 with the full page, no browser
needed.

**The data:** the raw HTML embeds:
```html
<script>window.nb.appState = {...huge JSON...}</script>
```
Same balanced-brace extraction technique as 99acres, marker `nb.appState = `.
Real listing data lives at:
```
appState.propertyDetails.detailsData
```
Rich fields: `description`/`combineDescription`/`ownerDes`, `address`,
`nbLocality` (clean sector name, e.g. `"Sector 46"`), `society`, `street`,
`buildingType` (IH/AP codes), `bedrooms`, `bathroom`, `totalFloor`, `floor`,
`propertySize`, `propertyAge`, `furnishing`/`furnishingDesc`, `facing`/
`facingDesc`, `parkingDesc`, `balconies`, `rent`, `deposit`, `leaseType`,
`availableFrom` (epoch ms), `amenities` (bool map keyed `LIFT`/`GYM`/`POOL`/
etc.), `photos[]`, and `active` (boolean).

**How removal/delisting shows up:** NoBroker *always* returns HTTP 200, even
for a listing id that never existed — it just serves the generic homepage
shell with `detailsData: null`. So HTTP status is useless for detecting a
dead listing; the only reliable signal is `detailsData` being null (page
looks "gone") vs present with `active: false` (still listed, but marked
rented out).

**Used for:**
1. Enriching the 460 pre-existing shallow rental listings with full detail
   (one-off migration, already run — see backup file from that pass).
2. Ongoing active/inactive/removed sync —
   `ggnHome/server/scripts/nobrokerSync.js`, scheduled daily via
   `ggnHome/server/cron/nobrokerSyncCron.js`. Has two safety nets since a
   single bad fetch can look identical to a genuinely removed listing:
   - **Circuit breaker**: if an implausible fraction of listings in one run
     look "removed," abort the whole run with no writes (probably a block,
     not mass delisting).
   - **Two-strike confirmation**: only actually delete a listing after it's
     shown "removed" on two separate runs at least 12h apart.

### Search/discovery (finding brand-new listings we don't have yet) — NOT CRACKED YET

Unlike detail pages, NoBroker's search results are **not** server-rendered —
the search itself fires as a client-side XHR only after a locality is
selected from a Google-Places-backed autocomplete widget. This means
discovering new listings needs the real browser too, and here's exactly
where we're stuck:

- Real input: `#listPageSearchLocality`
- Real suggestion dropdown: `#autocomplete-dropdown-container div[role="option"]`
  (each has the address text inside `.address`)
- Typing the sector name alone (e.g. `"Sector 45"`, *not* `"Sector 45, Gurugram"` —
  adding the city confuses the ranking) correctly surfaces `"Sector 45, Haryana, India"`
  as the top suggestion.
- Confirmed the app *can* transition into a `"fetching_properties"` loading
  state and populate `window.nb.appState.resultScreenReducer.propertySearchData`
  live — but that update only exists in JS memory, **not** in the DOM's
  serialized HTML, so it must be read with `page.evaluate(() => window.nb.appState...)`,
  never `page.content()` (which is frozen at initial page load).
- **The actual blocker:** selecting a suggestion — via a normal Playwright
  `.click()`, a forced click, or keyboard `ArrowDown`+`Enter` — does not
  reliably register. After the attempt, both the input's value and
  `#selectedLocalities` come back empty, meaning no locality actually gets
  attached and the search never fires. Root cause not yet identified.

**Next things to try** (not yet attempted, in rough priority order):
1. Intercept network responses (`page.on('response')`) during a search
   attempt to find the actual backend API endpoint directly — if found, call
   it with the right params for every sector and skip the fragile UI
   entirely. (Attempted once already but the CDP connection timed out
   because the 99acres scrape was mid-run on the same debug port — retry
   when the browser isn't busy with another script.)
2. Drive real pixel-coordinate clicks via `page.mouse.click(x, y)` computed
   from the suggestion element's bounding box, instead of Playwright's
   locator-based click — in case the site's listener specifically wants a
   native pointer event at real screen coordinates.
3. Try a completely fresh tab/context per attempt in case some stale
   event-listener state from a previous interaction is interfering.

---

## Open items before "the full file of code"

- [ ] Crack NoBroker discovery (see above), or decide to accept NoBroker as
      "detail-enrichment + sync only" and rely on 99acres for finding new
      inventory going forward.
- [ ] Decide whether to also enrich the 193 pre-existing NoBroker *sale*
      listings the same way the 460 rentals were enriched (same shallow-field
      problem, not yet fixed).
- [ ] Sale-side sync (`nobrokerSync.js` currently only covers `RentalProperty`).
