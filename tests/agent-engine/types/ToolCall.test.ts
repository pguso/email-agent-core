import { describe, it, expect } from 'vitest';
import type { ToolCall } from '../../../src/agent-engine/types/ToolCall';

describe('ToolCall', () => {
  it('should accept a ToolCall with name and arguments', () => {
    const toolCall: ToolCall = {
      name: 'sendEmail',
      arguments: {
        to: 'user@example.com',
        subject: 'Hello',
        body: 'Test message'
      }
    };

    expect(toolCall.name).toBe('sendEmail');
    expect(toolCall.arguments).toEqual({
      to: 'user@example.com',
      subject: 'Hello',
      body: 'Test message'
    });
  });

  it('should accept a ToolCall with empty arguments', () => {
    const toolCall: ToolCall = {
      name: 'getCurrentTime',
      arguments: {}
    };

    expect(toolCall.name).toBe('getCurrentTime');
    expect(toolCall.arguments).toEqual({});
    expect(Object.keys(toolCall.arguments)).toHaveLength(0);
  });

  it('should accept a ToolCall with various argument types', () => {
    const toolCall: ToolCall = {
      name: 'processData',
      arguments: {
        id: 123,
        name: 'test',
        enabled: true,
        tags: ['tag1', 'tag2'],
        metadata: { key: 'value' }
      }
    };

    expect(toolCall.name).toBe('processData');
    expect(toolCall.arguments.id).toBe(123);
    expect(toolCall.arguments.name).toBe('test');
    expect(toolCall.arguments.enabled).toBe(true);
    expect(toolCall.arguments.tags).toEqual(['tag1', 'tag2']);
    expect(toolCall.arguments.metadata).toEqual({ key: 'value' });
  });

  it('should accept nested objects in arguments', () => {
    const toolCall: ToolCall = {
      name: 'complexTool',
      arguments: {
        level1: {
          level2: {
            level3: 'deep value'
          }
        }
      }
    };

    expect(toolCall.arguments.level1.level2.level3).toBe('deep value');
  });

  it('should accept null and undefined values in arguments', () => {
    const toolCall: ToolCall = {
      name: 'testTool',
      arguments: {
        nullValue: null,
        undefinedValue: undefined,
        stringValue: 'test'
      }
    };

    expect(toolCall.arguments.nullValue).toBeNull();
    expect(toolCall.arguments.undefinedValue).toBeUndefined();
    expect(toolCall.arguments.stringValue).toBe('test');
  });
});
