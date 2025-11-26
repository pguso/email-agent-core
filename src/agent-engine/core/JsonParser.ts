import { BaseOutputParser, OutputParserException } from "./BaseParser.js";

export type JsonSchema = Record<string, "string" | "number" | "boolean" | "object" | "array">;

export interface JsonOutputParserOptions {
  schema?: JsonSchema;
}

/**
 * Parser that extracts JSON from LLM output
 * Handles markdown code blocks and extra text
 */
export class JsonOutputParser extends BaseOutputParser {
  private readonly schema?: JsonSchema;

  constructor(options: JsonOutputParserOptions = {}) {
    super();
    this.schema = options.schema;
  }

  /**
   * Parse JSON from text
   */
  async parse(text: string): Promise<any> {
    try {
      const jsonText = this.extractJson(text);
      const parsed = JSON.parse(jsonText);

      if (this.schema) {
        this.validateSchema(parsed);
      }

      return parsed;
    } catch (error: any) {
      throw new OutputParserException(
          `Failed to parse JSON: ${error.message}`,
          text,
          error
      );
    }
  }

  /**
   * Extract JSON from text (handles markdown, extra text)
   */
  private extractJson(text: string): string {
    const trimmed = text.trim();

    // Try direct parse
    try {
      JSON.parse(trimmed);
      return trimmed;
    } catch {
      /* fall through */
    }

    // Try Markdown code block
    const markdownMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (markdownMatch) {
      return markdownMatch[1].trim();
    }

    // Try object-looking JSON
    const jsonObjectMatch = text.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      return jsonObjectMatch[0];
    }

    // Try array-looking JSON
    const jsonArrayMatch = text.match(/\[[\s\S]*\]/);
    if (jsonArrayMatch) {
      return jsonArrayMatch[0];
    }

    return trimmed;
  }

  /**
   * Validate parsed JSON against schema
   */
  private validateSchema(parsed: any): void {
    if (!this.schema) return;

    for (const [key, type] of Object.entries(this.schema)) {
      if (!(key in parsed)) {
        throw new Error(`Missing required field: ${key}`);
      }

      const actualType = Array.isArray(parsed[key])
          ? "array"
          : typeof parsed[key];

      if (actualType !== type) {
        throw new Error(`Field ${key} should be ${type}, got ${actualType}`);
      }
    }
  }

  getFormatInstructions(): string {
    let instructions = "Respond with valid JSON.";

    if (this.schema) {
      const schemaDesc = Object.entries(this.schema)
          .map(([key, type]) => `"${key}": ${type}`)
          .join(", ");

      instructions += ` Schema: { ${schemaDesc} }`;
    }

    return instructions;
  }
}
