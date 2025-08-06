/**
 * AI Model configurations for topical map generation
 */

export const TOPICAL_MAP_MODEL_CONFIG = {
  DEFAULT: {
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 4000,
    topP: 0.9,
    frequencyPenalty: 0.1,
    presencePenalty: 0.1
  },
  
  CREATIVE: {
    model: 'gpt-4',
    temperature: 0.9,
    maxTokens: 4000,
    topP: 0.95,
    frequencyPenalty: 0.2,
    presencePenalty: 0.2
  },
  
  FOCUSED: {
    model: 'gpt-4',
    temperature: 0.3,
    maxTokens: 3000,
    topP: 0.8,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0
  }
};
