import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LlamaCppLLM } from '../../../src/agent-engine/llm/LlamaCppLLM';

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

  it('should be defined as a module', async () => {
    // Since LlamaCppLLM requires actual model files and complex setup,
    // we test that the module can be imported
    const module = await import('../../../src/agent-engine/llm/LlamaCppLLM');
    expect(typeof module).toBe('object');
  });

  it('should export LlamaCppLLM class', async () => {
    const module = await import('../../../src/agent-engine/llm/LlamaCppLLM');
    expect(module.LlamaCppLLM).toBeDefined();
    expect(typeof module.LlamaCppLLM).toBe('function');
  });

  // Note: Full integration tests would require actual model files
  // and are better suited for integration test suites
  it('should have expected class structure', async () => {
    const module = await import('../../../src/agent-engine/llm/LlamaCppLLM');
    const instance = new module.LlamaCppLLM({ modelPath: '/fake/path' });
    
    expect(instance).toHaveProperty('execute');
    expect(instance).toHaveProperty('run');
    expect(instance).toHaveProperty('streamOutput');
    expect(instance).toHaveProperty('dispose');
  });
});
