import {Address} from "nodemailer/lib/mailer";

/**
 * Options for sending an email.
 */
export interface SendEmailOptions {
    user?: string;
    to: string;
    subject?: string;
    text?: string;
    html?: string;
}

/**
 * Normalized result from sending an email.
 */
export interface SendEmailResult {
    messageId: string;
    accepted: (string | Address)[];
    rejected: (string | Address)[];
}