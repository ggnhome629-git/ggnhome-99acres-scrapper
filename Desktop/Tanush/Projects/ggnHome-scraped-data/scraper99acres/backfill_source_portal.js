const mongoose = require("../../ggnHome/server/node_modules/mongoose");
const RentalProperty = require("../../ggnHome/server/models/Rentalproperty.model");

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const res = await RentalProperty.updateMany(
    { sourceUrl: { $regex: "nobroker.in" }, sourcePortal: { $ne: "nobroker" } },
    { $set: { sourcePortal: "nobroker" } }
  );
  console.log("Backfilled sourcePortal=nobroker on", res.modifiedCount, "docs");

  const grouped = await RentalProperty.aggregate([
    { $group: { _id: "$sourcePortal", count: { $sum: 1 } } },
  ]);
  console.log("Now grouped by sourcePortal:", JSON.stringify(grouped));

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
