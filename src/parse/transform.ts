import { ParsedMail } from "mailparser";

export function toFetchedEmail(mail: any) {
  const parsedMail = (mail.parsed || {}) as ParsedMail;
  const headerDate = parsedMail.date || parsedMail.headers?.get?.("date");

  return {
    uid: mail.attrs?.uid,
    date: headerDate ? new Date(headerDate.toString()) : null,
    from: parsedMail.from?.text || null,
    to: Array.isArray(parsedMail.to) ? parsedMail.to[0]?.text : parsedMail.to?.text || null,
    subject: parsedMail.subject || "(No Subject)",
    text: parsedMail.text || "",
    html: parsedMail.html || "",
    messageId: parsedMail.messageId || mail.attrs?.uid,
    flags: mail.attrs?.flags || []
  };
}
