import fs from "fs";
import path from "path";
import { defaultConfig } from "../config/defaults.js";

export function runInit() {
  const dest = path.join(process.cwd(), "email-agent-core.config.json");

  if (fs.existsSync(dest)) {
    console.log("Config already exists at:", dest);
    return;
  }

  fs.writeFileSync(dest, JSON.stringify(defaultConfig, null, 2));
  console.log("Created:", dest);
}
