import { describe, it, expect } from 'vitest';
import { StringOutputParser } from '../../../src/agent-engine/core/StringParser';

describe('StringOutputParser', () => {
  it('should parse and trim text', async () => {
    const parser = new StringOutputParser();
    const result = await parser.parse('  hello world  ');

    expect(result).toBe('hello world');
  });

  it('should strip markdown code blocks by default', async () => {
    const parser = new StringOutputParser();
    const text = '```\ncode content\n```';
    const result = await parser.parse(text);

    expect(result).toBe('code content');
  });

  it('should strip markdown with language tag', async () => {
    const parser = new StringOutputParser();
    const text = '```python\nprint("hello")\n```';
    const result = await parser.parse(text);

    expect(result).toBe('print("hello")');
  });

  it('should not strip markdown when stripMarkdown is false', async () => {
    const parser = new StringOutputParser({ stripMarkdown: false });
    const text = '```\ncode\n```';
    const result = await parser.parse(text);

    expect(result).toBe('```\ncode\n```');
  });

  it('should handle text without markdown', async () => {
    const parser = new StringOutputParser();
    const result = await parser.parse('plain text response');

    expect(result).toBe('plain text response');
  });

  it('should handle empty string', async () => {
    const parser = new StringOutputParser();
    const result = await parser.parse('');

    expect(result).toBe('');
  });

  it('should handle multiline text', async () => {
    const parser = new StringOutputParser();
    const text = 'line 1\nline 2\nline 3';
    const result = await parser.parse(text);

    expect(result).toBe('line 1\nline 2\nline 3');
  });

  it('should strip multiple code blocks', async () => {
    const parser = new StringOutputParser();
    const text = 'Before\n```\nblock1\n```\nmiddle\n```\nblock2\n```\nafter';
    const result = await parser.parse(text);

    expect(result).not.toContain('```');
    expect(result).toContain('block1');
    expect(result).toContain('block2');
  });

  it('should handle whitespace around code blocks', async () => {
    const parser = new StringOutputParser();
    const text = '  \n```\ncontent\n```\n  ';
    const result = await parser.parse(text);

    expect(result).toBe('content');
  });

  it('should return format instructions', () => {
    const parser = new StringOutputParser();
    const instructions = parser.getFormatInstructions();

    expect(instructions).toBe('Respond with plain text. No markdown formatting.');
  });

  it('should work with _execute method', async () => {
    const parser = new StringOutputParser();
    const result = await parser._execute('  test  ');

    expect(result).toBe('test');
  });

  it('should work with run method from Action', async () => {
    const parser = new StringOutputParser();
    const result = await parser.run('  test input  ');

    expect(result).toBe('test input');
  });

  it('should preserve content within code blocks when stripping', async () => {
    const parser = new StringOutputParser();
    const text = '```javascript\nconst x = "hello";\nconsole.log(x);\n```';
    const result = await parser.parse(text);

    expect(result).toContain('const x = "hello"');
    expect(result).toContain('console.log(x)');
    expect(result).not.toContain('```');
  });

  it('should handle text with special characters', async () => {
    const parser = new StringOutputParser();
    const text = 'Special chars: @#$%^&*()';
    const result = await parser.parse(text);

    expect(result).toBe('Special chars: @#$%^&*()');
  });

  it('should handle very long text', async () => {
    const parser = new StringOutputParser();
    const longText = 'A'.repeat(10000);
    const result = await parser.parse(longText);

    expect(result).toBe(longText);
    expect(result.length).toBe(10000);
  });
});
