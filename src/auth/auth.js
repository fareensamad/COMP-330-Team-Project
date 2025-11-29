import 'dotenv/config';
import { Client, Account } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID);

const account = new Account(client);

// --- Sign up user ---
export async function registerUser(email, password, name) {
  try {
    const user = await account.create("unique()", email, password, name);
    console.log("✅ User created:", user);
    return user;
  } catch (err) {
    console.error("❌ Failed to create user:", err.message);
    throw err;
  }
}

// --- Log in user ---
export async function loginUser(email, password) {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    console.log("✅ Login successful:", session);
    return session;
  } catch (err) {
    console.error("❌ Login failed:", err.message);
    throw err;
  }
}

// --- Log out user ---
export async function logoutUser() {
  try {
    await account.deleteSession('current');
    console.log("✅ Logged out");
  } catch (err) {
    console.error("❌ Logout failed:", err.message);
    throw err;
  }
}
