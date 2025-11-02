import { Client, Account, Databases } from "appwrite";

// Initialize the Appwrite client
const client = new Client()
  .setEndpoint(VITE_APPWRITE_PROJECT_ID)
  .setProject(VITE_APPWRITE_PROJECT_ID); 

// Create Appwrite service instances
export const account = new Account(client);
export const databases = new Databases(client);
export { client };
