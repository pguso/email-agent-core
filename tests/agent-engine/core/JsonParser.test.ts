import { describe, it, expect } from 'vitest';
import { JsonOutputParser } from '../../../src/agent-engine/core/JsonParser';
import { OutputParserException } from '../../../src/agent-engine/core/BaseParser';

describe('JsonOutputParser', () => {
  describe('Basic JSON parsing', () => {
    it('should parse valid JSON', async () => {
      const parser = new JsonOutputParser();
      const result = await parser.parse('{"key": "value", "count": 42}');

      expect(result).toEqual({ key: 'value', count: 42 });
    });

    it('should parse JSON array', async () => {
      const parser = new JsonOutputParser();
      const result = await parser.parse('[1, 2, 3]');

      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle trimmed whitespace', async () => {
      const parser = new JsonOutputParser();
      const text = '  \n  {"data": "value"}  \n  ';
      const result = await parser.parse(text);

      expect(result).toEqual({ data: 'value' });
    });

    it('should parse nested JSON objects', async () => {
      const parser = new JsonOutputParser();
      const text = '{"user": {"name": "John", "address": {"city": "NYC"}}}';
      const result = await parser.parse(text);

      expect(result).toEqual({
        user: {
          name: 'John',
          address: { city: 'NYC' }
        }
      });
    });

    it('should handle complex arrays', async () => {
      const parser = new JsonOutputParser();
      const text = '[{"id": 1}, {"id": 2}, {"id": 3}]';
      const result = await parser.parse(text);

      expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    });
  });

  describe('JSON extraction from text', () => {
    it('should parse JSON from markdown code block with json tag', async () => {
      const parser = new JsonOutputParser();
      const text = '```json\n{"name": "test"}\n```';
      const result = await parser.parse(text);

      expect(result).toEqual({ name: 'test' });
    });

    it('should parse JSON from code block without language tag', async () => {
      const parser = new JsonOutputParser();
      const text = '```\n{"value": 123}\n```';
      const result = await parser.parse(text);

      expect(result).toEqual({ value: 123 });
    });

    it('should extract JSON object from mixed text', async () => {
      const parser = new JsonOutputParser();
      const text = 'Here is the result: {"status": "ok"} and more text';
      const result = await parser.parse(text);

      expect(result).toEqual({ status: 'ok' });
    });

    it('should extract JSON array from mixed text', async () => {
      const parser = new JsonOutputParser();
      const text = 'The items are: [1, 2, 3] end';
      const result = await parser.parse(text);

      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle text with key:value pairs without braces', async () => {
      const parser = new JsonOutputParser();
      const text = '"name": "John", "age": 30';
      const result = await parser.parse(text);

      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should return empty object for empty string', async () => {
      const parser = new JsonOutputParser();
      const result = await parser.parse('');

      expect(result).toEqual({});
    });

    it('should return empty object for whitespace only', async () => {
      const parser = new JsonOutputParser();
      const result = await parser.parse('   \n\t   ');

      expect(result).toEqual({});
    });
  });

  describe('JSON repair functionality', () => {
    it('should repair trailing comma in object', async () => {
      const parser = new JsonOutputParser();
      const text = '{"name": "John", "age": 30, }';
      const result = await parser.parse(text);

      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should repair trailing comma in array', async () => {
      const parser = new JsonOutputParser();
      const text = '[1, 2, 3, ]';
      const result = await parser.parse(text);

      expect(result).toEqual([1, 2, 3]);
    });

    it('should extract JSON object even when followed by text', async () => {
      const parser = new JsonOutputParser();
      const text = 'Here is: {"status": "ok"} and some extra text';
      const result = await parser.parse(text);

      expect(result).toEqual({ status: 'ok' });
    });

    it('should handle JSON with whitespace and newlines', async () => {
      const parser = new JsonOutputParser();
      const text = `{
        "name": "John",
        "age": 30,
      }`;
      const result = await parser.parse(text);

      expect(result).toEqual({ name: 'John', age: 30 });
    });
  });

  describe('Schema validation', () => {
    it('should validate schema when provided', async () => {
      const parser = new JsonOutputParser({
        schema: {
          name: 'string',
          age: 'number'
        }
      });

      const result = await parser.parse('{"name": "John", "age": 30}');
      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should throw error for missing required field', async () => {
      const parser = new JsonOutputParser({
        schema: {
          name: 'string',
          age: 'number'
        }
      });

      await expect(parser.parse('{"name": "John"}'))
        .rejects.toThrow('Missing required field: age');
    });

    it('should throw error for wrong type', async () => {
      const parser = new JsonOutputParser({
        schema: {
          name: 'string',
          age: 'number'
        }
      });

      await expect(parser.parse('{"name": "John", "age": "thirty"}'))
        .rejects.toThrow('Field "age" should be number, got string');
    });

    it('should validate array type', async () => {
      const parser = new JsonOutputParser({
        schema: {
          items: 'array'
        }
      });

      const result = await parser.parse('{"items": [1, 2, 3]}');
      expect(result).toEqual({ items: [1, 2, 3] });
    });

    it('should validate object type', async () => {
      const parser = new JsonOutputParser({
        schema: {
          meta: 'object'
        }
      });

      const result = await parser.parse('{"meta": {"key": "value"}}');
      expect(result).toEqual({ meta: { key: 'value' } });
    });

    it('should validate boolean type', async () => {
      const parser = new JsonOutputParser({
        schema: {
          active: 'boolean'
        }
      });

      const result = await parser.parse('{"active": true}');
      expect(result).toEqual({ active: true });
    });

    it('should work without schema', async () => {
      const parser = new JsonOutputParser();
      const result = await parser.parse('{"anything": "goes"}');

      expect(result).toEqual({ anything: 'goes' });
    });
  });

  describe('Error handling', () => {
    it('should return empty object for truly invalid JSON without colons', async () => {
      const parser = new JsonOutputParser();
      const result = await parser.parse('not valid json at all');

      expect(result).toEqual({});
    });

    it('should throw OutputParserException when schema validation fails', async () => {
      const parser = new JsonOutputParser({
        schema: {
          name: 'string'
        }
      });

      try {
        await parser.parse('{"name": 123}');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(OutputParserException);
        expect((error as OutputParserException).llmOutput).toBe('{"name": 123}');
      }
    });
  });

  describe('Format instructions', () => {
    it('should return format instructions without schema', () => {
      const parser = new JsonOutputParser();
      const instructions = parser.getFormatInstructions();

      expect(instructions).toBe('Respond ONLY with valid JSON.');
    });

    it('should return format instructions with schema', () => {
      const parser = new JsonOutputParser({
        schema: {
          name: 'string',
          count: 'number'
        }
      });
      const instructions = parser.getFormatInstructions();

      expect(instructions).toContain('Respond ONLY with valid JSON.');
      expect(instructions).toContain('Schema: { "name": string, "count": number }');
    });

    it('should format schema with multiple fields correctly', () => {
      const parser = new JsonOutputParser({
        schema: {
          id: 'number',
          name: 'string',
          active: 'boolean',
          tags: 'array'
        }
      });
      const instructions = parser.getFormatInstructions();

      expect(instructions).toContain('"id": number');
      expect(instructions).toContain('"name": string');
      expect(instructions).toContain('"active": boolean');
      expect(instructions).toContain('"tags": array');
    });
  });

  describe('Action interface compatibility', () => {
    it('should work with _execute method', async () => {
      const parser = new JsonOutputParser();
      const result = await parser._execute('{"test": true}');

      expect(result).toEqual({ test: true });
    });

    it('should work with run method from Action', async () => {
      const parser = new JsonOutputParser();
      const result = await parser.run('{"key": "value"}');

      expect(result).toEqual({ key: 'value' });
    });
  });
});
