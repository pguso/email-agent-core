export class ActionContext {
  callbacks?: any[];
  [key: string]: any;

  constructor(config: any = {}) {
    Object.assign(this, config);
  }
}

class CallbackManager {
  callbacks: any[];

  constructor(callbacks: any[] = []) {
    this.callbacks = callbacks;
  }

  async handleStart(runnable: Action, input: any, config: ActionContext): Promise<void> {
    // implement
  }

  async handleEnd(runnable: Action, output: any, config: ActionContext): Promise<void> {
    // implement
  }

  async handleError(runnable: Action, error: Error, config: ActionContext): Promise<void> {
    // implement
  }
}

/**
 * Action - Base class for all composable components
 *
 * Every Action must implement the _execute() method.
 * This base class provides run, streamOutput, runBatch, and chain.
 */
export class Action {
  name: string;

  constructor() {
    this.name = this.constructor.name;
  }

  /**
   * Main execution method - processes a single input
   *
   * @param input - The input to process
   * @param config - Optional configuration
   * @returns The processed output
   */
  async run(input: any, config: any = {}): Promise<any> {
    // Normalize config to RunnableConfig instance
    const runnableConfig = config instanceof ActionContext
        ? config
        : new ActionContext(config);

    // Create callback manager
    const callbackManager = new CallbackManager(runnableConfig.callbacks);

    try {
      // Notify callbacks: starting
      await callbackManager.handleStart(this, input, runnableConfig);

      // Execute the runnable
      const output = await this._execute(input, runnableConfig);

      // Notify callbacks: success
      await callbackManager.handleEnd(this, output, runnableConfig);

      return output;
    } catch (error) {
      // Notify callbacks: error
      await callbackManager.handleError(this, error as Error, runnableConfig);
      throw error;
    }
  }

  /**
   * Internal method that subclasses must implement
   *
   * @param _input - The input to process
   * @param _config - Optional configuration
   * @returns The processed output
   */
  async _execute(_input: any, _config: any): Promise<any> {
    throw new Error(
        `${this.name} must implement _call() method`
    );
  }

  /**
   * Stream output in chunks
   *
   * @param input - The input to process
   * @param config - Optional configuration
   * @yields Output chunks
   */
  async* streamOutput(input: any, config: any = {}): AsyncGenerator<any, void, unknown> {
    // Check if subclass has custom _streamOutput implementation
    // We need to check if it's been overridden from the base class
    const hasCustomStreamOutput = this._streamOutput !== Action.prototype._streamOutput;
    
    if (hasCustomStreamOutput) {
      // Use custom streaming implementation
      yield* this._streamOutput(input, config);
    } else {
      // Default implementation: just yield the full result
      const result = await this.run(input, config);
      yield result;
    }
  }

  /**
   * Internal streaming method for subclasses
   * Override this for custom streaming behavior
   */
  async* _streamOutput(input: any, config: any): AsyncGenerator<any, void, unknown> {
    yield await this._execute(input, config);
  }

  /**
   * Process multiple inputs in parallel
   *
   * @param inputs - Array of inputs to process
   * @param config - Optional configuration
   * @returns Array of outputs
   */
  async runBatch(inputs: any[], config: any = {}): Promise<any[]> {
    // Use Promise.all for parallel execution
    return await Promise.all(
        inputs.map(input => this.run(input, config))
    );
  }

  /**
   * Compose this Runnable with another
   * Creates a new Runnable that runs both in sequence
   *
   * @param other - The Runnable to pipe to
   * @returns A new composed Runnable
   */
  chain(other: Action): ActionPipeline {
    return new ActionPipeline([this, other]);
  }
}

/**
 * ActionPipeline - Chains multiple Actions together
 *
 * Output of one becomes input of the next
 */
export class ActionPipeline extends Action {
  steps: Action[];

  constructor(steps: Action[]) {
    super();
    this.steps = steps; // Array of Runnables
  }

  async _execute(input: any, config: any): Promise<any> {
    let output = input;

    // Run through each step sequentially
    for (const step of this.steps) {
      output = await step.run(output, config);
    }

    return output;
  }

  async *_streamOutput(input: any, config: any): AsyncGenerator<any, void, unknown> {
    let output = input;

    // Stream through all steps
    for (let i = 0; i < this.steps.length - 1; i++) {
      output = await this.steps[i].run(output, config);
    }

    // Only stream the last step
    yield* this.steps[this.steps.length - 1].streamOutput(output, config);
  }

  // pipe() returns a new sequence with the added step
  chain(other: Action): ActionPipeline {
    return new ActionPipeline([...this.steps, other]);
  }
}
