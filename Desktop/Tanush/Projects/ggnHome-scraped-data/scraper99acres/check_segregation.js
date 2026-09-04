const mongoose = require("../../ggnHome/server/node_modules/mongoose");
const RentalProperty = require("../../ggnHome/server/models/Rentalproperty.model");

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const bySourcePortal = await RentalProperty.aggregate([
    { $group: { _id: "$sourcePortal", count: { $sum: 1 } } },
  ]);
  console.log("Grouped by sourcePortal field:", JSON.stringify(bySourcePortal));

  const nobrokerByUrl = await RentalProperty.countDocuments({ sourceUrl: { $regex: "nobroker.in" } });
  const acresByUrl = await RentalProperty.countDocuments({ sourceUrl: { $regex: "99acres.com" } });
  const noSourceUrl = await RentalProperty.countDocuments({ sourceUrl: { $exists: false } });
  console.log("By sourceUrl pattern -> nobroker:", nobrokerByUrl, "| 99acres:", acresByUrl, "| no sourceUrl (manual):", noSourceUrl);

  const sample = await RentalProperty.findOne({ sourceUrl: { $regex: "nobroker.in" } }).select(
    "sourcePortal sourceUrl sourceListingId"
  );
  console.log("Sample NoBroker doc tagging:", JSON.stringify(sample));

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
