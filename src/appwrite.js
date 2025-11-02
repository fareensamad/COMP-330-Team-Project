import { Client, Account, Databases } from "appwrite";

// Initialize the Appwrite client
const client = new Client()
  .setEndpoint("https://nyc.cloud.appwrite.io/v1")
  .setProject("69041b6200090131a18b"); 

// Create Appwrite service instances
export const account = new Account(client);
export const databases = new Databases(client);
export { client };
