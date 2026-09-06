const fs = require("fs");
const path = require("path");
const { Client, Databases, Permission, Role } = require("node-appwrite");

const PROJECT_ID = "6a786172001351dc68bf";
const API_KEY = "standard_42d19a8f2bb2ae8f9dccf28cbee54b323a49b3f2215edceb03b171c5e4c4d8d88fc1322475f26402fbf101b041aec9857c6b4a8db2a833e55daa8e0090f405a04f96b53f4b2dbf59e3fc5ce0b8fcc6e912874d3aa9838233587516bd66da1a292da8a9dee9acea2be0cf489c2717f592345b7d93b86005a89447c4024adde4be";
const DB_ID = "6a789c5430b868b6d118";

const client = new Client()
  .setEndpoint("https://sgp.cloud.appwrite.io/v1")
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function setupTrackingPixels() {
  try {
    console.log("🚀 Starting TrackingPixels Collection Setup...");

    const permissions = [
      Permission.create(Role.any()),
      Permission.read(Role.any()),
      Permission.update(Role.any()),
      Permission.delete(Role.any()),
    ];

    // 1. Create Collection
    console.log("📝 Creating TrackingPixels Collection...");
    const col = await databases.createCollection(DB_ID, "unique()", "TrackingPixels", permissions);
    const COL_ID = col.$id;
    
    await databases.createStringAttribute(DB_ID, COL_ID, "ownerId", 255, true);
    await databases.createStringAttribute(DB_ID, COL_ID, "provider", 50, true);
    await databases.createStringAttribute(DB_ID, COL_ID, "pixelId", 255, false);
    await databases.createStringAttribute(DB_ID, COL_ID, "name", 100, true);
    await databases.createStringAttribute(DB_ID, COL_ID, "customScript", 4096, false);
    await databases.createBooleanAttribute(DB_ID, COL_ID, "active", false, true); // required=false, default=true
    await databases.createDatetimeAttribute(DB_ID, COL_ID, "createdAt", true);
    
    await sleep(2000); // Wait for attributes to create
    
    // Create Index for querying by owner
    await databases.createIndex(DB_ID, COL_ID, "ownerId_idx", "key", ["ownerId"]);
    console.log(`✅ TrackingPixels Collection created! ID: ${COL_ID}`);

    // 2. Update .env.local
    console.log("⚙️ Updating .env.local file...");
    const envPath = path.join(__dirname, "../.env.local");
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    
    if (!envContent.includes('NEXT_PUBLIC_APPWRITE_TRACKING_PIXELS_COL_ID')) {
        envContent += `\nNEXT_PUBLIC_APPWRITE_TRACKING_PIXELS_COL_ID=${COL_ID}\n`;
        fs.writeFileSync(envPath, envContent);
        console.log("✅ .env.local updated successfully!");
    } else {
        console.log("⚠️ .env.local already contains TrackingPixels env vars.");
    }

    console.log("🎉 All done! Tracking Pixels Backend Database is configured.");

  } catch (err) {
    console.error("❌ Error setting up Appwrite TrackingPixels tables:", err);
  }
}

setupTrackingPixels();
