const fs = require("fs");
const path = require("path");
const { Client, Databases, Permission, Role } = require("node-appwrite");

const PROJECT_ID = "6a786172001351dc68bf";
const API_KEY = "standard_42d19a8f2bb2ae8f9dccf28cbee54b323a49b3f2215edceb03b171c5e4c4d8d88fc1322475f26402fbf101b041aec9857c6b4a8db2a833e55daa8e0090f405a04f96b53f4b2dbf59e3fc5ce0b8fcc6e912874d3aa9838233587516bd66da1a292da8a9dee9acea2be0cf489c2717f592345b7d93b86005a89447c4024adde4be";

const client = new Client()
  .setEndpoint("https://sgp.cloud.appwrite.io/v1")
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

// Helper to wait
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function setupAppwrite() {
  try {
    console.log("🚀 Starting Appwrite Auto-Setup...");

    // 1. Create Database
    console.log("📦 Creating Database...");
    const db = await databases.create("unique()", "NeedTools DB");
    const DB_ID = db.$id;
    console.log(`✅ Database created! ID: ${DB_ID}`);

    // Permissions (Anyone can create, read, and update - for public tools)
    const permissions = [
      Permission.create(Role.any()),
      Permission.read(Role.any()),
      Permission.update(Role.any()),
    ];

    // 2. Create Contact Collection
    console.log("📝 Creating Contact Collection...");
    const contactCol = await databases.createCollection(DB_ID, "unique()", "Contact", permissions);
    const CONTACT_ID = contactCol.$id;
    
    // Add Contact Attributes
    await databases.createStringAttribute(DB_ID, CONTACT_ID, "name", 255, true);
    await databases.createEmailAttribute(DB_ID, CONTACT_ID, "email", true);
    await databases.createStringAttribute(DB_ID, CONTACT_ID, "subject", 255, true);
    await databases.createStringAttribute(DB_ID, CONTACT_ID, "message", 2000, true);
    await databases.createDatetimeAttribute(DB_ID, CONTACT_ID, "createdAt", true);
    console.log(`✅ Contact Collection created! ID: ${CONTACT_ID}`);

    // 3. Create Feedback Collection
    console.log("📝 Creating Feedback Collection...");
    const feedbackCol = await databases.createCollection(DB_ID, "unique()", "Feedback", permissions);
    const FEEDBACK_ID = feedbackCol.$id;

    // Add Feedback Attributes
    await databases.createStringAttribute(DB_ID, FEEDBACK_ID, "toolSlug", 255, true);
    await databases.createBooleanAttribute(DB_ID, FEEDBACK_ID, "isHelpful", true);
    await databases.createStringAttribute(DB_ID, FEEDBACK_ID, "comment", 1000, false);
    await databases.createDatetimeAttribute(DB_ID, FEEDBACK_ID, "createdAt", true);
    console.log(`✅ Feedback Collection created! ID: ${FEEDBACK_ID}`);

    // 4. Create Stats Collection
    console.log("📝 Creating Stats Collection...");
    const statsCol = await databases.createCollection(DB_ID, "unique()", "Stats", permissions);
    const STATS_ID = statsCol.$id;

    // Add Stats Attributes
    await databases.createStringAttribute(DB_ID, STATS_ID, "toolSlug", 255, true);
    await databases.createIntegerAttribute(DB_ID, STATS_ID, "usageCount", false, 0, 999999999, 1);
    await databases.createDatetimeAttribute(DB_ID, STATS_ID, "lastUsedAt", true);
    console.log(`✅ Stats Collection created! ID: ${STATS_ID}`);

    // 5. Update .env.local
    console.log("⚙️ Updating .env.local file...");
    const envContent = `# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_PROJECT_ID=${PROJECT_ID}
NEXT_PUBLIC_APPWRITE_DATABASE_ID=${DB_ID}
NEXT_PUBLIC_APPWRITE_CONTACT_COL_ID=${CONTACT_ID}
NEXT_PUBLIC_APPWRITE_FEEDBACK_COL_ID=${FEEDBACK_ID}
NEXT_PUBLIC_APPWRITE_STATS_COL_ID=${STATS_ID}
`;

    fs.writeFileSync(path.join(__dirname, ".env.local"), envContent);
    console.log("✅ .env.local updated successfully!");

    console.log("🎉 All done! The Appwrite Database is perfectly configured.");

  } catch (err) {
    console.error("❌ Error setting up Appwrite:", err);
  }
}

setupAppwrite();
