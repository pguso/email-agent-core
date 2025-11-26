import { describe, it, expect } from 'vitest';
import type { LlamaCppLLMOptions } from '../../../src/agent-engine/types/LlamaCppLLMOptions';

describe('LlamaCppLLMOptions', () => {
  it('should accept LlamaCppLLMOptions with all properties', () => {
    const options: LlamaCppLLMOptions = {
      modelPath: '/path/to/model.gguf',
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxTokens: 2048,
      repeatPenalty: 1.1,
      contextSize: 4096,
      batchSize: 512,
      verbose: true,
      stopStrings: ['</s>'],
      chatWrapper: {}
    };

    expect(options.modelPath).toBe('/path/to/model.gguf');
    expect(options.temperature).toBe(0.7);
    expect(options.topP).toBe(0.9);
    expect(options.topK).toBe(40);
    expect(options.maxTokens).toBe(2048);
    expect(options.repeatPenalty).toBe(1.1);
    expect(options.contextSize).toBe(4096);
    expect(options.batchSize).toBe(512);
    expect(options.verbose).toBe(true);
    expect(options.stopStrings).toEqual(['</s>']);
    expect(options.chatWrapper).toBeDefined();
  });

  it('should accept LlamaCppLLMOptions with only required modelPath', () => {
    const options: LlamaCppLLMOptions = {
      modelPath: '/path/to/model.gguf'
    };

    expect(options.modelPath).toBe('/path/to/model.gguf');
    expect(options.temperature).toBeUndefined();
    expect(options.verbose).toBeUndefined();
  });

  it('should accept LlamaCppLLMOptions with partial optional properties', () => {
    const options: LlamaCppLLMOptions = {
      modelPath: './model.gguf',
      temperature: 0.8,
      contextSize: 2048,
      verbose: false
    };

    expect(options.modelPath).toBe('./model.gguf');
    expect(options.temperature).toBe(0.8);
    expect(options.contextSize).toBe(2048);
    expect(options.verbose).toBe(false);
    expect(options.topP).toBeUndefined();
  });

  it('should accept chatWrapper as any type', () => {
    const options: LlamaCppLLMOptions = {
      modelPath: '/model.gguf',
      chatWrapper: { format: 'chatml' }
    };

    expect(options.chatWrapper).toEqual({ format: 'chatml' });
  });
});
