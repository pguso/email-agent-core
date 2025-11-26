import { describe, it, expect } from 'vitest';
import type { ChatHistoryItem } from '../../../src/agent-engine/types/ChatHistoryItem';

describe('ChatHistoryItem', () => {
  it('should accept a valid ChatHistoryItem with all properties', () => {
    const item: ChatHistoryItem = {
      type: 'message',
      text: 'Hello',
      response: 'Hi there'
    };

    expect(item.type).toBe('message');
    expect(item.text).toBe('Hello');
    expect(item.response).toBe('Hi there');
  });

  it('should accept a ChatHistoryItem with only type', () => {
    const item: ChatHistoryItem = {
      type: 'system'
    };

    expect(item.type).toBe('system');
    expect(item.text).toBeUndefined();
    expect(item.response).toBeUndefined();
  });

  it('should accept a ChatHistoryItem with type and text only', () => {
    const item: ChatHistoryItem = {
      type: 'user',
      text: 'What is the weather?'
    };

    expect(item.type).toBe('user');
    expect(item.text).toBe('What is the weather?');
    expect(item.response).toBeUndefined();
  });

  it('should accept a ChatHistoryItem with type and response only', () => {
    const item: ChatHistoryItem = {
      type: 'assistant',
      response: 'I can help you with that'
    };

    expect(item.type).toBe('assistant');
    expect(item.text).toBeUndefined();
    expect(item.response).toBe('I can help you with that');
  });
});
