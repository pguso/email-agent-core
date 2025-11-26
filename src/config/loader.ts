import fs from "fs";
import path from "path";
import { EmailConfig } from "./types.js";

export function loadEmailConfig(): EmailConfig {
  const root = process.cwd();
  const file = path.join(root, "email-agent-core.config.json");

  if (!fs.existsSync(file)) {
    throw new Error("Missing email-agent-core.config.json. Run `npx email-agent-core init`.");
  }

  const raw = fs.readFileSync(file, "utf8");
  return JSON.parse(raw);
}
