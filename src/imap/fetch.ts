import { loadEmailConfig } from "../config/loader.js";
import { EmailImapClient } from "./client.js";
import { toFetchedEmail } from "../parse/transform.js";

export async function fetchLatestEmails(limit = 10) {
  const config = loadEmailConfig();
  const client = new EmailImapClient(config.imap);

  await client.connect();
  const messages = await client.fetchLatest(limit);

  return messages.map(toFetchedEmail);
}
