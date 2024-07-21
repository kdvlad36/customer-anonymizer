import { connectToDatabase, getCollection } from "./db/db";
import { generateAndInsertCustomers } from "./customers/generator";
import { CustomerDocument, CustomerCollection } from "./types/types";

/**
 * The main function that initializes the application.
 * It connects to the database, gets the customers collection,
 * and starts generating and inserting customer data.
 *
 * @returns {Promise<void>} A promise that resolves when the function completes.
 */
const main = async (): Promise<void> => {
  try {
    const db = await connectToDatabase();
    const customers: CustomerCollection = getCollection<CustomerDocument>(
      db,
      "customers"
    );
    await generateAndInsertCustomers(customers);
  } catch (error) {
    console.error(`Error in app: ${error}`);
  }
};

main().catch(console.log);
