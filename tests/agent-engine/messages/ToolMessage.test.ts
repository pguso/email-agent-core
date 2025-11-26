import { describe, it, expect } from 'vitest';
import { ToolMessage } from '../../../src/agent-engine/messages/ToolMessage';

describe('ToolMessage', () => {
  it('should create a tool message with content and toolCallId', () => {
    const message = new ToolMessage('Tool result', 'call_123');

    expect(message.content).toBe('Tool result');
    expect(message.toolCallId).toBe('call_123');
    expect(message.type).toBe('tool');
    expect(message.id).toBeDefined();
    expect(message.timestamp).toBeDefined();
  });

  it('should format to prompt format with tool role', () => {
    const message = new ToolMessage('Result data', 'call_456');
    const format = message.toPromptFormat();

    expect(format).toEqual({
      role: 'tool',
      content: 'Result data',
      tool_call_id: 'call_456'
    });
  });

  it('should accept additional kwargs', () => {
    const message = new ToolMessage('Output', 'call_789', {
      executionTime: 125,
      success: true
    });

    expect(message.toolCallId).toBe('call_789');
    expect(message.additionalKwargs.executionTime).toBe(125);
    expect(message.additionalKwargs.success).toBe(true);
  });

  it('should serialize to JSON', () => {
    const message = new ToolMessage('Success', 'call_abc', { status: 'ok' });
    const json = message.toJSON();

    expect(json.type).toBe('tool');
    expect(json.content).toBe('Success');
    expect(json.status).toBe('ok');
    expect(json.id).toBe(message.id);
    expect(json.timestamp).toBe(message.timestamp);
  });

  it('should deserialize from JSON', () => {
    const json = {
      content: 'Restored tool message',
      tool_call_id: 'call_restored',
      metadata: 'test'
    };
    const message = ToolMessage.fromJSON(json);

    expect(message.content).toBe('Restored tool message');
    expect(message.toolCallId).toBe('call_restored');
    expect(message.additionalKwargs.metadata).toBe('test');
  });

  it('should handle empty tool result', () => {
    const message = new ToolMessage('', 'call_empty');

    expect(message.content).toBe('');
    expect(message.toolCallId).toBe('call_empty');
  });

  it('should handle JSON string as content', () => {
    const jsonContent = JSON.stringify({ result: 'value', count: 42 });
    const message = new ToolMessage(jsonContent, 'call_json');

    expect(message.content).toBe(jsonContent);
    expect(() => JSON.parse(message.content)).not.toThrow();
  });

  it('should handle multiline tool output', () => {
    const output = `Line 1
Line 2
Line 3`;
    const message = new ToolMessage(output, 'call_multi');

    expect(message.content).toBe(output);
    expect(message.toPromptFormat().content).toBe(output);
  });

  it('should preserve toolCallId in prompt format', () => {
    const message = new ToolMessage('Data', 'unique_call_id');
    const format = message.toPromptFormat();

    expect(format.tool_call_id).toBe('unique_call_id');
  });
});
