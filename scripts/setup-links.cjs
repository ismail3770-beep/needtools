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

async function setupLinks() {
  try {
    console.log("🚀 Starting Links Collection Setup...");

    const permissions = [
      Permission.create(Role.any()),
      Permission.read(Role.any()),
      Permission.update(Role.any()),
      Permission.delete(Role.any()),
    ];

    // 1. Create Links Collection
    console.log("📝 Creating Links Collection...");
    const linksCol = await databases.createCollection(DB_ID, "unique()", "Links", permissions);
    const LINKS_COL_ID = linksCol.$id;
    
    await databases.createStringAttribute(DB_ID, LINKS_COL_ID, "alias", 50, true);
    await databases.createStringAttribute(DB_ID, LINKS_COL_ID, "url", 2048, true);
    await databases.createStringAttribute(DB_ID, LINKS_COL_ID, "userId", 255, false);
    await databases.createStringAttribute(DB_ID, LINKS_COL_ID, "password", 255, false);
    await databases.createDatetimeAttribute(DB_ID, LINKS_COL_ID, "expiresAt", false);
    await databases.createDatetimeAttribute(DB_ID, LINKS_COL_ID, "createdAt", true);
    
    // Add Index for alias
    await sleep(2000); // Wait for attributes to create
    await databases.createIndex(DB_ID, LINKS_COL_ID, "alias_idx", "unique", ["alias"]);
    console.log(`✅ Links Collection created! ID: ${LINKS_COL_ID}`);

    // 2. Create LinkStats Collection
    console.log("📝 Creating LinkStats Collection...");
    const statsCol = await databases.createCollection(DB_ID, "unique()", "LinkStats", permissions);
    const STATS_COL_ID = statsCol.$id;

    await databases.createStringAttribute(DB_ID, STATS_COL_ID, "linkId", 50, true);
    await databases.createStringAttribute(DB_ID, STATS_COL_ID, "ip", 45, false);
    await databases.createStringAttribute(DB_ID, STATS_COL_ID, "country", 100, false);
    await databases.createStringAttribute(DB_ID, STATS_COL_ID, "city", 100, false);
    await databases.createStringAttribute(DB_ID, STATS_COL_ID, "device", 100, false);
    await databases.createStringAttribute(DB_ID, STATS_COL_ID, "browser", 100, false);
    await databases.createStringAttribute(DB_ID, STATS_COL_ID, "os", 100, false);
    await databases.createStringAttribute(DB_ID, STATS_COL_ID, "referrer", 2048, false);
    await databases.createDatetimeAttribute(DB_ID, STATS_COL_ID, "createdAt", true);
    
    // Add Index for linkId
    await sleep(2000); // Wait for attributes to create
    await databases.createIndex(DB_ID, STATS_COL_ID, "linkId_idx", "key", ["linkId"]);
    console.log(`✅ LinkStats Collection created! ID: ${STATS_COL_ID}`);

    // 3. Update .env.local
    console.log("⚙️ Updating .env.local file...");
    const envPath = path.join(__dirname, ".env.local");
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    if (!envContent.includes('NEXT_PUBLIC_APPWRITE_LINKS_COL_ID')) {
        envContent += `\nNEXT_PUBLIC_APPWRITE_LINKS_COL_ID=${LINKS_COL_ID}`;
        envContent += `\nNEXT_PUBLIC_APPWRITE_LINK_STATS_COL_ID=${STATS_COL_ID}\n`;
        fs.writeFileSync(envPath, envContent);
        console.log("✅ .env.local updated successfully!");
    } else {
        console.log("⚠️ .env.local already contains Links env vars.");
    }

    console.log("🎉 All done! URL Shortener Backend Database is configured.");

  } catch (err) {
    console.error("❌ Error setting up Appwrite Link tables:", err);
  }
}

setupLinks();
