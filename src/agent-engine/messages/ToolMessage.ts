import { BaseMessage } from "./BaseMessage.js";

export interface ToolMessageKwargs {
  [key: string]: any;
}

export class ToolMessage extends BaseMessage {
  public toolCallId: string;

  constructor(
      content: string,
      toolCallId: string,
      additionalKwargs: ToolMessageKwargs = {}
  ) {
    super(content, additionalKwargs);
    this.toolCallId = toolCallId;
  }

  get type(): string {
    return "tool";
  }

  toPromptFormat() {
    return {
      role: "tool",
      content: this.content,
      tool_call_id: this.toolCallId,
    };
  }

  static fromJSON(json: any): ToolMessage {
    return new ToolMessage(json.content, json.tool_call_id, { ...json });
  }
}
