import {Action, HumanMessage, LlamaCppLLM, SystemMessage} from "../agent-engine";
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
    private buildPrompt(originalEmail: string, ctx: ResponseContext): string {
        return `
Hotel: ${ctx.hotelName}
Guest Name: ${ctx.guestName ?? "Unknown"}
Request Type: ${ctx.requestType}

Context:
- Rooms available: ${ctx.roomsAvailable ? "Yes" : "No"}
${ctx.suggestedPrice ? `- Suggested price: $${ctx.suggestedPrice}/night` : ""}
${ctx.checkInDate ? `- Check-in: ${ctx.checkInDate}` : ""}
${ctx.checkOutDate ? `- Check-out: ${ctx.checkOutDate}` : ""}

${
            ctx.roomsAvailable
                ? `
Hotel Policies:
- Check-in: ${ctx.hotelPolicies.checkInTime}
- Check-out: ${ctx.hotelPolicies.checkOutTime}
- Cancellation: ${ctx.hotelPolicies.cancellation}
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
    async execute(input: {
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
