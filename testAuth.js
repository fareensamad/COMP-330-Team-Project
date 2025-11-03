// testAuth.js
import { registerUser, loginUser, logoutUser } from "./src/auth/auth.js";

async function main() {
  try {
    console.log("Creating user...");
    const user = await registerUser("test@example.com", "Password123", "Test User");

    console.log("Logging in...");
    const session = await loginUser("test@example.com", "Password123");

    console.log("Logging out...");
    await logoutUser();

    console.log("✅ All auth operations successful!");
  } catch (err) {
    console.error("❌ Auth test failed:", err.message);
  }
}

main();
