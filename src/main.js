// 1. Keep your imports at the very top of the file
const { Client, Messaging } = require("node-appwrite");

// In-memory counter for tracking brute-force attempts
let failedAttemptsCount = 0;

// 2. This is the main exported function block that Appwrite triggers
module.exports = async function (context) {
  // --- WRITE YOUR GATEKEEPER LOGIC HERE ---

  // Initialize the Appwrite Client using internal environment variables
  const client = new Client()
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const messaging = new Messaging(client);

  // Safely parse incoming data sent from your Vanilla JS UI fetch request
  let payload;
  try {
    payload = JSON.parse(context.req.body);
  } catch (err) {
    return context.res.json(
      { success: false, error: "Invalid request payload structure." },
      400,
    );
  }

  const { password, action } = payload;

  // This pulls your password from the hidden Environment Variables you set up in Settings
  const realPassword = process.env.MASTER_DASHBOARD_PASSWORD;

  // Password Check Execution
  if (password !== realPassword) {
    failedAttemptsCount++;

    if (failedAttemptsCount >= 3) {
      try {
        await messaging.createEmail(
          "SECURITY_ALERTS_PROVIDER", // Replace with your Appwrite Messaging provider ID
          "🚨 INTRUDER WARNING: ScySync Alert",
          "An unauthorized agent attempted to brute force your ScySync backup dashboard 3+ times.",
          ["your-personal-email@domain.com"], // Your email address
        );
        failedAttemptsCount = 0;
      } catch (mailError) {
        context.error("Failed to send email alert: " + mailError.message);
      }
    }

    return context.res.json(
      { success: false, error: "Access Denied. Keys mismatch." },
      401,
    );
  }

  // Success Loop
  failedAttemptsCount = 0;

  return context.res.json({
    success: true,
    message: "Authorization Cleared.",
    actionToken: Buffer.from(realPassword + Date.now()).toString("base64"),
  });
};
