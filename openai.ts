// OpenAI API integration for embeddings and chat completions
// Note: In production, you should store the API key securely and use environment variables

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class OpenAIError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'OpenAIError';
  }
}

export class MissingEmbeddingsError extends Error {
  constructor(message: string = "This shop's information isn't ready yet. Please try again later.") {
    super(message);
    this.name = 'MissingEmbeddingsError';
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!OPENAI_API_KEY) {
    throw new OpenAIError(
      'OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your environment.',
      'MISSING_API_KEY'
    );
  }

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new OpenAIError(
        error.error?.message || 'Failed to generate embedding',
        'API_ERROR'
      );
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    if (error instanceof OpenAIError) {
      throw error;
    }
    console.error('Embedding generation error:', error);
    throw new OpenAIError(
      'The AI service is temporarily unavailable. Please try again soon.',
      'NETWORK_ERROR'
    );
  }
}

export async function generateChatResponse(
  userQuestion: string,
  shopContext: string,
  chatHistory: Message[]
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new OpenAIError(
      'OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your environment.',
      'MISSING_API_KEY'
    );
  }

  const systemPrompt = shopContext
    ? `You are a helpful customer support assistant for a local shop. Answer questions based ONLY on the following shop information. If the information is not available in the context, politely say "I don't have that information" or suggest contacting the shop directly.

Shop Information:
${shopContext}

Be friendly, concise, and helpful. Do not make up information that is not in the shop context.`
    : `You are a helpful customer support assistant. The shop information is not available at the moment. Politely inform the user that you don't have access to the shop's information right now.`;

  const messages: Message[] = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.slice(-6), // Keep last 6 messages for context
    { role: 'user', content: userQuestion },
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new OpenAIError(
        error.error?.message || 'Failed to generate response',
        'API_ERROR'
      );
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    if (error instanceof OpenAIError) {
      throw error;
    }
    console.error('Chat completion error:', error);
    throw new OpenAIError(
      'The AI service is temporarily unavailable. Please try again soon.',
      'NETWORK_ERROR'
    );
  }
}
