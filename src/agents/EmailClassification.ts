import {Action, HumanMessage, LlamaCppLLM, SystemMessage} from "../agent-engine/index.js";
import {JsonOutputParser} from "../agent-engine/core/JsonParser.js";
import {EmailClassification} from "./types/EmailClassification.js";

/**
 * EmailClassifier
 *
 * A reusable Action that:
 * - builds a prompt
 * - calls LlamaCppLLM
 * - parses JSON using JsonOutputParser
 *
 * Fully composable inside your minimal framework.
 */
export class EmailClassifier extends Action {
    private llm: LlamaCppLLM;
    private parser: JsonOutputParser;

    constructor(llm: LlamaCppLLM) {
        super();
        this.llm = llm;

        // Optional: enforce schema
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
     * Convert subject/body into classification instructions
     */
    private buildPrompt(subject: string, body: string): string {
        return `
Analyze the following email and return ONLY valid JSON.

Required fields:
- category: booking | inquiry | complaint | cancellation | other
- priority: urgent | high | medium | low
- sentiment: positive | neutral | negative
- advert: boolean
- extractedInfo: { guestName?, checkIn?, checkOut?, roomType?, numberOfGuests? }
- suggestedAction: string
- confidence: number between 0.000–1.000

Email Subject: ${subject}
Email Body: ${body}

Respond ONLY with valid JSON.
`.trim();
    }

    /**
     * Execute classification
     */
    async execute(input: { subject: string; body: string }): Promise<EmailClassification> {
        const { subject, body } = input;

        const prompt = this.buildPrompt(subject, body);

        const response = await this.llm.run([
            new SystemMessage("You are an email classification assistant for a hotel."),
            new HumanMessage(prompt)
        ]);

        return this.parser.run(response.content);
    }
}
