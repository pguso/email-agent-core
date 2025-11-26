import {Action, ActionContext} from "./Action.js";

/**
 * Base class for all output parsers
 * Transforms LLM text output into structured data
 */
export abstract class BaseOutputParser extends Action {
    public readonly name: string;

    constructor() {
        super();
        this.name = this.constructor.name;
    }

    /**
     * Parse the LLM output into structured data
     * Must be implemented by subclasses
     */
    abstract parse(text: string): Promise<any>;

    /**
     * Get instructions for the LLM on how to format output
     */
    getFormatInstructions(): string {
        return "";
    }

    /**
     * Runnable interface: parse the output
     */
    async _execute(
        input: string | { content: string },
        _config?: ActionContext
    ): Promise<any> {
        const text =
            typeof input === "string" ? input : input.content;

        return this.parse(text);
    }

    /**
     * Parse with error handling
     */
    async parseWithPrompt(text: string, prompt: string): Promise<any> {
        try {
            return await this.parse(text);
        } catch (error: any) {
            throw new OutputParserException(
                `Failed to parse output from prompt: ${error.message}`,
                text,
                error
            );
        }
    }
}

/**
 * Exception thrown when parsing fails
 */
export class OutputParserException extends Error {
    public llmOutput: string;
    public originalError: unknown;

    constructor(message: string, llmOutput: string, originalError: unknown) {
        super(message);
        this.name = "OutputParserException";
        this.llmOutput = llmOutput;
        this.originalError = originalError;
    }
}
