import {Action, HumanMessage, SystemMessage, TemplatePrompt, LlamaCppLLM} from "../agent-engine/index.js";
import {ResponseContext} from "./types/ResponseContext.js";

/**
 * Default email response template.
 * The user can fully replace this via constructor injection.
 */
export const DEFAULT_RESPONSE_TEMPLATE = `
Hotel: {hotelName}
Guest Name: {guestName}
Request Type: {requestType}
{employeeLine}

Context:
- Rooms available: {roomsAvailable}
{suggestedPriceLine}
{checkInLine}
{checkOutLine}
{policyBlock}

Original Email:
{originalEmail}

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

/**
 * EmailResponseGenerator
 * Clean, extensible, template-driven LLM response generator.
 */
export class EmailResponseGenerator extends Action {
    private llm: LlamaCppLLM;
    private prompt: TemplatePrompt;

    constructor(
        llm: LlamaCppLLM,
        promptTemplate: TemplatePrompt = TemplatePrompt.fromTemplate(DEFAULT_RESPONSE_TEMPLATE)
    ) {
        super();
        this.llm = llm;
        this.prompt = promptTemplate;
    }

    /**
     * Transform raw context into variables for the template
     */
    private buildVariables(originalEmail: string, ctx: ResponseContext) {
        return {
            hotelName: ctx.hotelName,
            guestName: ctx.guestName ?? "Unknown",
            requestType: ctx.requestType,
            originalEmail,

            employeeLine: ctx.employeeName ? `Email is sent by: ${ctx.employeeName}` : "",

            roomsAvailable: ctx.roomsAvailable ? "Yes" : "No",
            suggestedPriceLine: ctx.suggestedPrice ? `- Suggested price: $${ctx.suggestedPrice}/night` : "",
            checkInLine: ctx.checkInDate ? `- Check-in: ${ctx.checkInDate}` : "",
            checkOutLine: ctx.checkOutDate ? `- Check-out: ${ctx.checkOutDate}` : "",

            policyBlock: ctx.roomsAvailable
                ? `
Hotel Policies:
- Check-in: ${ctx.hotelPolicies.checkInTime}
- Check-out: ${ctx.hotelPolicies.checkOutTime}
- Cancellation: ${ctx.hotelPolicies.cancellation}
`.trim()
                : "",
        };
    }

    /**
     * Execute LLM generation
     */
    async execute(input: { originalEmail: string; context: ResponseContext }): Promise<string> {
        const {originalEmail, context} = input;

        const variables = this.buildVariables(originalEmail, context);
        const finalPrompt = await this.prompt.run(variables);

        const response = await this.llm.run([
            new SystemMessage("You are a friendly and professional hotel receptionist writing an email response."),
            new HumanMessage(finalPrompt)
        ]);

        if (!response.content) {
            throw new Error("LLM returned empty response");
        }

        return response.content;
    }
}
