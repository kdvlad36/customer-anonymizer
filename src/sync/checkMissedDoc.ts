import { anonymizeCustomer } from "../customers/anonymizer";
import { CustomerCollection, CustomerDocument } from "../types/types";
import { processBatch } from "./processors";
import { saveLastTimestamp } from "./syncState";

/**
 * Checks for any documents that might have been missed during sync
 * and processes them in batches.
 *
 * @param {CustomerCollection} customers - The original customers collection.
 * @param {CustomerCollection} anonymizedCustomers - The anonymized customers collection.
 * @param {Date} lastTimestamp - The timestamp to start checking from.
 * @returns {Promise<void>} A promise that resolves when all missed documents are processed.
 */
export const checkMissedDocuments = async (
  customers: CustomerCollection,
  anonymizedCustomers: CustomerCollection,
  lastTimestamp: Date
) => {
  const cursor = customers.find({ createdAt: { $gte: lastTimestamp } });
  let batch: CustomerDocument[] = [];
  let maxTimestamp = lastTimestamp;

  for await (const doc of cursor) {
    const anonymizedDoc = anonymizeCustomer(doc);
    batch.push(anonymizedDoc);

    if (batch.length === 1000) {
      await processBatch(anonymizedCustomers, batch);
      batch = [];
    }

    if (doc.createdAt > maxTimestamp) {
      maxTimestamp = doc.createdAt;
    }
  }

  if (batch.length > 0) {
    await processBatch(anonymizedCustomers, batch);
  }

  await saveLastTimestamp(maxTimestamp);
};
