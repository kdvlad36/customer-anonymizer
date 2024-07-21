import { CustomerDocument } from "../types/types";

/**
 * Anonymizes a given string value using a simple hashing algorithm.
 *
 * @param {string} value - The string to be anonymized.
 * @returns {string} An anonymized version of the input string.
 */
const anonymizeValue = (value: string): string => {
  const hash = Array.from(value)
    .reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0)
    .toString();

  return Array.from({ length: 8 }, (_, i) => {
    const code = Math.abs(parseInt(hash.slice(i * 4, (i + 1) * 4), 16)) % 62;
    if (code < 26) return String.fromCharCode(code + 65);
    if (code < 52) return String.fromCharCode(code - 26 + 97);
    return String.fromCharCode(code - 52 + 48);
  }).join("");
};

/**
 * Anonymizes a customer document by replacing sensitive information with anonymized values.
 *
 * @param {CustomerDocument} customer - The customer document to be anonymized.
 * @returns {CustomerDocument} An anonymized version of the input customer document.
 */
export const anonymizeCustomer = (
  customer: CustomerDocument
): CustomerDocument => {
  const anonymizedCustomer = {
    ...customer,
    firstName: anonymizeValue(customer.firstName),
    lastName: anonymizeValue(customer.lastName),
    email: `${anonymizeValue(customer.email.split("@")[0])}@${
      customer.email.split("@")[1]
    }`,
    address: {
      ...customer.address,
      line1: anonymizeValue(customer.address.line1),
      line2: anonymizeValue(customer.address.line2),
      postcode: anonymizeValue(customer.address.postcode),
    },
  };

  return anonymizedCustomer;
};
