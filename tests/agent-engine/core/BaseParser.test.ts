import { describe, it, expect } from 'vitest';
import { BaseOutputParser, OutputParserException } from '../../../src/agent-engine/core/BaseParser';

// Concrete implementation for testing
class TestParser extends BaseOutputParser {
  async parse(text: string): Promise<any> {
    return { parsed: text };
  }

  getFormatInstructions(): string {
    return 'Test format instructions';
  }
}

// Parser that throws errors
class ErrorParser extends BaseOutputParser {
  async parse(_text: string): Promise<any> {
    throw new Error('Parse error');
  }
}

describe('BaseOutputParser', () => {
  it('should create a parser with name', () => {
    const parser = new TestParser();

    expect(parser.name).toBe('TestParser');
  });

  it('should parse text with parse method', async () => {
    const parser = new TestParser();
    const result = await parser.parse('test input');

    expect(result).toEqual({ parsed: 'test input' });
  });

  it('should execute with string input', async () => {
    const parser = new TestParser();
    const result = await parser._execute('test');

    expect(result).toEqual({ parsed: 'test' });
  });

  it('should execute with object input containing content', async () => {
    const parser = new TestParser();
    const result = await parser._execute({ content: 'test content' });

    expect(result).toEqual({ parsed: 'test content' });
  });

  it('should return format instructions', () => {
    const parser = new TestParser();
    const instructions = parser.getFormatInstructions();

    expect(instructions).toBe('Test format instructions');
  });

  it('should return empty string for default format instructions', () => {
    class MinimalParser extends BaseOutputParser {
      async parse(text: string): Promise<any> {
        return text;
      }
    }

    const parser = new MinimalParser();
    expect(parser.getFormatInstructions()).toBe('');
  });

  it('should parse with prompt successfully', async () => {
    const parser = new TestParser();
    const result = await parser.parseWithPrompt('test', 'prompt text');

    expect(result).toEqual({ parsed: 'test' });
  });

  it('should throw OutputParserException on parse failure', async () => {
    const parser = new ErrorParser();

    await expect(parser.parseWithPrompt('test', 'prompt'))
      .rejects.toThrow(OutputParserException);
  });

  it('should include original error in OutputParserException', async () => {
    const parser = new ErrorParser();

    try {
      await parser.parseWithPrompt('test', 'prompt');
    } catch (error) {
      expect(error).toBeInstanceOf(OutputParserException);
      if (error instanceof OutputParserException) {
        expect(error.message).toContain('Failed to parse output from prompt');
        expect(error.llmOutput).toBe('test');
        expect(error.originalError).toBeDefined();
      }
    }
  });

  it('should work with run method from Action', async () => {
    const parser = new TestParser();
    const result = await parser.run('test input');

    expect(result).toEqual({ parsed: 'test input' });
  });
});

describe('OutputParserException', () => {
  it('should create exception with message, output, and error', () => {
    const originalError = new Error('Original error');
    const exception = new OutputParserException(
      'Custom message',
      'llm output text',
      originalError
    );

    expect(exception.message).toBe('Custom message');
    expect(exception.llmOutput).toBe('llm output text');
    expect(exception.originalError).toBe(originalError);
    expect(exception.name).toBe('OutputParserException');
  });

  it('should be throwable and catchable', () => {
    const exception = new OutputParserException('Test', 'output', new Error());

    expect(() => {
      throw exception;
    }).toThrow(OutputParserException);
  });

  it('should include llm output in exception', () => {
    const exception = new OutputParserException(
      'Failed to parse',
      'problematic output',
      new Error('JSON parse error')
    );

    expect(exception.llmOutput).toBe('problematic output');
  });
});
