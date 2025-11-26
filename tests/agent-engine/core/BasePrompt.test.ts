import { describe, it, expect } from 'vitest';
import { BasePrompt } from '../../../src/agent-engine/core/BasePrompt';

// Concrete implementation for testing
class TestPrompt extends BasePrompt {
  protected async _render(values: Record<string, any>): Promise<string> {
    return `Rendered: ${JSON.stringify(values)}`;
  }
}

describe('BasePrompt', () => {
  it('should create a prompt with default options', () => {
    const prompt = new TestPrompt();

    expect(prompt.inputVariables).toEqual([]);
    expect(prompt.partialVariables).toEqual({});
  });

  it('should create a prompt with input variables', () => {
    const prompt = new TestPrompt({
      inputVariables: ['name', 'age']
    });

    expect(prompt.inputVariables).toEqual(['name', 'age']);
  });

  it('should create a prompt with partial variables', () => {
    const prompt = new TestPrompt({
      partialVariables: { default: 'value', count: 42 }
    });

    expect(prompt.partialVariables).toEqual({ default: 'value', count: 42 });
  });

  it('should execute via _execute method', async () => {
    const prompt = new TestPrompt();
    const result = await prompt._execute({ key: 'value' });

    expect(result).toBe('Rendered: {"key":"value"}');
  });

  it('should work with run method from Action', async () => {
    const prompt = new TestPrompt();
    const result = await prompt.run({ test: 'data' });

    expect(result).toBe('Rendered: {"test":"data"}');
  });

  it('should validate required input variables', async () => {
    const prompt = new TestPrompt({
      inputVariables: ['required1', 'required2']
    });

    // This should use the protected validate method
    await expect(prompt.render({ required1: 'value' }))
      .rejects.toThrow('Missing required input variables: required2');
  });

  it('should not throw when all required variables provided', async () => {
    const prompt = new TestPrompt({
      inputVariables: ['var1', 'var2']
    });

    const result = await prompt.render({ var1: 'a', var2: 'b' });
    expect(result).toBeDefined();
  });

  it('should merge partial and user variables', async () => {
    class MergingPrompt extends BasePrompt {
      protected async _render(values: Record<string, any>): Promise<string> {
        const merged = this.mergeVariables(values);
        return JSON.stringify(merged);
      }
    }

    const prompt = new MergingPrompt({
      partialVariables: { partial1: 'p1', partial2: 'p2' }
    });

    const result = await prompt.render({ user1: 'u1' });
    const parsed = JSON.parse(result);

    expect(parsed.partial1).toBe('p1');
    expect(parsed.partial2).toBe('p2');
    expect(parsed.user1).toBe('u1');
  });

  it('should allow user variables to override partial variables', async () => {
    class MergingPrompt extends BasePrompt {
      protected async _render(values: Record<string, any>): Promise<string> {
        const merged = this.mergeVariables(values);
        return JSON.stringify(merged);
      }
    }

    const prompt = new MergingPrompt({
      partialVariables: { key: 'partial' }
    });

    const result = await prompt.render({ key: 'user' });
    const parsed = JSON.parse(result);

    expect(parsed.key).toBe('user');
  });

  it('should satisfy partial variables in validation', async () => {
    const prompt = new TestPrompt({
      inputVariables: ['required'],
      partialVariables: { required: 'default' }
    });

    // Should not throw because partial provides the required variable
    const result = await prompt.render({});
    expect(result).toBeDefined();
  });

  it('should handle empty input variables', async () => {
    const prompt = new TestPrompt({
      inputVariables: []
    });

    const result = await prompt.render({ any: 'value' });
    expect(result).toBeDefined();
  });

  it('should handle multiple missing variables in error', async () => {
    const prompt = new TestPrompt({
      inputVariables: ['var1', 'var2', 'var3']
    });

    await expect(prompt.render({ var1: 'value' }))
      .rejects.toThrow('Missing required input variables: var2, var3');
  });

  it('should work with complex object values', async () => {
    const prompt = new TestPrompt();
    const complexData = {
      nested: { deep: { value: 123 } },
      array: [1, 2, 3],
      bool: true
    };

    const result = await prompt.render(complexData);
    expect(result).toContain('nested');
  });
});
