export interface LlamaCppLLMOptions {
    modelPath: string;
    temperature?: number;
    topP?: number;
    topK?: number;
    maxTokens?: number;
    repeatPenalty?: number;
    contextSize?: number;
    batchSize?: number;
    verbose?: boolean;
    stopStrings?: string[];
    chatWrapper?: any;
}