import { EmailConfig } from "./types.js";

export const defaultConfig: EmailConfig = {
  imap: {
    host: "imap.example.com",
    port: 993,
    tls: true,
    user: "",
    pass: ""
  },
  smtp: {
    host: "smtp.example.com",
    port: 587,
    secure: false,
    user: "",
    pass: ""
  }
};
