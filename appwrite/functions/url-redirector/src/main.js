import { Client, Databases, Query, ID } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  // Initialize Appwrite client
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);
  const databaseId = process.env.APPWRITE_DB_ID || '6a789c5430b868b6d118';
  const linksColId = process.env.APPWRITE_LINKS_COL_ID;
  const statsColId = process.env.APPWRITE_LINK_STATS_COL_ID;

  // Extract alias from path, removing leading slash
  // Example path: "/my-alias" -> "my-alias"
  const alias = req.path.replace(/^\/+/g, '').split('/')[0];

  if (!alias) {
    return res.text('Alias not provided', 400);
  }

  try {
    // Look up the alias in the Links collection
    const links = await databases.listDocuments(
      databaseId,
      linksColId,
      [Query.equal('alias', alias), Query.limit(1)]
    );

    if (links.total === 0) {
      // Alias not found
      return res.text('Link not found', 404);
    }

    const linkDoc = links.documents[0];
    const destinationUrl = linkDoc.url;

    // Optional: Check if expired
    if (linkDoc.expiresAt && new Date(linkDoc.expiresAt) < new Date()) {
      return res.text('Link expired', 410);
    }

    // Record stats asynchronously (do not block redirect)
    // Extract headers for stats
    const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || '';
    const userAgent = req.headers['user-agent'] || '';
    const referrer = req.headers['referer'] || '';
    
    // In Appwrite 1.4+, country might be passed via CF headers or Appwrite's own headers
    const country = req.headers['cf-ipcountry'] || req.headers['x-country'] || '';

    // Create stat record
    await databases.createDocument(
      databaseId,
      statsColId,
      ID.unique(),
      {
        linkId: alias,
        ip: ip.substring(0, 45), // Limit IP length
        browser: userAgent.substring(0, 100), // Simple truncation, ideally parse User-Agent
        referrer: referrer.substring(0, 2048),
        country: country,
        createdAt: new Date().toISOString()
      }
    ).catch(err => {
      error(`Failed to record stat for ${alias}: ${err.message}`);
    });

    // 301 Permanent Redirect or 302 Found
    // Using 301 is usually better for SEO, but dynamic links often use 302
    return res.redirect(destinationUrl, 301);

  } catch (err) {
    error(`Error redirecting alias ${alias}: ${err.message}`);
    return res.text('Internal Server Error', 500);
  }
};
