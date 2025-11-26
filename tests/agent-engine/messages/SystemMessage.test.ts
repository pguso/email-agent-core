import { describe, it, expect } from 'vitest';
import { SystemMessage } from '../../../src/agent-engine/messages/SystemMessage';

describe('SystemMessage', () => {
  it('should create a system message with content', () => {
    const message = new SystemMessage('You are a helpful assistant');

    expect(message.content).toBe('You are a helpful assistant');
    expect(message.type).toBe('system');
    expect(message.id).toBeDefined();
    expect(message.timestamp).toBeDefined();
  });

  it('should format to prompt format with system role', () => {
    const message = new SystemMessage('System instructions');
    const format = message.toPromptFormat();

    expect(format).toEqual({
      role: 'system',
      content: 'System instructions'
    });
  });

  it('should accept additional kwargs', () => {
    const message = new SystemMessage('Instructions', {
      priority: 'high',
      version: 2
    });

    expect(message.additionalKwargs.priority).toBe('high');
    expect(message.additionalKwargs.version).toBe(2);
  });

  it('should serialize to JSON', () => {
    const message = new SystemMessage('System prompt', { mode: 'strict' });
    const json = message.toJSON();

    expect(json.type).toBe('system');
    expect(json.content).toBe('System prompt');
    expect(json.mode).toBe('strict');
    expect(json.id).toBe(message.id);
    expect(json.timestamp).toBe(message.timestamp);
  });

  it('should handle long system prompts', () => {
    const longPrompt = 'A'.repeat(1000);
    const message = new SystemMessage(longPrompt);

    expect(message.content).toBe(longPrompt);
    expect(message.content.length).toBe(1000);
  });

  it('should handle multiline system instructions', () => {
    const instructions = `You are a helpful assistant.
You should be polite.
You should be concise.`;
    const message = new SystemMessage(instructions);

    expect(message.content).toBe(instructions);
    expect(message.toPromptFormat().content).toBe(instructions);
  });

  it('should handle empty system message', () => {
    const message = new SystemMessage('');

    expect(message.content).toBe('');
    expect(message.type).toBe('system');
  });
});
