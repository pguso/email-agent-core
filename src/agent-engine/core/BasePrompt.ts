import {Action, ActionContext} from "./Action.js";

export interface BasePromptOptions {
    inputVariables?: string[];
    partialVariables?: Record<string, any>;
}

/**
 * Base class for all prompt templates
 */
export abstract class BasePrompt extends Action {
    public inputVariables: string[];
    public partialVariables: Record<string, any>;

    constructor(options: BasePromptOptions = {}) {
        super();
        this.inputVariables = options.inputVariables ?? [];
        this.partialVariables = options.partialVariables ?? {};
    }

    /**
     * Render the prompt with values (must be implemented by subclasses)
     */
    abstract render(values: Record<string, any>): Promise<string>;

    /**
     * Action interface: run() calls this
     */
    async _execute(input: any, _context?: ActionContext): Promise<string> {
        return this.render(input);
    }

    /**
     * Validate required variables
     */
    protected validate(values: Record<string, any>): void {
        const merged = { ...this.partialVariables, ...values };
        const missing = this.inputVariables.filter(key => !(key in merged));

        if (missing.length > 0) {
            throw new Error(`Missing required input variables: ${missing.join(", ")}`);
        }
    }

    /**
     * Merge partial + user vars
     */
    protected mergeVariables(values: Record<string, any>): Record<string, any> {
        return { ...this.partialVariables, ...values };
    }
}
