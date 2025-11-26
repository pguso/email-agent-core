import {Action, HumanMessage, LlamaCppLLM, SystemMessage} from "../agent-engine/index.js";
import {ResponseContext} from "./types/ResponseContext.js";

/**
 * Generates a warm, professional hotel email response.
 *
 * This is the class-based, reusable version of `generateResponse()`.
 */
export class EmailResponseGenerator extends Action {
    private llm: LlamaCppLLM;

    constructor(llm: LlamaCppLLM) {
        super();
        this.llm = llm;
    }

    /**
     * Build the LLM prompt from input + context
     */
    private buildPrompt(originalEmail: string, context: ResponseContext): string {
        return `
Hotel: ${context.hotelName}
Guest Name: ${context.guestName ?? "Unknown"}
Request Type: ${context.requestType}

${context?.employeeName ? `Email is sent by: ${context.employeeName}`: ""}

Context:
- Rooms available: ${context.roomsAvailable ? "Yes" : "No"}
${context.suggestedPrice ? `- Suggested price: $${context.suggestedPrice}/night` : ""}
${context.checkInDate ? `- Check-in: ${context.checkInDate}` : ""}
${context.checkOutDate ? `- Check-out: ${context.checkOutDate}` : ""}

${
            context.roomsAvailable
                ? `
Hotel Policies:
- Check-in: ${context.hotelPolicies.checkInTime}
- Check-out: ${context.hotelPolicies.checkOutTime}
- Cancellation: ${context.hotelPolicies.cancellation}
`
                : ""
        }

Original Email:
${originalEmail}

Write a warm, professional response that:
1. Thanks them for their interest
2. Addresses their specific request
3. Provides availability and pricing (if applicable)
4. Mentions relevant policies
5. Invites them to ask questions
6. Includes a clear call-to-action

DO NOT respond in markdown.
DO NOT mention or suggest any other hotels.
Tone: friendly, professional, concise, helpful.
`.trim();
    }

    /**
     * Execute: generate the actual email reply
     */
    async _execute(input: {
        originalEmail: string;
        context: ResponseContext;
    }): Promise<string> {
        const {originalEmail, context} = input;

        const prompt = this.buildPrompt(originalEmail, context);

        const response = await this.llm.run([
            new SystemMessage(
                "You are a friendly and professional hotel receptionist writing an email response."
            ),
            new HumanMessage(prompt),
        ]);

        if (!response.content) {
            throw new Error("LLM returned empty response");
        }

        return response.content;
    }
}
