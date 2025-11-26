import { BasePrompt, BasePromptOptions } from "./BasePrompt.js";

export interface TemplatePromptOptions extends BasePromptOptions {
    template: string;
}

/**
 * Simple template prompt using {variable} placeholders
 */
export class TemplatePrompt extends BasePrompt {
    public template: string;

    constructor(options: TemplatePromptOptions) {
        super(options);
        this.template = options.template;

        // Auto-detect variables if not provided
        if (!options.inputVariables) {
            this.inputVariables = this.extractVariables(this.template);
        }
    }

    /**
     * Internal render implementation - replaces placeholders with values
     */
    protected async _render(values: Record<string, any>): Promise<string> {
        const merged = this.mergeVariables(values);

        let result = this.template;
        for (const [key, value] of Object.entries(merged)) {
            const regex = new RegExp(`\\{${key}\\}`, "g");
            result = result.replace(regex, String(value));
        }

        return result;
    }

    /**
     * Extract {variable} tokens from template
     */
    private extractVariables(template: string): string[] {
        const matches = template.match(/\{(\w+)\}/g) ?? [];
        return matches.map(v => v.slice(1, -1));
    }

    /**
     * Create directly from template string
     */
    static fromTemplate(template: string, options: Partial<TemplatePromptOptions> = {}): TemplatePrompt {
        return new TemplatePrompt({
            template,
            ...options
        } as TemplatePromptOptions);
    }
}
