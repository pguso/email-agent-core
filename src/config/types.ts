export interface ImapConfig {
  host: string;
  port: number;
  tls: boolean;
  user: string;
  pass: string;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
}

export interface EmailConfig {
  imap: ImapConfig;
  smtp: SmtpConfig;
}
