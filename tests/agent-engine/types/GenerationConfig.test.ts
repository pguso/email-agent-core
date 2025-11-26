import { describe, it, expect } from 'vitest';
import type { GenerationConfig } from '../../../src/agent-engine/types/GenerationConfig';

describe('GenerationConfig', () => {
  it('should accept a GenerationConfig with all properties', () => {
    const config: GenerationConfig = {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxTokens: 2048,
      repeatPenalty: 1.1,
      stopStrings: ['</s>', '\n\n'],
      clearHistory: true,
      seed: 42
    };

    expect(config.temperature).toBe(0.7);
    expect(config.topP).toBe(0.9);
    expect(config.topK).toBe(40);
    expect(config.maxTokens).toBe(2048);
    expect(config.repeatPenalty).toBe(1.1);
    expect(config.stopStrings).toEqual(['</s>', '\n\n']);
    expect(config.clearHistory).toBe(true);
    expect(config.seed).toBe(42);
  });

  it('should accept an empty GenerationConfig', () => {
    const config: GenerationConfig = {};

    expect(config.temperature).toBeUndefined();
    expect(config.topP).toBeUndefined();
    expect(config.topK).toBeUndefined();
    expect(config.maxTokens).toBeUndefined();
    expect(config.repeatPenalty).toBeUndefined();
    expect(config.stopStrings).toBeUndefined();
    expect(config.clearHistory).toBeUndefined();
    expect(config.seed).toBeUndefined();
  });

  it('should accept a GenerationConfig with partial properties', () => {
    const config: GenerationConfig = {
      temperature: 0.5,
      maxTokens: 1024
    };

    expect(config.temperature).toBe(0.5);
    expect(config.maxTokens).toBe(1024);
    expect(config.topP).toBeUndefined();
  });

  it('should accept stopStrings as an array', () => {
    const config: GenerationConfig = {
      stopStrings: ['STOP', 'END', 'QUIT']
    };

    expect(config.stopStrings).toHaveLength(3);
    expect(config.stopStrings).toContain('STOP');
  });
});
