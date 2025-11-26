import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock node-llama-cpp before importing LlamaCppLLM
vi.mock('node-llama-cpp', () => ({
  getLlama: vi.fn(),
  LlamaChatSession: vi.fn(),
  Llama: vi.fn(),
  LlamaModel: vi.fn(),
  LlamaContext: vi.fn(),
}));

describe('LlamaCppLLM', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined as a module', () => {
    // Since LlamaCppLLM requires actual model files and complex setup,
    // we test that the module can be imported
    expect(() => require('../../../src/agent-engine/llm/LlamaCppLLM')).not.toThrow();
  });

  it('should export LlamaCppLLM class', () => {
    const module = require('../../../src/agent-engine/llm/LlamaCppLLM');
    expect(module.LlamaCppLLM).toBeDefined();
    expect(typeof module.LlamaCppLLM).toBe('function');
  });

  // Note: Full integration tests would require actual model files
  // and are better suited for integration test suites
  it('should have expected class structure', () => {
    const { LlamaCppLLM } = require('../../../src/agent-engine/llm/LlamaCppLLM');
    const instance = new LlamaCppLLM({ modelPath: '/fake/path' });
    
    expect(instance).toHaveProperty('_execute');
    expect(instance).toHaveProperty('run');
    expect(instance).toHaveProperty('streamOutput');
    expect(instance).toHaveProperty('dispose');
  });
});
