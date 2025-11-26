import { ParsedMail } from "mailparser";

export function toFetchedEmail(m: any) {
  const p = (m.parsed || {}) as ParsedMail;
  const headerDate = p.date || p.headers?.get?.("date");

  return {
    uid: m.attrs?.uid,
    date: headerDate ? new Date(headerDate.toString()) : null,
    from: p.from?.text || null,
    to: Array.isArray(p.to) ? p.to[0]?.text : p.to?.text || null,
    subject: p.subject || "(No Subject)",
    text: p.text || "",
    html: p.html || "",
    messageId: p.messageId || m.attrs?.uid,
    flags: m.attrs?.flags || []
  };
}
