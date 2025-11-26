import { BaseMessage } from "./BaseMessage.js";

export class SystemMessage extends BaseMessage {
  get type() { return "system"; }

  toPromptFormat() {
    return {
      role: "system",
      content: this.content
    };
  }
}
