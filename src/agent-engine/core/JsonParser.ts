import { BaseOutputParser, OutputParserException } from "./BaseParser.js";

export type JsonSchema = Record<
    string,
    "string" | "number" | "boolean" | "object" | "array"
>;

export interface JsonOutputParserOptions {
  schema?: JsonSchema;
}

/**
 * Robust JSON parser for LLM output.
 * - Extracts JSON from text, code blocks, or mixed output
 * - Repairs truncated JSON
 * - Ensures correct opening/closing braces
 */
export class JsonOutputParser extends BaseOutputParser {
  private readonly schema?: JsonSchema;

  constructor(options: JsonOutputParserOptions = {}) {
    super();
    this.schema = options.schema;
  }

  async parse(text: string): Promise<any> {
    try {
      const extracted = this.extractJson(text);
      const repaired = this.repairJson(extracted);

      const parsed = JSON.parse(repaired);

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
   * Extract JSON from raw LLM output.
   */
  private extractJson(text: string): string {
    const trimmed = text.trim();

    if (!trimmed) return "{}";

    // direct JSON attempt
    try {
      JSON.parse(trimmed);
      return trimmed;
    } catch {}

    // capture JSON code block
    const block = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
    if (block) return block[1].trim();

    // find largest {...} region
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) return objectMatch[0];

    // find largest [...] region
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) return arrayMatch[0];

    // fallback: maybe LLM returned key:value pairs without braces
    if (text.includes(":")) {
      return `{${text}}`;
    }

    // fallback: empty or invalid — return empty object
    return "{}";
  }

  /**
   * Repair common LLM JSON mistakes:
   * - Missing closing braces
   * - Trailing commas
   * - Incomplete arrays
   */
  private repairJson(json: string): string {
    let repaired = json.trim();

    // fix trailing commas: { "a": 1, }
    repaired = repaired.replace(/,\s*([}\]])/g, "$1");

    // ensure even number of braces
    const openCurly = (repaired.match(/\{/g) || []).length;
    const closeCurly = (repaired.match(/\}/g) || []).length;

    if (openCurly > closeCurly) {
      repaired += "}".repeat(openCurly - closeCurly);
    }

    const openSquare = (repaired.match(/\[/g) || []).length;
    const closeSquare = (repaired.match(/\]/g) || []).length;

    if (openSquare > closeSquare) {
      repaired += "]".repeat(openSquare - closeSquare);
    }

    return repaired;
  }

  /**
   * Validate against schema if provided.
   */
  private validateSchema(parsed: any): void {
    if (!this.schema) return;

    for (const [key, type] of Object.entries(this.schema)) {
      if (!(key in parsed)) {
        throw new Error(`Missing required field: ${key}`);
      }

      const actual =
          Array.isArray(parsed[key]) ? "array" : typeof parsed[key];

      if (actual !== type) {
        throw new Error(
            `Field "${key}" should be ${type}, got ${actual}`
        );
      }
    }
  }

  getFormatInstructions(): string {
    let instructions = "Respond ONLY with valid JSON.";

    if (this.schema) {
      const schemaDesc = Object.entries(this.schema)
          .map(([key, type]) => `"${key}": ${type}`)
          .join(", ");
      instructions += ` Schema: { ${schemaDesc} }`;
    }

    return instructions;
  }
}
