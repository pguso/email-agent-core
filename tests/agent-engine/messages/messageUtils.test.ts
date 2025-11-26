import { describe, it, expect } from 'vitest';
import { messagesToPromptFormat, filterMessagesByType, getLastMessages } from '../../../src/agent-engine/messages/messageUtils';
import { AIMessage } from '../../../src/agent-engine/messages/AIMessage';
import { HumanMessage } from '../../../src/agent-engine/messages/HumanMessage';
import { SystemMessage } from '../../../src/agent-engine/messages/SystemMessage';
import { ToolMessage } from '../../../src/agent-engine/messages/ToolMessage';

describe('messageUtils', () => {
  describe('messagesToPromptFormat', () => {
    it('should convert messages to prompt format', () => {
      const messages = [
        new SystemMessage('You are helpful'),
        new HumanMessage('Hello'),
        new AIMessage('Hi there')
      ];

      const formatted = messagesToPromptFormat(messages);

      expect(formatted).toHaveLength(3);
      expect(formatted[0]).toEqual({ role: 'system', content: 'You are helpful' });
      expect(formatted[1]).toEqual({ role: 'user', content: 'Hello' });
      expect(formatted[2]).toEqual({ role: 'assistant', content: 'Hi there', tool_calls: undefined });
    });

    it('should handle empty message array', () => {
      const formatted = messagesToPromptFormat([]);

      expect(formatted).toEqual([]);
    });

    it('should convert single message', () => {
      const messages = [new HumanMessage('Test')];
      const formatted = messagesToPromptFormat(messages);

      expect(formatted).toHaveLength(1);
      expect(formatted[0]).toEqual({ role: 'user', content: 'Test' });
    });

    it('should handle tool messages', () => {
      const messages = [new ToolMessage('Tool result', 'call_123')];
      const formatted = messagesToPromptFormat(messages);

      expect(formatted).toHaveLength(1);
      expect(formatted[0]).toEqual({
        role: 'tool',
        content: 'Tool result',
        tool_call_id: 'call_123'
      });
    });

    it('should handle AI messages with tool calls', () => {
      const messages = [
        new AIMessage('Using tools', {
          toolCalls: [{ name: 'test', arguments: {} }]
        })
      ];
      const formatted = messagesToPromptFormat(messages);

      expect(formatted[0].tool_calls).toBeDefined();
      expect(formatted[0].tool_calls).toHaveLength(1);
    });
  });

  describe('filterMessagesByType', () => {
    it('should filter messages by type', () => {
      const messages = [
        new SystemMessage('System'),
        new HumanMessage('User 1'),
        new AIMessage('AI 1'),
        new HumanMessage('User 2'),
        new AIMessage('AI 2')
      ];

      const humanMessages = filterMessagesByType(messages, 'human');

      expect(humanMessages).toHaveLength(2);
      expect(humanMessages[0].content).toBe('User 1');
      expect(humanMessages[1].content).toBe('User 2');
    });

    it('should return empty array when no matches', () => {
      const messages = [new HumanMessage('Test')];
      const filtered = filterMessagesByType(messages, 'ai');

      expect(filtered).toEqual([]);
    });

    it('should filter system messages', () => {
      const messages = [
        new SystemMessage('System 1'),
        new HumanMessage('User'),
        new SystemMessage('System 2')
      ];

      const systemMessages = filterMessagesByType(messages, 'system');

      expect(systemMessages).toHaveLength(2);
      expect(systemMessages.every(m => m.type === 'system')).toBe(true);
    });

    it('should filter AI messages', () => {
      const messages = [
        new AIMessage('AI 1'),
        new HumanMessage('User'),
        new AIMessage('AI 2'),
        new AIMessage('AI 3')
      ];

      const aiMessages = filterMessagesByType(messages, 'ai');

      expect(aiMessages).toHaveLength(3);
    });

    it('should filter tool messages', () => {
      const messages = [
        new ToolMessage('Result 1', 'call_1'),
        new HumanMessage('User'),
        new ToolMessage('Result 2', 'call_2')
      ];

      const toolMessages = filterMessagesByType(messages, 'tool');

      expect(toolMessages).toHaveLength(2);
      expect(toolMessages.every(m => m.type === 'tool')).toBe(true);
    });
  });

  describe('getLastMessages', () => {
    it('should return last n messages', () => {
      const messages = [
        new HumanMessage('Message 1'),
        new AIMessage('Message 2'),
        new HumanMessage('Message 3'),
        new AIMessage('Message 4'),
        new HumanMessage('Message 5')
      ];

      const last3 = getLastMessages(messages, 3);

      expect(last3).toHaveLength(3);
      expect(last3[0].content).toBe('Message 3');
      expect(last3[1].content).toBe('Message 4');
      expect(last3[2].content).toBe('Message 5');
    });

    it('should return all messages if n is greater than array length', () => {
      const messages = [
        new HumanMessage('Message 1'),
        new AIMessage('Message 2')
      ];

      const last5 = getLastMessages(messages, 5);

      expect(last5).toHaveLength(2);
      expect(last5).toEqual(messages);
    });

    it('should return empty array for empty input', () => {
      const last = getLastMessages([], 5);

      expect(last).toEqual([]);
    });

    it('should return last message when n is 1', () => {
      const messages = [
        new HumanMessage('Message 1'),
        new AIMessage('Message 2'),
        new HumanMessage('Message 3')
      ];

      const last1 = getLastMessages(messages, 1);

      expect(last1).toHaveLength(1);
      expect(last1[0].content).toBe('Message 3');
    });

    it('should return empty array when n is 0', () => {
      const messages = [new HumanMessage('Message 1')];
      const last0 = getLastMessages(messages, 0);

      expect(last0).toEqual([]);
    });

    it('should handle negative n by returning empty array', () => {
      const messages = [
        new HumanMessage('Message 1'),
        new AIMessage('Message 2')
      ];

      const lastNegative = getLastMessages(messages, -2);

      expect(lastNegative).toEqual([]);
    });
  });
});
