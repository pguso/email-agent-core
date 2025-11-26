import { describe, it, expect } from 'vitest';
import * as agentEngine from '../../src/agent-engine/index';

describe('agent-engine/index', () => {
  it('should export message classes', () => {
    expect(agentEngine.BaseMessage).toBeDefined();
    expect(agentEngine.AIMessage).toBeDefined();
    expect(agentEngine.HumanMessage).toBeDefined();
    expect(agentEngine.SystemMessage).toBeDefined();
    expect(agentEngine.ToolMessage).toBeDefined();
  });

  it('should export Action classes', () => {
    expect(agentEngine.Action).toBeDefined();
    expect(agentEngine.ActionContext).toBeDefined();
    expect(agentEngine.ActionPipeline).toBeDefined();
  });

  it('should export parsers', () => {
    expect(agentEngine.JsonOutputParser).toBeDefined();
    expect(agentEngine.StringOutputParser).toBeDefined();
    expect(agentEngine.BaseOutputParser).toBeDefined();
  });

  it('should export prompt classes', () => {
    expect(agentEngine.TemplatePrompt).toBeDefined();
    expect(agentEngine.BasePrompt).toBeDefined();
  });

  it('should export LLM class', () => {
    expect(agentEngine.LlamaCppLLM).toBeDefined();
  });

  it('should export utility functions', () => {
    expect(agentEngine.messagesToPromptFormat).toBeDefined();
    expect(agentEngine.filterMessagesByType).toBeDefined();
    expect(agentEngine.getLastMessages).toBeDefined();
  });
});
