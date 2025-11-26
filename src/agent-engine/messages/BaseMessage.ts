export abstract class BaseMessage {
  public readonly id: string;
  public readonly timestamp: number;

  constructor(
      public content: string,
      public additionalKwargs: Record<string, any> = {}
  ) {
    this.timestamp = Date.now();
    this.id = this.generateId();
  }

  private generateId(): string {
    return `msg_${this.timestamp}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /** Subclasses must provide a type (e.g., "user", "system", "assistant") */
  abstract get type(): string;

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      type: this.type,
      content: this.content,
      timestamp: this.timestamp,
      ...this.additionalKwargs,
    };
  }

  /** Subclasses must implement fromJSON */
  static fromJSON(_json: any): BaseMessage {
    throw new Error("Implement in subclasses");
  }

  /** Subclasses must implement formatting for prompts */
  abstract toPromptFormat(): object;
}
