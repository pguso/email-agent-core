import { BaseMessage } from "./BaseMessage.js";

export class HumanMessage extends BaseMessage {
  get type() { return "human"; }

  toPromptFormat() {
    return {
      role: "user",
      content: this.content
    };
  }
}
