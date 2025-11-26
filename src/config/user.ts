import { EmailConfig } from "./types.js";

/**
 * Resolves the username to use for IMAP/SMTP.
 * Priority:
 *  1. Explicit user passed in function call
 *  2. IMAP user from config
 *  3. SMTP user from config
 */
export function resolveUser(
    providedUser: string | undefined,
    config: EmailConfig
): string {
    const resolved =
        providedUser ||
        config.imap?.user ||
        config.smtp?.user ||
        undefined;

    if (!resolved) {
        throw new Error(
            `[email-agent-core] No user provided.\n` +
            `You must either:\n` +
            `- pass { user: "you@example.com" } to your function, or\n` +
            `- set "imap.user" or "smtp.user" inside email-agent-core.config.json`
        );
    }

    return resolved;
}
