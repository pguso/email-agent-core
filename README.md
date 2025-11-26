# E-Mail Agent

A powerful, lightweight npm package for building intelligent email automation agents. This package provides a composable framework to fetch, parse, classify, and respond to emails using LLM models (both local and cloud-based).

## Features

- **IMAP Email Fetching**: Connect to any IMAP server and fetch emails programmatically
- **Email Parsing**: Transform raw email data into clean, structured objects
- **AI-Powered Classification**: Automatically classify emails by category, priority, sentiment, and more
- **Smart Response Generation**: Generate contextual, professional email responses using LLM
- **Composable Architecture**: Chain agents together to create complex workflows
- **Multiple LLM Providers**: Support for both local models (`node-llama-cpp`) and cloud providers (OpenAI)
- **TypeScript First**: Written in TypeScript with full type definitions

## Installation

```bash
npm install email-agent-core
```

## Quick Start

### 1. Fetch Emails from IMAP

```javascript
import { EmailImapClient } from 'email-agent-core';

const config = {
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  user: 'your-email@gmail.com',
  pass: 'your-password'
};

const client = new EmailImapClient(config);
await client.connect();

// Fetch the last 10 emails
const emails = await client.fetchLatest(10);
console.log(emails);
```

### 2. Parse Emails

```javascript
import { toFetchedEmail } from 'email-agent-core';

// Transform raw IMAP message to clean email object
const parsedEmail = toFetchedEmail(rawMessage);

console.log({
  uid: parsedEmail.uid,
  from: parsedEmail.from,
  subject: parsedEmail.subject,
  text: parsedEmail.text,
  date: parsedEmail.date
});
```

### 3. Classify Emails with AI

#### Using Local LLM (LlamaCppLLM)

```javascript
import { EmailClassifier, LlamaCppLLM } from 'email-agent-core';

// Initialize local LLM
const llm = new LlamaCppLLM({
  modelPath: './models/llama-model.gguf',
  temperature: 0.7
});

// Create classifier
const classifier = new EmailClassifier(llm);

// Classify an email
const classification = await classifier.execute({
  subject: 'Booking Request for December',
  body: 'Hi, I would like to book a room for 2 nights...'
});

console.log(classification);
// {
//   category: 'booking',
//   priority: 'high',
//   sentiment: 'positive',
//   advert: false,
//   extractedInfo: {
//     guestName: 'John Doe',
//     checkIn: '2024-12-01',
//     checkOut: '2024-12-03',
//     numberOfGuests: 2
//   },
//   suggestedAction: 'Check availability and respond with pricing',
//   confidence: 0.95
// }
```

#### Using OpenAI

```javascript
import { EmailClassifier, OpenAILLM } from 'email-agent-core';

// Initialize OpenAI LLM
const llm = new OpenAILLM({
  model: 'gpt-4o-mini',
  temperature: 0.2,
  apiKey: process.env.OPENAI_API_KEY // or your API key
});

// Create classifier
const classifier = new EmailClassifier(llm);

// Classify an email
const classification = await classifier.execute({
  subject: 'Booking Request for December',
  body: 'Hi, I would like to book a room for 2 nights...'
});

console.log(classification);
```

### 4. Generate Email Responses

```javascript
import { EmailResponseGenerator } from 'email-agent-core';

const generator = new EmailResponseGenerator(llm);

const response = await generator.execute({
  originalEmail: 'Hi, I would like to book a room for 2 nights...',
  context: {
    hotelName: 'Grand Hotel',
    guestName: 'John Doe',
    requestType: 'booking',
    roomsAvailable: true,
    suggestedPrice: 150,
    checkInDate: '2024-12-01',
    checkOutDate: '2024-12-03',
    hotelPolicies: {
      checkInTime: '3:00 PM',
      checkOutTime: '11:00 AM',
      cancellation: 'Free cancellation up to 24 hours before check-in'
    }
  }
});

console.log(response);
// Professional, contextual email response ready to send
```

## Complete Workflow Example

Here's a complete example that fetches emails, classifies them, and generates responses:

```javascript
import { 
  fetchLatestEmails,
  EmailClassifier,
  EmailResponseGenerator,
  LlamaCppLLM 
} from 'email-agent-core';

async function processEmails() {
  // Initialize LLM
  const llm = new LlamaCppLLM({
    modelPath: './models/llama-model.gguf',
    temperature: 0.7
  });

  // Create agents
  const classifier = new EmailClassifier(llm);
  const responseGenerator = new EmailResponseGenerator(llm);

  // Fetch latest emails
  const emails = await fetchLatestEmails(5);

  for (const email of emails) {
    console.log(`Processing: ${email.subject}`);

    // Classify email
    const classification = await classifier.execute({
      subject: email.subject,
      body: email.text
    });

    console.log('Classification:', classification);

    // Skip if it's an advertisement
    if (classification.advert) {
      console.log('Skipping advertisement');
      continue;
    }

    // Generate response for important emails
    if (classification.priority === 'high' || classification.priority === 'urgent') {
      const response = await responseGenerator.execute({
        originalEmail: email.text,
        context: {
          hotelName: 'Your Hotel Name',
          guestName: classification.extractedInfo?.guestName,
          requestType: classification.category,
          roomsAvailable: true,
          checkInDate: classification.extractedInfo?.checkIn,
          checkOutDate: classification.extractedInfo?.checkOut,
          hotelPolicies: {
            checkInTime: '3:00 PM',
            checkOutTime: '11:00 AM',
            cancellation: 'Free cancellation up to 24 hours before check-in'
          }
        }
      });

      console.log('Generated Response:', response);
      // Send the response using nodemailer or your email service
    }
  }
}

processEmails().catch(console.error);
```

## API Reference

### EmailImapClient

Connect to IMAP servers and fetch emails.

**Constructor:**
```javascript
new EmailImapClient(config: ImapConfig)
```

**Config:**
```typescript
interface ImapConfig {
  host: string;      // IMAP server host
  port: number;      // IMAP server port (usually 993 for SSL)
  tls: boolean;      // Use TLS/SSL
  user: string;      // Email address
  pass: string;      // Password or app-specific password
}
```

**Methods:**
- `async connect()`: Connect to the IMAP server
- `async fetchLatest(limit?: number)`: Fetch the latest N emails (default: 10)

### fetchLatestEmails(limit)

High-level function that loads config from environment, connects, and fetches emails.

```javascript
const emails = await fetchLatestEmails(10);
```

Returns an array of parsed email objects.

### toFetchedEmail(message)

Transform raw IMAP message to clean email object.

**Returns:**
```typescript
{
  uid: number;
  date: Date | null;
  from: string | null;
  to: string | null;
  subject: string;
  text: string;
  html: string;
  messageId: string;
  flags: string[];
}
```

### EmailClassifier

AI-powered email classification agent.

**Constructor:**
```javascript
const classifier = new EmailClassifier(llm: LlamaCppLLM)
```

**Methods:**
```javascript
async execute(input: { subject: string; body: string }): Promise<EmailClassification>
```

**Classification Result:**
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
  confidence: number; // 0.0 - 1.0
}
```

### EmailResponseGenerator

Generate professional email responses with context.

**Constructor:**
```javascript
const generator = new EmailResponseGenerator(llm: LlamaCppLLM)
```

**Methods:**
```javascript
async execute(input: {
  originalEmail: string;
  context: ResponseContext;
}): Promise<string>
```

**Response Context:**
```typescript
interface ResponseContext {
  hotelName: string;
  guestName?: string;
  requestType: string;
  roomsAvailable: boolean;
  suggestedPrice?: number;
  checkInDate?: string;
  checkOutDate?: string;
  hotelPolicies: {
    checkInTime: string;
    checkOutTime: string;
    cancellation: string;
  };
}
```

### LlamaCppLLM

Local LLM interface using node-llama-cpp.

**Constructor:**
```javascript
const llm = new LlamaCppLLM(options: LlamaCppLLMOptions)
```

**Options:**
```typescript
interface LlamaCppLLMOptions {
  modelPath: string;       // Path to .gguf model file
  temperature?: number;    // Sampling temperature (0.0 - 1.0)
  maxTokens?: number;      // Maximum tokens to generate
  topP?: number;           // Nucleus sampling
  topK?: number;           // Top-K sampling
  // ... additional llama.cpp options
}
```

**Methods:**
- `async run(messages: BaseMessage[]): Promise<AIMessage>`: Generate completion from messages

### OpenAILLM

Cloud-based LLM interface using OpenAI API.

**Constructor:**
```javascript
const llm = new OpenAILLM(options: OpenAILLMOptions)
```

**Options:**
```typescript
interface OpenAILLMOptions {
  model: string;           // OpenAI model name (e.g., 'gpt-4o-mini', 'gpt-4', 'gpt-3.5-turbo')
  apiKey: string;          // Your OpenAI API key
  temperature?: number;    // Sampling temperature (0.0 - 2.0)
  maxTokens?: number;      // Maximum tokens to generate
  topP?: number;           // Nucleus sampling
  // ... additional OpenAI options
}
```

**Methods:**
- `async run(messages: BaseMessage[]): Promise<AIMessage>`: Generate completion from messages

**Example:**
```javascript
import { OpenAILLM } from 'email-agent-core';

const llm = new OpenAILLM({
  model: 'gpt-4o-mini',
  temperature: 0.2,
  apiKey: process.env.OPENAI_API_KEY
});
```

### Action Base Class

All agents extend the `Action` class, providing composability.

**Methods:**
- `async run(input: any, config?: any)`: Execute the action
- `async* streamOutput(input: any, config?: any)`: Stream output chunks
- `async runBatch(inputs: any[], config?: any)`: Process multiple inputs
- `chain(other: Action)`: Chain this action with another

**Example - Chaining Actions:**
```javascript
// Create a pipeline that classifies then generates response
const pipeline = classifier.chain(responseGenerator);
const result = await pipeline.run(input);
```

## Configuration

### Project Initialization

Initialize your project with:

```bash
npx email-agent-core init
```

This command creates a configuration file:

```
email-agent-core.config.json
```

### email-agent-core.config.json

All email settings are now stored in this JSON file instead of environment variables.

```
{
  "imap": {
    "host": "imap.gmail.com",
    "port": 993,
    "tls": true,
    "user": "your-email@gmail.com",
    "password": "your-password"
  },
  "smtp": {
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": true,
    "user": "your-email@gmail.com",
    "password": "your-password"
  }
}
```

### Loading Configuration

Load the configuration within your project:

```
import { loadEmailConfig } from "email-agent-core";

const config = loadEmailConfig();
```

## Use Cases

### 1. Customer Support Automation
- Automatically classify support tickets
- Generate draft responses for common inquiries
- Prioritize urgent issues
- Extract key information (customer name, issue details, etc.)

### 2. Hotel/Booking Management
- Process booking requests automatically
- Extract reservation details (dates, guests, room preferences)
- Generate professional responses with availability and pricing
- Handle cancellations and modifications

### 3. Email Triage
- Filter out spam and advertisements
- Categorize emails by department or topic
- Route to appropriate handlers based on priority and sentiment
- Extract action items and deadlines

### 4. Sales Lead Management
- Identify potential sales inquiries
- Extract contact information and requirements
- Generate personalized follow-up emails
- Score leads by priority and interest level

### 5. Newsletter/Marketing Automation
- Classify feedback and responses
- Analyze sentiment of customer reactions
- Generate personalized responses to inquiries
- Extract unsubscribe requests

## Privacy & Security

The package supports two LLM options with different privacy implications:

### Local LLM (LlamaCppLLM) - Maximum Privacy
- **Local Processing**: All AI processing happens locally using `node-llama-cpp`
- **No External API Calls**: Email content never leaves your server
- **GDPR Compliant**: Full control over data processing and storage
- **Offline Capable**: Works without internet connection for AI processing

### Cloud LLM (OpenAI) - Convenience & Performance
- **External API**: Email content is sent to OpenAI for processing
- **API Key Required**: Secure API key authentication
- **Privacy Considerations**: Review OpenAI's data usage policies
- **High Performance**: Fast inference with powerful models

### General Security
- **Secure Connections**: TLS/SSL support for IMAP/SMTP connections
- **Configuration Security**: Store credentials securely (use environment variables)
- **Flexible Choice**: Choose the LLM provider that fits your privacy requirements

## Testing

```bash
npm test
```

See `test-real.js` for comprehensive workflow examples and tests including:
- Real IMAP/SMTP integration tests
- AI email classification with both local and OpenAI models
- Complete workflow demonstrations
- Email sending examples

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Additional Resources

- [node-llama-cpp Documentation](https://github.com/withcatai/node-llama-cpp)
- [IMAP Protocol RFC](https://tools.ietf.org/html/rfc3501)
- [Email Parsing with mailparser](https://nodemailer.com/extras/mailparser/)

## Important Notes

### LLM Model Requirements

You need to download a compatible GGUF model file. Popular options:
- Llama 2 or 3 models
- Mistral models
- Phi models

Download from [Hugging Face](https://huggingface.co/models?library=gguf) and place in your project directory.

### Gmail App Passwords

If using Gmail, you'll need to:
1. Enable 2-factor authentication
2. Generate an app-specific password
3. Use the app password instead of your regular password

### Rate Limiting

Be mindful of:
- IMAP server rate limits
- LLM inference time (local models can be slow)
- Memory usage with large models

## Future Enhancements

Planned features:
- Support for more LLM providers (Anthropic, Google AI, etc.)
- Scheduled email processing with cron
- Database integration for email history
- REST API wrapper
- Web dashboard for monitoring
- Advanced email threading and conversation tracking

## Tips

1. **Choose Your LLM Provider**: 
   - Use **OpenAI** for quick setup, high performance, and minimal resource requirements
   - Use **Local LLM** for maximum privacy, offline capability, and no API costs
2. **Start Small**: Begin with a small model (7B parameters) for faster local inference
3. **API Keys**: Store OpenAI API keys in environment variables, never in code
4. **Batch Processing**: Use `runBatch()` for processing multiple emails efficiently
5. **Streaming**: Use `streamOutput()` for real-time response generation
6. **Chaining**: Combine agents using `chain()` for complex workflows
7. **Error Handling**: Always wrap agent calls in try-catch blocks
8. **Testing**: Test thoroughly with sample emails before production use (see `test-real.js`)

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

Built with ❤️ for developers who need intelligent email automation.