import { describe, it, expect } from 'vitest';
import { AIMessage } from '../../../src/agent-engine/messages/AIMessage';

describe('AIMessage', () => {
  it('should create an AI message with content', () => {
    const message = new AIMessage('Hello from AI');

    expect(message.content).toBe('Hello from AI');
    expect(message.type).toBe('ai');
    expect(message.toolCalls).toEqual([]);
  });

  it('should have empty toolCalls by default', () => {
    const message = new AIMessage('Response');

    expect(message.hasToolCalls()).toBe(false);
    expect(message.toolCalls).toHaveLength(0);
  });

  it('should accept toolCalls in kwargs', () => {
    const toolCalls = [
      { name: 'sendEmail', arguments: { to: 'user@example.com' } },
      { name: 'searchWeb', arguments: { query: 'test' } }
    ];
    const message = new AIMessage('Using tools', { toolCalls });

    expect(message.toolCalls).toEqual(toolCalls);
    expect(message.hasToolCalls()).toBe(true);
  });

  it('should return correct hasToolCalls result', () => {
    const messageWithTools = new AIMessage('With tools', {
      toolCalls: [{ name: 'tool', arguments: {} }]
    });
    const messageWithoutTools = new AIMessage('No tools');

    expect(messageWithTools.hasToolCalls()).toBe(true);
    expect(messageWithoutTools.hasToolCalls()).toBe(false);
  });

  it('should format to prompt format without tool_calls', () => {
    const message = new AIMessage('Simple response');
    const format = message.toPromptFormat();

    expect(format).toEqual({
      role: 'assistant',
      content: 'Simple response',
      tool_calls: undefined
    });
  });

  it('should format to prompt format with tool_calls', () => {
    const toolCalls = [{ name: 'test', arguments: { key: 'value' } }];
    const message = new AIMessage('Response with tools', { toolCalls });
    const format = message.toPromptFormat();

    expect(format).toEqual({
      role: 'assistant',
      content: 'Response with tools',
      tool_calls: toolCalls
    });
  });

  it('should serialize to JSON', () => {
    const toolCalls = [{ name: 'getTool', arguments: {} }];
    const message = new AIMessage('AI response', { 
      toolCalls,
      custom: 'data' 
    });
    const json = message.toJSON();

    expect(json.type).toBe('ai');
    expect(json.content).toBe('AI response');
    expect(json.custom).toBe('data');
  });

  it('should deserialize from JSON', () => {
    const json = {
      content: 'Restored AI message',
      toolCalls: [{ name: 'tool1', arguments: { arg: 'value' } }],
      extraData: 'test'
    };
    const message = AIMessage.fromJSON(json);

    expect(message.content).toBe('Restored AI message');
    expect(message.toolCalls).toEqual(json.toolCalls);
    expect(message.additionalKwargs.extraData).toBe('test');
  });

  it('should handle fromJSON without toolCalls', () => {
    const json = { content: 'No tools' };
    const message = AIMessage.fromJSON(json);

    expect(message.content).toBe('No tools');
    expect(message.toolCalls).toEqual([]);
    expect(message.hasToolCalls()).toBe(false);
  });

  it('should accept additional kwargs alongside toolCalls', () => {
    const message = new AIMessage('Test', {
      toolCalls: [{ name: 'test', arguments: {} }],
      metadata: 'value',
      score: 0.95
    });

    expect(message.additionalKwargs.metadata).toBe('value');
    expect(message.additionalKwargs.score).toBe(0.95);
    expect(message.toolCalls).toHaveLength(1);
  });
});
