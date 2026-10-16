import { AIActionType } from '../types/note';

export interface AIProcessRequest {
  action: AIActionType | 'custom';
  text: string;
  title?: string;
  customInstruction?: string;
  targetLanguage?: string;
  targetTone?: string;
}

export interface AIProcessResponse {
  result?: string;
  tags?: string[];
  error?: string;
}

export async function processWithAI(request: AIProcessRequest): Promise<AIProcessResponse> {
  try {
    const response = await fetch('/api/ai/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to process request with AI.');
    }

    return data;
  } catch (error: any) {
    console.error('AI Service client error:', error);
    return { error: error.message || 'Error communicating with AI service.' };
  }
}
