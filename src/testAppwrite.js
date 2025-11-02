import { Client, Account } from "appwrite";

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const account = new Account(client);

// Example: check current session
async function ping() {
  try {
    const user = await account.get();
    console.log("Appwrite connected. Current user:", user);
  } catch (err) {
    console.error("Appwrite ping failed:", err);
  }
}

ping();
