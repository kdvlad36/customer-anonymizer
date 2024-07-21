import { ObjectId, Collection, ChangeStreamDocument } from "mongodb";

/**
 * Represents a customer document in the database.
 *
 * @typedef {Object} CustomerDocument
 * @property {ObjectId} [_id] - The unique identifier for the customer.
 * @property {string} firstName - The first name of the customer.
 * @property {string} lastName - The last name of the customer.
 * @property {string} email - The email address of the customer.
 * @property {Object} address - The address of the customer.
 * @property {string} address.line1 - The first line of the customer's address.
 * @property {string} address.line2 - The second line of the customer's address.
 * @property {string} address.postcode - The postcode of the customer's address.
 * @property {string} address.city - The city of the customer's address.
 * @property {string} address.state - The state of the customer's address.
 * @property {string} address.country - The country of the customer's address.
 * @property {Date} createdAt - The date and time when the customer document was created.
 */
export type CustomerDocument = Readonly<{
  _id?: ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  address: Readonly<{
    line1: string;
    line2: string;
    postcode: string;
    city: string;
    state: string;
    country: string;
  }>;
  createdAt: Date;
}>;

/**
 * Represents a change event in the MongoDB change stream for CustomerDocument.
 *
 * @typedef {ChangeStreamDocument<CustomerDocument>} ChangeEvent
 */
export type ChangeEvent = ChangeStreamDocument<CustomerDocument>;

/**
 * Represents a MongoDB collection of CustomerDocument objects.
 *
 * @typedef {Collection<CustomerDocument>} CustomerCollection
 */
export type CustomerCollection = Collection<CustomerDocument>;
