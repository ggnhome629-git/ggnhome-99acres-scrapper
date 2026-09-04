const TENANT_LABELS = { FA: "Family", SW: "Single Women", SM: "Single Men", CL: "Company Lease" };

const FURNISHING_ITEM_LABELS = {
  Ac: "Air Conditioner",
  Gey: "Geyser",
  Fan: "Fan",
  Ref: "Refrigerator",
  Wtrpurfr: "Water Purifier",
  Kit: "Modular Kitchen",
  Chmny: "Chimney",
  Bed: "Bed",
  Ward: "Wardrobe",
  Wrd: "Wardrobe",
  Tv: "TV",
  Sofa: "Sofa",
  Micro: "Microwave",
  Wm: "Washing Machine",
  Dtable: "Dining Table",
  Curtain: "Curtains",
  Lights: "Lights",
};

const PROPERTY_TYPE_MAP = {
  "Residential Apartment": "apartment",
  "Builder Floor": "apartment",
  "Independent House/Villa": "house",
  "Studio Apartment": "apartment",
  "Serviced Apartments": "apartment",
  Villa: "villa",
  "Independent House": "house",
};

const PARKING_LABELS = { C: "Car", B: "Bike", O: "Open", CV: "Covered" };

function decodeFeatures(featuresCsv, featureLabelsById) {
  if (!featuresCsv) return [];
  return featuresCsv
    .split(",")
    .map((id) => featureLabelsById[id.trim()])
    .filter(Boolean);
}

function cleanSector(locality) {
  if (!locality) return "";
  return locality.replace(/,\s*Gurgaon\s*$/i, "").trim();
}

function buildAddress(prop, sector) {
  const parts = [prop.BUILDING_NAME || prop.SOCIETY_NAME, sector, prop.CITY].filter(
    (v, i, arr) => v && arr.indexOf(v) === i
  );
  return parts.join(", ");
}

function buildTitle(prop, sector) {
  const bhk = parseInt(prop.BEDROOM_NUM, 10);
  const sizeLabel = Number.isFinite(bhk) && bhk > 0 ? `${bhk} BHK` : prop.PROPERTY_TYPE || "Property";
  return sector ? `${sizeLabel} in ${sector}` : sizeLabel;
}

function decodeParking(reservedParkingJson) {
  if (!reservedParkingJson) return undefined;
  try {
    const obj = JSON.parse(reservedParkingJson);
    return Object.entries(obj)
      .map(([code, count]) => `${count} ${PARKING_LABELS[code] || code}`)
      .join(", ");
  } catch (e) {
    return undefined;
  }
}

function decodeOwnerType() {
  // Always "Owner" here regardless of whether 99acres shows a dealer/company
  // name — "Agent" in our schema means a real, registered ggnHome agent
  // account, and the schema requires a valid agentUserId whenever ownerType
  // is "Agent". Scraped listings have no such account, so setting "Agent"
  // would fail validation. This matches the same convention already used
  // for the NoBroker-sourced listings.
  return "Owner";
}

function pickLandmarksByCategory(landmarks, category) {
  if (!Array.isArray(landmarks)) return [];
  return landmarks.filter((l) => l.category === category).map((l) => l.name);
}

// Maps a 99acres search-result "property" object (from window.__initialData__ ->
// srp.pageData.properties[]) onto the RentalProperty schema. Only fields we have
// real data for are set — nothing here is fabricated for fields 99acres doesn't
// expose at the search-result level (e.g. exact street address, deposit amount).
function mapListingToRentalProperty(prop, featureLabelsById) {
  const sector = cleanSector(prop.LOCALITY);
  const bedrooms = parseInt(prop.BEDROOM_NUM, 10);
  const bathrooms = parseInt(prop.BATHROOM_NUM, 10);
  const totalFloors = parseInt(prop.TOTAL_FLOOR, 10);
  const floorForRent = parseInt(prop.FLOOR_NUM, 10);
  const balconies = parseInt(prop.BALCONY_NUM, 10);
  const sqft = parseFloat(prop.CARPET_SQFT || prop.MIN_AREA_SQFT || prop.MAX_AREA_SQFT);
  const rent = parseFloat(prop.MIN_PRICE || prop.MAX_PRICE);

  const furnishingAttrs = (prop.FORMATTED && prop.FORMATTED.FURNISHING_ATTRIBUTES) || "";
  const appliances = furnishingAttrs
    .split(",")
    .map((code) => FURNISHING_ITEM_LABELS[code.trim()] || code.trim())
    .filter(Boolean);

  const facingUsp = (prop.TOP_USPS || []).find((u) => /facing/i.test(u));
  const layoutParts = [];
  if (prop.FORMATTED && prop.FORMATTED.FURNISH_LABEL) layoutParts.push(prop.FORMATTED.FURNISH_LABEL);
  if (facingUsp) layoutParts.push(facingUsp);

  const occTypes = (prop.RENTAL_ATTRIBUTES && prop.RENTAL_ATTRIBUTES.occ_r) || "";
  const tenantRequirements = occTypes
    .split(",")
    .map((c) => TENANT_LABELS[c.trim()])
    .filter(Boolean)
    .join(", ");

  const communityFeatures = decodeFeatures(prop.FEATURES, featureLabelsById);

  const transportLandmarks = pickLandmarksByCategory(prop.LANDMARK_DETAILS, "Transport");
  const otherLandmarks = (prop.LANDMARK_DETAILS || [])
    .filter((l) => l.category !== "Transport")
    .map((l) => `${l.name} (${l.category})`);

  const doc = {
    title: buildTitle(prop, sector),
    description: prop.DESCRIPTION,
    address: buildAddress(prop, sector),
    Sector: sector,
    purpose: "Rent",
    monthlyRent: rent,
    ownerType: decodeOwnerType(prop),
    ownernumber: `https://www.99acres.com/${prop.PROP_DETAILS_URL}`,
    images: prop.PROPERTY_IMAGES && prop.PROPERTY_IMAGES.length ? prop.PROPERTY_IMAGES : [prop.PHOTO_URL].filter(Boolean),
    isActive: true,
    isPostedNew: true,
    sourcePortal: "99acres",
    sourceListingId: prop.PROP_ID,
    sourceUrl: `https://www.99acres.com/${prop.PROP_DETAILS_URL}`,
    sourceStatus: "active",
    sourceCheckedAt: new Date(),
  };

  if (PROPERTY_TYPE_MAP[prop.PROPERTY_TYPE]) doc.propertyType = PROPERTY_TYPE_MAP[prop.PROPERTY_TYPE];
  if (Number.isFinite(bedrooms) && bedrooms > 0) doc.bedrooms = bedrooms;
  if (Number.isFinite(bathrooms) && bathrooms > 0) doc.bathrooms = bathrooms;
  if (Number.isFinite(totalFloors) && totalFloors > 0) doc.totalFloors = totalFloors;
  if (Number.isFinite(floorForRent) && floorForRent >= 0) doc.floorForRent = floorForRent;

  const totalArea = {};
  if (Number.isFinite(sqft) && sqft > 0) totalArea.sqft = sqft;
  totalArea.configuration = Number.isFinite(bedrooms) && bedrooms > 0 ? `${bedrooms} BHK` : prop.PROPERTY_TYPE;
  doc.totalArea = totalArea;

  if (layoutParts.length) doc.layoutFeatures = layoutParts.join(", ");
  if (appliances.length) doc.appliances = appliances;
  if (prop.AGE) doc.conditionAge = /^\d+$/.test(prop.AGE) ? `${prop.AGE} years` : prop.AGE;
  const parkingLabel = decodeParking(prop.RESERVED_PARKING);
  if (parkingLabel) doc.parking = parkingLabel;
  if (Number.isFinite(balconies) && balconies > 0) {
    doc.outdoorSpace = `${balconies} Balcon${balconies > 1 ? "ies" : "y"}`;
  }
  if (prop.DEPOSIT_TYPE === "MULTIPLE") doc.securityDeposit = "Multiple months' rent (exact amount on request)";
  if (prop.BROKERAGE === "1") doc.otherFees = "Brokerage applicable";
  else if (prop.BROKERAGE === "0") doc.otherFees = "No brokerage";
  if (tenantRequirements) doc.tenantRequirements = tenantRequirements;
  if (communityFeatures.length) doc.communityFeatures = communityFeatures;
  if (transportLandmarks.length) doc.transportation = transportLandmarks.join(", ");
  if (otherLandmarks.length) doc.localAmenities = otherLandmarks.slice(0, 6).join("; ");

  return doc;
}

// Maps a 99acres search-result "property" object onto the (much smaller)
// SaleProperty schema — it only has title/description/price/totalArea/
// bedrooms/bathrooms/location/Sector/images plus the shared ownership and
// source-tracking fields, so most of the richer rental-only decoding above
// doesn't apply here.
function mapListingToSaleProperty(prop) {
  const sector = cleanSector(prop.LOCALITY);
  const bedrooms = parseInt(prop.BEDROOM_NUM, 10);
  const bathrooms = parseInt(prop.BATHROOM_NUM, 10);
  const sqft = parseFloat(prop.CARPET_SQFT || prop.MIN_AREA_SQFT || prop.MAX_AREA_SQFT);
  const price = parseFloat(prop.MIN_PRICE || prop.MAX_PRICE);

  const doc = {
    title: buildTitle(prop, sector),
    description: prop.DESCRIPTION,
    price,
    location: buildAddress(prop, sector),
    Sector: sector,
    ownerType: decodeOwnerType(),
    ownernumber: `https://www.99acres.com/${prop.PROP_DETAILS_URL}`,
    images: prop.PROPERTY_IMAGES && prop.PROPERTY_IMAGES.length ? prop.PROPERTY_IMAGES : [prop.PHOTO_URL].filter(Boolean),
    isActive: true,
    isPostedNew: true,
    sourcePortal: "99acres",
    sourceListingId: prop.PROP_ID,
    sourceUrl: `https://www.99acres.com/${prop.PROP_DETAILS_URL}`,
    sourceStatus: "active",
    sourceCheckedAt: new Date(),
  };

  const totalArea = {};
  if (Number.isFinite(sqft) && sqft > 0) totalArea.sqft = sqft;
  totalArea.configuration = Number.isFinite(bedrooms) && bedrooms > 0 ? `${bedrooms} BHK` : prop.PROPERTY_TYPE;
  doc.totalArea = totalArea;

  if (Number.isFinite(bedrooms) && bedrooms > 0) doc.bedrooms = bedrooms;
  if (Number.isFinite(bathrooms) && bathrooms > 0) doc.bathrooms = bathrooms;

  return doc;
}

module.exports = { mapListingToRentalProperty, mapListingToSaleProperty };
