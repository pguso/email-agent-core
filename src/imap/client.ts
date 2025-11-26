import Imap from "imap";
import { EmailConfig } from "../config/types.js";
import { openInbox, searchMessages, fetchMessages, endConnection } from "./helpers.js";

export class EmailImapClient {
  private imap;

  constructor(private config: EmailConfig["imap"]) {
    this.imap = new Imap({
      user: config.user,
      password: config.pass,
      host: config.host,
      port: config.port,
      tls: config.tls,
      autotls: "always",
      tlsOptions: { rejectUnauthorized: false }
    });
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.once("ready", resolve);
      this.imap.once("error", reject);
      this.imap.connect();
    });
  }

  async fetchLatest(limit = 10) {
    await openInbox(this.imap);
    const uids = await searchMessages(this.imap, ["ALL"]);
    const last = uids.sort((a, b) => a - b).slice(-limit);
    const msgs = await fetchMessages(this.imap, last);
    await endConnection(this.imap);
    return msgs;
  }

  async disconnect() {
    this.imap.end();
  }
}
