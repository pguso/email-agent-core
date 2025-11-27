# Email Agent Core - In-Depth Tutorial

Welcome to the comprehensive tutorial for **email-agent-core**, a powerful framework for building intelligent email automation agents with LLM integration.

## Table of Contents

1. [Introduction](#1-introduction)
2. [Architecture Overview](#2-architecture-overview)
3. [Core Concepts](#3-core-concepts)
4. [Configuration System](#4-configuration-system)
5. [Email I/O Operations](#5-email-io-operations)
6. [The Agent Engine Framework](#6-the-agent-engine-framework)
7. [Built-in Agents](#7-built-in-agents)
8. [Building Custom Agents](#8-building-custom-agents)
9. [Advanced Patterns](#9-advanced-patterns)
10. [Best Practices](#10-best-practices)
11. [Real-World Examples](#11-real-world-examples)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Introduction

### What is email-agent-core?

**email-agent-core** is not just an email library—it's a complete framework for building intelligent, LLM-powered email automation systems. It combines:

- **Email I/O**: IMAP fetching and SMTP sending
- **AI Integration**: Support for both local LLMs (via node-llama-cpp) and cloud providers (OpenAI)
- **Agent Framework**: A composable architecture for building AI agents
- **Type Safety**: Full TypeScript support with comprehensive type definitions

### Why Use This Package?

Traditional email automation is rule-based and brittle. email-agent-core brings AI intelligence to email processing:

- **Intelligent Classification**: Understand email intent, sentiment, and priority
- **Context-Aware Responses**: Generate professional replies based on context
- **Composable Workflows**: Chain agents together for complex processing
- **Privacy Options**: Choose between local (private) or cloud (powerful) LLM processing
- **Extensible**: Build custom agents that fit your specific use case

### Package Philosophy

The framework is built on three key principles:

1. **Composability**: Everything is an `Action` that can be chained together
2. **Flexibility**: Swap LLM providers, customize prompts, extend functionality
3. **Type Safety**: Strong typing throughout ensures correctness and great DX

---

## 2. Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Your Application                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   email-agent-core                          │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Agents     │  │ Agent Engine │  │  Email I/O   │       │
│  │              │  │              │  │              │       │
│  │ - Classifier │  │ - Action     │  │ - IMAP       │       │
│  │ - Response   │  │ - Prompts    │  │ - SMTP       │       │
│  │ - Custom     │  │ - Messages   │  │ - Parser     │       │
│  │              │  │ - Parsers    │  │              │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                              │                              │
└──────────────────────────────┼──────────────────────────────┘
                               │
                               ▼
                   ┌───────────────────────┐
                   │    LLM Providers      │
                   │                       │
                   │  - LlamaCppLLM (local)│
                   │  - OpenAILLM (cloud)  │
                   └───────────────────────┘
```

### Directory Structure

```
email-agent-core/
├── src/
│   ├── agent-engine/          # Framework core
│   │   ├── core/              # Base classes
│   │   │   ├── Action.ts      # Composable action base
│   │   │   ├── BasePrompt.ts  # Prompt interface
│   │   │   ├── TemplatePrompt.ts
│   │   │   ├── BaseParser.ts  # Parser interface
│   │   │   ├── JsonParser.ts
│   │   │   └── StringParser.ts
│   │   ├── messages/          # LLM message types
│   │   │   ├── BaseMessage.ts
│   │   │   ├── HumanMessage.ts
│   │   │   ├── SystemMessage.ts
│   │   │   ├── AIMessage.ts
│   │   │   └── ToolMessage.ts
│   │   ├── llm/               # LLM implementations
│   │   │   ├── LlamaCppLLM.ts
│   │   │   └── OpenAILLM.ts
│   │   └── types/             # Type definitions
│   ├── agents/                # Concrete agent implementations
│   │   ├── EmailClassification.ts
│   │   ├── EmailResponseGenerator.ts
│   │   └── types/
│   ├── config/                # Configuration management
│   │   ├── loader.ts
│   │   ├── types.ts
│   │   └── defaults.ts
│   ├── imap/                  # Email fetching
│   │   ├── client.ts
│   │   ├── fetch.ts
│   │   └── types.ts
│   ├── smtp/                  # Email sending
│   │   ├── sendEmail.ts
│   │   └── types.ts
│   └── parse/                 # Email parsing
│       └── transform.ts
└── index.ts                   # Public API exports
```

### Component Layers

The package is organized in layers:

1. **Email I/O Layer**: IMAP client, SMTP sender, email parser
2. **Agent Engine Layer**: Framework for building composable AI agents
3. **Agent Implementation Layer**: Concrete agents (classifier, response generator)
4. **Application Layer**: Your code using the framework

---

## 3. Core Concepts

### 3.1 Actions

**Actions** are the fundamental building blocks of the framework. Every component that processes data is an Action.

#### The Action Base Class

```typescript
class Action {
  async run(input: any, config: any): Promise<any>
  async execute(input: any, config: any): Promise<any>  // Override this
  async* streamOutput(input: any, config: any): AsyncGenerator
  async runBatch(inputs: any[], config: any): Promise<any[]>
  chain(other: Action): ActionPipeline
}
```

**Key Methods:**

- `execute()`: The method you override in your custom Action
- `run()`: Public method that wraps execute() with callbacks and error handling
- `streamOutput()`: For streaming responses chunk by chunk
- `runBatch()`: Process multiple inputs in parallel
- `chain()`: Compose Actions into pipelines

**Why Actions?**

Actions provide:
- **Consistent interface**: All agents work the same way
- **Composability**: Chain Actions together with `chain()`
- **Callbacks**: Hook into lifecycle events (start, end, error)
- **Batch processing**: Built-in parallel processing support

### 3.2 Messages

Messages represent communication with LLMs. They follow a chat-based model similar to OpenAI's API.

#### Message Types

**1. SystemMessage**
```typescript
new SystemMessage("You are a helpful email assistant.")
```
Sets the context and behavior for the LLM.

**2. HumanMessage**
```typescript
new HumanMessage("Classify this email: ...")
```
Represents user/human input to the LLM.

**3. AIMessage**
```typescript
new AIMessage("Based on the email content...")
```
Represents LLM's response. Returned by LLM.run().

**4. ToolMessage**
```typescript
new ToolMessage("Function result: ...", toolCallId)
```
For function calling and tool use (advanced feature).

#### Message Flow

```
Your Code → [SystemMessage, HumanMessage] → LLM → AIMessage → Parser → Result
```

### 3.3 Prompts

Prompts define how to construct LLM input from variables.

#### TemplatePrompt

The most common prompt type uses `{variable}` placeholders:

```typescript
const prompt = TemplatePrompt.fromTemplate(`
  Classify this email:
  Subject: {subject}
  Body: {body}
`);

const rendered = await prompt.run({ 
  subject: "Booking Request",
  body: "I need a room for 2 nights" 
});
```

**Features:**
- Automatic variable extraction from `{placeholders}`
- Variable validation
- Can define partial variables and default values
- Extends Action, so it's composable

### 3.4 Parsers

Parsers transform LLM output into structured data.

#### JsonOutputParser

```typescript
const parser = new JsonOutputParser({
  schema: {
    category: "string",
    priority: "string",
    confidence: "number"
  }
});

const result = await parser.run(aiMessage.content);
// Result is parsed JSON object
```

#### StringParser

For simple string outputs:

```typescript
const parser = new StringParser();
const text = await parser.run(aiMessage.content);
```

### 3.5 LLM Providers

Two LLM implementations are provided.

#### LlamaCppLLM (Local)

```typescript
const llm = new LlamaCppLLM({
  modelPath: "./models/llama-3-8b.gguf",
  temperature: 0.7,
  maxTokens: 1000
});
```

**Pros:**
- Complete privacy (no data leaves your server)
- No API costs
- Offline operation
- GDPR compliant

**Cons:**
- Requires downloading model files (several GB)
- Slower inference (depends on hardware)
- Higher memory requirements

#### OpenAILLM (Cloud)

```typescript
const llm = new OpenAILLM({
  model: "gpt-4o-mini",
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0.2
});
```

**Pros:**
- Fast inference
- State-of-the-art models
- No local resources needed

**Cons:**
- API costs
- Data sent to third party
- Requires internet connection
- Privacy considerations

---

## 4. Configuration System

### Configuration File

The package uses `email-agent-core.config.json` for email credentials:

```json
{
  "imap": {
    "host": "imap.gmail.com",
    "port": 993,
    "tls": true,
    "user": "your-email@gmail.com",
    "pass": "your-app-password"
  },
  "smtp": {
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": false,
    "user": "your-email@gmail.com",
    "pass": "your-app-password"
  }
}
```

### Creating Configuration

**Option 1: Use the CLI**
```bash
npx email-agent-core init
```

**Option 2: Create manually**

Create `email-agent-core.config.json` in your project root with the structure above.

### Loading Configuration

```typescript
import { loadEmailConfig } from "email-agent-core";

const config = loadEmailConfig();
// Returns: { imap: {...}, smtp: {...} }
```

The loader:
1. Looks for `email-agent-core.config.json` in current directory
2. Validates the structure
3. Returns typed configuration object

### Gmail Setup

For Gmail:

1. Enable 2FA on your Google account
2. Go to Google Account → Security → App passwords
3. Generate an app password
4. Use the app password (not your regular password) in config

---

## 5. Email I/O Operations

This section covers how to fetch emails via IMAP, send emails via SMTP, and parse email content.

### 5.1 Fetching Emails with IMAP

#### Using EmailImapClient

The `EmailImapClient` class provides a simple interface to connect to IMAP servers and fetch emails.

**Basic Usage:**

```typescript
import { EmailImapClient } from "email-agent-core";

const config = {
  host: "imap.gmail.com",
  port: 993,
  tls: true,
  user: "your-email@gmail.com",
  pass: "your-app-password"
};

const client = new EmailImapClient(config);

// Connect to the server
await client.connect();

// Fetch the latest 10 emails
const emails = await client.fetchLatest(10);

console.log(`Fetched ${emails.length} emails`);
```

**What fetchLatest() Returns:**

The method returns an array of raw message objects with:
- `uid`: Unique identifier for the email
- `attributes`: Email metadata (flags, date, etc.)
- `body`: Raw email content (headers + body)

#### Using the High-Level fetchLatestEmails Function

For convenience, use `fetchLatestEmails()` which automatically loads config and returns parsed emails:

```typescript
import { fetchLatestEmails } from "email-agent-core";

// Loads config from email-agent-core.config.json
const emails = await fetchLatestEmails(5);

// Returns array of FetchedEmail objects (already parsed)
emails.forEach(email => {
  console.log(`From: ${email.from}`);
  console.log(`Subject: ${email.subject}`);
  console.log(`Body: ${email.text}`);
});
```

**FetchedEmail Structure:**

```typescript
interface FetchedEmail {
  uid: number;
  date: Date | null;
  from: string | null;
  to: string | null;
  subject: string;
  text: string;        // Plain text body
  html: string;        // HTML body
  messageId: string;
  flags: string[];     // e.g., ["\\Seen", "\\Flagged"]
}
```

#### IMAP Search Criteria

Internally, `EmailImapClient` uses IMAP search. You can customize search criteria:

```typescript
// In helpers.ts, searchMessages accepts IMAP criteria
// Common criteria: "ALL", "UNSEEN", "SINCE <date>", "FROM <email>"
```

### 5.2 Sending Emails with SMTP

#### Using sendEmail Function

The `sendEmail()` function sends emails using your SMTP configuration:

```typescript
import { sendEmail } from "email-agent-core";

const result = await sendEmail({
  to: "recipient@example.com",
  subject: "Booking Confirmation",
  text: "Thank you for your booking request...",
  html: "<p>Thank you for your booking request...</p>"
});

console.log("Message ID:", result.messageId);
console.log("Accepted:", result.accepted);
console.log("Rejected:", result.rejected);
```

**SendEmailOptions:**

```typescript
interface SendEmailOptions {
  to: string;              // Required: recipient email
  subject?: string;        // Email subject
  text?: string;           // Plain text body
  html?: string;           // HTML body
  user?: string;           // Optional: override sender
}
```

**SendEmailResult:**

```typescript
interface SendEmailResult {
  messageId: string;       // Unique message ID
  accepted: string[];      // Successfully accepted recipients
  rejected: string[];      // Rejected recipients
}
```

#### Complete Send/Receive Example

```typescript
import { fetchLatestEmails, sendEmail } from "email-agent-core";

// Fetch unread emails
const emails = await fetchLatestEmails(5);

for (const email of emails) {
  // Process email...
  const responseText = `Thank you for your email regarding: ${email.subject}`;
  
  // Send reply
  await sendEmail({
    to: email.from!,
    subject: `Re: ${email.subject}`,
    text: responseText
  });
  
  console.log(`Replied to ${email.from}`);
}
```

### 5.3 Email Parsing

#### toFetchedEmail Transformer

The `toFetchedEmail()` function converts raw IMAP messages to clean `FetchedEmail` objects:

```typescript
import { toFetchedEmail } from "email-agent-core";

// rawMessage is from EmailImapClient.fetchLatest()
const parsedEmail = toFetchedEmail(rawMessage);

console.log({
  uid: parsedEmail.uid,
  from: parsedEmail.from,
  subject: parsedEmail.subject,
  text: parsedEmail.text,
  date: parsedEmail.date
});
```

**What It Does:**

1. Extracts UID and attributes from raw message
2. Parses email headers using `mailparser`
3. Extracts text and HTML bodies
4. Formats sender/recipient addresses
5. Handles dates and message IDs
6. Returns strongly-typed object

#### Accessing Email Parts

```typescript
const email = await fetchLatestEmails(1).then(e => e[0]);

// Plain text content (best for LLM processing)
console.log(email.text);

// HTML content (for display)
console.log(email.html);

// Metadata
console.log(email.date);
console.log(email.flags);  // ["\\Seen"] etc.

// Email addresses
console.log(email.from);   // "sender@example.com"
console.log(email.to);     // "recipient@example.com"
```

### 5.4 Error Handling

Always wrap email I/O in try-catch blocks:

```typescript
import { EmailImapClient } from "email-agent-core";

const client = new EmailImapClient(config);

try {
  await client.connect();
  const emails = await client.fetchLatest(10);
  console.log(`Fetched ${emails.length} emails`);
} catch (error) {
  console.error("IMAP Error:", error);
  // Handle authentication errors, connection timeouts, etc.
} finally {
  // Always disconnect
  await client.disconnect();
}
```

**Common IMAP Errors:**

- **Authentication Failed**: Wrong credentials or app password not enabled
- **Connection Timeout**: Network issues or wrong host/port
- **Mailbox Not Found**: Invalid mailbox name (default is "INBOX")

**Common SMTP Errors:**

- **Authentication Failed**: Wrong SMTP credentials
- **Recipient Rejected**: Invalid or blocked recipient address
- **Message Too Large**: Email exceeds size limits

---

## 6. The Agent Engine Framework

The Agent Engine is the heart of email-agent-core. It provides the composable architecture for building AI-powered agents.

### 6.1 The Action Lifecycle

Every agent in the framework extends the `Action` base class. Understanding its lifecycle is key to building custom agents.

#### Action Execution Flow

```
User calls run() 
    ↓
Normalize config to ActionContext
    ↓
Create CallbackManager
    ↓
handleStart callbacks (optional)
    ↓
Call execute() (your implementation)
    ↓
handleEnd callbacks (success) OR handleError callbacks (failure)
    ↓
Return result or throw error
```

#### The execute() Method

This is where you implement your agent's logic:

```typescript
class MyAgent extends Action {
  async execute(input: any, config: any): Promise<any> {
    // Your agent logic here
    // 1. Process input
    // 2. Call LLM or other services
    // 3. Return result
    return result;
  }
}
```

**Key Points:**

- `execute()` is called by `run()` - never call it directly
- Use `run()` for execution - it adds error handling and callbacks
- `config` can contain callbacks, custom parameters, etc.
- Always return a value or throw an error

#### ActionContext

`ActionContext` is a flexible configuration object:

```typescript
const context = new ActionContext({
  callbacks: [loggingCallback, metricsCallback],
  maxRetries: 3,
  timeout: 30000,
  customParam: "value"
});

const result = await agent.run(input, context);
```

### 6.2 Composing Actions with chain()

The power of Actions is composability. Use `chain()` to create pipelines:

```typescript
import { EmailClassifier, EmailResponseGenerator } from "email-agent-core";

const classifier = new EmailClassifier(llm);
const generator = new EmailResponseGenerator(llm);

// Create a pipeline
const pipeline = classifier.chain(generator);

// Execute the pipeline
const result = await pipeline.run({
  subject: "Booking Request",
  body: "I need a room..."
});

// Result flows: input → classifier → generator → final result
```

**How chain() Works:**

1. Creates an `ActionPipeline` with both actions
2. Output of first action becomes input of second
3. Can chain multiple actions: `a.chain(b).chain(c).chain(d)`
4. Each action sees the output of the previous one

**ActionPipeline:**

```typescript
class ActionPipeline extends Action {
  steps: Action[];
  
  async execute(input: any, config: any): Promise<any> {
    let output = input;
    for (const step of this.steps) {
      output = await step.run(output, config);
    }
    return output;
  }
}
```

### 6.3 Batch Processing

Process multiple inputs in parallel with `runBatch()`:

```typescript
const emails = [
  { subject: "Booking", body: "..." },
  { subject: "Inquiry", body: "..." },
  { subject: "Complaint", body: "..." }
];

// Process all in parallel
const classifications = await classifier.runBatch(emails);

console.log(classifications);
// [{ category: "booking", ... }, { category: "inquiry", ... }, ...]
```

**Performance Benefits:**

- Parallel execution with `Promise.all()`
- Faster than sequential processing
- Ideal for processing multiple emails at once

### 6.4 Streaming Output

For real-time responses, use `streamOutput()`:

```typescript
const generator = new EmailResponseGenerator(llm);

// Stream the response chunk by chunk
for await (const chunk of generator.streamOutput(input)) {
  process.stdout.write(chunk);
}
```

**When to Use Streaming:**

- Long-running LLM responses
- Real-time UI updates
- Progressive response generation
- Better user experience for slow operations

**Implementing Custom Streaming:**

```typescript
class MyStreamingAgent extends Action {
  async* _streamOutput(input: any, config: any): AsyncGenerator<string, void, unknown> {
    // Yield chunks as they become available
    yield "Processing";
    yield "...";
    yield "Done!";
  }
}
```

### 6.5 Working with Prompts

Prompts transform variables into LLM input strings.

#### TemplatePrompt Basics

```typescript
import { TemplatePrompt } from "email-agent-core";

const prompt = TemplatePrompt.fromTemplate(`
  Analyze this email:
  Subject: {subject}
  Body: {body}
  
  Provide a classification.
`);

// Render the prompt
const rendered = await prompt.run({
  subject: "Booking Request",
  body: "I need a room for 2 nights"
});

console.log(rendered);
// Analyze this email:
// Subject: Booking Request
// Body: I need a room for 2 nights
// 
// Provide a classification.
```

#### Variable Extraction

`TemplatePrompt` automatically extracts `{variable}` placeholders:

```typescript
const template = "Hello {name}, your order {orderId} is ready!";
const prompt = TemplatePrompt.fromTemplate(template);

console.log(prompt.inputVariables);
// ["name", "orderId"]
```

#### Partial Variables

You can set default values for some variables:

```typescript
const prompt = new TemplatePrompt({
  template: "Hello {name}, welcome to {hotel}!",
  partialVariables: {
    hotel: "Grand Hotel"  // Default value
  }
});

// Only need to provide 'name'
const rendered = await prompt.run({ name: "John" });
// "Hello John, welcome to Grand Hotel!"
```

#### Using Prompts in Agents

```typescript
class MyClassifier extends Action {
  private prompt: TemplatePrompt;
  
  constructor() {
    super();
    this.prompt = TemplatePrompt.fromTemplate(`
      Classify: {text}
      Return JSON with category and confidence.
    `);
  }
  
  async execute(input: { text: string }): Promise<any> {
    const promptText = await this.prompt.run({ text: input.text });
    // Send promptText to LLM...
  }
}
```

### 6.6 Working with Messages

Messages structure the conversation with LLMs.

#### Message Types and Usage

**SystemMessage - Set Context:**

```typescript
import { SystemMessage } from "email-agent-core";

const systemMsg = new SystemMessage(
  "You are a professional hotel receptionist. Be friendly and helpful."
);
```

**HumanMessage - User Input:**

```typescript
import { HumanMessage } from "email-agent-core";

const humanMsg = new HumanMessage(
  "Classify this email: Subject: Booking Request, Body: ..."
);
```

**AIMessage - LLM Response:**

```typescript
// Returned by LLM.run()
const aiMsg = await llm.run([systemMsg, humanMsg]);
console.log(aiMsg.content);  // "{ category: 'booking', ... }"
```

#### Multi-Turn Conversations

```typescript
const messages = [
  new SystemMessage("You are a helpful assistant."),
  new HumanMessage("What's the weather like?"),
  new AIMessage("I don't have access to weather data."),
  new HumanMessage("Then what can you help with?"),
];

const response = await llm.run(messages);
```

#### Message Content

Messages contain:
- `content`: String content of the message
- `role`: "system", "user", "assistant", or "tool"
- Additional metadata (varies by provider)

### 6.7 Working with Parsers

Parsers transform LLM output into structured data.

#### JsonOutputParser

Most common parser for structured output:

```typescript
import { JsonOutputParser } from "email-agent-core";

const parser = new JsonOutputParser({
  schema: {
    category: "string",
    priority: "string",
    confidence: "number",
    advert: "boolean"
  }
});

const llmResponse = await llm.run(messages);
const parsed = await parser.run(llmResponse.content);

console.log(parsed);
// { category: "booking", priority: "high", confidence: 0.95, advert: false }
```

**Schema Validation:**

The schema is optional but recommended:
- Validates expected fields
- Documents the output structure
- Helps with TypeScript typing

**Handling Parse Errors:**

```typescript
try {
  const parsed = await parser.run(llmResponse.content);
} catch (error) {
  console.error("Failed to parse JSON:", error);
  // LLM might have returned invalid JSON
  // Consider retrying or using a fallback
}
```

#### StringParser

For simple text output:

```typescript
import { StringParser } from "email-agent-core";

const parser = new StringParser();
const text = await parser.run(llmResponse.content);
// Just returns the content as-is (string)
```

#### Custom Parsers

Extend `BaseParser` for custom parsing:

```typescript
import { BaseParser } from "email-agent-core";

class CsvParser extends BaseParser {
  async execute(input: string): Promise<string[][]> {
    return input.split('\n').map(line => line.split(','));
  }
}

const parser = new CsvParser();
const rows = await parser.run(csvString);
```

### 6.8 LLM Interface

Both `LlamaCppLLM` and `OpenAILLM` implement the same interface.

#### Common LLM Methods

```typescript
interface LLM {
  run(messages: BaseMessage[]): Promise<AIMessage>;
}
```

**Using LLMs:**

```typescript
import { LlamaCppLLM, SystemMessage, HumanMessage } from "email-agent-core";

const llm = new LlamaCppLLM({
  modelPath: "./models/llama-3-8b.gguf",
  temperature: 0.7
});

const response = await llm.run([
  new SystemMessage("You are a helpful assistant."),
  new HumanMessage("Hello!")
]);

console.log(response.content);  // "Hello! How can I help you today?"
```

#### LlamaCppLLM Options

```typescript
const llm = new LlamaCppLLM({
  modelPath: "./models/model.gguf",  // Required
  temperature: 0.7,                   // Default: 0.7
  maxTokens: 1000,                    // Default: 512
  topP: 0.9,                          // Nucleus sampling
  topK: 40,                           // Top-K sampling
  repeatPenalty: 1.1,                 // Reduce repetition
  contextSize: 4096                   // Context window size
});
```

#### OpenAILLM Options

```typescript
const llm = new OpenAILLM({
  model: "gpt-4o-mini",               // Required
  apiKey: process.env.OPENAI_API_KEY, // Required
  temperature: 0.2,                   // Default: 0.7
  maxTokens: 1000,                    // Max response tokens
  topP: 1.0,                          // Nucleus sampling
  frequencyPenalty: 0.0,              // Reduce repetition
  presencePenalty: 0.0                // Encourage diversity
});
```

#### Swapping LLM Providers

Because they share the same interface, swapping is easy:

```typescript
// Local LLM
const localLLM = new LlamaCppLLM({ modelPath: "..." });
const classifier1 = new EmailClassifier(localLLM);

// Cloud LLM
const cloudLLM = new OpenAILLM({ model: "gpt-4o-mini", apiKey: "..." });
const classifier2 = new EmailClassifier(cloudLLM);

// Same interface, different implementation
```

---

## 7. Built-in Agents

The package includes two production-ready agents for email automation.

### 7.1 EmailClassifier

The `EmailClassifier` agent analyzes emails and extracts structured information.

#### Basic Usage

```typescript
import { EmailClassifier, LlamaCppLLM } from "email-agent-core";

const llm = new LlamaCppLLM({
  modelPath: "./models/llama-3-8b.gguf",
  temperature: 0.7
});

const classifier = new EmailClassifier(llm);

const classification = await classifier.run({
  subject: "Booking Request for December",
  body: "Hi, I would like to book a room for 2 nights from Dec 1-3..."
});

console.log(classification);
```

#### Classification Output

```typescript
interface EmailClassification {
  category: 'booking' | 'inquiry' | 'complaint' | 'cancellation' | 'other';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  sentiment: 'positive' | 'neutral' | 'negative';
  advert: boolean;
  extractedInfo: {
    guestName?: string;
    checkIn?: string;
    checkOut?: string;
    roomType?: string;
    numberOfGuests?: number;
  };
  suggestedAction: string;
  confidence: number;  // 0.0 - 1.0
}
```

**Field Explanations:**

- **category**: Primary type of email (booking, inquiry, etc.)
- **priority**: How urgently it needs attention
- **sentiment**: Emotional tone of the email
- **advert**: Whether it's a marketing/spam email
- **extractedInfo**: Key details extracted from the email
- **suggestedAction**: LLM's recommendation for next steps
- **confidence**: How confident the LLM is (0-1 scale)

#### Customizing the Classification Prompt

You can provide your own prompt template:

```typescript
import { EmailClassifier, TemplatePrompt } from "email-agent-core";

const customPrompt = TemplatePrompt.fromTemplate(`
You are analyzing a customer email for an e-commerce business.

Subject: {subject}
Body: {body}

Classify this email and return JSON with:
- category: order | return | inquiry | complaint | other
- priority: urgent | high | medium | low
- sentiment: positive | neutral | negative
- advert: boolean
- extractedInfo: { orderNumber?, customerName?, issue? }
- suggestedAction: string
- confidence: number (0.0-1.0)

Respond ONLY with valid JSON.
`);

const classifier = new EmailClassifier(llm, customPrompt);
```

#### Using with OpenAI

```typescript
import { EmailClassifier, OpenAILLM } from "email-agent-core";

const llm = new OpenAILLM({
  model: "gpt-4o-mini",
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0.2  // Lower temperature for more consistent classification
});

const classifier = new EmailClassifier(llm);
```

#### Batch Classification

Process multiple emails at once:

```typescript
const emails = [
  { subject: "Booking", body: "..." },
  { subject: "Inquiry", body: "..." },
  { subject: "Complaint", body: "..." }
];

const classifications = await classifier.runBatch(emails);

classifications.forEach((result, i) => {
  console.log(`Email ${i + 1}:`);
  console.log(`  Category: ${result.category}`);
  console.log(`  Priority: ${result.priority}`);
  console.log(`  Confidence: ${result.confidence}`);
});
```

#### Real-World Usage Pattern

```typescript
import { fetchLatestEmails, EmailClassifier } from "email-agent-core";

const emails = await fetchLatestEmails(10);

for (const email of emails) {
  const classification = await classifier.run({
    subject: email.subject,
    body: email.text
  });
  
  // Filter out spam
  if (classification.advert) {
    console.log("Skipping advertisement");
    continue;
  }
  
  // Route based on category and priority
  if (classification.priority === 'urgent') {
    await notifyTeam(email, classification);
  }
  
  if (classification.category === 'booking') {
    await processBooking(email, classification.extractedInfo);
  }
}
```

### 7.2 EmailResponseGenerator

The `EmailResponseGenerator` creates professional email replies based on context.

#### Basic Usage

```typescript
import { EmailResponseGenerator, LlamaCppLLM } from "email-agent-core";

const llm = new LlamaCppLLM({
  modelPath: "./models/llama-3-8b.gguf",
  temperature: 0.7
});

const generator = new EmailResponseGenerator(llm);

const response = await generator.run({
  originalEmail: "Hi, I'd like to book a room for 2 nights...",
  context: {
    hotelName: "Grand Hotel",
    guestName: "John Doe",
    requestType: "booking",
    roomsAvailable: true,
    suggestedPrice: 150,
    checkInDate: "2024-12-01",
    checkOutDate: "2024-12-03",
    hotelPolicies: {
      checkInTime: "3:00 PM",
      checkOutTime: "11:00 AM",
      cancellation: "Free cancellation up to 24 hours before check-in"
    }
  }
});

console.log(response);
// Professional email response ready to send
```

#### Response Context

```typescript
interface ResponseContext {
  hotelName: string;
  guestName?: string;
  requestType: string;
  roomsAvailable: boolean;
  suggestedPrice?: number;
  checkInDate?: string;
  checkOutDate?: string;
  employeeName?: string;
  hotelPolicies: {
    checkInTime: string;
    checkOutTime: string;
    cancellation: string;
  };
}
```

#### Customizing the Response Template

```typescript
import { EmailResponseGenerator, TemplatePrompt } from "email-agent-core";

const customTemplate = TemplatePrompt.fromTemplate(`
You are a customer service representative for {hotelName}.

Customer: {guestName}
Request: {requestType}
Original Email: {originalEmail}

Context:
- Rooms available: {roomsAvailable}
- Price: {suggestedPrice}
- Check-in: {checkInDate}
- Check-out: {checkOutDate}

Write a professional, friendly response that:
1. Addresses the customer by name
2. Answers their specific request
3. Provides relevant information
4. Ends with a clear call-to-action

Keep the tone warm and professional.
DO NOT use markdown formatting.
`);

const generator = new EmailResponseGenerator(llm, customTemplate);
```

#### Complete Workflow Example

```typescript
import { 
  fetchLatestEmails, 
  EmailClassifier, 
  EmailResponseGenerator,
  sendEmail 
} from "email-agent-core";

const classifier = new EmailClassifier(llm);
const generator = new EmailResponseGenerator(llm);

const emails = await fetchLatestEmails(5);

for (const email of emails) {
  // Step 1: Classify
  const classification = await classifier.run({
    subject: email.subject,
    body: email.text
  });
  
  // Step 2: Skip ads and low priority
  if (classification.advert || classification.priority === 'low') {
    continue;
  }
  
  // Step 3: Generate response
  const responseText = await generator.run({
    originalEmail: email.text,
    context: {
      hotelName: "Grand Hotel",
      guestName: classification.extractedInfo.guestName,
      requestType: classification.category,
      roomsAvailable: true,
      checkInDate: classification.extractedInfo.checkIn,
      checkOutDate: classification.extractedInfo.checkOut,
      hotelPolicies: {
        checkInTime: "3:00 PM",
        checkOutTime: "11:00 AM",
        cancellation: "Free cancellation up to 24 hours before check-in"
      }
    }
  });
  
  // Step 4: Send response
  await sendEmail({
    to: email.from!,
    subject: `Re: ${email.subject}`,
    text: responseText
  });
  
  console.log(`Sent response to ${email.from}`);
}
```

#### Chaining Classifier and Generator

```typescript
// Create a pipeline
const pipeline = classifier.chain(generator);

// This won't work directly because outputs don't match inputs
// You need an adapter:

class ClassificationToResponseAdapter extends Action {
  async execute(classification: EmailClassification): Promise<any> {
    return {
      originalEmail: classification.originalEmail,
      context: {
        hotelName: "Grand Hotel",
        guestName: classification.extractedInfo.guestName,
        requestType: classification.category,
        roomsAvailable: true,
        // ... other context
      }
    };
  }
}

const adapter = new ClassificationToResponseAdapter();
const pipeline = classifier.chain(adapter).chain(generator);

const response = await pipeline.run({
  subject: "Booking Request",
  body: "..."
});
```

### 7.3 Understanding Default Prompts

Both agents use carefully crafted default prompts that you can access:

```typescript
import { 
  DEFAULT_CLASSIFICATION_TEMPLATE,
  DEFAULT_RESPONSE_TEMPLATE 
} from "email-agent-core";

console.log(DEFAULT_CLASSIFICATION_TEMPLATE);
console.log(DEFAULT_RESPONSE_TEMPLATE);
```

**Why You Might Customize:**

- Different industry (not a hotel)
- Different classification categories
- Different output format
- Different tone or style
- Different language

**Best Practices for Custom Prompts:**

1. **Be Explicit**: Clearly define expected output format
2. **Use Examples**: Include examples in the prompt if needed
3. **Specify JSON**: Always ask for JSON when using JsonOutputParser
4. **Set Tone**: Explicitly state the desired tone (formal, casual, etc.)
5. **Include Constraints**: Mention what NOT to do

---

## 8. Building Custom Agents

Learn how to build your own agents from scratch using the Action framework.

### 8.1 Simple Agent Example

Let's build a simple email sentiment analyzer:

```typescript
import { Action, LlamaCppLLM, HumanMessage, SystemMessage } from "email-agent-core";

class SentimentAnalyzer extends Action {
  private llm: LlamaCppLLM;
  
  constructor(llm: LlamaCppLLM) {
    super();
    this.llm = llm;
  }
  
  async execute(input: { text: string }): Promise<string> {
    const response = await this.llm.run([
      new SystemMessage("You are a sentiment analyzer. Reply with only: positive, negative, or neutral."),
      new HumanMessage(`Analyze sentiment: ${input.text}`)
    ]);
    
    return response.content.trim().toLowerCase();
  }
}

// Usage
const llm = new LlamaCppLLM({ modelPath: "./models/llama.gguf" });
const analyzer = new SentimentAnalyzer(llm);

const sentiment = await analyzer.run({ text: "I love this product!" });
console.log(sentiment);  // "positive"
```

### 8.2 Agent with Prompt Template

Add a customizable prompt using `TemplatePrompt`:

```typescript
import { Action, TemplatePrompt, LlamaCppLLM, HumanMessage } from "email-agent-core";

class EmailSummarizer extends Action {
  private llm: LlamaCppLLM;
  private prompt: TemplatePrompt;
  
  constructor(llm: LlamaCppLLM, promptTemplate?: TemplatePrompt) {
    super();
    this.llm = llm;
    this.prompt = promptTemplate || TemplatePrompt.fromTemplate(`
      Summarize this email in 2-3 sentences:
      
      From: {from}
      Subject: {subject}
      Body: {body}
      
      Summary:
    `);
  }
  
  async execute(input: { from: string; subject: string; body: string }): Promise<string> {
    const promptText = await this.prompt.run(input);
    const response = await this.llm.run([new HumanMessage(promptText)]);
    return response.content;
  }
}

// Usage
const summarizer = new EmailSummarizer(llm);
const summary = await summarizer.run({
  from: "john@example.com",
  subject: "Project Update",
  body: "Long email content..."
});
```

### 8.3 Agent with Structured Output

Use `JsonOutputParser` for structured results:

```typescript
import { 
  Action, 
  TemplatePrompt, 
  JsonOutputParser,
  LlamaCppLLM,
  HumanMessage,
  SystemMessage 
} from "email-agent-core";

interface KeywordExtraction {
  keywords: string[];
  topics: string[];
  entities: string[];
}

class KeywordExtractor extends Action {
  private llm: LlamaCppLLM;
  private prompt: TemplatePrompt;
  private parser: JsonOutputParser;
  
  constructor(llm: LlamaCppLLM) {
    super();
    this.llm = llm;
    
    this.prompt = TemplatePrompt.fromTemplate(`
      Extract keywords, topics, and entities from this email:
      
      {emailText}
      
      Return ONLY valid JSON with this structure:
      {
        "keywords": ["keyword1", "keyword2"],
        "topics": ["topic1", "topic2"],
        "entities": ["entity1", "entity2"]
      }
    `);
    
    this.parser = new JsonOutputParser({
      schema: {
        keywords: "array",
        topics: "array",
        entities: "array"
      }
    });
  }
  
  async execute(input: { emailText: string }): Promise<KeywordExtraction> {
    const promptText = await this.prompt.run(input);
    
    const response = await this.llm.run([
      new SystemMessage("You are a keyword extraction assistant."),
      new HumanMessage(promptText)
    ]);
    
    return this.parser.run(response.content);
  }
}

// Usage
const extractor = new KeywordExtractor(llm);
const result = await extractor.run({ 
  emailText: "Email about project deadlines and budget..." 
});

console.log(result.keywords);   // ["project", "deadline", "budget"]
console.log(result.topics);     // ["project management", "finance"]
console.log(result.entities);   // ["Q4", "$50,000"]
```

### 8.4 Agent with Error Handling

Add robust error handling:

```typescript
import { Action, LlamaCppLLM } from "email-agent-core";

class RobustClassifier extends Action {
  private llm: LlamaCppLLM;
  private maxRetries: number;
  
  constructor(llm: LlamaCppLLM, maxRetries: number = 3) {
    super();
    this.llm = llm;
    this.maxRetries = maxRetries;
  }
  
  async execute(input: { text: string }): Promise<any> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        // Attempt classification
        const response = await this.llm.run([
          new HumanMessage(`Classify: ${input.text}`)
        ]);
        
        // Try to parse JSON
        const result = JSON.parse(response.content);
        
        // Validate structure
        if (!result.category) {
          throw new Error("Missing required field: category");
        }
        
        return result;
        
      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${attempt} failed:`, error);
        
        if (attempt < this.maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }
    }
    
    // All retries failed
    throw new Error(`Failed after ${this.maxRetries} attempts: ${lastError!.message}`);
  }
}
```

### 8.5 Stateful Agent

Create an agent that maintains state:

```typescript
import { Action } from "email-agent-core";

class EmailCounter extends Action {
  private counts: Map<string, number>;
  
  constructor() {
    super();
    this.counts = new Map();
  }
  
  async execute(input: { category: string }): Promise<{ category: string; count: number }> {
    const { category } = input;
    const currentCount = this.counts.get(category) || 0;
    const newCount = currentCount + 1;
    
    this.counts.set(category, newCount);
    
    return {
      category,
      count: newCount
    };
  }
  
  getStats(): Record<string, number> {
    return Object.fromEntries(this.counts);
  }
  
  reset(): void {
    this.counts.clear();
  }
}

// Usage
const counter = new EmailCounter();

await counter.run({ category: "booking" });
await counter.run({ category: "inquiry" });
await counter.run({ category: "booking" });

console.log(counter.getStats());
// { booking: 2, inquiry: 1 }
```

### 8.6 Agent with External API

Integrate with external services:

```typescript
import { Action } from "email-agent-core";
import fetch from "node-fetch";

class WeatherAgent extends Action {
  private apiKey: string;
  
  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }
  
  async execute(input: { city: string }): Promise<any> {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${input.city}&appid=${this.apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    return {
      city: input.city,
      temperature: data.main.temp,
      conditions: data.weather[0].description
    };
  }
}

// Usage
const weatherAgent = new WeatherAgent(process.env.WEATHER_API_KEY!);
const weather = await weatherAgent.run({ city: "London" });
```

### 8.7 Streaming Agent

Implement streaming for real-time output:

```typescript
import { Action, LlamaCppLLM, HumanMessage } from "email-agent-core";

class StreamingWriter extends Action {
  private llm: LlamaCppLLM;
  
  constructor(llm: LlamaCppLLM) {
    super();
    this.llm = llm;
  }
  
  async execute(input: { prompt: string }): Promise<string> {
    const response = await this.llm.run([new HumanMessage(input.prompt)]);
    return response.content;
  }
  
  // Custom streaming implementation
  async* _streamOutput(input: { prompt: string }): AsyncGenerator<string, void, unknown> {
    // Simulate streaming (replace with actual LLM streaming)
    const response = await this.execute(input);
    const words = response.split(' ');
    
    for (const word of words) {
      yield word + ' ';
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
}

// Usage
const writer = new StreamingWriter(llm);

for await (const chunk of writer.streamOutput({ prompt: "Write a greeting" })) {
  process.stdout.write(chunk);
}
```

### 8.8 Complete Custom Agent Template

Here's a complete template for building agents:

```typescript
import {
  Action,
  TemplatePrompt,
  JsonOutputParser,
  LlamaCppLLM,
  SystemMessage,
  HumanMessage
} from "email-agent-core";

// 1. Define your output interface
interface MyAgentOutput {
  field1: string;
  field2: number;
  field3: boolean;
}

// 2. Create your agent class
class MyCustomAgent extends Action {
  private llm: LlamaCppLLM;
  private prompt: TemplatePrompt;
  private parser: JsonOutputParser;
  
  // 3. Constructor with dependencies
  constructor(
    llm: LlamaCppLLM,
    promptTemplate?: TemplatePrompt
  ) {
    super();
    this.llm = llm;
    
    // 4. Define default prompt
    this.prompt = promptTemplate || TemplatePrompt.fromTemplate(`
      Your prompt here with {variables}
    `);
    
    // 5. Setup parser
    this.parser = new JsonOutputParser({
      schema: {
        field1: "string",
        field2: "number",
        field3: "boolean"
      }
    });
  }
  
  // 6. Implement execute method
  async execute(input: { /* your input type */ }): Promise<MyAgentOutput> {
    // 6a. Prepare prompt
    const promptText = await this.prompt.run(input);
    
    // 6b. Call LLM
    const response = await this.llm.run([
      new SystemMessage("System context here"),
      new HumanMessage(promptText)
    ]);
    
    // 6c. Parse and return result
    return this.parser.run(response.content);
  }
  
  // 7. Optional: Add helper methods
  validate(output: MyAgentOutput): boolean {
    return output.field1.length > 0 && output.field2 > 0;
  }
}

// 8. Export for use
export { MyCustomAgent, MyAgentOutput };
```

### 8.9 Testing Custom Agents

Always test your agents:

```typescript
import { describe, it, expect } from "vitest";
import { MyCustomAgent } from "./MyCustomAgent";

describe("MyCustomAgent", () => {
  it("should process input correctly", async () => {
    const agent = new MyCustomAgent(llm);
    
    const result = await agent.run({ /* test input */ });
    
    expect(result).toBeDefined();
    expect(result.field1).toBe("expected value");
  });
  
  it("should handle batch processing", async () => {
    const agent = new MyCustomAgent(llm);
    
    const inputs = [
      { /* input 1 */ },
      { /* input 2 */ }
    ];
    
    const results = await agent.runBatch(inputs);
    
    expect(results).toHaveLength(2);
  });
  
  it("should validate output", () => {
    const agent = new MyCustomAgent(llm);
    
    const validOutput = { field1: "test", field2: 5, field3: true };
    expect(agent.validate(validOutput)).toBe(true);
    
    const invalidOutput = { field1: "", field2: 0, field3: false };
    expect(agent.validate(invalidOutput)).toBe(false);
  });
});
```

### 8.10 Best Practices for Custom Agents

**1. Single Responsibility**
- Each agent should do one thing well
- Complex workflows = chain multiple agents

**2. Dependency Injection**
- Pass LLM and prompts via constructor
- Makes testing easier

**3. Type Safety**
- Define clear input/output interfaces
- Use TypeScript types throughout

**4. Error Handling**
- Wrap LLM calls in try-catch
- Validate parsed output
- Provide meaningful error messages

**5. Testability**
- Make agents unit-testable
- Mock LLM for faster tests
- Test edge cases

**6. Configurability**
- Allow custom prompts
- Support configuration options
- Provide sensible defaults

**7. Documentation**
- Document input/output formats
- Provide usage examples
- Explain configuration options

---

## 9. Advanced Patterns

This section covers advanced techniques for building sophisticated email automation systems.

### 9.1 Complex Action Chains

Build multi-step processing pipelines:

```typescript
import { 
  Action, 
  EmailClassifier, 
  EmailResponseGenerator 
} from "email-agent-core";

// Step 1: Spam Filter
class SpamFilter extends Action {
  async execute(input: any): Promise<any> {
    if (input.classification.advert) {
      throw new Error("Spam detected");
    }
    return input;
  }
}

// Step 2: Priority Router
class PriorityRouter extends Action {
  async execute(input: any): Promise<any> {
    return {
      ...input,
      queue: input.classification.priority === 'urgent' ? 'high-priority' : 'normal'
    };
  }
}

// Step 3: Build the pipeline
const classifier = new EmailClassifier(llm);
const spamFilter = new SpamFilter();
const router = new PriorityRouter();
const generator = new EmailResponseGenerator(llm);

// Chain them together
const pipeline = classifier
  .chain(spamFilter)
  .chain(router)
  .chain(generator);

// Use the pipeline
try {
  const result = await pipeline.run(emailInput);
  console.log("Processed:", result);
} catch (error) {
  console.log("Filtered out:", error.message);
}
```

### 9.2 Conditional Workflows

Route based on conditions:

```typescript
class ConditionalRouter extends Action {
  constructor(
    private condition: (input: any) => boolean,
    private truePath: Action,
    private falsePath: Action
  ) {
    super();
  }
  
  async execute(input: any): Promise<any> {
    if (this.condition(input)) {
      return this.truePath.run(input);
    } else {
      return this.falsePath.run(input);
    }
  }
}

// Usage
const urgentHandler = new UrgentEmailHandler(llm);
const normalHandler = new NormalEmailHandler(llm);

const router = new ConditionalRouter(
  (input) => input.priority === 'urgent',
  urgentHandler,
  normalHandler
);

const result = await router.run(emailData);
```

### 9.3 Parallel Processing

Process multiple branches simultaneously:

```typescript
class ParallelProcessor extends Action {
  constructor(private actions: Action[]) {
    super();
  }
  
  async execute(input: any): Promise<any[]> {
    // Run all actions in parallel
    const promises = this.actions.map(action => action.run(input));
    return Promise.all(promises);
  }
}

// Usage
const sentimentAnalyzer = new SentimentAnalyzer(llm);
const keywordExtractor = new KeywordExtractor(llm);
const summaryGenerator = new SummaryGenerator(llm);

const parallel = new ParallelProcessor([
  sentimentAnalyzer,
  keywordExtractor,
  summaryGenerator
]);

const [sentiment, keywords, summary] = await parallel.run(emailText);
```

### 9.4 Retry Logic with Exponential Backoff

Implement robust retry mechanisms:

```typescript
class RetryAction extends Action {
  constructor(
    private action: Action,
    private maxRetries: number = 3,
    private baseDelay: number = 1000
  ) {
    super();
  }
  
  async execute(input: any): Promise<any> {
    let lastError: Error;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await this.action.run(input);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.maxRetries - 1) {
          const delay = this.baseDelay * Math.pow(2, attempt);
          console.log(`Retry ${attempt + 1} after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error(`Failed after ${this.maxRetries} attempts: ${lastError!.message}`);
  }
}

// Usage
const classifier = new EmailClassifier(llm);
const robustClassifier = new RetryAction(classifier, 3, 1000);

const result = await robustClassifier.run(email);
```

### 9.5 Caching Results

Cache LLM responses to avoid redundant calls:

```typescript
class CachedAction extends Action {
  private cache: Map<string, any>;
  
  constructor(
    private action: Action,
    private getCacheKey: (input: any) => string
  ) {
    super();
    this.cache = new Map();
  }
  
  async execute(input: any): Promise<any> {
    const key = this.getCacheKey(input);
    
    if (this.cache.has(key)) {
      console.log("Cache hit:", key);
      return this.cache.get(key);
    }
    
    console.log("Cache miss:", key);
    const result = await this.action.run(input);
    this.cache.set(key, result);
    
    return result;
  }
  
  clearCache(): void {
    this.cache.clear();
  }
}

// Usage
const classifier = new EmailClassifier(llm);
const cachedClassifier = new CachedAction(
  classifier,
  (input) => `${input.subject}:${input.body.substring(0, 100)}`
);

// First call - cache miss
const result1 = await cachedClassifier.run(email);

// Second call with same email - cache hit
const result2 = await cachedClassifier.run(email);
```

### 9.6 Rate Limiting

Implement rate limiting for API calls:

```typescript
class RateLimitedAction extends Action {
  private lastCall: number = 0;
  
  constructor(
    private action: Action,
    private minInterval: number = 1000  // ms between calls
  ) {
    super();
  }
  
  async execute(input: any): Promise<any> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCall;
    
    if (timeSinceLastCall < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastCall;
      console.log(`Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastCall = Date.now();
    return this.action.run(input);
  }
}

// Usage - limit to 1 call per second
const classifier = new EmailClassifier(llm);
const limitedClassifier = new RateLimitedAction(classifier, 1000);
```

### 9.7 Logging and Metrics

Add comprehensive logging:

```typescript
class LoggingAction extends Action {
  constructor(
    private action: Action,
    private logger: (message: string) => void = console.log
  ) {
    super();
  }
  
  async execute(input: any): Promise<any> {
    const startTime = Date.now();
    this.logger(`[${this.action.name}] Starting...`);
    this.logger(`Input: ${JSON.stringify(input).substring(0, 100)}`);
    
    try {
      const result = await this.action.run(input);
      const duration = Date.now() - startTime;
      
      this.logger(`[${this.action.name}] Completed in ${duration}ms`);
      this.logger(`Output: ${JSON.stringify(result).substring(0, 100)}`);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger(`[${this.action.name}] Failed after ${duration}ms`);
      this.logger(`Error: ${(error as Error).message}`);
      throw error;
    }
  }
}

// Usage
const classifier = new EmailClassifier(llm);
const loggedClassifier = new LoggingAction(classifier);

const result = await loggedClassifier.run(email);
```

### 9.8 Circuit Breaker Pattern

Prevent cascading failures:

```typescript
class CircuitBreaker extends Action {
  private failures: number = 0;
  private lastFailure: number = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private action: Action,
    private threshold: number = 5,
    private timeout: number = 60000  // 1 minute
  ) {
    super();
  }
  
  async execute(input: any): Promise<any> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailure > this.timeout) {
        this.state = 'half-open';
        console.log("Circuit half-open, trying again");
      } else {
        throw new Error("Circuit breaker is open");
      }
    }
    
    try {
      const result = await this.action.run(input);
      
      if (this.state === 'half-open') {
        this.state = 'closed';
        this.failures = 0;
        console.log("Circuit closed");
      }
      
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailure = Date.now();
      
      if (this.failures >= this.threshold) {
        this.state = 'open';
        console.log("Circuit breaker opened");
      }
      
      throw error;
    }
  }
}

// Usage
const classifier = new EmailClassifier(llm);
const protectedClassifier = new CircuitBreaker(classifier, 5, 60000);
```

### 9.9 Fan-Out/Fan-In Pattern

Process data in parallel then aggregate:

```typescript
class FanOutFanIn extends Action {
  constructor(
    private fanOutActions: Action[],
    private aggregator: (results: any[]) => any
  ) {
    super();
  }
  
  async execute(input: any): Promise<any> {
    // Fan out - run all actions in parallel
    const results = await Promise.all(
      this.fanOutActions.map(action => action.run(input))
    );
    
    // Fan in - aggregate results
    return this.aggregator(results);
  }
}

// Usage
const classifyByCategory = new CategoryClassifier(llm);
const classifyBySentiment = new SentimentClassifier(llm);
const classifyByPriority = new PriorityClassifier(llm);

const comprehensiveClassifier = new FanOutFanIn(
  [classifyByCategory, classifyBySentiment, classifyByPriority],
  (results) => ({
    category: results[0],
    sentiment: results[1],
    priority: results[2]
  })
);

const result = await comprehensiveClassifier.run(email);
```

### 9.10 Event-Driven Processing

Implement event-based workflows:

```typescript
import { EventEmitter } from 'events';

class EventDrivenAgent extends Action {
  private emitter: EventEmitter;
  
  constructor(private action: Action) {
    super();
    this.emitter = new EventEmitter();
  }
  
  on(event: string, listener: (...args: any[]) => void): this {
    this.emitter.on(event, listener);
    return this;
  }
  
  async execute(input: any): Promise<any> {
    this.emitter.emit('start', input);
    
    try {
      const result = await this.action.run(input);
      this.emitter.emit('success', result);
      return result;
    } catch (error) {
      this.emitter.emit('error', error);
      throw error;
    } finally {
      this.emitter.emit('complete');
    }
  }
}

// Usage
const classifier = new EmailClassifier(llm);
const eventDriven = new EventDrivenAgent(classifier);

eventDriven
  .on('start', (input) => console.log('Processing:', input))
  .on('success', (result) => console.log('Success:', result))
  .on('error', (error) => console.error('Error:', error))
  .on('complete', () => console.log('Done'));

const result = await eventDriven.run(email);
```

### 9.11 Scheduled Email Processing

Process emails on a schedule:

```typescript
import cron from 'node-cron';
import { fetchLatestEmails, EmailClassifier } from "email-agent-core";

class ScheduledProcessor {
  constructor(
    private classifier: EmailClassifier,
    private schedule: string = '*/5 * * * *'  // Every 5 minutes
  ) {}
  
  start(): void {
    console.log(`Starting scheduled processing: ${this.schedule}`);
    
    cron.schedule(this.schedule, async () => {
      console.log('Running scheduled email processing...');
      
      try {
        const emails = await fetchLatestEmails(10);
        
        for (const email of emails) {
          const classification = await this.classifier.run({
            subject: email.subject,
            body: email.text
          });
          
          console.log(`Processed: ${email.subject} - ${classification.category}`);
          
          // Handle based on classification...
        }
      } catch (error) {
        console.error('Scheduled processing error:', error);
      }
    });
  }
}

// Usage
const classifier = new EmailClassifier(llm);
const scheduler = new ScheduledProcessor(classifier, '*/5 * * * *');
scheduler.start();
```

### 9.12 State Machine Pattern

Implement complex state-based workflows:

```typescript
type State = 'new' | 'classified' | 'responded' | 'archived';

class EmailStateMachine extends Action {
  private state: State = 'new';
  private transitions: Map<State, Action>;
  
  constructor() {
    super();
    this.transitions = new Map([
      ['new', new EmailClassifier(llm)],
      ['classified', new EmailResponseGenerator(llm)],
      ['responded', new EmailArchiver()],
    ]);
  }
  
  async execute(input: any): Promise<any> {
    console.log(`Current state: ${this.state}`);
    
    const action = this.transitions.get(this.state);
    if (!action) {
      throw new Error(`No transition defined for state: ${this.state}`);
    }
    
    const result = await action.run(input);
    this.advanceState();
    
    return result;
  }
  
  private advanceState(): void {
    const stateOrder: State[] = ['new', 'classified', 'responded', 'archived'];
    const currentIndex = stateOrder.indexOf(this.state);
    
    if (currentIndex < stateOrder.length - 1) {
      this.state = stateOrder[currentIndex + 1];
    }
  }
  
  getState(): State {
    return this.state;
  }
}
```

---

## 10. Best Practices

Follow these guidelines to build robust, secure, and efficient email automation systems.

### 10.1 Performance Optimization

**Use Batch Processing**

Process multiple emails at once:
```typescript
// Bad - sequential processing
for (const email of emails) {
  await classifier.run(email);
}

// Good - parallel processing
await classifier.runBatch(emails);
```

**Implement Caching**

Cache frequently accessed or expensive operations:
```typescript
const cachedClassifier = new CachedAction(
  classifier,
  (input) => `${input.subject}:${input.body.slice(0, 50)}`
);
```

**Limit Email Fetching**

Only fetch what you need:
```typescript
// Don't fetch all emails at once
const emails = await fetchLatestEmails(10);  // Good
// const emails = await fetchLatestEmails(1000);  // Bad
```

**Use Streaming for Long Responses**

For real-time feedback:
```typescript
for await (const chunk of generator.streamOutput(input)) {
  // Process chunks as they arrive
}
```

**Choose the Right LLM**

- **Local models**: Slower but private, good for non-urgent processing
- **Cloud models**: Faster, best for real-time responses

### 10.2 Security Best Practices

**Secure Credentials**

Never hardcode credentials:
```typescript
// Bad
const config = {
  user: "myemail@gmail.com",
  pass: "mypassword123"
};

// Good
import { loadEmailConfig } from "email-agent-core";
const config = loadEmailConfig();  // From email-agent-core.config.json
```

**Use App Passwords**

For Gmail and similar services:
- Enable 2FA
- Generate app-specific passwords
- Never use your main password

**Sanitize Email Content**

Validate and sanitize before processing:
```typescript
function sanitizeEmail(email: string): string {
  // Remove potentially dangerous content
  return email
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .trim();
}

const safeBody = sanitizeEmail(email.html);
```

**Protect API Keys**

Store them securely:
```typescript
// Use environment variables
const apiKey = process.env.OPENAI_API_KEY;

// Or secure configuration files (not in version control)
// Add to .gitignore: email-agent-core.config.json
```

**Validate LLM Output**

Always validate structured output:
```typescript
function validateClassification(result: any): result is EmailClassification {
  return (
    typeof result.category === 'string' &&
    typeof result.priority === 'string' &&
    typeof result.confidence === 'number' &&
    result.confidence >= 0 && result.confidence <= 1
  );
}

const result = await classifier.run(input);
if (!validateClassification(result)) {
  throw new Error("Invalid classification result");
}
```

**Rate Limiting**

Prevent abuse and respect API limits:
```typescript
const limitedClassifier = new RateLimitedAction(classifier, 1000);
```

### 10.3 Error Handling

**Always Use Try-Catch**

Wrap all agent calls:
```typescript
try {
  const result = await classifier.run(input);
  // Process result
} catch (error) {
  console.error("Classification failed:", error);
  // Handle error appropriately
}
```

**Implement Retry Logic**

For transient failures:
```typescript
const robustClassifier = new RetryAction(classifier, 3, 1000);
```

**Graceful Degradation**

Provide fallbacks:
```typescript
async function classifyEmail(email: any) {
  try {
    return await classifier.run(email);
  } catch (error) {
    console.error("AI classification failed, using fallback");
    // Return default classification
    return {
      category: 'other',
      priority: 'medium',
      confidence: 0
    };
  }
}
```

**Log Errors Comprehensively**

```typescript
catch (error) {
  console.error({
    message: error.message,
    stack: error.stack,
    input: JSON.stringify(input),
    timestamp: new Date().toISOString()
  });
}
```

**Handle Specific Error Types**

```typescript
try {
  const result = await classifier.run(input);
} catch (error) {
  if (error.message.includes("timeout")) {
    // Handle timeout
  } else if (error.message.includes("auth")) {
    // Handle authentication error
  } else {
    // Handle other errors
  }
}
```

### 10.4 Testing

**Unit Test Your Agents**

```typescript
import { describe, it, expect, vi } from "vitest";

describe("EmailClassifier", () => {
  it("should classify booking emails", async () => {
    const mockLLM = {
      run: vi.fn().mockResolvedValue({
        content: JSON.stringify({
          category: "booking",
          priority: "high",
          confidence: 0.95
        })
      })
    };
    
    const classifier = new EmailClassifier(mockLLM as any);
    const result = await classifier.run({
      subject: "Booking Request",
      body: "I want to book a room"
    });
    
    expect(result.category).toBe("booking");
    expect(result.priority).toBe("high");
  });
});
```

**Integration Testing**

Test with real IMAP/SMTP:
```typescript
describe("Email Integration", () => {
  it("should fetch and classify real emails", async () => {
    const emails = await fetchLatestEmails(1);
    const classifier = new EmailClassifier(llm);
    
    const result = await classifier.run({
      subject: emails[0].subject,
      body: emails[0].text
    });
    
    expect(result).toBeDefined();
    expect(result.category).toBeTruthy();
  });
});
```

**Mock LLMs for Faster Tests**

```typescript
class MockLLM {
  async run(messages: any[]): Promise<any> {
    return {
      content: JSON.stringify({
        category: "test",
        priority: "medium"
      })
    };
  }
}

const classifier = new EmailClassifier(new MockLLM() as any);
```

### 10.5 Configuration Management

**Environment-Based Config**

```typescript
const config = {
  llm: process.env.NODE_ENV === 'production' 
    ? new OpenAILLM({ model: "gpt-4o-mini", apiKey: process.env.OPENAI_API_KEY })
    : new LlamaCppLLM({ modelPath: "./models/test-model.gguf" }),
  
  emailLimit: process.env.NODE_ENV === 'production' ? 50 : 5,
  
  enableCache: process.env.NODE_ENV === 'production'
};
```

**Separate Test/Production Configs**

```typescript
// config/production.ts
export const productionConfig = {
  imap: { /* production settings */ },
  smtp: { /* production settings */ }
};

// config/development.ts
export const developmentConfig = {
  imap: { /* dev settings */ },
  smtp: { /* dev settings */ }
};
```

### 10.6 Monitoring and Logging

**Structured Logging**

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Use in agents
logger.info('Email classified', {
  category: result.category,
  priority: result.priority,
  confidence: result.confidence
});
```

**Track Metrics**

```typescript
class MetricsTracker {
  private metrics = {
    emailsProcessed: 0,
    classificationsSuccessful: 0,
    classificationsFailed: 0,
    avgProcessingTime: 0
  };
  
  recordSuccess(duration: number): void {
    this.metrics.emailsProcessed++;
    this.metrics.classificationsSuccessful++;
    this.updateAvgTime(duration);
  }
  
  recordFailure(): void {
    this.metrics.emailsProcessed++;
    this.metrics.classificationsFailed++;
  }
  
  getMetrics() {
    return { ...this.metrics };
  }
}
```

**Health Checks**

```typescript
async function healthCheck(): Promise<boolean> {
  try {
    // Test IMAP connection
    const client = new EmailImapClient(config.imap);
    await client.connect();
    await client.disconnect();
    
    // Test LLM
    const testResult = await llm.run([
      new HumanMessage("test")
    ]);
    
    return true;
  } catch (error) {
    console.error("Health check failed:", error);
    return false;
  }
}
```

### 10.7 Deployment

**Use Process Managers**

For production, use PM2 or similar:
```bash
pm2 start dist/index.js --name email-agent
pm2 logs email-agent
pm2 restart email-agent
```

**Containerization**

Docker example:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY dist ./dist
COPY models ./models
CMD ["node", "dist/index.js"]
```

**Environment Variables**

```bash
# .env
NODE_ENV=production
OPENAI_API_KEY=sk-...
LOG_LEVEL=info
```

**Graceful Shutdown**

```typescript
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  
  // Stop accepting new emails
  // Finish processing current emails
  // Close connections
  
  process.exit(0);
});
```

### 10.8 Code Organization

**Modular Structure**

```
src/
├── agents/
│   ├── EmailClassifier.ts
│   ├── EmailResponseGenerator.ts
│   └── CustomAgent.ts
├── config/
│   ├── production.ts
│   ├── development.ts
│   └── index.ts
├── utils/
│   ├── logger.ts
│   ├── metrics.ts
│   └── validators.ts
└── index.ts
```

**Dependency Injection**

```typescript
class EmailProcessor {
  constructor(
    private classifier: EmailClassifier,
    private generator: EmailResponseGenerator,
    private logger: Logger
  ) {}
  
  async process(email: any) {
    // Use injected dependencies
  }
}
```

**Single Responsibility**

Each agent should do one thing:
```typescript
// Good
class EmailClassifier extends Action { /* ... */ }
class EmailResponseGenerator extends Action { /* ... */ }

// Bad
class EmailProcessorDoesEverything extends Action {
  // Too many responsibilities
}
```

### 10.9 Documentation

**Document Your Agents**

```typescript
/**
 * Classifies hotel booking emails by category, priority, and sentiment.
 * 
 * @example
 * ```typescript
 * const classifier = new EmailClassifier(llm);
 * const result = await classifier.run({
 *   subject: "Booking Request",
 *   body: "I need a room for 2 nights"
 * });
 * 
 * 
 * @param llm - LLM instance (LlamaCppLLM or OpenAILLM)
 * @param promptTemplate - Optional custom prompt template
 */
export class EmailClassifier extends Action {
  // Implementation
}
```

---

## 11. Real-World Examples

Complete, production-ready examples for common use cases.

### 11.1 Hotel Booking Automation

Complete system for handling hotel booking emails:

```typescript
import {
  fetchLatestEmails,
  EmailClassifier,
  EmailResponseGenerator,
  sendEmail,
  LlamaCppLLM,
  OpenAILLM
} from "email-agent-core";

// Configuration
const llm = new OpenAILLM({
  model: "gpt-4o-mini",
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0.2
});

const classifier = new EmailClassifier(llm);
const generator = new EmailResponseGenerator(llm);

// Hotel-specific context
const hotelContext = {
  hotelName: "Grand Plaza Hotel",
  policies: {
    checkInTime: "3:00 PM",
    checkOutTime: "11:00 AM",
    cancellation: "Free cancellation up to 24 hours before check-in"
  }
};

async function processBookingEmails() {
  try {
    // Fetch latest emails
    const emails = await fetchLatestEmails(20);
    console.log(`Processing ${emails.length} emails...`);
    
    for (const email of emails) {
      console.log(`\nProcessing: ${email.subject}`);
      
      // Step 1: Classify the email
      const classification = await classifier.run({
        subject: email.subject,
        body: email.text
      });
      
      console.log(`Category: ${classification.category}`);
      console.log(`Priority: ${classification.priority}`);
      console.log(`Sentiment: ${classification.sentiment}`);
      
      // Step 2: Skip spam/advertisements
      if (classification.advert) {
        console.log("Skipping advertisement");
        continue;
      }
      
      // Step 3: Handle based on category
      if (classification.category === 'booking') {
        // Check availability (integrate with your booking system)
        const availability = await checkAvailability(
          classification.extractedInfo.checkIn,
          classification.extractedInfo.checkOut
        );
        
        // Generate response
        const response = await generator.run({
          originalEmail: email.text,
          context: {
            ...hotelContext,
            guestName: classification.extractedInfo.guestName || "Valued Guest",
            requestType: classification.category,
            roomsAvailable: availability.available,
            suggestedPrice: availability.price,
            checkInDate: classification.extractedInfo.checkIn,
            checkOutDate: classification.extractedInfo.checkOut,
            hotelPolicies: hotelContext.policies
          }
        });
        
        // Send response
        await sendEmail({
          to: email.from!,
          subject: `Re: ${email.subject}`,
          text: response
        });
        
        console.log(`✓ Booking response sent to ${email.from}`);
        
      } else if (classification.category === 'inquiry') {
        // Handle general inquiries
        const response = await generator.run({
          originalEmail: email.text,
          context: {
            ...hotelContext,
            guestName: classification.extractedInfo.guestName || "Valued Guest",
            requestType: "inquiry",
            roomsAvailable: true,
            hotelPolicies: hotelContext.policies
          }
        });
        
        await sendEmail({
          to: email.from!,
          subject: `Re: ${email.subject}`,
          text: response
        });
        
        console.log(`✓ Inquiry response sent to ${email.from}`);
        
      } else if (classification.priority === 'urgent') {
        // Alert staff for urgent issues
        await notifyStaff(email, classification);
        console.log(`⚠ Urgent email forwarded to staff`);
      }
    }
    
    console.log("\n✅ Email processing complete");
    
  } catch (error) {
    console.error("Error processing emails:", error);
  }
}

// Helper function - integrate with your booking system
async function checkAvailability(checkIn?: string, checkOut?: string) {
  // Your booking system logic here
  return {
    available: true,
    price: 150
  };
}

// Helper function - notification system
async function notifyStaff(email: any, classification: any) {
  // Send to Slack, email, SMS, etc.
  console.log("Notifying staff:", {
    from: email.from,
    subject: email.subject,
    priority: classification.priority
  });
}

// Run the processor
processBookingEmails();
```

### 11.2 Customer Support Ticket System

Automated support ticket classification and routing:

```typescript
import {
  fetchLatestEmails,
  EmailClassifier,
  TemplatePrompt,
  OpenAILLM
} from "email-agent-core";

// Custom classifier for support tickets
const supportPrompt = TemplatePrompt.fromTemplate(`
Analyze this support ticket and classify it.

Subject: {subject}
Body: {body}

Return JSON with:
- category: technical | billing | feature_request | bug_report | other
- priority: critical | high | medium | low
- department: engineering | sales | customer_success | billing
- estimatedResolutionTime: immediate | 1-day | 3-days | 1-week
- requiresHumanReview: boolean
- suggestedAction: string
`);

const llm = new OpenAILLM({
  model: "gpt-4o-mini",
  apiKey: process.env.OPENAI_API_KEY
});

const supportClassifier = new EmailClassifier(llm, supportPrompt);

// Department routing
const departments = {
  engineering: "engineering@company.com",
  sales: "sales@company.com",
  customer_success: "support@company.com",
  billing: "billing@company.com"
};

async function processSupportTickets() {
  const emails = await fetchLatestEmails(50);
  
  for (const email of emails) {
    const classification = await supportClassifier.run({
      subject: email.subject,
      body: email.text
    });
    
    // Create ticket in your system
    const ticket = await createTicket({
      email: email.from,
      subject: email.subject,
      body: email.text,
      category: classification.category,
      priority: classification.priority,
      department: classification.department
    });
    
    // Route to appropriate department
    await forwardToDepart(
      ticket,
      departments[classification.department]
    );
    
    // Send auto-reply
    await sendEmail({
      to: email.from!,
      subject: `Re: ${email.subject} [Ticket #${ticket.id}]`,
      text: `
Thank you for contacting us!

Your ticket (#${ticket.id}) has been received and routed to our ${classification.department} team.

Priority: ${classification.priority}
Estimated Resolution: ${classification.estimatedResolutionTime}

${classification.suggestedAction}

Best regards,
Support Team
      `.trim()
    });
    
    console.log(`Ticket #${ticket.id} created and routed`);
  }
}

async function createTicket(data: any) {
  // Integrate with your ticketing system (Zendesk, Jira, etc.)
  return {
    id: Math.random().toString(36).substr(2, 9),
    ...data
  };
}

async function forwardToDepart(ticket: any, email: string) {
  // Forward to department
  console.log(`Forwarding ticket ${ticket.id} to ${email}`);
}

processSupportTickets();
```

### 11.3 Email Newsletter Analyzer

Analyze subscriber responses and feedback:

```typescript
import {
  fetchLatestEmails,
  Action,
  TemplatePrompt,
  JsonOutputParser,
  OpenAILLM,
  HumanMessage,
  SystemMessage
} from "email-agent-core";

// Custom sentiment and feedback analyzer
class FeedbackAnalyzer extends Action {
  private llm: OpenAILLM;
  private prompt: TemplatePrompt;
  private parser: JsonOutputParser;
  
  constructor(llm: OpenAILLM) {
    super();
    this.llm = llm;
    
    this.prompt = TemplatePrompt.fromTemplate(`
Analyze this newsletter response:

{emailBody}

Extract and return JSON:
{
  "sentiment": "positive | neutral | negative",
  "feedback": "brief summary",
  "topics": ["topic1", "topic2"],
  "actionItems": ["action1", "action2"],
  "unsubscribeRequest": boolean,
  "suggestions": ["suggestion1"]
}
    `);
    
    this.parser = new JsonOutputParser();
  }
  
  async execute(input: { emailBody: string }): Promise<any> {
    const promptText = await this.prompt.run(input);
    const response = await this.llm.run([
      new SystemMessage("You analyze newsletter feedback."),
      new HumanMessage(promptText)
    ]);
    return this.parser.run(response.content);
  }
}

const llm = new OpenAILLM({
  model: "gpt-4o-mini",
  apiKey: process.env.OPENAI_API_KEY
});

const analyzer = new FeedbackAnalyzer(llm);

async function analyzeNewsletterResponses() {
  const emails = await fetchLatestEmails(100);
  
  const stats = {
    positive: 0,
    neutral: 0,
    negative: 0,
    unsubscribes: 0,
    topTopics: new Map<string, number>()
  };
  
  const insights: any[] = [];
  
  for (const email of emails) {
    const analysis = await analyzer.run({
      emailBody: email.text
    });
    
    // Aggregate stats
    stats[analysis.sentiment]++;
    
    if (analysis.unsubscribeRequest) {
      stats.unsubscribes++;
      // Process unsubscribe
    }
    
    // Track topics
    analysis.topics.forEach((topic: string) => {
      stats.topTopics.set(
        topic,
        (stats.topTopics.get(topic) || 0) + 1
      );
    });
    
    insights.push({
      from: email.from,
      sentiment: analysis.sentiment,
      feedback: analysis.feedback,
      suggestions: analysis.suggestions
    });
  }
  
  // Generate report
  console.log("\n📊 Newsletter Feedback Report");
  console.log("================================");
  console.log(`Total Responses: ${emails.length}`);
  console.log(`Positive: ${stats.positive} (${(stats.positive/emails.length*100).toFixed(1)}%)`);
  console.log(`Neutral: ${stats.neutral} (${(stats.neutral/emails.length*100).toFixed(1)}%)`);
  console.log(`Negative: ${stats.negative} (${(stats.negative/emails.length*100).toFixed(1)}%)`);
  console.log(`Unsubscribes: ${stats.unsubscribes}`);
  console.log("\nTop Topics:");
  Array.from(stats.topTopics.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([topic, count]) => {
      console.log(`  - ${topic}: ${count}`);
    });
  
  // Save insights to database or file
  await saveInsights(insights);
}

async function saveInsights(insights: any[]) {
  // Save to your database
  console.log(`\n💾 Saved ${insights.length} insights`);
}

analyzeNewsletterResponses();
```

### 11.4 Scheduled Email Monitoring

Monitor emails 24/7 with scheduled processing:

```typescript
import cron from 'node-cron';
import {
  fetchLatestEmails,
  EmailClassifier,
  EmailResponseGenerator,
  sendEmail,
  OpenAILLM
} from "email-agent-core";

class EmailMonitor {
  private classifier: EmailClassifier;
  private generator: EmailResponseGenerator;
  private processedEmails: Set<string>;
  
  constructor() {
    const llm = new OpenAILLM({
      model: "gpt-4o-mini",
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.classifier = new EmailClassifier(llm);
    this.generator = new EmailResponseGenerator(llm);
    this.processedEmails = new Set();
  }
  
  async processNewEmails() {
    const startTime = Date.now();
    console.log(`\n[${new Date().toISOString()}] Processing emails...`);
    
    try {
      const emails = await fetchLatestEmails(20);
      let processed = 0;
      let skipped = 0;
      
      for (const email of emails) {
        // Skip already processed
        if (this.processedEmails.has(email.messageId)) {
          skipped++;
          continue;
        }
        
        // Classify and handle
        const classification = await this.classifier.run({
          subject: email.subject,
          body: email.text
        });
        
        if (classification.priority === 'urgent' || classification.priority === 'high') {
          // Auto-respond to urgent emails
          const response = await this.generator.run({
            originalEmail: email.text,
            context: {
              hotelName: "Grand Hotel",
              guestName: classification.extractedInfo.guestName,
              requestType: classification.category,
              roomsAvailable: true,
              hotelPolicies: {
                checkInTime: "3:00 PM",
                checkOutTime: "11:00 AM",
                cancellation: "Free cancellation up to 24 hours"
              }
            }
          });
          
          await sendEmail({
            to: email.from!,
            subject: `Re: ${email.subject}`,
            text: response
          });
          
          processed++;
        }
        
        this.processedEmails.add(email.messageId);
      }
      
      const duration = Date.now() - startTime;
      console.log(`✓ Processed: ${processed}, Skipped: ${skipped}, Duration: ${duration}ms`);
      
    } catch (error) {
      console.error("❌ Error:", error);
    }
  }
  
  start() {
    console.log("🚀 Email Monitor started");
    console.log("Schedule: Every 5 minutes");
    
    // Run every 5 minutes
    cron.schedule('*/5 * * * *', () => {
      this.processNewEmails();
    });
    
    // Also run immediately
    this.processNewEmails();
  }
}

// Start the monitor
const monitor = new EmailMonitor();
monitor.start();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log("\n👋 Shutting down gracefully...");
  process.exit(0);
});
```

### 11.5 Multi-Language Email Handler

Handle emails in multiple languages:

```typescript
import {
  fetchLatestEmails,
  Action,
  TemplatePrompt,
  OpenAILLM,
  HumanMessage,
  SystemMessage
} from "email-agent-core";

class LanguageDetector extends Action {
  private llm: OpenAILLM;
  
  constructor(llm: OpenAILLM) {
    super();
    this.llm = llm;
  }
  
  async execute(input: { text: string }): Promise<string> {
    const response = await this.llm.run([
      new SystemMessage("Detect the language. Reply with ISO code only (en, es, fr, de, etc.)"),
      new HumanMessage(input.text)
    ]);
    return response.content.trim().toLowerCase();
  }
}

class MultilingualResponder extends Action {
  private llm: OpenAILLM;
  private prompt: TemplatePrompt;
  
  constructor(llm: OpenAILLM) {
    super();
    this.llm = llm;
    
    this.prompt = TemplatePrompt.fromTemplate(`
Original Email (in {language}):
{originalEmail}

Write a professional response in {language} that:
1. Thanks the sender
2. Addresses their request
3. Provides helpful information
4. Invites further questions

Response in {language}:
    `);
  }
  
  async execute(input: { originalEmail: string; language: string }): Promise<string> {
    const promptText = await this.prompt.run(input);
    const response = await this.llm.run([
      new SystemMessage(`You are a multilingual customer service assistant. Respond in ${input.language}.`),
      new HumanMessage(promptText)
    ]);
    return response.content;
  }
}

const llm = new OpenAILLM({
  model: "gpt-4o",  // GPT-4 for better multilingual support
  apiKey: process.env.OPENAI_API_KEY
});

const detector = new LanguageDetector(llm);
const responder = new MultilingualResponder(llm);

async function handleMultilingualEmails() {
  const emails = await fetchLatestEmails(10);
  
  for (const email of emails) {
    console.log(`\nProcessing: ${email.subject}`);
    
    // Detect language
    const language = await detector.run({ text: email.text });
    console.log(`Language detected: ${language}`);
    
    // Generate response in same language
    const response = await responder.run({
      originalEmail: email.text,
      language: language
    });
    
    // Send response
    await sendEmail({
      to: email.from!,
      subject: `Re: ${email.subject}`,
      text: response
    });
    
    console.log(`✓ Multilingual response sent in ${language}`);
  }
}

handleMultilingualEmails();
```

---

## 12. Troubleshooting

Common issues and their solutions.

### 12.1 IMAP Connection Issues

**Problem: "Authentication Failed"**

```
Error: [AUTHENTICATIONFAILED] Invalid credentials
```

**Solutions:**

1. **Gmail**: Use app-specific password, not your main password
   - Enable 2FA on your Google account
   - Go to Security → App passwords
   - Generate a new app password
   - Use that password in your config

2. **Check credentials**: Verify username and password in `email-agent-core.config.json`

3. **Enable IMAP**: Make sure IMAP is enabled in your email settings

4. **Check host/port**: Common settings:
   - Gmail: `imap.gmail.com:993`
   - Outlook: `outlook.office365.com:993`
   - Yahoo: `imap.mail.yahoo.com:993`

**Problem: "Connection Timeout"**

```
Error: connect ETIMEDOUT
```

**Solutions:**

1. Check firewall settings
2. Verify port is correct (usually 993 for SSL)
3. Try with `tls: true`
4. Check if your network blocks IMAP

**Problem: "Certificate Error"**

```
Error: self signed certificate
```

**Solution:**

```typescript
// In client.ts, tlsOptions already set to:
tlsOptions: { rejectUnauthorized: false }
```

### 12.2 LLM Issues

**Problem: "Model not found"**

```
Error: ENOENT: no such file or directory, open './models/llama.gguf'
```

**Solutions:**

1. Download a GGUF model from Hugging Face
2. Place it in the correct directory
3. Update the `modelPath` to match the actual file location

```typescript
const llm = new LlamaCppLLM({
  modelPath: "./models/your-actual-model.gguf"  // Update this
});
```

**Problem: "Out of Memory" with Local LLM**

**Solutions:**

1. Use a smaller model (7B instead of 13B or 70B)
2. Reduce `contextSize`:
   ```typescript
   const llm = new LlamaCppLLM({
     modelPath: "./models/model.gguf",
     contextSize: 2048  // Default is 4096
   });
   ```
3. Use cloud LLM instead (OpenAI) for resource-constrained systems

**Problem: "Invalid JSON from LLM"**

```
Error: Unexpected token in JSON at position 0
```

**Solutions:**

1. **Improve prompt**: Be more explicit about JSON format
   ```typescript
   const prompt = TemplatePrompt.fromTemplate(`
     Analyze this email and return ONLY valid JSON.
     Do not include any text before or after the JSON.
     
     Email: {body}
     
     Return JSON:
   `);
   ```

2. **Clean LLM output**: Strip markdown code blocks
   ```typescript
   let content = aiMessage.content;
   // Remove markdown code blocks
   content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
   const parsed = JSON.parse(content);
   ```

3. **Add retry logic**: Use RetryAction wrapper

4. **Lower temperature**: More deterministic output
   ```typescript
   const llm = new OpenAILLM({
     temperature: 0.1  // Lower = more consistent
   });
   ```

**Problem: "OpenAI API Rate Limit"**

```
Error: Rate limit reached
```

**Solutions:**

1. Implement rate limiting:
   ```typescript
   const limitedClassifier = new RateLimitedAction(classifier, 1000);
   ```

2. Use batch processing with delays:
   ```typescript
   for (const email of emails) {
     await classifier.run(email);
     await new Promise(r => setTimeout(r, 500));  // 500ms delay
   }
   ```

3. Upgrade your OpenAI plan for higher limits

### 12.3 Email Parsing Issues

**Problem: "Empty email body"**

**Solutions:**

1. Check if email has text content:
   ```typescript
   const body = email.text || email.html || "No content";
   ```

2. Parse HTML if text is empty:
   ```typescript
   import { htmlToText } from 'html-to-text';
   const text = email.text || htmlToText(email.html);
   ```

**Problem: "Special characters corrupted"**

**Solution:**

Ensure proper encoding handling - the package handles this automatically with `mailparser`.

### 12.4 Configuration Issues

**Problem: "Config file not found"**

```
Error: ENOENT: no such file or directory, open 'email-agent-core.config.json'
```

**Solutions:**

1. Create the config file:
   ```bash
   npx email-agent-core init
   ```

2. Ensure it's in your project root

3. Check the file name (must be exactly `email-agent-core.config.json`)

**Problem: "Invalid configuration"**

**Solution:**

Verify JSON structure:
```json
{
  "imap": {
    "host": "imap.gmail.com",
    "port": 993,
    "tls": true,
    "user": "your-email@gmail.com",
    "pass": "your-password"
  },
  "smtp": {
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": false,
    "user": "your-email@gmail.com",
    "pass": "your-password"
  }
}
```

### 12.5 Performance Issues

**Problem: "Slow email processing"**

**Solutions:**

1. **Use batch processing**:
   ```typescript
   await classifier.runBatch(emails);  // Parallel
   ```

2. **Implement caching**:
   ```typescript
   const cachedClassifier = new CachedAction(classifier, getCacheKey);
   ```

3. **Use cloud LLM** (faster than local):
   ```typescript
   const llm = new OpenAILLM({...});  // Faster than LlamaCppLLM
   ```

4. **Reduce email limit**:
   ```typescript
   const emails = await fetchLatestEmails(10);  // Not 100
   ```

**Problem: "Memory leak"**

**Solutions:**

1. Clear caches periodically:
   ```typescript
   setInterval(() => {
     cachedAction.clearCache();
   }, 3600000);  // Every hour
   ```

2. Limit processed email tracking:
   ```typescript
   if (processedEmails.size > 1000) {
     processedEmails.clear();
   }
   ```

### 12.6 Type Errors

**Problem: "Property 'from' is possibly null"**

**Solution:**

Use optional chaining and fallbacks:
```typescript
const from = email.from ?? "unknown@example.com";
await sendEmail({ to: from, subject: "...", text: "..." });
```

**Problem: "Type mismatch in custom agent"**

**Solution:**

Define clear interfaces:
```typescript
interface MyInput {
  subject: string;
  body: string;
}

interface MyOutput {
  category: string;
  priority: string;
}

class MyAgent extends Action {
  async execute(input: MyInput): Promise<MyOutput> {
    // Implementation
  }
}
```

### 12.7 Debugging Tips

**Enable Verbose Logging**

```typescript
console.log("Input:", JSON.stringify(input, null, 2));
console.log("LLM Response:", response.content);
console.log("Parsed Result:", JSON.stringify(result, null, 2));
```

**Test with Simple Cases**

```typescript
// Test with hardcoded simple input
const testInput = {
  subject: "Test",
  body: "This is a test email"
};

const result = await classifier.run(testInput);
console.log("Test result:", result);
```

**Isolate the Problem**

Test each component separately:
```typescript
// Test 1: IMAP connection
const emails = await fetchLatestEmails(1);
console.log("✓ IMAP working");

// Test 2: LLM
const response = await llm.run([new HumanMessage("test")]);
console.log("✓ LLM working");

// Test 3: Classifier
const classification = await classifier.run(testEmail);
console.log("✓ Classifier working");
```

**Check Environment**

```typescript
console.log("Node version:", process.version);
console.log("Environment:", process.env.NODE_ENV);
console.log("API Key set:", !!process.env.OPENAI_API_KEY);
```

### 12.8 Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `ECONNREFUSED` | IMAP/SMTP server unreachable | Check host, port, and network |
| `EAUTH` | Authentication failed | Check credentials, use app password |
| `ETIMEDOUT` | Connection timeout | Check firewall, network, port |
| `ENOTFOUND` | Host not found | Check host name spelling |
| `Invalid JSON` | LLM returned invalid JSON | Improve prompt, add retry logic |
| `Module not found` | Missing dependency | Run `npm install` |
| `spawn ENOMEM` | Out of memory | Use smaller model or cloud LLM |
| `401 Unauthorized` | Invalid API key | Check OpenAI API key |
| `429 Too Many Requests` | Rate limit exceeded | Add rate limiting, slow down |

### 12.9 Getting Help

**Check Package Version**

```bash
npm list email-agent-core
```

**Update to Latest**

```bash
npm update email-agent-core
```

**Check Documentation**

- README.md for quick start
- TUTORIAL.md (this file) for in-depth guide
- Source code comments for implementation details

**Debug Mode**

Set environment variable:
```bash
DEBUG=email-agent-core:* node your-script.js
```

**Report Issues**

If you encounter a bug:
1. Check existing issues on GitHub
2. Create a minimal reproduction example
3. Include error messages and stack traces
4. Specify versions (Node.js, package version)

### 12.10 Best Practices to Avoid Issues

1. **Always use try-catch blocks** around agent calls
2. **Validate inputs** before passing to agents
3. **Implement retry logic** for transient failures
4. **Use TypeScript** for better type safety
5. **Test with small datasets** before scaling
6. **Monitor memory usage** in production
7. **Log important events** for debugging
8. **Keep dependencies updated**
9. **Use environment variables** for sensitive data
10. **Read error messages carefully** - they usually indicate the problem

---

## Conclusion

You now have a comprehensive understanding of **email-agent-core**! This tutorial covered:

✅ **Architecture** - How the package is structured  
✅ **Core Concepts** - Actions, Messages, Prompts, Parsers, LLMs  
✅ **Configuration** - Setting up email connections  
✅ **Email I/O** - Fetching and sending emails  
✅ **Agent Engine** - The composable framework  
✅ **Built-in Agents** - EmailClassifier and EmailResponseGenerator  
✅ **Custom Agents** - Building your own agents  
✅ **Advanced Patterns** - Complex workflows and patterns  
✅ **Best Practices** - Production-ready guidelines  
✅ **Real-World Examples** - Complete working systems  
✅ **Troubleshooting** - Solving common issues  

### Next Steps

1. **Start Small**: Begin with a simple classifier
2. **Experiment**: Try different prompts and LLMs
3. **Build**: Create agents for your specific use case
4. **Scale**: Implement caching, monitoring, and error handling
5. **Share**: Contribute back to the community

### Resources

- **GitHub**: [email-agent-core repository](https://github.com/pguso/email-agent-core)
- **NPM**: [email-agent-core package](https://www.npmjs.com/package/email-agent-core)
- **README**: Quick reference and API documentation

### Community

Questions? Ideas? Contributions?  
Open an issue or pull request on GitHub!

---

**Happy Automating! 🚀**

Built with ❤️ for developers who need intelligent email automation.
