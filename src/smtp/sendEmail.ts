import nodemailer from "nodemailer";
import { loadEmailConfig } from "../config/loader.js";
import { resolveUser } from "../config/user.js";
import {SendEmailOptions, SendEmailResult} from "./types";

/**
 * Creates and returns a Nodemailer SMTP transport using the project config.
 */
function createSmtpTransport(config: ReturnType<typeof loadEmailConfig>) {
    return nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        requireTLS: true,
        auth: {
            user: config.smtp.user,
            pass: config.smtp.pass,
        },
        tls: { rejectUnauthorized: false },
    });
}

/**
 * Sends an email using SMTP settings defined in
 * the user's email-agent-core.config.json.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    const config = loadEmailConfig();

    const username = resolveUser(options.user, config);
    const recipient = options.to;

    if (!recipient) {
        throw new Error(`Missing required field "to".`);
    }

    const transporter = createSmtpTransport(config);

    const fromAddress = config.smtp.user || username;

    const info = await transporter.sendMail({
        from: fromAddress,
        to: recipient,
        subject: options.subject || "",
        text: options.text,
        html: options.html,
    });

    return {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
    };
}
