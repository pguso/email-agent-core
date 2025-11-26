import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BaseMessage } from '../../../src/agent-engine/messages/BaseMessage';

// Create a concrete implementation for testing
class TestMessage extends BaseMessage {
  get type(): string {
    return 'test';
  }

  toPromptFormat(): object {
    return {
      role: 'test',
      content: this.content
    };
  }

  static fromJSON(json: any): TestMessage {
    return new TestMessage(json.content, json);
  }
}

describe('BaseMessage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should create a message with content', () => {
    const message = new TestMessage('Hello world');

    expect(message.content).toBe('Hello world');
    expect(message.id).toBeDefined();
    expect(message.timestamp).toBeDefined();
  });

  it('should generate unique IDs for different messages', () => {
    const message1 = new TestMessage('Message 1');
    const message2 = new TestMessage('Message 2');

    expect(message1.id).not.toBe(message2.id);
  });

  it('should set timestamp on creation', () => {
    const now = Date.now();
    vi.setSystemTime(now);
    
    const message = new TestMessage('Test');

    expect(message.timestamp).toBe(now);
  });

  it('should accept additional kwargs', () => {
    const message = new TestMessage('Test', { custom: 'value', extra: 123 });

    expect(message.additionalKwargs).toEqual({ custom: 'value', extra: 123 });
  });

  it('should have empty additionalKwargs by default', () => {
    const message = new TestMessage('Test');

    expect(message.additionalKwargs).toEqual({});
  });

  it('should serialize to JSON with toJSON method', () => {
    const message = new TestMessage('Test content', { custom: 'data' });
    const json = message.toJSON();

    expect(json.id).toBe(message.id);
    expect(json.type).toBe('test');
    expect(json.content).toBe('Test content');
    expect(json.timestamp).toBe(message.timestamp);
    expect(json.custom).toBe('data');
  });

  it('should include additionalKwargs in JSON output', () => {
    const message = new TestMessage('Test', { 
      meta: 'information',
      count: 42,
      flag: true 
    });
    const json = message.toJSON();

    expect(json.meta).toBe('information');
    expect(json.count).toBe(42);
    expect(json.flag).toBe(true);
  });

  it('should call toPromptFormat on concrete implementation', () => {
    const message = new TestMessage('Test');
    const format = message.toPromptFormat();

    expect(format).toEqual({
      role: 'test',
      content: 'Test'
    });
  });

  it('should throw error when calling BaseMessage.fromJSON directly', () => {
    expect(() => BaseMessage.fromJSON({})).toThrow('Implement in subclasses');
  });

  it('should support fromJSON in concrete implementation', () => {
    const json = { content: 'Restored message', custom: 'value' };
    const message = TestMessage.fromJSON(json);

    expect(message.content).toBe('Restored message');
    expect(message.additionalKwargs.custom).toBe('value');
  });
});
