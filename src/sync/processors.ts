import {
  CustomerCollection,
  CustomerDocument,
  ChangeEvent,
} from "../types/types";
import { anonymizeCustomer } from "../customers/anonymizer";
import { saveLastTimestamp } from "./syncState";

/**
 * Processes a batch of customer documents by inserting them into the anonymized collection.
 *
 * @param {CustomerCollection} anonymizedCustomers - The collection of anonymized customers.
 * @param {CustomerDocument[]} batch - The batch of customer documents to process.
 * @returns {Promise<void>} A promise that resolves when the batch has been processed.
 * @throws {Error} If there's an error during the insertion process.
 */
export const processBatch = async (
  anonymizedCustomers: CustomerCollection,
  batch: CustomerDocument[]
): Promise<void> => {
  if (batch.length > 0) {
    try {
      await anonymizedCustomers.insertMany(batch, { ordered: false });
    } catch (error: unknown) {
      if ((error as any).code === 11000) {
        for (const writeError of (error as any).writeErrors) {
          if (writeError.code !== 11000) {
            console.error(`Error inserting document: ${writeError.errmsg}`);
          }
        }
      } else {
        throw error;
      }
    }
  }
};

/**
 * Processes a single change event from the change stream.
 *
 * @param {CustomerCollection} anonymizedCustomers - The collection of anonymized customers.
 * @param {ChangeEvent} change - The change event to process.
 * @returns {Promise<void>} A promise that resolves when the change event has been processed.
 */
export const processChangeEvent = async (
  anonymizedCustomers: CustomerCollection,
  change: ChangeEvent
): Promise<void> => {
  try {
    switch (change.operationType) {
      case "insert":
      case "update":
        if (change.fullDocument) {
          const anonymizedCustomer = anonymizeCustomer(change.fullDocument);
          await processBatch(anonymizedCustomers, [anonymizedCustomer]);
          await saveLastTimestamp(change.fullDocument.createdAt);
        }
        break;
      default:
        console.log(`Unhandled change event type: ${change.operationType}`);
    }
  } catch (error) {
    console.error("Error processing change event:", error);
  }
};
