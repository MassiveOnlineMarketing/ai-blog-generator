#!/usr/bin/env node

/**
 * CLI Tool for Topical Map Generation
 * Quick testing of the topical map system
 */

import { generateTopicalMapComplete } from '../src/features/topical-map';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🗺️  Topical Map Generator CLI

Usage:
  node cli/topical-map-cli.js [options]

Options:
  --business "Business Name"     Business name
  --topic "Main Topic"           Main topic/niche
  --industry "Industry"          Business industry
  --audience "Target Audience"   Target audience
  --help, -h                     Show this help

Example:
  node cli/topical-map-cli.js --business "TechCorp" --topic "AI Marketing" --industry "Technology" --audience "Marketing professionals"
    `);
    return;
  }

  // Parse arguments
  const businessName = getArgValue(args, '--business') || 'Example Business';
  const mainTopic = getArgValue(args, '--topic') || 'Digital Marketing';
  const industry = getArgValue(args, '--industry') || 'Technology';
  const audience = getArgValue(args, '--audience') || 'Business professionals';

  console.log('🚀 Generating topical map...');
  console.log(`📊 Business: ${businessName}`);
  console.log(`🎯 Topic: ${mainTopic}`);
  console.log(`🏢 Industry: ${industry}`);
  console.log(`👥 Audience: ${audience}\n`);

  const input = {
    businessName,
    businessDescription: `A business in the ${industry} industry`,
    targetAudience: audience,
    industry,
    mainTopic,
    keyObjectives: [
      'Increase organic traffic',
      'Establish thought leadership',
      'Generate qualified leads'
    ],
    primaryKeywords: [mainTopic.toLowerCase()],
    contentDepth: 'intermediate' as const,
    contentFormat: 'mixed' as const,
    expectedVolume: 'medium' as const
  };

  try {
    const result = await generateTopicalMapComplete(input);

    if (result.result) {
      console.log('✅ Topical Map Generated Successfully!\n');
      console.log(`📊 Results Summary:`);
      console.log(`   Total Topics: ${result.result.totalEntries}`);
      console.log(`   Pillar Topics: ${result.result.pillarTopics.length}`);
      console.log(`   Cluster Topics: ${result.result.clusterTopics.length}`);
      console.log(`   Support Topics: ${result.result.supportTopics.length}`);
      console.log(`   Processing Time: ${result.processingTime}ms\n`);

      if (result.result.pillarTopics.length > 0) {
        console.log('🏛️  Sample Pillar Topics:');
        result.result.pillarTopics.slice(0, 3).forEach((topic, i) => {
          console.log(`   ${i + 1}. ${topic.title}`);
        });
        console.log('');
      }

      if (result.errors.length > 0) {
        console.log('⚠️  Warnings:');
        result.errors.forEach(error => {
          console.log(`   • ${error.stage}: ${error.error}`);
        });
      }
    } else {
      console.log('❌ Generation failed');
      if (result.errors.length > 0) {
        console.log('Errors:');
        result.errors.forEach(error => {
          console.log(`   • ${error.error}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ CLI Error:', error);
    process.exit(1);
  }
}

function getArgValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index !== -1 && index + 1 < args.length ? args[index + 1] : undefined;
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
