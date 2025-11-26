import { describe, it, expect, vi } from 'vitest';
import type { PromptOptions } from '../../../src/agent-engine/types/PromptOptions';

describe('PromptOptions', () => {
  it('should accept PromptOptions with all required properties', () => {
    const options: PromptOptions = {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxTokens: 2048,
      repeatPenalty: 1.1,
      customStopTriggers: ['</s>', '\n\n']
    };

    expect(options.temperature).toBe(0.7);
    expect(options.topP).toBe(0.9);
    expect(options.topK).toBe(40);
    expect(options.maxTokens).toBe(2048);
    expect(options.repeatPenalty).toBe(1.1);
    expect(options.customStopTriggers).toEqual(['</s>', '\n\n']);
  });

  it('should accept PromptOptions with optional seed', () => {
    const options: PromptOptions = {
      temperature: 0.5,
      topP: 0.8,
      topK: 30,
      maxTokens: 1024,
      repeatPenalty: 1.0,
      customStopTriggers: [],
      seed: 42
    };

    expect(options.seed).toBe(42);
  });

  it('should accept PromptOptions with optional onTextChunk callback', () => {
    const callback = vi.fn();
    const options: PromptOptions = {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxTokens: 2048,
      repeatPenalty: 1.1,
      customStopTriggers: [],
      onTextChunk: callback
    };

    expect(options.onTextChunk).toBe(callback);
    options.onTextChunk?.('test chunk');
    expect(callback).toHaveBeenCalledWith('test chunk');
  });

  it('should accept PromptOptions with all properties including optionals', () => {
    const callback = vi.fn();
    const options: PromptOptions = {
      temperature: 0.8,
      topP: 0.95,
      topK: 50,
      maxTokens: 4096,
      repeatPenalty: 1.2,
      customStopTriggers: ['STOP', 'END'],
      seed: 123,
      onTextChunk: callback
    };

    expect(options.temperature).toBe(0.8);
    expect(options.topP).toBe(0.95);
    expect(options.topK).toBe(50);
    expect(options.maxTokens).toBe(4096);
    expect(options.repeatPenalty).toBe(1.2);
    expect(options.customStopTriggers).toEqual(['STOP', 'END']);
    expect(options.seed).toBe(123);
    expect(options.onTextChunk).toBe(callback);
  });

  it('should accept empty customStopTriggers array', () => {
    const options: PromptOptions = {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxTokens: 2048,
      repeatPenalty: 1.1,
      customStopTriggers: []
    };

    expect(options.customStopTriggers).toHaveLength(0);
  });
});
