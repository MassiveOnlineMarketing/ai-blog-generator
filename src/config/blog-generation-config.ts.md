import { TopicalMapEntry } from '@db/client';
import { 
  pillarSystemPrompt, 
  generatePillarUserPrompt,
  clusterSystemPrompt,
  generateClusterUserPrompt,
  supportSystemPrompt,
  generateSupportUserPrompt
} from '../features/blog-generation/prompts';
import { SLICE_CONFIG } from '../shared/config/sliceConfig';

/**
 * Central Blog Generation Configuration
 * Manages prompts, settings, and options for blog generation
 */

export interface BlogTypePrompts {
  system: {
    pillar: string;
    cluster: string;
    support: string;
  };
  userPromptGenerators: {
    pillar: (entry: TopicalMapEntry) => string;
    cluster: (entry: TopicalMapEntry) => string;
    support: (entry: TopicalMapEntry) => string;
  };
}

export interface GenerationSettings {
  outputPath: string;
  maxRetries: number;
  delayBetweenGenerations: number;
  aiModel: string;
  promptVersion: string;
}

export interface BlogGenerationConfig {
  prompts: {
    default: BlogTypePrompts;
    test: BlogTypePrompts;
  };
  settings: {
    default: GenerationSettings;
    test: GenerationSettings;
  };
  sliceConfig: {
    global: typeof SLICE_CONFIG;
    perType?: Partial<Record<'pillar' | 'cluster' | 'support', typeof SLICE_CONFIG>>;
  };
}

/**
 * Main Blog Generation Configuration
 */
export const BLOG_GENERATION_CONFIG: BlogGenerationConfig = {
  prompts: {
    default: {
      system: {
        pillar: pillarSystemPrompt,
        cluster: clusterSystemPrompt,
        support: supportSystemPrompt
      },
      userPromptGenerators: {
        pillar: generatePillarUserPrompt,
        cluster: generateClusterUserPrompt,
        support: generateSupportUserPrompt
      }
    },
    test: {
      system: {
        pillar: `[TEST MODE] ${pillarSystemPrompt}

**EXPERIMENTAL FEATURES FOR TESTING:**
- Try alternative content structures and approaches
- Test new slice combinations and layouts  
- Experiment with different storytelling techniques
- Validate new SEO strategies and keyword approaches
- All output will be saved to test directories for review`,
        cluster: `[TEST MODE] ${clusterSystemPrompt}

**EXPERIMENTAL FEATURES FOR TESTING:**
- Test innovative cluster content formats
- Experiment with new practical implementation approaches
- Try alternative internal linking strategies
- Validate different engagement techniques
- All output will be saved to test directories for review`,
        support: `[TEST MODE] ${supportSystemPrompt}

**EXPERIMENTAL FEATURES FOR TESTING:**
- Experiment with new FAQ and explanation formats
- Test alternative content organization methods
- Try innovative user guidance approaches
- Validate different quick-reference structures
- All output will be saved to test directories for review`
      },
      userPromptGenerators: {
        pillar: (entry: TopicalMapEntry) => {
          const basePrompt = generatePillarUserPrompt(entry);
          return `${basePrompt}

**TEST MODE ADJUSTMENTS:**
- Content will be saved to test directory for review
- Focus on experimental features and alternative approaches
- Prioritize speed and innovation over perfect optimization`;
        },
        cluster: (entry: TopicalMapEntry) => {
          const basePrompt = generateClusterUserPrompt(entry);
          return `${basePrompt}

**TEST MODE ADJUSTMENTS:**
- Content will be saved to test directory for review
- Experiment with new cluster content formats
- Try innovative practical implementation approaches`;
        },
        support: (entry: TopicalMapEntry) => {
          const basePrompt = generateSupportUserPrompt(entry);
          return `${basePrompt}

**TEST MODE ADJUSTMENTS:**
- Content will be saved to test directory for review
- Test alternative FAQ and explanation formats
- Focus on new user guidance approaches`;
        }
      }
    }
  },
  sliceConfig: {
    global: SLICE_CONFIG,
    perType: {
      // Example: enable checklist for pillar only
      // pillar: { ...SLICE_CONFIG, checklist: true },
      // cluster: { ...SLICE_CONFIG, tips: true },
      // support: { ...SLICE_CONFIG, notification: false },
    }
  },
  settings: {
    default: {
      outputPath: 'data',
      maxRetries: 3,
      delayBetweenGenerations: 1000,
      aiModel: 'gpt-4.1',
      promptVersion: '2.0'
    },
    test: {
      outputPath: 'data/test',
      maxRetries: 2,
      delayBetweenGenerations: 500,
      aiModel: 'gpt-4.1',
      promptVersion: '2.0-test'
    }
  }
};

/**
 * Get system prompt for specific blog type and mode
 */
export function getSystemPrompt(blogType: 'P' | 'C' | 'S', mode: 'default' | 'test' = 'default'): string {
  const typeMap = {
    'P': 'pillar',
    'C': 'cluster',
    'S': 'support'
  } as const;
  
  return BLOG_GENERATION_CONFIG.prompts[mode].system[typeMap[blogType]];
}

/**
 * Get user prompt generator for specific blog type and mode
 */
export function getUserPromptGenerator(blogType: 'P' | 'C' | 'S', mode: 'default' | 'test' = 'default'): (entry: TopicalMapEntry) => string {
  const typeMap = {
    'P': 'pillar',
    'C': 'cluster',
    'S': 'support'
  } as const;
  
  return BLOG_GENERATION_CONFIG.prompts[mode].userPromptGenerators[typeMap[blogType]];
}

/**
 * Get both system prompt and user prompt for a blog entry
 */
export function getBlogPrompts(entry: TopicalMapEntry, mode: 'default' | 'test' = 'default'): { systemPrompt: string; userPrompt: string } {
  const blogType = entry.type as 'P' | 'C' | 'S';
  
  const systemPrompt = getSystemPrompt(blogType, mode);
  const userPromptGenerator = getUserPromptGenerator(blogType, mode);
  const userPrompt = userPromptGenerator(entry);
  
  return {
    systemPrompt,
    userPrompt
  };
}

/**
 * Get settings for specific mode
 */
export function getGenerationSettings(mode: 'default' | 'test' = 'default'): GenerationSettings {
  return BLOG_GENERATION_CONFIG.settings[mode];
}

/**
 * Get output path for specific mode
 */
export function getOutputPath(mode: 'default' | 'test' = 'default'): string {
  return BLOG_GENERATION_CONFIG.settings[mode].outputPath;
}