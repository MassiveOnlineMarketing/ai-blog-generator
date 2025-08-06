import { generateObject, generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { config } from 'dotenv';

// Load environment variables
config();

/**
 * OpenAI client configuratie
 */
export const aiClient = openai('gpt-4o-mini');

/**
 * AI modellen configuratie
 */
export const AI_MODELS = {
  CONTENT_GENERATION: 'gpt-4o-mini',
  KEYWORD_ANALYSIS: 'gpt-4o-mini',
  CONTENT_ANALYSIS: 'gpt-4o-mini',
  OPTIMIZATION: 'gpt-4o-mini',
  PILLAR: 'gpt-4.1', // Model for pillar articles
  CLUSTER: 'gpt-4.1', // Model for cluster articles
  SUPPORT: 'gpt-4.1' // Model for support articles
} as const;


export const BLOG_MODEL_CONFIG = {
  P: {
    model: AI_MODELS.PILLAR,
    maxTokens: 8000
  },
  C: {
    model: AI_MODELS.CLUSTER,
    maxTokens: 6000
  },
  S: {
    model: AI_MODELS.SUPPORT,
    maxTokens: 4000
  }
} as const;

/**
 * Basis AI generation functie
 */
export async function generateObjectWithAI<T>(
  schema: any,
  prompt: string,
  system?: string,
  modelConfiguration: { model: string; maxTokens: number } = BLOG_MODEL_CONFIG.S
) {
  return generateObject({
    model: openai(modelConfiguration.model),
    maxTokens: modelConfiguration.maxTokens,
    schema,
    system,
    prompt,
  });
}

export async function generateWithAI<T>(
  prompt: string,
  system?: string,
  modelConfiguration: { model: string; maxTokens: number } = BLOG_MODEL_CONFIG.S
) {
  return generateText({
    model: openai(modelConfiguration.model),
    maxTokens: modelConfiguration.maxTokens,
    system,
    prompt
  });
}


export { openai };