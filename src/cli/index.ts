#!/usr/bin/env node

import { runInit } from "./init.js";

const cmd = process.argv[2];

switch (cmd) {
  case "init":
    runInit();
    break;

  default:
    console.log("Unknown command. Usage: npx email-agent-core init");
}
