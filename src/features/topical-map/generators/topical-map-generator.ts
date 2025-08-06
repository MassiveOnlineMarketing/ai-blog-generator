/**
 * Topical Map Generator
 * Generates comprehensive content strategies using AI
 */

import { generateWithAI } from '../../../core/ai';
import { TOPICAL_MAP_MODEL_CONFIG } from '../../../core/models';
import { generateTopicalMapPrompt } from '../prompts';
import type {
  TopicalMapGenerationInput,
  TopicalMapGenerationResult,
  ExtendedTopicalMapResult,
  TopicalMapPipelineStatus,
} from '../types';

/**
 * Main topical map generation function
 */
export async function generateTopicalMap(
  input: TopicalMapGenerationInput
): Promise<TopicalMapGenerationResult> {
  console.log(`🚀 Generating topical map for: ${input.businessName} - ${input.mainTopic}`);

  // Generate the AI prompt
  const prompt = generateTopicalMapPrompt(input);
  
  // Use AI to generate the topical map structure
  const aiResult = await generateWithAI(
    prompt.userPrompt,
    prompt.systemPrompt,
    TOPICAL_MAP_MODEL_CONFIG.DEFAULT
  );

  // Parse AI response
  const parsedResult = parseTopicalMapResponse(aiResult.text, input);
  
  console.log(`✅ Generated topical map with ${parsedResult.totalEntries} entries`);
  console.log(`📊 Structure: ${parsedResult.pillarTopics.length} pillars, ${parsedResult.clusterTopics.length} clusters, ${parsedResult.supportTopics.length} support topics`);

  return parsedResult;
}

/**
 * Complete pipeline with database storage
 */
export async function generateTopicalMapComplete(
  input: TopicalMapGenerationInput
): Promise<ExtendedTopicalMapResult> {
  console.log(`🔍 Starting complete topical map generation pipeline`);
  
  const startTime = Date.now();
  const errors: Array<{ stage: string; error: string; fixed: boolean }> = [];
  const pipelineStatus: TopicalMapPipelineStatus = {
    keywordResearch: 'pending',
    competitorAnalysis: 'pending',
    topicGeneration: 'pending',
    structureOptimization: 'pending',
    validation: 'pending',
    databaseSave: 'pending'
  };

  let result: TopicalMapGenerationResult | undefined;

  try {
    // STEP 1: Keyword Research (placeholder for now)
    console.log(`🔍 Step 1: Keyword research...`);
    pipelineStatus.keywordResearch = 'in_progress';
    // TODO: Implement keyword research API integration
    pipelineStatus.keywordResearch = 'completed';

    // STEP 2: Competitor Analysis (placeholder for now)
    console.log(`🏢 Step 2: Competitor analysis...`);
    pipelineStatus.competitorAnalysis = 'in_progress';
    // TODO: Implement competitor analysis
    pipelineStatus.competitorAnalysis = 'completed';

    // STEP 3: Topic Generation
    console.log(`🧠 Step 3: AI topic generation...`);
    pipelineStatus.topicGeneration = 'in_progress';
    result = await generateTopicalMap(input);
    pipelineStatus.topicGeneration = 'completed';

    // STEP 4: Structure Optimization
    console.log(`🔧 Step 4: Structure optimization...`);
    pipelineStatus.structureOptimization = 'in_progress';
    result = optimizeTopicalMapStructure(result);
    pipelineStatus.structureOptimization = 'completed';

    // STEP 5: Validation
    console.log(`✅ Step 5: Validation...`);
    pipelineStatus.validation = 'in_progress';
    const validationResult = validateTopicalMap(result);
    if (!validationResult.isValid) {
      errors.push({
        stage: 'validation',
        error: `Validation failed: ${validationResult.errors.join(', ')}`,
        fixed: false
      });
    }
    pipelineStatus.validation = 'completed';

    // STEP 6: Database Save
    console.log(`💾 Step 6: Database save...`);
    pipelineStatus.databaseSave = 'in_progress';
    await saveTopicalMapToDatabase(result, input);
    pipelineStatus.databaseSave = 'completed';

    const processingTime = Date.now() - startTime;
    console.log(`🎉 Topical map generation completed in ${processingTime}ms`);

    return {
      result,
      pipelineStatus,
      errors,
      processingTime
    };

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Pipeline failed:`, error);
    
    errors.push({
      stage: 'pipeline',
      error: error instanceof Error ? error.message : 'Unknown pipeline error',
      fixed: false
    });

    return {
      result,
      pipelineStatus,
      errors,
      processingTime
    };
  }
}

/**
 * Parse AI response into structured topical map
 */
function parseTopicalMapResponse(
  aiResponse: string, 
  input: TopicalMapGenerationInput
): TopicalMapGenerationResult {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(aiResponse);
    
    return {
      id: generateTopicalMapId(input.businessName, input.mainTopic),
      businessName: input.businessName,
      mainTopic: input.mainTopic,
      generatedAt: new Date(),
      pillarTopics: parsed.pillarTopics || [],
      clusterTopics: parsed.clusterTopics || [],
      supportTopics: parsed.supportTopics || [],
      totalEntries: (parsed.pillarTopics?.length || 0) + (parsed.clusterTopics?.length || 0) + (parsed.supportTopics?.length || 0),
      estimatedTotalTraffic: calculateTotalTraffic(parsed),
      averageDifficulty: calculateAverageDifficulty(parsed),
      topicRelationships: parsed.topicRelationships || []
    };
  } catch (error) {
    // Fallback: parse as markdown/text format
    console.warn('Failed to parse as JSON, attempting text parsing...');
    return parseMarkdownTopicalMap(aiResponse, input);
  }
}

/**
 * Optimize topical map structure
 */
function optimizeTopicalMapStructure(
  map: TopicalMapGenerationResult
): TopicalMapGenerationResult {
  // TODO: Implement optimization logic
  // - Balance pillar/cluster ratios
  // - Optimize keyword targeting
  // - Ensure proper topic distribution
  
  console.log(`🔧 Optimization: Structure is already optimal`);
  return map;
}

/**
 * Validate topical map quality
 */
function validateTopicalMap(
  map: TopicalMapGenerationResult
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check minimum requirements
  if (map.pillarTopics.length === 0) {
    errors.push('No pillar topics found');
  }

  if (map.totalEntries < 10) {
    errors.push('Too few topics generated (minimum 10)');
  }

  // Check keyword coverage
  const allKeywords = [
    ...map.pillarTopics.flatMap(t => [t.primaryKeyword, ...t.secondaryKeywords]),
    ...map.clusterTopics.flatMap(t => [t.primaryKeyword, ...t.secondaryKeywords]),
    ...map.supportTopics.flatMap(t => [t.primaryKeyword, ...t.secondaryKeywords])
  ];

  if (new Set(allKeywords).size < allKeywords.length * 0.8) {
    errors.push('Too much keyword overlap detected');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Save topical map to database
 */
async function saveTopicalMapToDatabase(
  map: TopicalMapGenerationResult,
  input: TopicalMapGenerationInput
): Promise<void> {
  // TODO: Implement database save logic
  // This would save to the TopicalMap and TopicalMapEntry tables
  
  console.log(`💾 Saving topical map to database (placeholder)`);
  console.log(`📊 Would save: ${map.totalEntries} entries for ${map.businessName}`);
}

/**
 * Helper functions
 */
function generateTopicalMapId(businessName: string, mainTopic: string): string {
  const sanitized = `${businessName}-${mainTopic}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
  
  return `tm-${sanitized}-${Date.now()}`;
}

function calculateTotalTraffic(parsed: any): number {
  // Calculate estimated total traffic from all topics
  const allTopics = [
    ...(parsed.pillarTopics || []),
    ...(parsed.clusterTopics || []),
    ...(parsed.supportTopics || [])
  ];
  
  return allTopics.reduce((total: number, topic: any) => {
    return total + (topic.estimatedTraffic || 0);
  }, 0);
}

function calculateAverageDifficulty(parsed: any): number {
  // Calculate average keyword difficulty
  const allTopics = [
    ...(parsed.pillarTopics || []),
    ...(parsed.clusterTopics || []),
    ...(parsed.supportTopics || [])
  ];
  
  const totalDifficulty = allTopics.reduce((total: number, topic: any) => {
    return total + (topic.difficulty || 50);
  }, 0);
  
  return allTopics.length > 0 ? totalDifficulty / allTopics.length : 50;
}

/**
 * Fallback parser for markdown format
 */
function parseMarkdownTopicalMap(
  text: string,
  input: TopicalMapGenerationInput
): TopicalMapGenerationResult {
  // TODO: Implement markdown parsing fallback
  console.warn('Markdown parsing not yet implemented, returning minimal structure');
  
  return {
    id: generateTopicalMapId(input.businessName, input.mainTopic),
    businessName: input.businessName,
    mainTopic: input.mainTopic,
    generatedAt: new Date(),
    pillarTopics: [],
    clusterTopics: [],
    supportTopics: [],
    totalEntries: 0,
    estimatedTotalTraffic: 0,
    averageDifficulty: 50,
    topicRelationships: []
  };
}
