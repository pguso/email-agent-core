import { describe, it, expect, vi } from 'vitest';
import { ActionContext, Action, ActionPipeline } from '../../../src/agent-engine/core/Action';

// Test implementation of Action
class TestAction extends Action {
  async execute(input: any, _config: any): Promise<any> {
    return `processed: ${input}`;
  }
}

// Test implementation with streaming
class StreamingAction extends Action {
  async execute(input: any, _config: any): Promise<any> {
    return `streamed: ${input}`;
  }

  async* _streamOutput(input: any, config: any): AsyncGenerator<any, void, unknown> {
    yield `chunk1: ${input}`;
    yield `chunk2: ${input}`;
    yield await this.execute(input, config);
  }
}

// Test implementation that throws error
class ErrorAction extends Action {
  async execute(_input: any, _config: any): Promise<any> {
    throw new Error('Test error');
  }
}

describe('ActionContext', () => {
  it('should create an ActionContext with config', () => {
    const context = new ActionContext({ key: 'value', count: 42 });

    expect(context.key).toBe('value');
    expect(context.count).toBe(42);
  });

  it('should create an ActionContext with callbacks', () => {
    const callbacks = [vi.fn(), vi.fn()];
    const context = new ActionContext({ callbacks });

    expect(context.callbacks).toEqual(callbacks);
  });

  it('should create an empty ActionContext', () => {
    const context = new ActionContext();

    expect(context).toBeDefined();
  });
});

describe('Action', () => {
  it('should set name from constructor', () => {
    const action = new TestAction();

    expect(action.name).toBe('TestAction');
  });

  it('should throw error when _execute is not implemented', async () => {
    const action = new Action();

    await expect(action.run('input')).rejects.toThrow('Action must implement _call() method');
  });

  it('should execute with run method', async () => {
    const action = new TestAction();
    const result = await action.run('test');

    expect(result).toBe('processed: test');
  });

  it('should pass config to _execute', async () => {
    const executeSpy = vi.fn().mockResolvedValue('result');
    const action = new TestAction();
    action.execute = executeSpy;

    await action.run('input', { custom: 'config' });

    expect(executeSpy).toHaveBeenCalled();
    const config = executeSpy.mock.calls[0][1];
    expect(config.custom).toBe('config');
  });

  it('should handle ActionContext config', async () => {
    const action = new TestAction();
    const context = new ActionContext({ key: 'value' });
    
    const result = await action.run('test', context);

    expect(result).toBe('processed: test');
  });

  it('should handle errors in execution', async () => {
    const action = new ErrorAction();

    await expect(action.run('input')).rejects.toThrow('Test error');
  });

  it('should stream output with default implementation', async () => {
    const action = new TestAction();
    const generator = action.streamOutput('test');
    
    const chunks = [];
    for await (const chunk of generator) {
      chunks.push(chunk);
    }

    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBe('processed: test');
  });

  it('should stream output with custom implementation', async () => {
    const action = new StreamingAction();
    const generator = action.streamOutput('test');
    
    const chunks = [];
    for await (const chunk of generator) {
      chunks.push(chunk);
    }

    expect(chunks).toHaveLength(3);
    expect(chunks[0]).toBe('chunk1: test');
    expect(chunks[1]).toBe('chunk2: test');
    expect(chunks[2]).toBe('streamed: test');
  });

  it('should run batch with multiple inputs', async () => {
    const action = new TestAction();
    const results = await action.runBatch(['input1', 'input2', 'input3']);

    expect(results).toHaveLength(3);
    expect(results[0]).toBe('processed: input1');
    expect(results[1]).toBe('processed: input2');
    expect(results[2]).toBe('processed: input3');
  });

  it('should run empty batch', async () => {
    const action = new TestAction();
    const results = await action.runBatch([]);

    expect(results).toEqual([]);
  });

  it('should chain actions', () => {
    const action1 = new TestAction();
    const action2 = new TestAction();
    const pipeline = action1.chain(action2);

    expect(pipeline).toBeInstanceOf(ActionPipeline);
    expect(pipeline.steps).toHaveLength(2);
    expect(pipeline.steps[0]).toBe(action1);
    expect(pipeline.steps[1]).toBe(action2);
  });
});

describe('ActionPipeline', () => {
  it('should create a pipeline with multiple steps', () => {
    const action1 = new TestAction();
    const action2 = new TestAction();
    const pipeline = new ActionPipeline([action1, action2]);

    expect(pipeline.steps).toHaveLength(2);
  });

  it('should execute steps sequentially', async () => {
    class AddAction extends Action {
      constructor(private value: string) {
        super();
      }
      async execute(input: any, _config: any): Promise<any> {
        return `${input}+${this.value}`;
      }
    }

    const pipeline = new ActionPipeline([
      new AddAction('A'),
      new AddAction('B'),
      new AddAction('C')
    ]);

    const result = await pipeline.run('start');
    expect(result).toBe('start+A+B+C');
  });

  it('should chain additional actions to pipeline', () => {
    const action1 = new TestAction();
    const action2 = new TestAction();
    const action3 = new TestAction();
    
    const pipeline1 = new ActionPipeline([action1, action2]);
    const pipeline2 = pipeline1.chain(action3);

    expect(pipeline2.steps).toHaveLength(3);
    expect(pipeline2.steps[2]).toBe(action3);
  });

  it('should stream output from last step', async () => {
    class PassThroughAction extends Action {
      async execute(input: any, _config: any): Promise<any> {
        return `pass: ${input}`;
      }
    }

    const pipeline = new ActionPipeline([
      new PassThroughAction(),
      new StreamingAction()
    ]);

    const generator = pipeline.streamOutput('test');
    const chunks = [];
    for await (const chunk of generator) {
      chunks.push(chunk);
    }

    expect(chunks.length).toBeGreaterThan(0);
  });

  it('should handle single step pipeline', async () => {
    const action = new TestAction();
    const pipeline = new ActionPipeline([action]);
    const result = await pipeline.run('input');

    expect(result).toBe('processed: input');
  });
});
