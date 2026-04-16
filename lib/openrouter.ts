const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

const MODELS = [
  'deepseek/deepseek-chat',
  'qwen/qwen-2.5-72b-instruct',
  'moonshotai/moonshot-v1-8k',
  'minimax/minimax-text-01',
];

function log(level: string, message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`, data || '');
}

async function tryModel(model: string, options: ChatCompletionOptions): Promise<string> {
  log('INFO', `Trying model: ${model}`);
  
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    },
    body: JSON.stringify({
      model: model,
      messages: options.messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    log('ERROR', `Model ${model} failed`, { status: response.status, error: error.substring(0, 200) });
    throw new Error(`OpenRouter API error: ${error.substring(0, 100)}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    log('ERROR', 'Invalid response structure', { response: JSON.stringify(data).substring(0, 200) });
    throw new Error('Invalid API response structure');
  }
  
  log('INFO', `Model ${model} succeeded`);
  return data.choices[0].message.content;
}

export async function getCompletion(options: ChatCompletionOptions): Promise<string> {
  log('INFO', 'getCompletion called', { model: options.model, messageCount: options.messages.length });
  
  if (!OPENROUTER_API_KEY) {
    log('ERROR', 'No API key configured');
    throw new Error('OPENROUTER_API_KEY not configured');
  }

  const errors: string[] = [];
  const modelsToTry = [options.model, ...MODELS.filter(m => m !== options.model)];
  
  for (const model of modelsToTry) {
    try {
      return await tryModel(model, { ...options, model });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push(`${model}: ${errorMsg}`);
      log('WARN', `Model ${model} failed, trying next...`, { error: errorMsg });
    }
  }

  log('ERROR', 'All models failed', { errors });
  throw new Error(`All models failed: ${errors.join('; ')}`);
}

export async function* streamCompletion(options: ChatCompletionOptions): AsyncGenerator<string> {
  log('INFO', 'streamCompletion called', { model: options.model });
  
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }

  for (const model of MODELS) {
    try {
      log('INFO', `Streaming with model: ${model}`);
      
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        },
        body: JSON.stringify({
          model: model,
          messages: options.messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 4096,
          stream: true,
        }),
      });

      if (!response.ok) {
        const lastError = await response.text();
        log('WARN', `Model ${model} streaming failed`, { status: response.status });
        continue;
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            try {
              const json = JSON.parse(data);
              const content = json.choices[0]?.delta?.content;
              if (content) yield content;
            } catch {}
          }
        }
      }
      
      return;
    } catch (error) {
      log('WARN', `Model ${model} streaming error`, { error: String(error) });
    }
  }
  
  throw new Error('All streaming models failed');
}

export const AVAILABLE_MODELS = MODELS;
export const DEFAULT_MODEL = 'deepseek/deepseek-chat';