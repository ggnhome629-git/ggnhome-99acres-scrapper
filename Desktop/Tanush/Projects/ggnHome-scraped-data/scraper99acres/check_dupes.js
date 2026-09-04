const mongoose = require("../../ggnHome/server/node_modules/mongoose");
const RentalProperty = require("../../ggnHome/server/models/Rentalproperty.model");

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const total = await RentalProperty.countDocuments({ sourcePortal: "99acres" });
  console.log("Total 99acres docs:", total);

  const dupes = await RentalProperty.aggregate([
    { $match: { sourcePortal: "99acres" } },
    { $group: { _id: "$sourceListingId", ids: { $push: "$_id" }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
  ]);

  console.log("Duplicate sourceListingId groups:", dupes.length);

  let removed = 0;
  for (const d of dupes) {
    const [, ...extras] = d.ids; // keep the first, remove the rest
    await RentalProperty.deleteMany({ _id: { $in: extras } });
    removed += extras.length;
  }
  console.log("Removed duplicate docs:", removed);

  const finalTotal = await RentalProperty.countDocuments({ sourcePortal: "99acres" });
  const activeCount = await RentalProperty.countDocuments({ sourcePortal: "99acres", isActive: true });
  console.log("Final total:", finalTotal, "| isActive true:", activeCount);

  const bySector = await RentalProperty.aggregate([
    { $match: { sourcePortal: "99acres" } },
    { $group: { _id: "$Sector", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  console.log("By sector:", JSON.stringify(bySector));

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
