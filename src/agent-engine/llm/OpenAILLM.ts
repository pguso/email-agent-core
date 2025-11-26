import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { Action } from "../core/Action.js";
import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from "../messages/index.js";
import { GenerationConfig } from "../types/GenerationConfig.js";

export interface OpenAILLMOptions {
    apiKey?: string;
    model: string;
    temperature?: number;
    topP?: number;
    maxTokens?: number;
    stopStrings?: string[];
    verbose?: boolean;
}

/**
 * OpenAILLM – A universal Action wrapper for the official OpenAI API.
 *
 * Mirrors the structure of LlamaCppLLM for 1:1 compatibility.
 */
export class OpenAILLM extends Action {
    private client: OpenAI;
    private readonly model: string;
    private readonly temperature: number;
    private readonly topP: number;
    private readonly maxTokens: number;
    private readonly stopStrings: string[];
    private readonly verbose: boolean;

    constructor(options: OpenAILLMOptions) {
        super();

        if (!options.model) {
            throw new Error("OpenAILLM: 'model' is required.");
        }

        this.client = new OpenAI({
            apiKey: options.apiKey ?? process.env.OPENAI_API_KEY,
        });

        this.model = options.model;
        this.temperature = options.temperature ?? 0.7;
        this.topP = options.topP ?? 1.0;
        this.maxTokens = options.maxTokens ?? 2048;
        this.stopStrings = options.stopStrings ?? [];
        this.verbose = options.verbose ?? false;
    }

    /**
     * Convert internal message objects to OpenAI's format
     */
    private toOpenAIMessages(messages: BaseMessage[]): ChatCompletionMessageParam[] {
        return messages.map((msg): ChatCompletionMessageParam => {
            switch (msg.type) {
                case "system":
                    return { role: "system" as const, content: msg.content };

                case "human":
                    return { role: "user" as const, content: msg.content };

                case "ai":
                    return { role: "assistant" as const, content: msg.content };

                case "tool":
                    return {
                        role: "tool" as const,
                        content: msg.content,
                        tool_call_id: (msg as any).toolCallId,
                    };

                default:
                    return { role: "user" as const, content: msg.content };
            }
        });
    }

    /**
     * Core generation method (like llama._execute)
     */
    async _execute(
        input: string | BaseMessage[],
        config: GenerationConfig = {}
    ): Promise<AIMessage> {
        let messages: BaseMessage[];

        // Normalize input
        if (typeof input === "string") {
            messages = [new HumanMessage(input)];
        } else {
            messages = input;
        }

        if (this.verbose) {
            console.log("OpenAILLM prompt:", messages);
        }

        const response = await this.client.chat.completions.create({
            model: config.model ?? this.model,
            messages: this.toOpenAIMessages(messages),
            temperature: config.temperature ?? this.temperature,
            top_p: config.topP ?? this.topP,
            max_tokens: config.maxTokens ?? this.maxTokens,
            stop: config.stopStrings ?? this.stopStrings,
        });

        const text = response.choices[0]?.message?.content ?? "";

        return new AIMessage(text);
    }

    /**
     * Batch processing
     */
    async runBatch(
        inputs: (string | BaseMessage[])[],
        config: GenerationConfig = {}
    ): Promise<AIMessage[]> {
        const results: AIMessage[] = [];

        for (const input of inputs) {
            results.push(await this._execute(input, config));
        }

        return results;
    }

    /**
     * Streaming output
     */
    async *streamOutput(
        input: string | BaseMessage[],
        config: GenerationConfig = {}
    ): AsyncGenerator<AIMessage> {
        let messages: BaseMessage[];

        if (typeof input === "string") {
            messages = [new HumanMessage(input)];
        } else {
            messages = input;
        }

        const stream = await this.client.chat.completions.create({
            model: config.model ?? this.model,
            messages: this.toOpenAIMessages(messages),
            temperature: config.temperature ?? this.temperature,
            top_p: config.topP ?? this.topP,
            max_tokens: config.maxTokens ?? this.maxTokens,
            stop: config.stopStrings ?? this.stopStrings,
            stream: true,
        });

        for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
                yield new AIMessage(delta, { chunk: true });
            }
        }
    }

    /**
     * Debug output
     */
    toString() {
        return `OpenAILLM(model=${this.model})`;
    }
}
