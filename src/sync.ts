import { connectToDatabase, getCollection } from "./db/db";
import { anonymizeCustomer } from "./customers/anonymizer";

import {
  ChangeEvent,
  CustomerCollection,
  CustomerDocument,
} from "./types/types";
import { processBatch, processChangeEvent } from "./sync/processors";
import {
  clearLastTimestamp,
  getLastTimestamp,
  saveLastTimestamp,
} from "./sync/syncState";
import { checkMissedDocuments } from "./sync/checkMissedDoc";

/**
 * Starts a realtime sync process to watch for changes in the customers collection
 * and update the anonymized customers collection accordingly.
 *
 * @param {CustomerCollection} customers - The original customers collection.
 * @param {CustomerCollection} anonymizedCustomers - The anonymized customers collection.
 * @param {Date} lastTimestamp - The timestamp to start watching for changes from.
 * @returns {Promise<void>} A promise that resolves when the sync process is set up.
 */
const realtimeSync = async (
  customers: CustomerCollection,
  anonymizedCustomers: CustomerCollection,
  lastTimestamp: Date
): Promise<void> => {
  const pipeline = [
    {
      $match: {
        operationType: {
          $in: ["insert", "update", "delete", "drop", "dropDatabase"],
        },
      },
    },
    { $match: { "fullDocument.createdAt": { $gte: lastTimestamp } } },
  ];

  const changeStream = customers.watch<ChangeEvent>(pipeline);

  changeStream.on("change", (change: ChangeEvent) =>
    processChangeEvent(anonymizedCustomers, change)
  );
  changeStream.on("error", (error) => {
    console.error("Error in change stream:", error);
  });
  changeStream.on("end", () => {
    console.log("Change stream ended");
  });
  changeStream.on("close", () => {
    console.log("Change stream closed");
  });
  console.log("Realtime sync started");
};

/**
 * Performs a full synchronization of the customers collection to the anonymized collection.
 *
 * @param {CustomerCollection} customers - The original customers collection.
 * @param {CustomerCollection} anonymizedCustomers - The anonymized customers collection.
 * @returns {Promise<void>} A promise that resolves when the full sync is complete.
 */
const fullSync = async (
  customers: CustomerCollection,
  anonymizedCustomers: CustomerCollection
): Promise<void> => {
  await clearLastTimestamp();
  const cursor = customers.find();
  let batch: CustomerDocument[] = [];
  let lastTimestamp: Date | null = null;

  for await (const doc of cursor) {
    const anonymizedDoc = anonymizeCustomer(doc);
    batch.push(anonymizedDoc);

    if (batch.length === 1000) {
      await processBatch(anonymizedCustomers, batch);
      batch = [];
    }

    lastTimestamp = doc.createdAt;
  }

  if (batch.length > 0) {
    await processBatch(anonymizedCustomers, batch);
  }

  if (lastTimestamp) {
    await saveLastTimestamp(lastTimestamp);
  }

  console.log("Full sync completed");
};

/**
 * Main synchronization function that decides between full reindex or incremental sync.
 *
 * @param {CustomerCollection} customers - The original customers collection.
 * @param {CustomerCollection} anonymizedCustomers - The anonymized customers collection.
 * @param {boolean} fullReindex - Flag to determine if a full reindex should be performed.
 * @returns {Promise<void>} A promise that resolves when the sync process is complete.
 */
const syncCustomers = async (
  customers: CustomerCollection,
  anonymizedCustomers: CustomerCollection,
  fullReindex: boolean
): Promise<void> => {
  if (fullReindex) {
    await fullSync(customers, anonymizedCustomers);
  } else {
    const lastTimestamp = await getLastTimestamp();
    if (!lastTimestamp) {
      await fullSync(customers, anonymizedCustomers);
      await realtimeSync(customers, anonymizedCustomers, new Date(0));
    } else {
      const adjustedTimestamp = new Date(lastTimestamp.getTime() - 120000);
      await checkMissedDocuments(
        customers,
        anonymizedCustomers,
        adjustedTimestamp
      );
      await realtimeSync(customers, anonymizedCustomers, adjustedTimestamp);
    }
  }
};

/**
 * Initializes the database connection and starts the customer data synchronization process.
 *
 * @returns {Promise<void>}
 */
const main = async () => {
  try {
    const db = await connectToDatabase();
    const customers = getCollection<CustomerDocument>(db, "customers");
    const anonymizedCustomers = getCollection<CustomerDocument>(
      db,
      "anonymized_customers"
    );

    const fullReindex = process.argv.includes("--full-reindex");
    await syncCustomers(customers, anonymizedCustomers, fullReindex);
  } catch (error) {
    console.error("Error in main function:", error);
  }
};

main().catch(console.error);
