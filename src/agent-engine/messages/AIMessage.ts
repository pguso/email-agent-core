import { BaseMessage } from "./BaseMessage.js";
import {ToolCall} from "../types/ToolCall";

export interface AIMessageKwargs {
  toolCalls?: ToolCall[];
  [key: string]: any;
}

export class AIMessage extends BaseMessage {
  public toolCalls: ToolCall[];

  constructor(
      content: string,
      additionalKwargs: AIMessageKwargs = {}
  ) {
    super(content, additionalKwargs);
    this.toolCalls = additionalKwargs.toolCalls ?? [];
  }

  get type(): string {
    return "ai";
  }

  hasToolCalls(): boolean {
    return this.toolCalls.length > 0;
  }

  toPromptFormat() {
    return {
      role: "assistant",
      content: this.content,
      tool_calls: this.toolCalls.length ? this.toolCalls : undefined,
    };
  }

  static fromJSON(json: any): AIMessage {
    return new AIMessage(json.content, {
      ...json,
      toolCalls: json.toolCalls ?? [],
    });
  }
}
