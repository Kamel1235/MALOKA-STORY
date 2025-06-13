import { MongoClient, Db } from 'mongodb';

// IMPORTANT: Replace this with your actual connection string, ideally from an environment variable.
// For Netlify, you would set MONGODB_URI in your site's environment variables.
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://kamel60:wwee2233@kamel.yt9mxta.mongodb.net/?retryWrites=true&w=majority&appName=Kamel';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI);
  cachedClient = client;

  try {
    await client.connect();
    // It's good practice to specify the database name in the connection string or here.
    // If your connection string already specifies the database (e.g., /dbname),
    // you can omit it here or ensure it matches.
    // Let's assume the database name is part of the connection string or you want to use a default one.
    // If not, you might need to pass it or configure it, e.g., client.db("yourDbName")
    const dbName = new URL(MONGODB_URI).pathname.substring(1) || 'default_db_name_if_not_in_uri';
    const db = client.db(dbName);
    cachedDb = db;
    return { client, db };
  } catch (error) {
    cachedClient = null; // Reset cache on error
    cachedDb = null;
    console.error('Failed to connect to MongoDB', error);
    throw new Error('Failed to connect to MongoDB');
  }
}

// Example usage (optional, for testing or demonstration):
// async function example() {
//   try {
//     const { db } = await connectToDatabase();
//     // Perform database operations
//     console.log('Successfully connected to database:', db.databaseName);
//   } catch (error) {
//     console.error('Error in example usage:', error);
//   }
// }
// example();
