#!/usr/bin/env node

/**
 * Blog Generation Examples
 * Comprehensive examples for all blog generation functions
 */

import { TopicalMapRepository } from '../src/shared/database/repositories';
import { 
  generateBlogFromTopicalMapWithPrismic,
  generateBlogFromTopicalMapEntryComplete,
  generateAndPublishBlog
} from '../src/features/blog-generation/blog-generator';
import { TopicalMapBlogType, ExtendedBlogGenerationResult } from '../src/shared/types';

type BlogGenerationResult = {
  entry: any;
  result?: ExtendedBlogGenerationResult;
  error?: any;
  status: 'success' | 'failed';
};

type TypeResult = {
  type: TopicalMapBlogType;
  results: BlogGenerationResult[];
  successful: number;
  failed: number;
};

type BatchResult = {
  entryId: string;
  result?: ExtendedBlogGenerationResult;
  error?: any;
  status: 'success' | 'failed';
};

/**
 * Example 1: Generate all blogs by type with optional limits
 */
export async function generateAllBlogsByType(
  topicalMapId: string,
  blogType: TopicalMapBlogType,
  maxBlogs?: number,
  groupFilter?: string
): Promise<BlogGenerationResult[]> {
  console.log(`🚀 Generating all ${blogType} blogs for topical map: ${topicalMapId}`);
  
  const entries = await TopicalMapRepository.fetchEntriesByTopicalMapId(
    topicalMapId, 
    blogType, 
    maxBlogs || 1000
  );


  let filteredEntries = entries;
  if (groupFilter) {
    // Filter by group/category if specified
    filteredEntries = filteredEntries.filter(entry => 
      entry.onderwerp?.toLowerCase().includes(groupFilter.toLowerCase()) ||
      entry.titelPagina?.toLowerCase().includes(groupFilter.toLowerCase())
    );
    console.log(`📂 Filtered to ${filteredEntries.length} entries matching group: ${groupFilter}`);
  }

  const results: BlogGenerationResult[] = [];
  let successful = 0;
  let failed = 0;

  for (const entry of filteredEntries) {
    try {
      console.log(`\n📝 Processing: ${entry.titelPagina}`);
      
      const result = await generateBlogFromTopicalMapEntryComplete(entry.id);
      results.push({ entry, result, status: 'success' });
      successful++;
      
      console.log(`✅ Success: ${entry.titelPagina}`);
    } catch (error) {
      console.error(`❌ Failed: ${entry.titelPagina}`, error);
      results.push({ entry, error, status: 'failed' });
      failed++;
    }
  }

  console.log(`\n📊 Summary for ${blogType} blogs:`);
  console.log(`   ✅ Successful: ${successful}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${Math.round((successful / filteredEntries.length) * 100)}%`);

  return results;
}

/**
 * Example 2: Generate all blogs for a specific topical map
 */
export async function generateAllBlogsForTopic(
  topicalMapId: string,
  maxBlogsPerType?: number
) {
  console.log(`🗺️ Generating ALL blogs for topical map: ${topicalMapId}`);
  
  const types: TopicalMapBlogType[] = ['P', 'C', 'S'];
  const allResults: TypeResult[] = [];

  for (const type of types) {
    console.log(`\n=== Processing ${type} blogs ===`);
    
    const typeResults = await generateAllBlogsByType(
      topicalMapId, 
      type, 
      maxBlogsPerType
    );
    
    allResults.push({
      type,
      results: typeResults,
      successful: typeResults.filter(r => r.status === 'success').length,
      failed: typeResults.filter(r => r.status === 'failed').length
    });
  }

  // Overall summary
  const totalSuccessful = allResults.reduce((sum, type) => sum + type.successful, 0);
  const totalFailed = allResults.reduce((sum, type) => sum + type.failed, 0);
  const totalProcessed = totalSuccessful + totalFailed;

  console.log(`\n🎉 COMPLETE TOPICAL MAP SUMMARY:`);
  console.log(`   📊 Total Processed: ${totalProcessed}`);
  console.log(`   ✅ Total Successful: ${totalSuccessful}`);
  console.log(`   ❌ Total Failed: ${totalFailed}`);
  console.log(`   📈 Overall Success Rate: ${Math.round((totalSuccessful / totalProcessed) * 100)}%`);

  allResults.forEach(type => {
    console.log(`   ${type.type}: ${type.successful}/${type.successful + type.failed} (${Math.round((type.successful / (type.successful + type.failed)) * 100)}%)`);
  });

  return allResults;
}

/**
 * Example 3: Generate specific blog by entry ID
 */
export async function generateSpecificBlogById(entryId: string) {
  console.log(`🎯 Generating specific blog for entry ID: ${entryId}`);
  
  try {
    // First, get the entry to show details
    const entry = await TopicalMapRepository.findEntryById(entryId);

    if (!entry) {
      throw new Error(`Entry with ID ${entryId} not found`);
    }

    console.log(`📋 Entry Details:`);
    console.log(`   Title: ${entry.titelPagina}`);
    console.log(`   Type: ${entry.type}`);
    console.log(`   Topic: ${entry.onderwerp}`);
    console.log(`   Topical Map: ${entry.topicalMap?.name || 'Unknown'}`);

    const result = await generateBlogFromTopicalMapEntryComplete(entryId);
    
    console.log(`\n✅ Blog generation successful!`);
    console.log(`   Document UID: ${result.document?.uid}`);
    console.log(`   Word Count: ~${result.stats?.wordCountEstimate}`);
    console.log(`   Reading Time: ${result.stats?.readingTime} min`);
    console.log(`   Slices: ${result.stats?.sliceCount}`);
    
    if (result.prismicId) {
      console.log(`   Prismic ID: ${result.prismicId}`);
    }

    if (result.errors.length > 0) {
      console.log(`\n⚠️ Warnings/Errors:`);
      result.errors.forEach(error => {
        console.log(`   ${error.stage}: ${error.error} (Fixed: ${error.fixed})`);
      });
    }

    console.log(`\n📊 Pipeline Status:`);
    Object.entries(result.pipelineStatus).forEach(([stage, status]) => {
      const emoji = status === 'success' ? '✅' : status === 'failed' ? '❌' : '🔧';
      console.log(`   ${emoji} ${stage}: ${status}`);
    });

    return result;
    
  } catch (error) {
    console.error(`❌ Failed to generate blog for ID ${entryId}:`, error);
    throw error;
  }
}

/**
 * Example 4: Quick generation without full pipeline (for testing)
 */
export async function generateBlogQuick(entryId: string, skipPrismic = false) {
  console.log(`⚡ Quick blog generation for entry ID: ${entryId}`);
  
  const entry = await TopicalMapRepository.findEntryById(entryId);

  if (!entry) {
    throw new Error(`Entry with ID ${entryId} not found`);
  }

  const blogType = entry.type as TopicalMapBlogType;
  
  if (skipPrismic) {
    // Just generate markdown and Prismic structure, no publication
    const result = await generateBlogFromTopicalMapWithPrismic(entry, blogType);
    console.log(`✅ Quick generation complete (no Prismic publication)`);
    return result;
  } else {
    // Generate and publish
    const result = await generateAndPublishBlog(entry, blogType);
    console.log(`✅ Quick generation and publication complete`);
    return result;
  }
}

/**
 * Example 5: Batch generation with error recovery
 */
export async function generateBlogsBatch(
  entryIds: string[],
  continueOnError = true,
  delayMs = 1000
) {
  console.log(`📦 Batch generating ${entryIds.length} blogs`);
  
  const results: BatchResult[] = [];
  let processed = 0;

  for (const entryId of entryIds) {
    processed++;
    console.log(`\n[${processed}/${entryIds.length}] Processing: ${entryId}`);
    
    try {
      const result = await generateSpecificBlogById(entryId);
      results.push({ entryId, result, status: 'success' });
      console.log(`✅ [${processed}/${entryIds.length}] Success`);
    } catch (error) {
      console.error(`❌ [${processed}/${entryIds.length}] Failed:`, error);
      results.push({ entryId, error, status: 'failed' });
      
      if (!continueOnError) {
        console.log(`🛑 Stopping batch due to error`);
        break;
      }
    }

    // Add delay between requests to avoid rate limiting
    if (delayMs > 0 && processed < entryIds.length) {
      console.log(`⏳ Waiting ${delayMs}ms before next generation...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'failed').length;

  console.log(`\n📊 Batch Summary:`);
  console.log(`   ✅ Successful: ${successful}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${Math.round((successful / results.length) * 100)}%`);

  return results;
}

/**
 * CLI Usage Examples
 */
async function runExamples() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🚀 Blog Generation Examples CLI

Usage:
  node examples/blog-generation-examples.js [command] [options]

Commands:
  all-by-type <topicalMapId> <type> [max] [group]  Generate all blogs by type
  all-for-topic <topicalMapId> [maxPerType]        Generate all blogs for topic
  by-id <entryId>                                  Generate specific blog by ID
  quick <entryId> [--skip-prismic]                 Quick generation
  batch <entryId1,entryId2,...> [--continue]       Batch generation

Examples:
  # Generate all support blogs (max 5) for a topical map
  node examples/blog-generation-examples.js all-by-type "map123" "S" 5

  # Generate all blogs for a topical map (max 3 per type)
  node examples/blog-generation-examples.js all-for-topic "map123" 3

  # Generate specific blog by ID
  node examples/blog-generation-examples.js by-id "entry123"

  # Quick generation without Prismic
  node examples/blog-generation-examples.js quick "entry123" --skip-prismic

  # Batch generate multiple blogs
  node examples/blog-generation-examples.js batch "entry1,entry2,entry3" --continue
    `);
    return;
  }

  const command = args[0];

  try {
    switch (command) {
      case 'all-by-type':
        await generateAllBlogsByType(
          args[1], 
          args[2] as TopicalMapBlogType, 
          args[3] ? parseInt(args[3]) : undefined,
          args[4]
        );
        break;

      case 'all-for-topic':
        await generateAllBlogsForTopic(
          args[1], 
          args[2] ? parseInt(args[2]) : undefined
        );
        break;

      case 'by-id':
        await generateSpecificBlogById(args[1]);
        break;

      case 'quick':
        await generateBlogQuick(args[1], args.includes('--skip-prismic'));
        break;

      case 'batch':
        const entryIds = args[1]?.split(',') || [];
        await generateBlogsBatch(entryIds, args.includes('--continue'));
        break;

      default:
        console.log('❌ Unknown command. Use --help for usage information.');
        process.exit(1);
    }

  } catch (error) {
    console.error('❌ Example failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runExamples().catch(console.error);
}
