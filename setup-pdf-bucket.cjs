const fs = require("fs");
const path = require("path");
const { Client, Storage, Permission, Role } = require("node-appwrite");

const PROJECT_ID = "6a786172001351dc68bf";
const API_KEY = "standard_42d19a8f2bb2ae8f9dccf28cbee54b323a49b3f2215edceb03b171c5e4c4d8d88fc1322475f26402fbf101b041aec9857c6b4a8db2a833e55daa8e0090f405a04f96b53f4b2dbf59e3fc5ce0b8fcc6e912874d3aa9838233587516bd66da1a292da8a9dee9acea2be0cf489c2717f592345b7d93b86005a89447c4024adde4be";

const client = new Client()
  .setEndpoint("https://sgp.cloud.appwrite.io/v1")
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const storage = new Storage(client);

async function setupBucket() {
  try {
    console.log("?? Creating PDF Bucket...");
    const permissions = [
      Permission.create(Role.any()),
      Permission.read(Role.any()),
      Permission.update(Role.any()),
      Permission.delete(Role.any()),
    ];

    const bucket = await storage.createBucket("unique()", "PDF Uploads", permissions, false, true, 50000000, ["pdf"], undefined, false, false);
    const BUCKET_ID = bucket.$id;
    console.log(`? Bucket created! ID: ${BUCKET_ID}`);

    let envContent = fs.readFileSync(path.join(__dirname, ".env.local"), "utf-8");
    if (!envContent.includes("NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID")) {
      envContent += `\nNEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID=${BUCKET_ID}\n`;
      fs.writeFileSync(path.join(__dirname, ".env.local"), envContent);
      console.log("? .env.local updated successfully!");
    }

  } catch (err) {
    console.error("? Error setting up Appwrite Bucket:", err);
  }
}

setupBucket();
