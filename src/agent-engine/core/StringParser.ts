import { BaseOutputParser } from "./BaseParser.js";

export interface StringOutputParserOptions {
  stripMarkdown?: boolean;
}

/**
 * Parser that returns cleaned string output
 * Strips whitespace and optionally removes markdown
 */
export class StringOutputParser extends BaseOutputParser {
  private stripMarkdown: boolean;

  constructor(options: StringOutputParserOptions = {}) {
    super();
    this.stripMarkdown = options.stripMarkdown ?? true;
  }

  /**
   * Parse: clean the text
   */
  async parse(text: string): Promise<string> {
    let cleaned = text.trim();

    if (this.stripMarkdown) {
      cleaned = this.stripMarkdownCodeBlocks(cleaned);
    }

    return cleaned;
  }

  /**
   * Remove markdown code blocks (```code```)
   */
  private stripMarkdownCodeBlocks(text: string): string {
    return text.replace(/```[\w]*\n([\s\S]*?)\n```/g, "$1").trim();
  }

  getFormatInstructions(): string {
    return "Respond with plain text. No markdown formatting.";
  }
}
