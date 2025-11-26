import Imap from "imap";
import { simpleParser } from "mailparser";
import {ImapBox, MessageParts} from "./types.js";

export function openInbox(imap: Imap): Promise<ImapBox> {
  return new Promise((resolve, reject) => {
    imap.openBox("INBOX", true, (err, box) => {
      if (err) reject(err);
      else resolve(box);
    });
  });
}

export function searchMessages(imap: Imap, criteria: any[]): Promise<number[]> {
  return new Promise((resolve, reject) => {
    imap.search(criteria, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

export function fetchMessages(imap: Imap, uids: number[]): Promise<MessageParts[]> {
  return new Promise((resolve, reject) => {
    const messages: MessageParts[] = [];
    if (!uids || uids.length === 0) return resolve([]);

    const f = imap.fetch(uids, { bodies: "", struct: true });
    let pending = 0;
    let ended = false;

    const finishIfDone = () => {
      if (ended && pending === 0) resolve(messages);
    };

    f.on("message", (msg, seqno) => {
      pending++;
      const parts: MessageParts = {
        seqno,
        parsed: undefined,
        parseError: undefined,
        attrs: undefined
      };

      msg.on("body", (stream: any) => {
        simpleParser(stream)
          .then((parsed) => (parts.parsed = parsed))
          .catch((e) => (parts.parseError = e))
          .finally(() => {
            pending--;
            finishIfDone();
          });
      });

      msg.once("attributes", (attrs) => (parts.attrs = attrs));

      msg.once("end", () => {
        messages.push(parts);
      });
    });

    f.once("error", reject);
    f.once("end", () => {
      ended = true;
      finishIfDone();
    });
  });
}

export function endConnection(imap: Imap): Promise<void> {
  return new Promise((resolve) => {
    try {
      imap.end();
    } catch {}
    resolve();
  });
}
