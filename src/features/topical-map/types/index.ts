/**
 * Topical Map Generation Types
 */

/**
 * Input for topical map generation
 */
export interface TopicalMapGenerationInput {
  // Business information
  businessName: string;
  businessDescription: string;
  targetAudience: string;
  industry: string;
  
  // Core focus
  mainTopic: string;
  keyObjectives: string[];
  
  // SEO preferences
  primaryKeywords: string[];
  competitorDomains?: string[];
  geoTarget?: string;
  
  // Content preferences
  contentDepth: 'basic' | 'intermediate' | 'expert';
  contentFormat: 'blog' | 'guides' | 'mixed';
  expectedVolume: 'small' | 'medium' | 'large'; // Number of topics
}

/**
 * Structure of a generated topical map entry
 */
export interface GeneratedTopicalMapEntry {
  // Core content
  title: string;
  description: string;
  category: string;
  
  // SEO data
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchVolume?: number;
  difficulty?: number;
  
  // Content strategy
  contentType: 'P' | 'C' | 'S'; // Pillar, Cluster, Support
  targetWordCount: number;
  priority: 1 | 2 | 3 | 4 | 5;
  
  // Relationships
  parentTopic?: string;
  relatedTopics: string[];
  supportingTopics: string[];
  
  // Metadata
  estimatedTraffic?: number;
  competitionLevel: 'low' | 'medium' | 'high';
  userIntent: 'informational' | 'commercial' | 'transactional' | 'navigational';
}

/**
 * Complete topical map result
 */
export interface TopicalMapGenerationResult {
  // Metadata
  id: string;
  businessName: string;
  mainTopic: string;
  generatedAt: Date;
  
  // Structure
  pillarTopics: GeneratedTopicalMapEntry[];
  clusterTopics: GeneratedTopicalMapEntry[];
  supportTopics: GeneratedTopicalMapEntry[];
  
  // Statistics
  totalEntries: number;
  estimatedTotalTraffic: number;
  averageDifficulty: number;
  
  // Relationships map
  topicRelationships: TopicRelationship[];
}

/**
 * Topic relationship mapping
 */
export interface TopicRelationship {
  parentTopic: string;
  childTopic: string;
  relationshipType: 'supports' | 'clusters' | 'extends';
  strength: number; // 1-10 relevance score
}

/**
 * Generation pipeline status for topical maps
 */
export interface TopicalMapPipelineStatus {
  keywordResearch: 'pending' | 'in_progress' | 'completed' | 'failed';
  competitorAnalysis: 'pending' | 'in_progress' | 'completed' | 'failed';
  topicGeneration: 'pending' | 'in_progress' | 'completed' | 'failed';
  structureOptimization: 'pending' | 'in_progress' | 'completed' | 'failed';
  validation: 'pending' | 'in_progress' | 'completed' | 'failed';
  databaseSave: 'pending' | 'in_progress' | 'completed' | 'failed';
}

/**
 * Extended result with pipeline tracking
 */
export interface ExtendedTopicalMapResult {
  result?: TopicalMapGenerationResult;
  pipelineStatus: TopicalMapPipelineStatus;
  errors: Array<{ stage: string; error: string; fixed: boolean }>;
  processingTime: number;
}
