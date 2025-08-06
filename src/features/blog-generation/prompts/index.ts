/**
 * Blog Generation Prompts Index
 * Exports all prompt functions for different content types
 */

// Pillar Page Prompts
export { 
  pillarSystemPrompt, 
  generatePillarUserPrompt 
} from './pillar-prompts';

// Cluster Content Prompts  
export { 
  clusterSystemPrompt, 
  generateClusterUserPrompt 
} from './cluster-prompts';

// Support Content Prompts
export { 
  supportSystemPrompt, 
  generateSupportUserPrompt 
} from './support-prompts';


// Base Prompts (slice definitions)
export { getSlicePrompt } from './base-prompts';

/**
 * Content Type Mapping
 */
export const CONTENT_TYPE_PROMPTS = {
  'P': { // Pillar
    systemPrompt: 'pillarSystemPrompt',
    userPromptGenerator: 'generatePillarUserPrompt'
  },
  'C': { // Cluster
    systemPrompt: 'clusterSystemPrompt', 
    userPromptGenerator: 'generateClusterUserPrompt'
  },
  'S': { // Support
    systemPrompt: 'supportSystemPrompt',
    userPromptGenerator: 'generateSupportUserPrompt'
  },
} as const;

/**
 * Word Count Targets by Content Type
 */
export const WORD_COUNT_TARGETS = {
  'P': { min: 2500, max: 4000 }, // Pillar
  'C': { min: 1000, max: 2000 }, // Cluster
  'S': { min: 500, max: 1000 },  // Support
} as const;

/**
 * Content Type Descriptions
 */
export const CONTENT_TYPE_DESCRIPTIONS = {
  'P': 'Pillar Page - Uitgebreide, diepgaande gids over het brede onderwerp',
  'C': 'Cluster Content - Gedetailleerde artikelen over subonderwerpen', 
  'S': 'Support Content - Korte, specifieke content voor FAQ, definities',
} as const;
