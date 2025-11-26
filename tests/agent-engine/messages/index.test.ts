import { describe, it, expect } from 'vitest';
import * as messages from '../../../src/agent-engine/messages/index';

describe('messages/index', () => {
  it('should export BaseMessage', () => {
    expect(messages.BaseMessage).toBeDefined();
  });

  it('should export AIMessage', () => {
    expect(messages.AIMessage).toBeDefined();
  });

  it('should export HumanMessage', () => {
    expect(messages.HumanMessage).toBeDefined();
  });

  it('should export SystemMessage', () => {
    expect(messages.SystemMessage).toBeDefined();
  });

  it('should export ToolMessage', () => {
    expect(messages.ToolMessage).toBeDefined();
  });

  it('should export messagesToPromptFormat', () => {
    expect(messages.messagesToPromptFormat).toBeDefined();
    expect(typeof messages.messagesToPromptFormat).toBe('function');
  });

  it('should export filterMessagesByType', () => {
    expect(messages.filterMessagesByType).toBeDefined();
    expect(typeof messages.filterMessagesByType).toBe('function');
  });

  it('should export getLastMessages', () => {
    expect(messages.getLastMessages).toBeDefined();
    expect(typeof messages.getLastMessages).toBe('function');
  });
});
