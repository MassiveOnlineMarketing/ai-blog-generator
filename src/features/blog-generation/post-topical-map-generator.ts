/**
 * Post Topical Map Generation
 * Main function to generate all blogs after topical map creation
 */

import { generateBlogFromTopicalMapEntryComplete } from './blog-generator';
import { TopicalMapBlogType } from '../../shared/types';
import { TopicalMapRepository } from '../../shared/database/repositories';

export interface PostGenerationOptions {
  /**
   * Optional: Only process these entry IDs (for CLI filtering)
   */
  entryIds?: string[];
  /**
   * Maximum number of blogs to generate per type
   * Set to 0 for unlimited (default: 0)
   */
  maxBlogsPerType?: number;
  
  /**
   * Which blog types to generate
   * Default: all types ['P', 'C', 'S']
   */
  blogTypes?: TopicalMapBlogType[];
  
  /**
   * Steps to execute in the pipeline
   */
  stepsToExecute?: {
    generateMarkdown?: boolean;
    parseToPrismic?: boolean;
    publishToPrismic?: boolean;
    saveToDatabase?: boolean;
  };
  
  /**
   * Steps to save/log
   */
  stepsToSave?: {
    saveMarkdownFiles?: boolean;
    savePrismicFiles?: boolean;
    logPrismicUploads?: boolean;
  };
  
  /**
   * Delay between generations to avoid rate limits (ms)
   */
  delayBetweenGenerations?: number;
  
  /**
   * Continue on error or stop at first failure
   */
  continueOnError?: boolean;
  
  /**
   * Filter entries by group/category
   */
  groupFilter?: string;
}

export interface PostGenerationResult {
  topicalMapId: string;
  summary: {
    totalProcessed: number;
    totalSuccessful: number;
    totalFailed: number;
    successRate: number;
    processingTimeMs: number;
  };
  resultsByType: Array<{
    type: TopicalMapBlogType;
    processed: number;
    successful: number;
    failed: number;
    entries: Array<{
      entryId: string;
      title: string;
      status: 'success' | 'failed';
      prismicId?: string;
      error?: string;
      files?: {
        markdownPath?: string;
        prismicPath?: string;
      };
    }>;
  }>;
  errors: Array<{
    stage: string;
    entryId?: string;
    error: string;
  }>;
}

/**
 * Main function: Generate all blogs for a topical map
 */
export async function generateAllBlogsForTopicalMap(
  topicalMapId: string,
  options: PostGenerationOptions = {}
): Promise<PostGenerationResult> {
  const startTime = Date.now();
  
  console.log(`🚀 Starting complete blog generation for topical map: ${topicalMapId}`);
  console.log(`📋 Options:`, options);

  // Set defaults
  const opts = {
    maxBlogsPerType: options.maxBlogsPerType || 0,
    blogTypes: options.blogTypes || (['P', 'C', 'S'] as TopicalMapBlogType[]),
    stepsToExecute: {
      generateMarkdown: true,
      parseToPrismic: true,
      publishToPrismic: true,
      saveToDatabase: true,
      ...options.stepsToExecute
    },
    stepsToSave: {
      saveMarkdownFiles: false,
      savePrismicFiles: false,
      logPrismicUploads: true,
      ...options.stepsToSave
    },
    delayBetweenGenerations: options.delayBetweenGenerations || 1000,
    continueOnError: options.continueOnError !== false,
    groupFilter: options.groupFilter
  };

  // Verify topical map exists
  const topicalMap = await TopicalMapRepository.findTopicalMapById(topicalMapId);

  if (!topicalMap) {
    throw new Error(`Topical map with ID ${topicalMapId} not found`);
  }

  console.log(`📊 Found topical map: "${topicalMap.name}"`);

  const result: PostGenerationResult = {
    topicalMapId,
    summary: {
      totalProcessed: 0,
      totalSuccessful: 0,
      totalFailed: 0,
      successRate: 0,
      processingTimeMs: 0
    },
    resultsByType: [],
    errors: []
  };

  // Process each blog type
  for (const blogType of opts.blogTypes) {
    console.log(`\n=== Processing ${blogType} blogs ===`);
    try {
      const typeResult = await generateBlogsByType(
        topicalMapId,
        blogType,
        opts.maxBlogsPerType,
        opts.groupFilter,
        opts,
        options.entryIds // pass entryIds for filtering
      );
      result.resultsByType.push(typeResult);
      result.summary.totalProcessed += typeResult.processed;
      result.summary.totalSuccessful += typeResult.successful;
      result.summary.totalFailed += typeResult.failed;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Failed to process ${blogType} blogs:`, errorMsg);
      result.errors.push({
        stage: `${blogType}_generation`,
        error: errorMsg
      });
      if (!opts.continueOnError) {
        break;
      }
    }
  }

  // Calculate final statistics
  const endTime = Date.now();
  result.summary.processingTimeMs = endTime - startTime;
  result.summary.successRate = result.summary.totalProcessed > 0 
    ? Math.round((result.summary.totalSuccessful / result.summary.totalProcessed) * 100)
    : 0;

  // Update topical map status
  await TopicalMapRepository.updateTopicalMapStatus(
    topicalMapId,
    result.summary.successRate > 80 ? 'completed' : 'partial'
  );

  // Print summary
  console.log(`\n🎉 COMPLETE GENERATION SUMMARY:`);
  console.log(`   📊 Total Processed: ${result.summary.totalProcessed}`);
  console.log(`   ✅ Total Successful: ${result.summary.totalSuccessful}`);
  console.log(`   ❌ Total Failed: ${result.summary.totalFailed}`);
  console.log(`   📈 Success Rate: ${result.summary.successRate}%`);
  console.log(`   ⏱️  Processing Time: ${Math.round(result.summary.processingTimeMs / 1000)}s`);

  result.resultsByType.forEach(type => {
    const typeSuccessRate = type.processed > 0 
      ? Math.round((type.successful / type.processed) * 100)
      : 0;
    console.log(`   ${type.type}: ${type.successful}/${type.processed} (${typeSuccessRate}%)`);
  });

  if (result.errors.length > 0) {
    console.log(`\n⚠️  Errors encountered: ${result.errors.length}`);
    result.errors.forEach(error => {
      console.log(`   • ${error.stage}: ${error.error}`);
    });
  }

  return result;
}

/**
 * Generate blogs for a specific type
 */
async function generateBlogsByType(
  topicalMapId: string,
  blogType: TopicalMapBlogType,
  maxBlogs: number,
  groupFilter?: string,
  options: any = {},
  entryIds?: string[]
) {
  console.log(`📝 Fetching ${blogType} entries...`);
  
  // Fetch entries for this type
  let entries = await TopicalMapRepository.fetchEntriesByTopicalMapId(
    topicalMapId,
    blogType,
    maxBlogs || 1000
  );
  // If entryIds provided, filter to only those
  if (Array.isArray(entryIds) && entryIds.length > 0) {
    entries = entries.filter((entry: any) => entryIds.includes(entry.id));
  }
  // Skip entries with contentStatus 'published' (for safety, but CLI already filters for planned)
  let filteredEntries = entries.filter((entry: any) => entry.contentStatus !== 'published');
  if (groupFilter) {
    filteredEntries = filteredEntries.filter((entry: any) => 
      entry.kernonderwerp?.toLowerCase().includes(groupFilter.toLowerCase()) ||
      entry.titelPagina?.toLowerCase().includes(groupFilter.toLowerCase())
    );
    console.log(`📂 Filtered to ${filteredEntries.length} entries matching: ${groupFilter}`);
  }

  const typeResult = {
    type: blogType,
    processed: 0,
    successful: 0,
    failed: 0,
    entries: [] as any[]
  };

  console.log(`🔄 Processing ${filteredEntries.length} ${blogType} entries...`);

  for (const [index, entry] of filteredEntries.entries()) {
    const entryNum = index + 1;
    console.log(`\n[${entryNum}/${filteredEntries.length}] Processing: ${entry.titelPagina}`);
    
    try {
      // Generate using complete pipeline or custom steps
      const generationResult = await generateBlogFromTopicalMapEntryComplete(entry.id);
      
      // Save additional files if requested
      const files: any = {};
      if (options.stepsToSave.saveMarkdownFiles && generationResult.markdownContent) {
        files.markdownPath = await saveMarkdownFile(entry, generationResult.markdownContent, blogType);
      }
      
      if (options.stepsToSave.savePrismicFiles && generationResult.document) {
        files.prismicPath = await savePrismicFile(entry, generationResult.document, blogType);
      }
      
      if (options.stepsToSave.logPrismicUploads && generationResult.prismicId) {
        await logPrismicUpload(entry, generationResult.prismicId, generationResult.document?.uid);
      }

      typeResult.entries.push({
        entryId: entry.id,
        title: entry.titelPagina,
        status: 'success',
        prismicId: generationResult.prismicId,
        files
      });

      typeResult.successful++;
      console.log(`✅ [${entryNum}/${filteredEntries.length}] Success: ${entry.titelPagina}`);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ [${entryNum}/${filteredEntries.length}] Failed: ${entry.titelPagina}`, errorMsg);
      
      typeResult.entries.push({
        entryId: entry.id,
        title: entry.titelPagina,
        status: 'failed',
        error: errorMsg
      });

      typeResult.failed++;
    }

    typeResult.processed++;

    // Add delay between generations
    if (options.delayBetweenGenerations > 0 && entryNum < filteredEntries.length) {
      console.log(`⏳ Waiting ${options.delayBetweenGenerations}ms...`);
      await new Promise(resolve => setTimeout(resolve, options.delayBetweenGenerations));
    }
  }

  const successRate = typeResult.processed > 0 
    ? Math.round((typeResult.successful / typeResult.processed) * 100)
    : 0;

  console.log(`\n📊 ${blogType} Summary: ${typeResult.successful}/${typeResult.processed} (${successRate}%)`);
  return typeResult;
}

/**
 * Helper functions for saving files and logging
 */
async function saveMarkdownFile(entry: any, content: string, type: TopicalMapBlogType): Promise<string> {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  const sanitize = (str: string) => str.replace(/[^a-z0-9_\-]/gi, '_').toLowerCase();
  const dir = path.join(process.cwd(), 'data', 'generated-blogs', type);
  const fileName = `${sanitize(entry.titelPagina)}.md`;
  const filePath = path.join(dir, fileName);
  
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, content, 'utf8');
  
  return filePath;
}

async function savePrismicFile(entry: any, document: any, type: TopicalMapBlogType): Promise<string> {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  const sanitize = (str: string) => str.replace(/[^a-z0-9_\-]/gi, '_').toLowerCase();
  const dir = path.join(process.cwd(), 'data', 'prismic-blogs', type);
  const fileName = `${sanitize(entry.titelPagina)}.json`;
  const filePath = path.join(dir, fileName);
  
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(document, null, 2), 'utf8');
  
  return filePath;
}

async function logPrismicUpload(entry: any, prismicId: string, uid?: string): Promise<void> {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  const logDir = path.join(process.cwd(), 'data', 'prismic-logs');
  const logFile = path.join(logDir, 'uploads.log');
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    entryId: entry.id,
    title: entry.titelPagina,
    prismicId,
    uid,
    type: entry.type
  };
  
  await fs.mkdir(logDir, { recursive: true });
  await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n', 'utf8');
}

/**
 * Quick function for generating blogs with minimal configuration
 */
export async function generateAllBlogsQuick(
  topicalMapId: string,
  maxPerType = 5
): Promise<PostGenerationResult> {
  // Accepts optional entryIds as 3rd argument
  let entryIds: string[] | undefined = undefined;
  if (arguments.length > 2 && Array.isArray(arguments[2])) {
    entryIds = arguments[2];
  }
  return generateAllBlogsForTopicalMap(topicalMapId, {
    maxBlogsPerType: maxPerType,
    stepsToSave: {
      saveMarkdownFiles: true,
      savePrismicFiles: true,
      logPrismicUploads: true
    },
    delayBetweenGenerations: 2000,
    ...(entryIds ? { entryIds } : {})
  });
}

/**
 * Function for testing without Prismic publication
 */
export async function generateAllBlogsTestMode(
  topicalMapId: string,
  maxPerType = 3
): Promise<PostGenerationResult> {
  return generateAllBlogsForTopicalMap(topicalMapId, {
    maxBlogsPerType: maxPerType,
    stepsToExecute: {
      generateMarkdown: true,
      parseToPrismic: true,
      publishToPrismic: false,
      saveToDatabase: false
    },
    stepsToSave: {
      saveMarkdownFiles: true,
      savePrismicFiles: true,
      logPrismicUploads: false
    },
    delayBetweenGenerations: 500
  });
}
