const { Client, Storage } = require("node-appwrite");
const { InputFile } = require("node-appwrite/file");
const { compressPdf } = require("@caijinglong/pdf-compress/node");

module.exports = async ({ req, res, log, error }) => {
  if (req.method === "GET") {
    return res.send("Appwrite PDF Compressor Function is running!");
  }

  try {
    let payload = {};
    const bodyToParse = req.bodyRaw || req.bodyString || req.body;
    if (typeof bodyToParse === "string") {
      try {
        payload = JSON.parse(bodyToParse);
      } catch (e) {
        payload = {};
      }
    } else {
      payload = bodyToParse || {};
    }

    const fileId = payload.fileId;
    const bucketId = payload.bucketId;
    const compressionLevel = parseFloat(payload.compressionLevel) || 0.6;
    const resolutionScale = parseFloat(payload.resolutionScale) || 1.5;

    if (!fileId || !bucketId) {
      return res.json({ success: false, message: "Missing fileId or bucketId" }, 400);
    }

    log(`Initializing Appwrite Client for project ${process.env.APPWRITE_FUNCTION_PROJECT_ID}`);
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT || "https://sgp.cloud.appwrite.io/v1")
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID || "6a786172001351dc68bf")
      .setKey(process.env.APPWRITE_API_KEY);

    const storage = new Storage(client);

    log(`Downloading file ${fileId} from bucket ${bucketId}...`);
    const fileBuffer = await storage.getFileDownload(bucketId, fileId);
    log(`File downloaded. Size: ${fileBuffer.byteLength} bytes. Starting compression...`);

    const result = await compressPdf(fileBuffer, {
      quality: compressionLevel, // e.g. 0.6 for medium, 0.3 for high compression
      maxWidth: Math.floor(700 * resolutionScale), // more aggressive max width (default UI 2.0 -> 1400px)
      maxHeight: Math.floor(700 * resolutionScale),
      jpegOnly: true, // convert massive PNGs to JPEG inside PDF
      skipImagesWithAlpha: false,
    });

    log(`Compression finished. Original: ${result.summary.originalBytes}, Compressed: ${result.summary.compressedBytes}`);

    const outputData = (result.summary.compressedBytes < result.summary.originalBytes && result.data) 
      ? result.data 
      : fileBuffer;

    log(`Uploading compressed file back to bucket...`);
    const compressedFile = await storage.createFile(
      bucketId,
      "unique()",
      InputFile.fromBuffer(Buffer.from(outputData), "compressed.pdf")
    );

    log(`Upload complete. New File ID: ${compressedFile.$id}`);

    return res.json({
      success: true,
      originalFileId: fileId,
      compressedFileId: compressedFile.$id,
      summary: result.summary,
    });
  } catch (err) {
    error("Error during PDF compression: " + err.message);
    return res.json({ success: false, message: err.message }, 500);
  }
};
