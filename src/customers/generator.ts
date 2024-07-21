import { faker } from "@faker-js/faker";
import { CustomerDocument, CustomerCollection } from "../types/types";
import { ObjectId } from "mongodb";

/**
 * Generates a single customer document with random data.
 *
 * @returns {CustomerDocument} A customer document with randomly generated data.
 */
const generateCustomer = (): CustomerDocument => ({
  _id: new ObjectId(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email(),
  address: {
    line1: faker.address.streetAddress(),
    line2: faker.address.secondaryAddress(),
    postcode: faker.address.zipCode(),
    city: faker.address.city(),
    state: faker.address.state(),
    country: faker.address.countryCode(),
  },
  createdAt: new Date(),
});

/**
 * Generates a batch of customer documents.
 *
 * @param {number} size - The number of customer documents to generate.
 * @returns {CustomerDocument[]} An array of generated customer documents.
 */
const generateCustomerBatch = (size: number): CustomerDocument[] =>
  Array.from({ length: size }, generateCustomer);

/**
 * Continuously generates and inserts customer documents into the database.
 *
 * @param {CustomerCollection} customers - The collection to insert customers into.
 * @returns {Promise<void>} A promise that never resolves (runs indefinitely).
 */
export const generateAndInsertCustomers = async (
  customers: CustomerCollection
): Promise<void> => {
  while (true) {
    try {
      const batchSize = Math.floor(Math.random() * 10) + 1;
      const batch = generateCustomerBatch(batchSize);

      await customers.insertMany(batch);

      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error) {
      console.error("Error generating and inserting customers:", error);
      // You might want to add a delay here before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};
