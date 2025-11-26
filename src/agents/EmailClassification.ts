import {Action, HumanMessage, SystemMessage, LlamaCppLLM, TemplatePrompt} from "../agent-engine/index.js";
import { JsonOutputParser } from "../agent-engine/core/JsonParser.js";
import { EmailClassification } from "./types/EmailClassification.js";

/**
 * Default classification prompt template.
 * Can be fully replaced by user via constructor injection.
 */
export const DEFAULT_CLASSIFICATION_TEMPLATE = `
Analyze the following email and return ONLY valid JSON.

Required fields:
- category: booking | inquiry | complaint | cancellation | other
- priority: urgent | high | medium | low
- sentiment: positive | neutral | negative
- advert: boolean
- extractedInfo: {
    guestName?,
    checkIn?,
    checkOut?,
    roomType?,
    numberOfGuests?
}
- suggestedAction: string
- confidence: number between 0.000–1.000

Email Subject: {subject}
Email Body: {body}

Respond ONLY with valid JSON.
`.trim();

/**
 * EmailClassifier
 *
 * - Builds prompt from template
 * - Sends to LLM
 * - Parses JSON via JsonOutputParser
 */
export class EmailClassifier extends Action {
    private llm: LlamaCppLLM;
    private prompt: TemplatePrompt;
    private parser: JsonOutputParser;

    constructor(
        llm: LlamaCppLLM,
        promptTemplate: TemplatePrompt = TemplatePrompt.fromTemplate(DEFAULT_CLASSIFICATION_TEMPLATE)
    ) {
        super();
        this.llm = llm;
        this.prompt = promptTemplate;

        // JSON parser with optional schema
        this.parser = new JsonOutputParser({
            schema: {
                advert: "boolean",
                category: "string",
                priority: "string",
                sentiment: "string",
                extractedInfo: "object",
                suggestedAction: "string",
            }
        });
    }

    /**
     * Map input → template variables
     */
    private buildVariables(subject: string, body: string) {
        return {
            subject,
            body,
        };
    }

    /**
     * Execute classification
     */
    async execute(input: { subject: string; body: string }): Promise<EmailClassification> {
        const { subject, body } = input;

        const variables = this.buildVariables(subject, body);
        const finalPrompt = await this.prompt.run(variables);

        const response = await this.llm.run([
            new SystemMessage("You are an email classification assistant for a hotel."),
            new HumanMessage(finalPrompt)
        ]);

        return this.parser.run(response.content);
    }
}
