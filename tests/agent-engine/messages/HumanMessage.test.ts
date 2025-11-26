import { describe, it, expect } from 'vitest';
import { HumanMessage } from '../../../src/agent-engine/messages/HumanMessage';

describe('HumanMessage', () => {
  it('should create a human message with content', () => {
    const message = new HumanMessage('Hello from user');

    expect(message.content).toBe('Hello from user');
    expect(message.type).toBe('human');
    expect(message.id).toBeDefined();
    expect(message.timestamp).toBeDefined();
  });

  it('should format to prompt format with user role', () => {
    const message = new HumanMessage('User input');
    const format = message.toPromptFormat();

    expect(format).toEqual({
      role: 'user',
      content: 'User input'
    });
  });

  it('should accept additional kwargs', () => {
    const message = new HumanMessage('Test message', {
      userId: '123',
      metadata: { source: 'web' }
    });

    expect(message.additionalKwargs.userId).toBe('123');
    expect(message.additionalKwargs.metadata).toEqual({ source: 'web' });
  });

  it('should serialize to JSON', () => {
    const message = new HumanMessage('User question', { tag: 'question' });
    const json = message.toJSON();

    expect(json.type).toBe('human');
    expect(json.content).toBe('User question');
    expect(json.tag).toBe('question');
    expect(json.id).toBe(message.id);
    expect(json.timestamp).toBe(message.timestamp);
  });

  it('should handle empty content', () => {
    const message = new HumanMessage('');

    expect(message.content).toBe('');
    expect(message.type).toBe('human');
  });

  it('should handle multiline content', () => {
    const content = 'Line 1\nLine 2\nLine 3';
    const message = new HumanMessage(content);

    expect(message.content).toBe(content);
    expect(message.toPromptFormat().content).toBe(content);
  });

  it('should preserve special characters in content', () => {
    const content = 'Test with special chars: @#$%^&*()';
    const message = new HumanMessage(content);

    expect(message.content).toBe(content);
  });
});
