const { Client, Storage, Query } = require("node-appwrite");

module.exports = async ({ req, res, log, error }) => {
  try {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT || "https://sgp.cloud.appwrite.io/v1")
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const storage = new Storage(client);
    const bucketId = process.env.APPWRITE_STORAGE_BUCKET_ID || "6a8f4c4f0482bf2aa92d";

    // 1 hour ago
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    log(`Starting cleanup. Deleting files older than ${oneHourAgo} in bucket ${bucketId}`);

    let totalDeleted = 0;
    let hasMore = true;

    while (hasMore) {
      const files = await storage.listFiles(bucketId, [
        Query.lessThan("$createdAt", oneHourAgo),
        Query.limit(100)
      ]);

      if (files.files.length === 0) {
        hasMore = false;
        break;
      }

      for (const file of files.files) {
        await storage.deleteFile(bucketId, file.$id);
        log(`Deleted file: ${file.$id}`);
        totalDeleted++;
      }
    }

    log(`Cleanup finished successfully. Total files deleted: ${totalDeleted}`);
    return res.json({ success: true, deletedCount: totalDeleted });

  } catch (err) {
    error("Error during storage cleanup: " + err.message);
    return res.json({ success: false, message: err.message }, 500);
  }
};
