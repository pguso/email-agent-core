export interface GenerationConfig {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxTokens?: number;
    repeatPenalty?: number;
    stopStrings?: string[];
    clearHistory?: boolean;
    seed?: number;
    model?: string;
}