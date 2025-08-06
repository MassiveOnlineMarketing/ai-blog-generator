#!/usr/bin/env node

/**
 * Post Topical Map Generation CLI
 * Generate all blogs after topical map creation
 */

import { 
  generateAllBlogsForTopicalMap,
  generateAllBlogsQuick,
  generateAllBlogsTestMode 
} from '../src/features/blog-generation/post-topical-map-generator';
import { TopicalMapBlogType } from '../src/shared/types';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🚀 Post Topical Map Blog Generation CLI

Usage:
  npx tsx cli/post-topical-map-cli.js [command] [options]

Commands:
  generate <topicalMapId>                    Full generation with all options
  quick <topicalMapId> [maxPerType]          Quick generation (default 5 per type)
  test <topicalMapId> [maxPerType]           Test mode (no Prismic/DB, default 3 per type)
  by-id <entryId>                             Generate specific blog by entry ID

Options for 'generate':
  --max-per-type <number>                    Max blogs per type (0 = unlimited)
  --types <P,C,S>                           Blog types to generate (default: P,C,S)
  --no-markdown                             Skip markdown generation
  --no-prismic                              Skip Prismic parsing
  --no-publish                              Skip Prismic publication
  --no-database                             Skip database saving
  --save-markdown                           Save markdown files
  --save-prismic                            Save Prismic JSON files
  --no-log-uploads                          Skip upload logging
  --delay <ms>                              Delay between generations (default: 1000)
  --stop-on-error                           Stop on first error
  --group <filter>                          Filter by group/category

Examples:
  # Quick generation (5 blogs per type)
  npx tsx cli/post-topical-map-cli.js quick "map-id-123"

  # Test mode (3 blogs per type, no publishing)
  npx tsx cli/post-topical-map-cli.js test "map-id-123"

  # Full generation with custom options
  npx tsx cli/post-topical-map-cli.js generate "map-id-123" \\
    --max-per-type 10 \\
    --types "P,C" \\
    --save-markdown \\
    --delay 2000

  # Generate only support blogs for a specific group
  npx tsx cli/post-topical-map-cli.js generate "map-id-123" \\
    --types "S" \\
    --group "SEO" \\
    --max-per-type 5
    `);
    return;
  }

  const command = args[0];
  const topicalMapId = args[1];

  if (!topicalMapId) {
    console.error('❌ Error: Topical Map ID is required');
    console.log('Use --help for usage information');
    process.exit(1);
  }

  try {
    switch (command) {
      case 'quick':
        await runQuickGeneration(topicalMapId, args);
        break;
      case 'test':
        await runTestGeneration(topicalMapId, args);
        break;
      case 'generate':
        await runFullGeneration(topicalMapId, args);
        break;
      case 'by-id':
        await runById(args[1]);
        break;
      default:
        console.error('❌ Unknown command:', command);
        console.log('Use --help for usage information');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Generation failed:', error);
    process.exit(1);
  }
}

async function runQuickGeneration(topicalMapId: string, args: string[]) {
  const maxPerType = args[2] ? parseInt(args[2]) : 5;
  
  console.log(`⚡ Quick generation for topical map: ${topicalMapId}`);
  console.log(`📊 Max per type: ${maxPerType}`);
  
  const result = await generateAllBlogsQuick(topicalMapId, maxPerType);
  printResult(result);
}

async function runTestGeneration(topicalMapId: string, args: string[]) {
  const maxPerType = args[2] ? parseInt(args[2]) : 3;
  
  console.log(`🧪 Test generation for topical map: ${topicalMapId}`);
  console.log(`📊 Max per type: ${maxPerType}`);
  
  const result = await generateAllBlogsTestMode(topicalMapId, maxPerType);
  printResult(result);
}

async function runById(entryId: string) {
  if (!entryId) {
    console.error('❌ Error: Entry ID is required');
    process.exit(1);
  }
  const { generateBlogFromTopicalMapEntryComplete } = await import('../src/features/blog-generation/blog-generator');
  const { TopicalMapRepository } = await import('../src/shared/database/repositories');
  const { prismicUidExists } = await import('../src/features/blog-generation/prismic-utils');
  const readline = await import('readline');
  const fs = await import('fs/promises');
  const path = await import('path');
  const args = process.argv.slice(2);
  const saveMarkdown = args.includes('--save-markdown');
  const savePrismic = args.includes('--save-prismic');
  console.log(`🎯 Generating blog for entry ID: ${entryId}`);
  try {
    const entry = await TopicalMapRepository.findEntryById(entryId);
    console.log('entry', entry);
    // Check for published status before any AI/generation
    if (entry.contentStatus === 'published' || entry.contentStatus === 'in_progress') {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const confirm = await new Promise((resolve) => {
        rl.question(`⚠️  Entry is already published in the database. Continue and overwrite? (y/N): `, (answer) => {
          rl.close();
          resolve(/^y(es)?$/i.test(answer.trim()));
        });
      });
      if (!confirm) {
        console.log('⏹️  Generation cancelled by user.');
        process.exit(0);
      }
    }
    // Now check Prismic UID existence before any AI/generation
    // TODO: Make this check more robust
    // e.g. check if UID is already used in Prismic
    const existsInPrismic = await prismicUidExists(entry.uid || entry.prismicUid || entry.titelPagina);
    console.log(`🔍 Checking Prismic UID existence: ${existsInPrismic}`);
    if (existsInPrismic) {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const confirm = await new Promise((resolve) => {
        rl.question(`⚠️  Prismic document with this UID already exists. Continue and overwrite? (y/N): `, (answer) => {
          rl.close();
          resolve(/^y(es)?$/i.test(answer.trim()));
        });
      });
      if (!confirm) {
        console.log('⏹️  Generation cancelled by user.');
        process.exit(0);
      }
    }
    // Only now proceed to AI/generation
    const result = await generateBlogFromTopicalMapEntryComplete(entryId);
    // Save markdown if requested
    let markdownPath, prismicPath;
    if (saveMarkdown && result.markdownContent) {
      const sanitize = (str) => str.replace(/[^a-z0-9_\-]/gi, '_').toLowerCase();
      const dir = path.join(process.cwd(), 'data', 'generated-blogs', entry.type);
      const fileName = `${sanitize(entry.titelPagina)}.md`;
      markdownPath = path.join(dir, fileName);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(markdownPath, result.markdownContent, 'utf8');
      console.log(`💾 Saved markdown: ${markdownPath}`);
    }
    if (savePrismic && result.document) {
      const sanitize = (str) => str.replace(/[^a-z0-9_\-]/gi, '_').toLowerCase();
      const dir = path.join(process.cwd(), 'data', 'prismic-blogs', entry.type);
      const fileName = `${sanitize(entry.titelPagina)}.json`;
      prismicPath = path.join(dir, fileName);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(prismicPath, JSON.stringify(result.document, null, 2), 'utf8');
      console.log(`💾 Saved Prismic JSON: ${prismicPath}`);
    }
    printResult({
      summary: {
        totalProcessed: 1,
        totalSuccessful: result.pipelineStatus.databaseUpdate === 'success' ? 1 : 0,
        totalFailed: result.pipelineStatus.databaseUpdate === 'success' ? 0 : 1,
        successRate: result.pipelineStatus.databaseUpdate === 'success' ? 100 : 0,
        processingTimeMs: 0
      },
      resultsByType: [
        {
          type: result.document?.type || entry?.type || 'Unknown',
          processed: 1,
          successful: result.pipelineStatus.databaseUpdate === 'success' ? 1 : 0,
          failed: result.pipelineStatus.databaseUpdate === 'success' ? 0 : 1,
          entries: [
            {
              entryId,
              title: result.document?.data.heading || entry?.titelPagina || '',
              status: result.pipelineStatus.databaseUpdate === 'success' ? 'success' : 'failed',
              prismicId: result.prismicId,
              error: result.errors?.map(e => e.error).join('; '),
              files: {
                ...(markdownPath ? { markdownPath } : {}),
                ...(prismicPath ? { prismicPath } : {})
              }
            }
          ]
        }
      ],
      errors: result.errors || []
    });
  } catch (error) {
    console.error('❌ Failed to generate blog for entry:', error);
    process.exit(1);
  }
}

async function runFullGeneration(topicalMapId: string, args: string[]) {
  console.log(`🚀 Full generation for topical map: ${topicalMapId}`);
  
  // Parse options
  const options: any = {
    maxBlogsPerType: getArgValue(args, '--max-per-type') ? parseInt(getArgValue(args, '--max-per-type')!) : undefined,
    blogTypes: parseTypes(getArgValue(args, '--types')),
    stepsToExecute: {
      generateMarkdown: !args.includes('--no-markdown'),
      parseToPrismic: !args.includes('--no-prismic'),
      publishToPrismic: !args.includes('--no-publish'),
      saveToDatabase: !args.includes('--no-database')
    },
    stepsToSave: {
      saveMarkdownFiles: args.includes('--save-markdown'),
      savePrismicFiles: args.includes('--save-prismic'),
      logPrismicUploads: !args.includes('--no-log-uploads')
    },
    delayBetweenGenerations: getArgValue(args, '--delay') ? parseInt(getArgValue(args, '--delay')!) : 1000,
    continueOnError: !args.includes('--stop-on-error'),
    groupFilter: getArgValue(args, '--group')
  };

  console.log(`📋 Options:`, JSON.stringify(options, null, 2));
  
  const result = await generateAllBlogsForTopicalMap(topicalMapId, options);
  printResult(result);
}

function parseTypes(typesStr?: string): TopicalMapBlogType[] | undefined {
  if (!typesStr) return undefined;
  
  return typesStr.split(',').map(t => t.trim().toUpperCase()) as TopicalMapBlogType[];
}

function getArgValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index !== -1 && index + 1 < args.length ? args[index + 1] : undefined;
}

function printResult(result: any) {
  console.log(`\n🎉 GENERATION COMPLETE!`);
  console.log(`📊 Summary:`);
  console.log(`   Total Processed: ${result.summary.totalProcessed}`);
  console.log(`   Total Successful: ${result.summary.totalSuccessful}`);
  console.log(`   Total Failed: ${result.summary.totalFailed}`);
  console.log(`   Success Rate: ${result.summary.successRate}%`);
  console.log(`   Processing Time: ${Math.round(result.summary.processingTimeMs / 1000)}s`);

  console.log(`\n📈 Results by Type:`);
  result.resultsByType.forEach((type: any) => {
    const successRate = type.processed > 0 ? Math.round((type.successful / type.processed) * 100) : 0;
    console.log(`   ${type.type}: ${type.successful}/${type.processed} (${successRate}%)`);
    
    // Show some successful entries
    const successful = type.entries.filter((e: any) => e.status === 'success').slice(0, 3);
    successful.forEach((entry: any) => {
      console.log(`     ✅ ${entry.title} ${entry.prismicId ? `(${entry.prismicId})` : ''}`);
    });
    
    // Show some failed entries
    const failed = type.entries.filter((e: any) => e.status === 'failed').slice(0, 2);
    failed.forEach((entry: any) => {
      console.log(`     ❌ ${entry.title}: ${entry.error}`);
    });
    
    if (type.entries.length > 5) {
      console.log(`     ... and ${type.entries.length - 5} more`);
    }
  });

  if (result.errors.length > 0) {
    console.log(`\n⚠️  Errors:`);
    result.errors.forEach((error: any) => {
      console.log(`   • ${error.stage}: ${error.error}`);
    });
  }

  // Show file locations if any were saved
  const hasFiles = result.resultsByType.some((type: any) => 
    type.entries.some((entry: any) => entry.files?.markdownPath || entry.files?.prismicPath)
  );
  
  if (hasFiles) {
    console.log(`\n📁 Generated Files:`);
    console.log(`   Markdown: data/generated-blogs/`);
    console.log(`   Prismic JSON: data/prismic-blogs/`);
    console.log(`   Upload logs: data/prismic-logs/uploads.log`);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
