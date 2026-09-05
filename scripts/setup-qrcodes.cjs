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

async function setupQrCodes() {
  try {
    console.log("🚀 Starting QR Codes Collection Setup...");

    const permissions = [
      Permission.create(Role.any()),
      Permission.read(Role.any()),
      Permission.update(Role.any()),
    ];

    // 1. Create QRCodes Collection
    console.log("📝 Creating QRCodes Collection...");
    const qrCol = await databases.createCollection(DB_ID, "unique()", "QRCodes", permissions);
    const QR_COL_ID = qrCol.$id;
    
    await databases.createStringAttribute(DB_ID, QR_COL_ID, "shortId", 50, true);
    await databases.createStringAttribute(DB_ID, QR_COL_ID, "destinationUrl", 2048, true);
    await databases.createStringAttribute(DB_ID, QR_COL_ID, "payloadData", 10000, false);
    await databases.createStringAttribute(DB_ID, QR_COL_ID, "ownerToken", 255, false);
    await databases.createBooleanAttribute(DB_ID, QR_COL_ID, "isDynamic", true);
    await databases.createDatetimeAttribute(DB_ID, QR_COL_ID, "createdAt", true);
    
    // Add Index for shortId
    await sleep(2000); // Wait for attributes to create
    await databases.createIndex(DB_ID, QR_COL_ID, "shortId_idx", "unique", ["shortId"]);
    console.log(`✅ QRCodes Collection created! ID: ${QR_COL_ID}`);

    // 2. Create QRScans Collection
    console.log("📝 Creating QRScans Collection...");
    const scansCol = await databases.createCollection(DB_ID, "unique()", "QRScans", permissions);
    const SCANS_COL_ID = scansCol.$id;

    await databases.createStringAttribute(DB_ID, SCANS_COL_ID, "qrId", 50, true);
    await databases.createStringAttribute(DB_ID, SCANS_COL_ID, "userAgent", 1000, false);
    await databases.createStringAttribute(DB_ID, SCANS_COL_ID, "country", 100, false);
    await databases.createDatetimeAttribute(DB_ID, SCANS_COL_ID, "scannedAt", true);
    
    // Add Index for qrId
    await sleep(2000); // Wait for attributes to create
    await databases.createIndex(DB_ID, SCANS_COL_ID, "qrId_idx", "key", ["qrId"]);
    console.log(`✅ QRScans Collection created! ID: ${SCANS_COL_ID}`);

    // 3. Update .env.local
    console.log("⚙️ Updating .env.local file...");
    const envPath = path.join(__dirname, ".env.local");
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    if (!envContent.includes('NEXT_PUBLIC_APPWRITE_QR_COL_ID')) {
        envContent += `\nNEXT_PUBLIC_APPWRITE_QR_COL_ID=${QR_COL_ID}`;
        envContent += `\nNEXT_PUBLIC_APPWRITE_QR_SCANS_COL_ID=${SCANS_COL_ID}\n`;
        fs.writeFileSync(envPath, envContent);
        console.log("✅ .env.local updated successfully!");
    } else {
        console.log("⚠️ .env.local already contains QR env vars.");
    }

    console.log("🎉 All done! QR Code Backend Database is configured.");

  } catch (err) {
    console.error("❌ Error setting up Appwrite QR tables:", err);
  }
}

setupQrCodes();
