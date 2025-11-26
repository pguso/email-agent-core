import {getLlama, LlamaChatSession, Llama, LlamaModel, LlamaContext, ChatHistoryItem} from 'node-llama-cpp';
import {Action} from "../core/Action.js";
import {AIMessage, BaseMessage, HumanMessage} from "../messages/index.js";
import {LlamaCppLLMOptions} from "../types/LlamaCppLLMOptions.js";
import {GenerationConfig} from "../types/GenerationConfig.js";
import {PromptOptions} from "../types/PromptOptions.js";

/**
 * LlamaCppLLM - A Action wrapper for node-llama-cpp
 *
 * Wraps your LLM calls from agent fundamentals into a reusable,
 * composable Action component.
 *
 * Key benefits over raw node-llama-cpp:
 * - Composable with other Actions via .chain()
 * - Supports batch processing multiple inputs
 * - Built-in streaming support
 * - Consistent interface across all LLMs
 * - Easy to swap with other LLM providers
 */
export class LlamaCppLLM extends Action {
  modelPath: string;
  temperature: number;
  topP: number;
  topK: number;
  maxTokens: number;
  repeatPenalty: number;
  contextSize: number;
  batchSize: number;
  verbose: boolean;
  chatWrapper: any;
  stopStrings: string[];
  private _llama: Llama | null;
  private _model: LlamaModel | null;
  private _context: LlamaContext | null;
  private _chatSession: LlamaChatSession | null;
  private _initialized: boolean;
  private _currentStreamChunks?: string[];

  /**
   * Create a new LlamaCppLLM instance
   *
   * @param options - Configuration options
   * @param options.modelPath - Path to your GGUF model file (REQUIRED)
   * @param options.temperature - Sampling temperature (0-1)
   *   - Lower (0.1): More focused, deterministic
   *   - Higher (0.9): More creative, random
   * @param options.topP - Nucleus sampling threshold
   * @param options.topK - Top-K sampling parameter
   * @param options.maxTokens - Maximum tokens to generate
   * @param options.repeatPenalty - Penalty for repeating tokens
   * @param options.contextSize - Context window size
   * @param options.batchSize - Batch processing size
   * @param options.verbose - Enable debug logging
   * @param options.stopStrings - Strings that stop generation
   * @param options.chatWrapper - Custom chat wrapper instance (e.g., QwenChatWrapper)
   *   - If not provided, the library will automatically select the best wrapper for your model
   */
  constructor(options: LlamaCppLLMOptions) {
    super();

    // Validate required options
    this.modelPath = options.modelPath;
    if (!this.modelPath) {
      throw new Error(
          'modelPath is required. Example: new LlamaCppLLM({ modelPath: "./model.gguf" })'
      );
    }

    // Generation parameters
    // These control how the LLM generates text - same as in your fundamentals!
    this.temperature = options.temperature ?? 0.7;
    this.topP = options.topP ?? 0.9;
    this.topK = options.topK ?? 40;
    this.maxTokens = options.maxTokens ?? 2048;
    this.repeatPenalty = options.repeatPenalty ?? 1.1;

    // Context configuration
    this.contextSize = options.contextSize ?? 4096;
    this.batchSize = options.batchSize ?? 512;

    // Behavior
    this.verbose = options.verbose ?? false;

    // Chat wrapper configuration
    // If not provided, LlamaChatSession will auto-select the best wrapper
    this.chatWrapper = options.chatWrapper ?? 'auto';

    // Stop strings - when the model sees these, it stops generating
    // Default includes common chat separators
    this.stopStrings = options.stopStrings ?? [
      'Human:',
      'User:',
      '\n\nHuman:',
      '\n\nUser:'
    ];

    // Internal state (lazy initialized)
    this._llama = null;
    this._model = null;
    this._context = null;
    this._chatSession = null;
    this._initialized = false;
  }

  /**
   * Initialize model (lazy loading)
   *
   * This loads the model only when first needed, not at construction.
   * This pattern is useful because model loading is slow - we only
   * want to do it once and only when we actually need it.
   *
   * @private
   * @throws {Error} If model loading fails
   */
  private async _initialize(): Promise<void> {
    // Skip if already initialized
    if (this._initialized) return;

    if (this.verbose) {
      console.log(`Loading model: ${this.modelPath}`);
    }

    try {
      // Step 1: Get the llama instance
      this._llama = await getLlama();

      // Step 2: Load the model file
      this._model = await this._llama.loadModel({
        modelPath: this.modelPath
      });

      // Step 3: Create a context for generation
      this._context = await this._model.createContext({
        contextSize: this.contextSize,
        batchSize: this.batchSize
      });

      // Step 4: Create a chat session
      // This manages conversation history for us
      const contextSequence = this._context.getSequence();
      const sessionConfig: any = {
        contextSequence
      };

      // Add chatWrapper if specified (otherwise LlamaChatSession uses "auto")
      if (this.chatWrapper !== 'auto') {
        sessionConfig.chatWrapper = this.chatWrapper;
      }

      this._chatSession = new LlamaChatSession(sessionConfig);

      this._initialized = true;

      if (this.verbose) {
        console.log('✓ Model loaded successfully');
        if (this.chatWrapper !== 'auto') {
          console.log(`✓ Using custom chat wrapper: ${this.chatWrapper.constructor.name}`);
        } else {
          console.log('✓ Using auto-detected chat wrapper');
        }
      }
    } catch (error) {
      const err = error as Error;
      throw new Error(
          `Failed to initialize model at ${this.modelPath}: ${err.message}`
      );
    }
  }

  /**
   * Convert our Message objects to node-llama-cpp chat history format
   *
   * This bridges between our standardized Message types and what
   * node-llama-cpp expects. Think of it as a translator.
   *
   * @private
   * @param messages - Array of Message objects
   * @returns Chat history in llama.cpp format
   */
  private _messagesToChatHistory(messages: BaseMessage[]): ChatHistoryItem[] {
    return messages.map(msg => {
      switch (msg.type) {
        case "system":
          return {
            type: "system",
            text: msg.content // OK: string | LlamaTextJSON
          };

        case "human":
          return {
            type: "user",
            text: msg.content // OK: string
          };

        case "ai":
          return {
            type: "model",
            response: Array.isArray(msg.content)
                ? msg.content
                : [msg.content] // FIX: ensure array
          };

        case "tool":
          return {
            type: "system",
            text: `Tool Result: ${msg.content}`
          };

        default:
          return {
            type: "user",
            text: msg.content
          };
      }
    });
  }

  /**
   * Main generation method - this is where your LLM calls happen!
   *
   * This is the same as calling `llm.chat(messages)` in your fundamentals,
   * but wrapped to work with the Runnable interface.
   *
   * @async
   * @param input - User input or message array
   * @param config - Runtime configuration
   * @returns Generated response as AIMessage
   */
  async _execute(input: string | BaseMessage[], config: GenerationConfig = {}): Promise<AIMessage> {
    // Ensure model is loaded (only happens once)
    await this._initialize();

    if (!this._chatSession) {
      throw new Error('Chat session not initialized');
    }

    // Clear history if requested (important for batch processing)
    if (config.clearHistory) {
      this._chatSession.setChatHistory([]);
    }

    // Handle different input types
    let messages: BaseMessage[];
    if (typeof input === 'string') {
      messages = [new HumanMessage(input)];
    } else if (Array.isArray(input)) {
      messages = input;
    } else {
      throw new Error(
          'Input must be a string or array of messages. ' +
          'Example: "Hello" or [new HumanMessage("Hello")]'
      );
    }

    // Extract system message if present
    const systemMessages = messages.filter(msg => msg.type === 'system');
    const systemPrompt = systemMessages.length > 0
        ? systemMessages[0].content
        : '';

    // Convert our Message objects to llama.cpp format
    const chatHistory = this._messagesToChatHistory(messages);
    this._chatSession.setChatHistory(chatHistory as any);

    // ALWAYS set system prompt (either new value or empty string to clear)
    // Note: systemPrompt property may not exist in newer versions of node-llama-cpp
    // @ts-ignore
    this._chatSession.systemPrompt = systemPrompt;

    try {
      // Build prompt options
      const promptOptions: PromptOptions = {
        temperature: config.temperature ?? this.temperature,
        topP: config.topP ?? this.topP,
        topK: config.topK ?? this.topK,
        maxTokens: config.maxTokens ?? this.maxTokens,
        repeatPenalty: config.repeatPenalty ?? this.repeatPenalty,
        customStopTriggers: config.stopStrings ?? this.stopStrings
      };

      // Add random seed if temperature > 0 and no seed specified
      // This ensures randomness works properly
      if (promptOptions.temperature > 0 && config.seed === undefined) {
        promptOptions.seed = Math.floor(Math.random() * 1000000);
      } else if (config.seed !== undefined) {
        promptOptions.seed = config.seed;
      }

      // Generate response using prompt (simpler than promptWithMeta for non-streaming)
      const response = await this._chatSession.prompt('', promptOptions as any);

      // Return as AIMessage for consistency
      return new AIMessage(response);
    } catch (error) {
      const err = error as Error;
      throw new Error(`Generation failed: ${err.message}`);
    }
  }

  /**
   * Batch processing with history isolation
   *
   * Processes multiple inputs sequentially, ensuring each gets a clean chat history.
   * Note: Local models process requests sequentially, so there's no performance
   * benefit compared to calling invoke() multiple times.
   *
   * @async
   * @param inputs - Array of inputs to process
   * @param config - Runtime configuration
   * @returns Array of generated responses
   */
  async runBatch(inputs: (string | BaseMessage[])[], config: GenerationConfig = {}): Promise<AIMessage[]> {
    const results: AIMessage[] = [];
    for (const input of inputs) {
      // Clear history before each batch item to prevent contamination
      const result = await this._execute(input, { ...config, clearHistory: true });
      results.push(result);
    }
    return results;
  }

  /**
   * Streaming generation - show results as they're generated!
   *
   * This is the same as _call() but yields chunks as they arrive,
   * like the typing effect you see in ChatGPT.
   *
   * @async
   * @generator
   * @param input - User input or message array
   * @param config - Runtime configuration
   * @yields Chunks of generated text
   */
  async* streamOutput(input: string | BaseMessage[], config: GenerationConfig = {}): AsyncGenerator<AIMessage, void, unknown> {
    await this._initialize();

    if (!this._chatSession) {
      throw new Error('Chat session not initialized');
    }

    // Clear history if requested
    if (config.clearHistory) {
      this._chatSession.setChatHistory([]);
    }

    // Handle different input types (same as _call)
    let messages: BaseMessage[];
    if (typeof input === 'string') {
      messages = [new HumanMessage(input)];
    } else if (Array.isArray(input)) {
      messages = input;
    } else {
      throw new Error(
          'Input must be a string or array of messages for streaming'
      );
    }

    // Extract system message if present
    const systemMessages = messages.filter(msg => msg.type === 'system');
    const systemPrompt = systemMessages.length > 0
        ? systemMessages[0].content
        : '';

    // Set up chat history
    const chatHistory = this._messagesToChatHistory(messages);
    this._chatSession.setChatHistory(chatHistory as any);

    // ALWAYS set system prompt (either new value or empty string to clear)
    // Note: systemPrompt property may not exist in newer versions of node-llama-cpp
    // @ts-ignore
    this._chatSession.systemPrompt = systemPrompt;

    try {
      // Build prompt options
      const promptOptions: PromptOptions = {
        temperature: config.temperature ?? this.temperature,
        topP: config.topP ?? this.topP,
        topK: config.topK ?? this.topK,
        maxTokens: config.maxTokens ?? this.maxTokens,
        repeatPenalty: config.repeatPenalty ?? this.repeatPenalty,
        customStopTriggers: config.stopStrings ?? this.stopStrings
      };

      // Add random seed if temperature > 0 and no seed specified
      if (promptOptions.temperature > 0 && config.seed === undefined) {
        promptOptions.seed = Math.floor(Math.random() * 1000000);
      } else if (config.seed !== undefined) {
        promptOptions.seed = config.seed;
      }

      // Use onTextChunk callback to stream chunks as they arrive
      promptOptions.onTextChunk = (chunk: string) => {
        // This callback is synchronous, so we can't yield directly
        // We'll collect chunks and yield them after
        this._currentStreamChunks = this._currentStreamChunks || [];
        this._currentStreamChunks.push(chunk);
      };

      // Initialize chunk collection
      this._currentStreamChunks = [];

      // Start generation (this will call onTextChunk as it generates)
      const responsePromise = this._chatSession.prompt('', promptOptions as any);

      // Yield chunks as they become available
      let lastYieldedIndex = 0;

      // Poll for new chunks
      while (true) {
        // Yield any new chunks
        while (lastYieldedIndex < this._currentStreamChunks.length) {
          yield new AIMessage(this._currentStreamChunks[lastYieldedIndex], {
            chunk: true
          });
          lastYieldedIndex++;
        }

        // Check if generation is complete
        const isDone = await Promise.race([
          responsePromise.then(() => true),
          new Promise<boolean>(resolve => setTimeout(() => resolve(false), 10))
        ]);

        if (isDone) {
          // Yield any remaining chunks
          while (lastYieldedIndex < this._currentStreamChunks.length) {
            yield new AIMessage(this._currentStreamChunks[lastYieldedIndex], {
              chunk: true
            });
            lastYieldedIndex++;
          }
          break;
        }
      }

      // Wait for the full response
      await responsePromise;

      // Clean up
      delete this._currentStreamChunks;

    } catch (error) {
      const err = error as Error;
      throw new Error(`Streaming failed: ${err.message}`);
    }
  }

  /**
   * Cleanup resources
   *
   * LLMs hold resources in memory. Call this when you're done
   * to free them up properly.
   *
   * @async
   * @returns Promise that resolves when cleanup is complete
   */
  async dispose(): Promise<void> {
    if (this._context) {
      await this._context.dispose();
      this._context = null;
    }
    if (this._model) {
      await this._model.dispose();
      this._model = null;
    }
    this._chatSession = null;
    this._initialized = false;

    if (this.verbose) {
      console.log('✓ Model resources disposed');
    }
  }

  /**
   * String representation for debugging
   *
   * @returns Human-readable representation
   */
  toString(): string {
    return `LlamaCppLLM(model=${this.modelPath})`;
  }
}

export default LlamaCppLLM;
