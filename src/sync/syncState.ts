import { connectToDatabase, getCollection } from "../db/db";

/**
 * Saves the last processed timestamp to the database.
 *
 * @param {Date} timestamp - The timestamp to save.
 * @returns {Promise<void>} A promise that resolves when the timestamp has been saved.
 */
export const saveLastTimestamp = async (timestamp: Date): Promise<void> => {
  try {
    const db = await connectToDatabase();
    const syncState = getCollection<{ _id: string; timestamp: Date }>(
      db,
      "syncState"
    );
    await syncState.updateOne(
      { _id: "lastTimestamp" },
      { $set: { timestamp } },
      { upsert: true }
    );
  } catch (error) {
    console.error("Error saving last timestamp:", error);
  }
};

/**
 * Retrieves the last processed timestamp from the database.
 *
 * @returns {Promise<Date | null>} A promise that resolves to the last timestamp or null if not found.
 */
export const getLastTimestamp = async (): Promise<Date | null> => {
  try {
    const db = await connectToDatabase();
    const syncState = getCollection<{ _id: string; timestamp: Date }>(
      db,
      "syncState"
    );
    const state = await syncState.findOne({ _id: "lastTimestamp" });
    console.log(
      `Loaded last timestamp: ${state ? state.timestamp.toISOString() : "null"}`
    );
    return state ? state.timestamp : null;
  } catch (error) {
    console.error("Error getting last timestamp:", error);
    return null;
  }
};

/**
 * Clears the last processed timestamp from the database.
 *
 * @returns {Promise<void>} A promise that resolves when the timestamp has been cleared.
 */
export const clearLastTimestamp = async (): Promise<void> => {
  try {
    const db = await connectToDatabase();
    const syncState = getCollection<{ _id: string; timestamp: Date }>(
      db,
      "syncState"
    );
    await syncState.deleteOne({ _id: "lastTimestamp" });
  } catch (error) {
    console.error("Error clearing last timestamp:", error);
  }
};
