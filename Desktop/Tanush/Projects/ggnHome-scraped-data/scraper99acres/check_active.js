const mongoose = require("../../ggnHome/server/node_modules/mongoose");
const RentalProperty = require("../../ggnHome/server/models/Rentalproperty.model");

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const total = await RentalProperty.countDocuments({ sourcePortal: "99acres" });
  const active = await RentalProperty.countDocuments({ sourcePortal: "99acres", isActive: true });
  const inactive = await RentalProperty.countDocuments({ sourcePortal: "99acres", isActive: { $ne: true } });

  console.log("Total 99acres docs:", total);
  console.log("isActive true:", active);
  console.log("isActive NOT true:", inactive);

  if (inactive > 0) {
    const res = await RentalProperty.updateMany(
      { sourcePortal: "99acres", isActive: { $ne: true } },
      { $set: { isActive: true } }
    );
    console.log("Fixed to isActive:true ->", res.modifiedCount);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
