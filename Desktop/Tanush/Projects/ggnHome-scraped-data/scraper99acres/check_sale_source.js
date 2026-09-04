const mongoose = require("../../ggnHome/server/node_modules/mongoose");
const SaleProperty = require("../../ggnHome/server/models/SaleProperty.model");

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const total = await SaleProperty.countDocuments();
  const withSourceUrl = await SaleProperty.countDocuments({ sourceUrl: { $exists: true, $ne: null } });
  const nobrokerByUrl = await SaleProperty.countDocuments({ sourceUrl: { $regex: "nobroker.in" } });
  const acresByUrl = await SaleProperty.countDocuments({ sourceUrl: { $regex: "99acres.com" } });

  console.log("Total sale docs:", total);
  console.log("With any sourceUrl already:", withSourceUrl);
  console.log("nobroker-pattern:", nobrokerByUrl, "| 99acres-pattern:", acresByUrl);

  if (withSourceUrl > 0) {
    const sample = await SaleProperty.findOne({ sourceUrl: { $exists: true, $ne: null } }).lean();
    console.log("Sample doc with sourceUrl:", JSON.stringify(sample, null, 2).slice(0, 1000));
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
