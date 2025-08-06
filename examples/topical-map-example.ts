/**
 * Topical Map Generation Example
 * Demonstrates how to use the topical map generation system
 */

import { generateTopicalMapComplete } from '../src/features/topical-map';

async function exampleTopicalMapGeneration() {
  console.log('🚀 Starting topical map generation example...');

  const input = {
    businessName: 'TechSolutions Pro',
    businessDescription: 'A B2B SaaS company providing project management solutions for remote teams',
    targetAudience: 'Project managers, team leads, and remote work coordinators',
    industry: 'Software/SaaS',
    mainTopic: 'Remote Project Management',
    keyObjectives: [
      'Increase organic traffic by 300%',
      'Establish thought leadership in remote work',
      'Generate qualified leads for enterprise solutions'
    ],
    primaryKeywords: [
      'remote project management',
      'distributed team collaboration',
      'project management software',
      'remote work tools'
    ],
    competitorDomains: [
      'asana.com',
      'trello.com',
      'monday.com'
    ],
    geoTarget: 'North America',
    contentDepth: 'expert' as const,
    contentFormat: 'mixed' as const,
    expectedVolume: 'large' as const
  };

  try {
    const result = await generateTopicalMapComplete(input);

    if (result.result) {
      console.log('\n📊 Topical Map Generation Results:');
      console.log(`✅ Total Topics: ${result.result.totalEntries}`);
      console.log(`🏛️ Pillar Topics: ${result.result.pillarTopics.length}`);
      console.log(`🧩 Cluster Topics: ${result.result.clusterTopics.length}`);
      console.log(`🎯 Support Topics: ${result.result.supportTopics.length}`);
      console.log(`📈 Estimated Total Traffic: ${result.result.estimatedTotalTraffic}`);
      console.log(`⚡ Average Difficulty: ${result.result.averageDifficulty}`);
      console.log(`⏱️ Processing Time: ${result.processingTime}ms`);

      if (result.result.pillarTopics.length > 0) {
        console.log('\n🏛️ Sample Pillar Topics:');
        result.result.pillarTopics.slice(0, 3).forEach((topic, index) => {
          console.log(`${index + 1}. ${topic.title}`);
          console.log(`   Primary: ${topic.primaryKeyword}`);
          console.log(`   Traffic: ${topic.estimatedTraffic}, Difficulty: ${topic.difficulty}`);
        });
      }

      if (result.errors.length > 0) {
        console.log('\n⚠️ Warnings/Errors:');
        result.errors.forEach(error => {
          console.log(`- ${error.stage}: ${error.error}`);
        });
      }

      console.log('\n🎉 Topical map generation completed successfully!');
    } else {
      console.log('❌ Topical map generation failed');
      console.log('Errors:', result.errors);
    }

  } catch (error) {
    console.error('❌ Example failed:', error);
  }
}

// Run example if this file is executed directly
if (require.main === module) {
  exampleTopicalMapGeneration()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { exampleTopicalMapGeneration };
