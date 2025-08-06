import { TopicalMapBlogType } from "../../shared/types";
import { BLOG_MODEL_CONFIG, generateWithAI } from "../../core/ai";
import { 
  generatePillarUserPrompt, 
  pillarSystemPrompt,
  generateClusterUserPrompt,
  clusterSystemPrompt,
  generateSupportUserPrompt,
  supportSystemPrompt
} from "./prompts";
import { TopicalMapEntry } from "@db/client";
import { MarkdownToPrismicParser } from "../../shared/utils/markdownToPrismicParser";
import { PrismicPublisher } from "../../integrations/prismic/publication/prismic-publisher";
import { TopicalMapRepository, GeneratedContentRepository } from "../../shared/database/repositories";
import type { 
  BlogDocument, 
  ExtendedBlogGenerationResult, 
  BlogStats, 
  PipelineError,
  BlogGenerationResult
} from "../../shared/types/blog-generation";

export async function generateBlogFromTopicalMapEntry(
  entry: TopicalMapEntry,
  type: TopicalMapBlogType,
) {
  let userPrompt: string;
  let systemPrompt: string
  const model = getModelConfigurationForBlogType(type);

  switch (type) {
    case 'P': // Pillar
      userPrompt = generatePillarUserPrompt(entry);
      systemPrompt = pillarSystemPrompt;
      break;
    case 'C': // Cluster
      userPrompt = generateClusterUserPrompt(entry);
      systemPrompt = clusterSystemPrompt;
      break;
    case 'S': // Support
      userPrompt = generateSupportUserPrompt(entry);
      systemPrompt = supportSystemPrompt;
      break;
    default:
      throw new Error(`Unsupported blog type: ${type}`);
  }

  const result = await generateWithAI(
    userPrompt,
    systemPrompt,
    model
  );
  const blogData = result.text;

  console.log(`Generated blog for: ${entry.titelPagina}`);

  return {
    blogData, 
    userPrompt,
    systemPrompt,
  };
}

/**
 * Generate a complete blog with Prismic document structure
 */
export async function generateBlogFromTopicalMapWithPrismic(
  entry: TopicalMapEntry,
  type: TopicalMapBlogType,
): Promise<BlogGenerationResult> {
  console.log(`🚀 Generating ${type} blog with Prismic structure for: ${entry.titelPagina}`);

  // Generate markdown content
  const { blogData: markdownContent, userPrompt, systemPrompt } = await generateBlogFromTopicalMapEntry(entry, type);
  
  // Parse markdown to Prismic slices
  const parser = new MarkdownToPrismicParser();
  const slices = parser.parseMarkdownToSlices(markdownContent);
  
  console.log(`✅ Generated ${slices.length} slices for ${type} blog`);
  console.log('slices', slices);

  // Extract title from markdown (first H1)
  const titleMatch = markdownContent.match(/^# (.+)$/m);
  const title = titleMatch?.[1] || entry.titelPagina;

  console.log(`📄 Title extracted: "${title}"`);

  // Extract meta descriptions (look for Meta Descriptions section)
  const metaMatch = markdownContent.match(/## Meta Descriptions?\s*\n([\s\S]*?)(?=\n##|\n---|\n$)/);
  let metaDescription = '';
  if (metaMatch && metaMatch[1]) {
    const metaContent = metaMatch[1];
    const firstMetaMatch = metaContent.match(/^\d+\.\s*(.+)$/m);
    if (firstMetaMatch && firstMetaMatch[1]) {
      metaDescription = firstMetaMatch[1];
    }
  }

  // Generate UID from title and type
  const uid = await generateUniqueUID(entry.urlPagina, type, entry.id);

  // Calculate reading time based on word count estimate
  const wordCount = estimateWordCount(markdownContent);
  const readingTime = Math.max(3, Math.min(15, Math.round(wordCount / 200)));

  // Build the complete Prismic document
  const blogDocument: BlogDocument = {
    uid,
    type: 'blog',
    lang: 'nl-nl',
    data: {
      heading: title,
      updated_at: new Date().toISOString().slice(0, 10),
      author: 'Guido van der Reijden',
      reading_time: readingTime,
      slices: slices,
      meta_title: title,
      meta_description: metaDescription || undefined,
    }
  };

  // Calculate statistics
  const stats = calculateBlogStats(blogDocument, markdownContent);

  console.log(`🎉 ${type} blog generated: "${title}"`);
  console.log(`📊 Stats: ${stats.sliceCount} slices, ${stats.readingTime}min read, ~${stats.wordCountEstimate} words`);

  return {
    document: blogDocument,
    stats,
    markdownContent,
    userPrompt,
    systemPrompt
  };
}

/**
 * Complete database-driven blog generation pipeline
 * Includes: AI Generation → Markdown Parsing → Prismic Document → Database Update
 */
export async function generateBlogFromTopicalMapEntryComplete(entryId: string): Promise<ExtendedBlogGenerationResult> {
  console.log(`🔍 Starting complete blog generation pipeline for entry: ${entryId}`);

  const errors: PipelineError[] = [];
  const pipelineStatus = {
    aiGeneration: 'failed' as 'success' | 'failed',
    markdownParsing: 'failed' as 'success' | 'failed',
    prismicDocument: 'failed' as 'success' | 'failed',
    prismicPublication: 'failed' as 'success' | 'failed',
    databaseUpdate: 'failed' as 'success' | 'failed',
  };

  let finalDocument: BlogDocument | undefined;
  let finalStats: any | undefined;
  let markdownContent: string | undefined;
  let prismicId: string | undefined;

  try {
    // STEP 1: Load data from database
    console.log(`📊 Step 1: Loading data from database...`);
    
    const entry = await TopicalMapRepository.findEntryById(entryId);

    if (!entry) {
      throw new Error(`TopicalMapEntry with ID ${entryId} not found`);
    }

    console.log(`📋 Found entry: "${entry.titelPagina}" (${entry.type})`);

    // Update status to 'in_progress'
    await TopicalMapRepository.updateEntryStatus(entryId, 'in_progress');

    // STEP 2: AI Content Generation
    console.log(`🤖 Step 2: AI content generation...`);
    
    const blogType = mapEntryTypeToBlogType(entry.type);
    const generationResult = await generateBlogFromTopicalMapWithPrismic(entry, blogType);
    
    pipelineStatus.aiGeneration = 'success';
    pipelineStatus.markdownParsing = 'success';
    pipelineStatus.prismicDocument = 'success';
    
    finalDocument = generationResult.document;
    finalStats = generationResult.stats;
    markdownContent = generationResult.markdownContent;
    
    console.log(`✅ AI generation and parsing successful`);

    // STEP 3: Prismic Publication
    console.log(`📤 Step 3: Prismic publication...`);
    
    const publisher = new PrismicPublisher();
    const publicationResult = await publisher.publishToPrismic(finalDocument);

    if (publicationResult.success) {
      pipelineStatus.prismicPublication = 'success';
      prismicId = publicationResult.prismicId;
      console.log(`✅ Prismic publication successful: ${prismicId}`);
    } else {
      pipelineStatus.prismicPublication = 'failed';
      const errorMsg = `Prismic publication failed: ${publicationResult.errors.map(e => e.message || e.type).join(', ')}`;
      errors.push({ stage: 'prismic', error: errorMsg, fixed: false });
      console.warn(`⚠️ ${errorMsg}`);
      
      // If it's a UID conflict that couldn't be resolved, try with a new unique UID
      if (publicationResult.errors.some(e => e.type === 'uid_conflict')) {
        console.log(`🔄 Attempting publication with new unique UID...`);
        
        const newUID = await generateUniqueUID(entry.urlPagina, blogType, entryId);
        const retryDocument = {
          ...finalDocument,
          uid: newUID
        };
        
        const retryResult = await publisher.publishToPrismic(retryDocument);
        if (retryResult.success) {
          pipelineStatus.prismicPublication = 'success';
          prismicId = retryResult.prismicId;
          finalDocument = retryDocument; // Update the final document with new UID
          console.log(`✅ Retry publication successful with UID: ${newUID}`);
        } else {
          console.warn(`❌ Retry publication also failed: ${retryResult.errors.map(e => e.message || e.type).join(', ')}`);
        }
      }
    }

    // STEP 4: Database Update
    console.log(`💾 Step 4: Database update...`);

    // Update TopicalMapEntry
    await TopicalMapRepository.updateEntryStatus(
      entryId, 
      pipelineStatus.prismicPublication === 'success' ? 'published' : 'generated'
    );

    // STEP 5: Save content and stats in GeneratedContent (upsert logic)
    if (finalDocument && finalStats) {
      const model = getModelConfigurationForBlogType(blogType);
      
      await GeneratedContentRepository.upsertGeneratedContent({
        topicalMapEntryId: entryId,
        prismicUid: finalDocument.uid,
        title: finalDocument.data.heading,
        content: finalDocument.data as any,
        wordCount: finalStats.wordCountEstimate,
        readingTime: finalStats.readingTime,
        metaTitle: finalDocument.data.meta_title,
        metaDescription: finalDocument.data.meta_description,
        targetKeywords: entry.belangrijksteZoekwoorden,
        aiModel: model.model,
        promptVersion: '2.0',
        generationTime: Math.floor(Date.now() / 1000),
        prismicId: prismicId,
        validationStatus: 'valid',
        publicationStatus: pipelineStatus.prismicPublication === 'success' ? 'published' : 'generated'
      });
      
      console.log(`✅ Saved GeneratedContent record`);
    }

    pipelineStatus.databaseUpdate = 'success';
    console.log(`✅ Database update successful`);

    console.log(`🎉 Complete pipeline finished successfully for: ${entry.titelPagina}`);
    
    return {
      document: finalDocument,
      stats: finalStats,
      pipelineStatus,
      errors,
      markdownContent,
      prismicId
    };

  } catch (error) {
    console.error(`❌ Pipeline failed:`, error);
    
    // Update database with error status
    try {
      await TopicalMapRepository.updateEntryStatus(entryId, 'failed');
    } catch (dbError) {
      console.error('Failed to update database with error status:', dbError);
    }

    // Return partial result if we have something
    if (finalDocument && finalStats) {
      return {
        document: finalDocument,
        stats: finalStats,
        pipelineStatus,
        errors: [
          ...errors,
          { 
            stage: 'pipeline', 
            error: error instanceof Error ? error.message : 'Unknown pipeline error', 
            fixed: false 
          }
        ],
        markdownContent
      };
    }

    throw error;
  }
}

/**
 * Generate and publish a blog directly to Prismic (simplified version)
 */
export async function generateAndPublishBlog(
  entry: TopicalMapEntry,
  type: TopicalMapBlogType
): Promise<{
  success: boolean;
  document?: BlogDocument;
  prismicId?: string;
  errors: string[];
}> {
  try {
    console.log(`🚀 Starting direct blog generation and publication for: ${entry.titelPagina}`);

    // Generate blog with Prismic structure
    const result = await generateBlogFromTopicalMapWithPrismic(entry, type);
    
    // Publish to Prismic
    const publisher = new PrismicPublisher();
    const publicationResult = await publisher.publishToPrismic(result.document);

    if (publicationResult.success) {
      console.log(`✅ Blog successfully generated and published: ${publicationResult.prismicId}`);
      return {
        success: true,
        document: result.document,
        prismicId: publicationResult.prismicId,
        errors: []
      };
    } else {
      const errorMessages = publicationResult.errors.map(e => e.message || e.type);
      console.error(`❌ Publication failed:`, errorMessages);
      return {
        success: false,
        document: result.document,
        errors: errorMessages
      };
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Generation failed:`, errorMessage);
    return {
      success: false,
      errors: [errorMessage]
    };
  }
}



/**
 * Helper functions
 */

function mapEntryTypeToBlogType(entryType: string): TopicalMapBlogType {
  switch (entryType.toUpperCase()) {
    case 'P': return 'P';
    case 'C': return 'C';  
    case 'S': return 'S';
    default: 
      console.warn(`Unknown entry type: ${entryType}, defaulting to S`);
      return 'S';
  }
}

function generateUID(url: string, blogType: TopicalMapBlogType): string {
  let baseUID = url.toLowerCase()
    .replace(/\/blog\//, '') // Remove '/blog/' prefix if exists
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

  // If the UID is too short, add the blog type prefix
  if (baseUID.length < 10) {
    const typePrefix = blogType === 'P' ? 'pillar' : blogType === 'C' ? 'cluster' : 'support';
    baseUID = `${typePrefix}-${baseUID}`;
  }

  // Ensure UID is not too long (Prismic has limits)
  if (baseUID.length > 60) {
    baseUID = baseUID.substring(0, 60);
  }

  // Remove trailing hyphens
  baseUID = baseUID.replace(/-+$/, '');

  return baseUID;
}

async function generateUniqueUID(url: string, blogType: TopicalMapBlogType, entryId: string): Promise<string> {
  // Start with the basic UID
  let uid = generateUID(url, blogType);
  
  // Check if this UID already exists in our database
  const existingContent = await GeneratedContentRepository.findByPrismicUid(uid, entryId);

  // If UID exists, add a suffix to make it unique
  if (existingContent) {
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    uid = `${uid}-${timestamp}`;
    console.log(`⚠️ UID conflict detected, using unique UID: ${uid}`);
  }

  return uid;
}

function estimateWordCount(text: string): number {
  // Remove markdown syntax and count words
  const cleanText = text
    .replace(/#+\s/g, '') // Remove headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
    .replace(/`(.+?)`/g, '$1') // Remove code
    .replace(/---/g, '') // Remove dividers
    .replace(/^\s*[-*+]\s/gm, '') // Remove bullet points
    .replace(/^\s*\d+\.\s/gm, '') // Remove numbered lists
    .trim();

  return cleanText.split(/\s+/).filter(word => word.length > 0).length;
}

function calculateBlogStats(document: BlogDocument, markdownContent: string): BlogStats {
  const sliceTypes = document.data.slices.reduce((acc: Record<string, number>, slice: any) => {
    acc[slice.slice_type] = (acc[slice.slice_type] || 0) + 1;
    return acc;
  }, {});

  const wordCountEstimate = estimateWordCount(markdownContent);

  return {
    sliceCount: document.data.slices.length,
    readingTime: document.data.reading_time,
    wordCountEstimate,
    sliceBreakdown: sliceTypes
  };
}

function getModelConfigurationForBlogType(blogType: TopicalMapBlogType): { model: string; maxTokens: number } {
  switch (blogType) {
    case 'P':
      return BLOG_MODEL_CONFIG.P;
    case 'C':
      return BLOG_MODEL_CONFIG.C;
    case 'S':
      return BLOG_MODEL_CONFIG.S;
    default:
      return BLOG_MODEL_CONFIG.S;
  }
}