# Topical Map Generation Feature

This feature generates comprehensive topical maps for SEO and content strategy using AI.

## Overview

The topical map generator creates a hierarchical content structure with:
- **Pillar Topics**: Broad, high-volume topics (3-7 topics)
- **Cluster Topics**: Supporting topics that link to pillars (15-30 topics)
- **Support Topics**: Long-tail, specific topics (20-50 topics)

## Usage

### Basic Usage

```typescript
import { generateTopicalMap } from '../features/topical-map';

const input = {
  businessName: 'Your Business',
  businessDescription: 'Description of your business',
  targetAudience: 'Your target audience',
  industry: 'Your industry',
  mainTopic: 'Your main topic/niche',
  keyObjectives: ['Objective 1', 'Objective 2'],
  primaryKeywords: ['keyword1', 'keyword2'],
  contentDepth: 'expert',
  contentFormat: 'mixed',
  expectedVolume: 'large'
};

const result = await generateTopicalMap(input);
console.log(`Generated ${result.totalEntries} topics`);
```

### Complete Pipeline

```typescript
import { generateTopicalMapComplete } from '../features/topical-map';

const result = await generateTopicalMapComplete(input);
// Includes validation, optimization, and database storage
```

## Input Parameters

### Required
- `businessName`: Name of the business
- `businessDescription`: Brief description of the business
- `targetAudience`: Primary target audience
- `industry`: Business industry/sector
- `mainTopic`: Main topic or niche to focus on
- `keyObjectives`: Array of business objectives
- `primaryKeywords`: Array of primary keywords to target
- `contentDepth`: 'basic' | 'intermediate' | 'expert'
- `contentFormat`: 'blog' | 'guides' | 'mixed'
- `expectedVolume`: 'small' | 'medium' | 'large'

### Optional
- `competitorDomains`: Array of competitor domains
- `geoTarget`: Geographic targeting (default: 'Global')

## Output Structure

```typescript
interface TopicalMapGenerationResult {
  id: string;
  businessName: string;
  mainTopic: string;
  generatedAt: Date;
  pillarTopics: GeneratedTopicalMapEntry[];
  clusterTopics: GeneratedTopicalMapEntry[];
  supportTopics: GeneratedTopicalMapEntry[];
  totalEntries: number;
  estimatedTotalTraffic: number;
  averageDifficulty: number;
  topicRelationships: TopicRelationship[];
}
```

### Topic Entry Structure

Each topic includes:
- `title`: Topic title
- `primaryKeyword`: Main target keyword
- `secondaryKeywords`: Supporting keywords
- `searchIntent`: User search intent
- `estimatedTraffic`: Monthly search volume estimate
- `difficulty`: Keyword difficulty (1-100)
- `contentType`: Recommended content format
- `targetAudience`: Specific audience segment
- `description`: Brief topic description

## Pipeline Stages

The complete pipeline includes:

1. **Keyword Research**: Analyze target keywords
2. **Competitor Analysis**: Study competitor content
3. **Topic Generation**: AI-powered topic creation
4. **Structure Optimization**: Balance topic hierarchy
5. **Validation**: Quality checks and validation
6. **Database Save**: Store results for future use

## Examples

See `examples/topical-map-example.ts` for a complete usage example.

## Features

- ✅ AI-powered topic generation
- ✅ Hierarchical content structure
- ✅ SEO-optimized keyword targeting
- ✅ Multiple content formats
- ✅ Traffic and difficulty estimation
- ✅ Topic relationship mapping
- ✅ Pipeline status tracking
- ✅ Error handling and validation
- ⏳ Database integration (coming soon)
- ⏳ Keyword research API (coming soon)
- ⏳ Competitor analysis (coming soon)

## Architecture

```
src/features/topical-map/
├── generators/
│   └── topical-map-generator.ts    # Main generation logic
├── prompts/
│   └── topical-map-prompt.ts       # AI prompts
├── types/
│   └── index.ts                    # TypeScript definitions
└── index.ts                        # Feature exports
```

## Integration

The topical map feature integrates with:
- Core AI system for content generation
- Shared database for data persistence
- Blog generation feature for content creation

## Next Steps

1. Implement database schema for topical maps
2. Add keyword research API integration
3. Create competitor analysis tools
4. Build content generation from topical maps
5. Add analytics and tracking
