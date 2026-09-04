const mongoose = require("../../ggnHome/server/node_modules/mongoose");

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  const mb = (bytes) => (bytes / (1024 * 1024)).toFixed(3);

  const dbStats = await db.command({ dbStats: 1 }); // raw bytes
  console.log("=== Database stats ===");
  console.log(`dataSize: ${mb(dbStats.dataSize)} MB`);
  console.log(`storageSize: ${mb(dbStats.storageSize)} MB`);
  console.log(`indexSize: ${mb(dbStats.indexSize)} MB`);
  console.log(`totalSize (storage+index): ${mb(dbStats.storageSize + dbStats.indexSize)} MB`);
  console.log(`collections: ${dbStats.collections}, objects: ${dbStats.objects}`);

  const collections = await db.listCollections().toArray();
  console.log("\n=== Per-collection stats ===");
  for (const c of collections) {
    try {
      const stats = await db.command({ collStats: c.name });
      console.log(
        `${c.name}: count=${stats.count}, avgObjSize=${(stats.avgObjSize || 0)} bytes, storageSize=${mb(stats.storageSize)} MB, totalIndexSize=${mb(stats.totalIndexSize)} MB`
      );
    } catch (e) {
      console.log(`${c.name}: (could not get stats: ${e.message})`);
    }
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
