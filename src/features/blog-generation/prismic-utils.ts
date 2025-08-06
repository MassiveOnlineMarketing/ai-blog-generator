// Utility for Prismic UID existence check
import { PrismicPublisher } from '../../integrations/prismic/publication/prismic-publisher';

const publisher = new PrismicPublisher();

/**
 * Checks if a Prismic document with the given UID exists.
 * @param uid The Prismic UID to check
 * @returns Promise<boolean> true if exists, false otherwise
 */
export async function prismicUidExists(uid: string): Promise<boolean> {
  const result = await publisher["checkDocumentExists"](uid);
  return !!result;
}
