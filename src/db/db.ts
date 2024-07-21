import { MongoClient, Db, Collection, Document } from "mongodb";
import * as dotenv from "dotenv";

let db: Db | null = null;

dotenv.config();
const DB_URI = process.env.DB_URI;

if (!DB_URI) {
  throw new Error("DB_URI is not defined in the environment variables");
}

/**
 *
 * Establishes a connection to the MongoDB database.
 *
 * @returns {Promise<Db>} A promise that resolves to the connected database instance.
 * @throws {Error} If the DB_URI is not defined or if there's an error connecting to the database.
 */
export const connectToDatabase = async (): Promise<Db> => {
  if (db) return db;

  const client = new MongoClient(DB_URI);
  try {
    await client.connect();
    db = client.db();

    return db;
  } catch (error) {
    console.log(`Error connecting to database: ${error}`);
    throw error;
  }
};

/**
 * Retrieves a collection from the database.
 *
 * @param {Db} db - The database instance.
 * @param {string} collectionName - The name of the collection to retrieve.
 * @returns {Collection<T>} The requested collection.
 */
export const getCollection = <T extends Document>(
  db: Db,
  collectionName: string
): Collection<T> => {
  return db.collection<T>(collectionName);
};
