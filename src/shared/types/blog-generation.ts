/**
 * Types en interfaces voor blog generation
 */

/**
 * Blog types voor de topical map
 */
export type TopicalMapBlogType = 'P' | 'C' | 'S';

/**
 * Base interface voor blog generation vanuit topical map
 */
export interface TopicalMapBlogOptions {
  topic: string;
  targetAudience?: string;
  tone?: 'professional' | 'casual' | 'educational' | 'persuasive';
  keywords?: string[];
  author?: 'Guido van der Reijden' | 'Julian Koren';
}

/**
 * Blog statistics interface
 */
export interface BlogStats {
  sliceCount: number;
  readingTime: number;
  wordCountEstimate: number;
  sliceBreakdown: Record<string, number>;
}

/**
 * Blog document structure for Prismic
 */
export interface BlogDocument {
  uid: string;
  type: 'blog';
  lang: string;
  data: {
    heading: string;
    updated_at: string;
    author: string;
    reading_time: number;
    slices: any[];
    meta_title: string;
    meta_description?: string;
  };
}

/**
 * Result interface for basic blog generation
 */
export interface BlogGenerationResult {
  document: BlogDocument;
  stats: BlogStats;
  markdownContent: string;
  userPrompt: string;
  systemPrompt: string;
}

/**
 * Pipeline status tracking
 */
export interface PipelineStatus {
  aiGeneration: 'success' | 'failed';
  markdownParsing: 'success' | 'failed';
  prismicDocument: 'success' | 'failed';
  prismicPublication: 'success' | 'failed';
  databaseUpdate: 'success' | 'failed';
}

/**
 * Pipeline error tracking
 */
export interface PipelineError {
  stage: string;
  error: string;
  fixed: boolean;
}

/**
 * Prismic error tracking
 */
export interface PrismicError {
  type: 'slice_error' | 'field_error' | 'api_error' | 'migration_error' | 'uid_conflict';
  message: string;
  sliceIndex?: number;
  field?: string;
}

/**
 * Extended result interface for complete pipeline
 */
export interface ExtendedBlogGenerationResult {
  document: BlogDocument;
  stats: BlogStats;
  pipelineStatus: PipelineStatus;
  errors: PipelineError[];
  markdownContent?: string;
  prismicId?: string;
}

/**
 * Internal links structure for interlinking
 */
export interface InternalLinks {
  pillarLinks: string[];
  clusterLinks: string[];
  supportLinks: string[];
  toolLinks: string[];
  existingLinks: string[];
}

/**
 * Reading time ranges per blog type
 */
export interface ReadingTimeRange {
  min: number;
  max: number;
}

/**
 * Reading time configurations per blog type
 */
export const READING_TIME_RANGES: Record<TopicalMapBlogType, ReadingTimeRange> = {
  P: { min: 15, max: 25 }, // Pillar: >2500 words
  C: { min: 8, max: 12 },  // Cluster: 1000-2000 words
  S: { min: 3, max: 6 },   // Support: 500-1000 words
};
