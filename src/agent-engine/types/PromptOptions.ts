export interface PromptOptions {
    temperature: number;
    topP: number;
    topK: number;
    maxTokens: number;
    repeatPenalty: number;
    customStopTriggers: string[];
    seed?: number;
    onTextChunk?: (chunk: string) => void;
}