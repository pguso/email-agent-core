import { describe, it, expect } from 'vitest';
import { TemplatePrompt } from '../../../src/agent-engine/core/TemplatePrompt';

describe('TemplatePrompt', () => {
  it('should create a template prompt with template', () => {
    const prompt = new TemplatePrompt({
      template: 'Hello {name}'
    });

    expect(prompt.template).toBe('Hello {name}');
  });

  it('should auto-detect variables from template', () => {
    const prompt = new TemplatePrompt({
      template: 'Hello {name}, you are {age} years old'
    });

    expect(prompt.inputVariables).toContain('name');
    expect(prompt.inputVariables).toContain('age');
    expect(prompt.inputVariables).toHaveLength(2);
  });

  it('should render template with variables', async () => {
    const prompt = new TemplatePrompt({
      template: 'Hello {name}!'
    });

    const result = await prompt.render({ name: 'Alice' });
    expect(result).toBe('Hello Alice!');
  });

  it('should render template with multiple variables', async () => {
    const prompt = new TemplatePrompt({
      template: '{greeting} {name}, welcome to {place}'
    });

    const result = await prompt.render({
      greeting: 'Hello',
      name: 'Bob',
      place: 'wonderland'
    });

    expect(result).toBe('Hello Bob, welcome to wonderland');
  });

  it('should handle duplicate variable names', async () => {
    const prompt = new TemplatePrompt({
      template: '{name} loves {name}'
    });

    const result = await prompt.render({ name: 'John' });
    expect(result).toBe('John loves John');
  });

  it('should use explicit input variables if provided', () => {
    const prompt = new TemplatePrompt({
      template: 'Hello {name}',
      inputVariables: ['name', 'extra']
    });

    expect(prompt.inputVariables).toEqual(['name', 'extra']);
  });

  it('should validate required variables', async () => {
    const prompt = new TemplatePrompt({
      template: 'Hello {name} {age}'
    });

    await expect(prompt.render({ name: 'Alice' }))
      .rejects.toThrow('Missing required input variables: age');
  });

  it('should work with partial variables', async () => {
    const prompt = new TemplatePrompt({
      template: 'Hello {name}, default: {default}',
      partialVariables: { default: 'value' }
    });

    const result = await prompt.render({ name: 'Alice' });
    expect(result).toBe('Hello Alice, default: value');
  });

  it('should create from template using static method', () => {
    const prompt = TemplatePrompt.fromTemplate('Hello {name}');

    expect(prompt).toBeInstanceOf(TemplatePrompt);
    expect(prompt.template).toBe('Hello {name}');
    expect(prompt.inputVariables).toContain('name');
  });

  it('should create from template with options', () => {
    const prompt = TemplatePrompt.fromTemplate('Hello {name}', {
      partialVariables: { greeting: 'Hi' }
    });

    expect(prompt.partialVariables).toEqual({ greeting: 'Hi' });
  });

  it('should handle template with no variables', async () => {
    const prompt = new TemplatePrompt({
      template: 'Static text with no variables'
    });

    const result = await prompt.render({});
    expect(result).toBe('Static text with no variables');
  });

  it('should handle numeric values', async () => {
    const prompt = new TemplatePrompt({
      template: 'Count: {count}'
    });

    const result = await prompt.render({ count: 42 });
    expect(result).toBe('Count: 42');
  });

  it('should handle boolean values', async () => {
    const prompt = new TemplatePrompt({
      template: 'Active: {active}'
    });

    const result = await prompt.render({ active: true });
    expect(result).toBe('Active: true');
  });

  it('should convert objects to string', async () => {
    const prompt = new TemplatePrompt({
      template: 'Data: {data}'
    });

    const result = await prompt.render({ data: { key: 'value' } });
    expect(result).toContain('[object Object]');
  });

  it('should handle multiline templates', async () => {
    const template = `Line 1: {var1}
Line 2: {var2}
Line 3: {var3}`;
    const prompt = new TemplatePrompt({ template });

    const result = await prompt.render({
      var1: 'first',
      var2: 'second',
      var3: 'third'
    });

    expect(result).toContain('Line 1: first');
    expect(result).toContain('Line 2: second');
    expect(result).toContain('Line 3: third');
  });

  it('should work with _execute method', async () => {
    const prompt = new TemplatePrompt({
      template: 'Test {value}'
    });

    const result = await prompt.execute({ value: 'data' });
    expect(result).toBe('Test data');
  });

  it('should work with run method from Action', async () => {
    const prompt = new TemplatePrompt({
      template: 'Test {value}'
    });

    const result = await prompt.run({ value: 'data' });
    expect(result).toBe('Test data');
  });

  it('should handle variables with underscores', async () => {
    const prompt = new TemplatePrompt({
      template: 'Value: {my_variable}'
    });

    const result = await prompt.render({ my_variable: 'test' });
    expect(result).toBe('Value: test');
  });

  it('should handle variables with numbers', async () => {
    const prompt = new TemplatePrompt({
      template: 'Value: {var1} and {var2}'
    });

    const result = await prompt.render({ var1: 'first', var2: 'second' });
    expect(result).toBe('Value: first and second');
  });

  it('should not replace partial matches', async () => {
    const prompt = new TemplatePrompt({
      template: 'Value: {var} and {variable}'
    });

    const result = await prompt.render({ var: 'short', variable: 'long' });
    expect(result).toBe('Value: short and long');
  });
});
