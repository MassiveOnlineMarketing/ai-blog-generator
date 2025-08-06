# AI Blog Generation System

This folder contains the complete AI-powered blog generation system that creates high-quality, SEO-optimized blog content from topical map data.

## System Overview

The AI blog generation system follows a modern approach:

1. **Text Generation**: Uses AI to generate markdown content instead of structured objects
2. **Markdown Parsing**: Converts markdown to Prismic slice structures
3. **Prismic Integration**: Publishes content directly to Prismic CMS
4. **Database Tracking**: Stores generation metadata and status

## Architecture

```
AI Generation → Markdown Content → Prismic Slices → Publication → Database Storage
```

### Key Components

- **`blog-generator.ts`**: Main generation functions and pipeline
- **`prompts/`**: AI prompt templates for different content types
- **`index.ts`**: AI service configuration and utilities
- **`../utils/markdownToPrismicParser.ts`**: Markdown to Prismic slice converter
- **`../publication/prismic-publisher.ts`**: Prismic CMS integration

## Main Functions

### 1. `generateBlogFromTopicalMapEntry(entry, type)`
**Basic blog generation from TopicalMapEntry**

```typescript
import { generateBlogFromTopicalMapEntry } from './blog-generator';

const entry = await prisma.topicalMapEntry.findUnique({ where: { id: 'entry-id' } });
const result = await generateBlogFromTopicalMapEntry(entry, 'P');

console.log(result.blogData); // Raw markdown content
console.log(result.userPrompt); // Generated user prompt
console.log(result.systemPrompt); // System prompt used
```

**Returns**: Raw markdown content with prompts used

### 2. `generateBlogFromTopicalMapWithPrismic(entry, type)`
**Generate blog with Prismic document structure**

```typescript
import { generateBlogFromTopicalMapWithPrismic } from './blog-generator';

const entry = await prisma.topicalMapEntry.findUnique({ where: { id: 'entry-id' } });
const result = await generateBlogFromTopicalMapWithPrismic(entry, 'P');

console.log(result.document); // Complete Prismic document
console.log(result.stats); // Word count, reading time, etc.
console.log(result.markdownContent); // Original markdown
```

**Returns**: 
- Complete Prismic BlogDocument
- Statistics (word count, reading time, slice breakdown)
- Original markdown content
- Prompts used

### 3. `generateBlogFromTopicalMapEntryComplete(entryId)`
**Complete pipeline with database storage**

```typescript
import { generateBlogFromTopicalMapEntryComplete } from './blog-generator';

const result = await generateBlogFromTopicalMapEntryComplete('entry-id');

console.log(result.pipelineStatus); // Status of each pipeline step
console.log(result.prismicId); // Published document ID
console.log(result.errors); // Any errors encountered
```

**Returns**:
- Complete blog document
- Pipeline status tracking
- Prismic publication ID
- Error handling and recovery

### 4. `generateAndPublishBlog(entry, type)`
**Simplified generation and publication**

```typescript
import { generateAndPublishBlog } from './blog-generator';

const entry = await prisma.topicalMapEntry.findUnique({ where: { id: 'entry-id' } });
const result = await generateAndPublishBlog(entry, 'P');

if (result.success) {
  console.log(`Published to Prismic: ${result.prismicId}`);
} else {
  console.error('Publication failed:', result.errors);
}
```

**Returns**: Simple success/failure with Prismic ID

## Blog Types

The system supports three types of blog content:

- **`'P'` (Pillar)**: Comprehensive topic overviews (3000-5000 words)
- **`'C'` (Cluster)**: Detailed subtopic content (1500-3000 words)
- **`'S'` (Support)**: Specific questions/definitions (800-1500 words)

## Usage Examples

### Basic Generation
```typescript
// Generate markdown content only
const entry = await prisma.topicalMapEntry.findFirst({ where: { type: 'P' } });
const result = await generateBlogFromTopicalMapEntry(entry, 'P');
console.log(result.blogData); // Markdown content
```

### Generate with Prismic Structure
```typescript
// Generate and convert to Prismic format
const entry = await prisma.topicalMapEntry.findFirst({ where: { type: 'P' } });
const result = await generateBlogFromTopicalMapWithPrismic(entry, 'P');

console.log(`Generated ${result.stats.sliceCount} slices`);
console.log(`Reading time: ${result.stats.readingTime} minutes`);
console.log(`Word count: ~${result.stats.wordCountEstimate} words`);
```

### Complete Pipeline with Database
```typescript
// Full pipeline with error handling
try {
  const result = await generateBlogFromTopicalMapEntryComplete('entry-id');
  
  if (result.pipelineStatus.prismicPublication === 'success') {
    console.log(`✅ Published successfully: ${result.prismicId}`);
  } else {
    console.log(`⚠️ Generated but not published`);
  }
  
  console.log('Pipeline Status:', result.pipelineStatus);
} catch (error) {
  console.error('Pipeline failed:', error);
}
```

### Simple Publication
```typescript
// Quick generation and publication
const entry = await prisma.topicalMapEntry.findFirst();
const result = await generateAndPublishBlog(entry, entry.type);

if (result.success) {
  console.log(`🎉 Blog published: ${result.prismicId}`);
} else {
  console.error('Failed:', result.errors);
}
```

## Configuration

### AI Models
Models are configured in `BLOG_MODEL_CONFIG`:

```typescript
const BLOG_MODEL_CONFIG = {
  P: { model: 'gpt-4o', maxTokens: 8000 },      // Pillar content
  C: { model: 'gpt-4o', maxTokens: 6000 },      // Cluster content  
  S: { model: 'gpt-4o-mini', maxTokens: 4000 }, // Support content
};
```

### Slice Configuration
Enable/disable specific content slices in `src/config/sliceConfig.ts`:

```typescript
export const SLICE_CONFIG = {
  typography: true,
  notification: true,
  accordion: true,
  pros_cons: true,
  checklist: false,     // Disable checklist slices
  tips: true,
  // ... more slice types
};
```

### Prompts
Prompts are dynamically generated based on:
- TopicalMapEntry data (title, keywords, target audience)
- Enabled slice types
- Content type (P/C/S)

## Pipeline Status Tracking

The complete pipeline tracks status for each step:

```typescript
interface PipelineStatus {
  aiGeneration: 'success' | 'failed';
  markdownParsing: 'success' | 'failed'; 
  prismicDocument: 'success' | 'failed';
  prismicPublication: 'success' | 'failed';
  databaseUpdate: 'success' | 'failed';
}
```

## Error Handling

The system includes comprehensive error handling:

- **AI Generation Errors**: Retry logic and fallback prompts
- **Parsing Errors**: Validation and auto-correction
- **Prismic Errors**: Conflict resolution and updates
- **Database Errors**: Transaction rollback and status tracking

## Markdown Features

The system supports rich markdown that converts to Prismic slices:

### Special Slice Markers
```markdown
:::notification:warning
**Important**: This is a notification slice
:::

:::accordion
## Question 1
Answer content here

## Question 2  
More answer content
:::

:::pros-cons
**Voordelen:**
- Pro item 1
- Pro item 2

**Nadelen:**
- Con item 1
- Con item 2
:::
```

### Blog Links
Internal links are converted to hyperlinks:
```markdown
:::blog-link:/blog/target-article
Link text here
:::
```
Becomes: `[Link text here](/blog/target-article)`

### Standard Markdown
- **Headers**: `#`, `##`, `###` (converted to heading1, heading2, heading3)
- **Lists**: `- item` (converted to list-item), `1. item` (converted to o-list-item)  
- **Bold**: `**text**` (converted to strong spans)
- **Italic**: `*text*` (converted to em spans)
- **Links**: `[text](url)` (converted to hyperlink spans)

## Database Integration

Generated content is stored with full metadata:

```typescript
// TopicalMapEntry status tracking
contentStatus: 'generated' | 'published' | 'failed'

// GeneratedContent record
{
  title: string,
  content: PrismicDocument,
  wordCount: number,
  readingTime: number,
  metaTitle: string,
  metaDescription: string,
  aiModel: string,
  promptVersion: string,
  prismicUid: string,
  prismicId: string,
  publicationStatus: 'generated' | 'published'
}
```

## Monitoring & Debugging

### Enable Debug Logging
```typescript
// The system logs extensively:
console.log(`🚀 Generating ${type} blog for: ${entry.titelPagina}`);
console.log(`✅ Generated ${slices.length} slices`);
console.log(`📊 Stats: ${stats.sliceCount} slices, ${stats.readingTime}min read`);
```

### Check Pipeline Status
```typescript
const result = await generateBlogFromTopicalMapEntryComplete(entryId);
console.log('Pipeline Status:', result.pipelineStatus);
console.log('Errors:', result.errors);
```

## Testing

Test scripts are available in `src/scripts/`:

- **`testNewBlogGenerator.ts`**: Test basic generation
- **`testBlogLinkParsing.ts`**: Test link conversion
- **`create-pillar-blog.ts`**: Generate specific pillar content

```bash
# Run tests
npx tsx src/scripts/testNewBlogGenerator.ts
npx tsx src/scripts/testBlogLinkParsing.ts
```

## Performance Notes

- **Pillar blogs**: ~30-60 seconds generation time
- **Cluster blogs**: ~20-40 seconds generation time  
- **Support blogs**: ~10-20 seconds generation time
- **Prismic publication**: ~2-5 seconds additional time
- **Memory usage**: ~100-200MB per generation

## Troubleshooting

### Common Issues

1. **"Unknown slice type" warnings**: Update `markdownToPrismicParser.ts` to handle new slice types
2. **Prismic publication failures**: Check authentication and document structure
3. **Memory issues**: Reduce batch size or increase Node.js memory limit
4. **Timeout errors**: Increase AI generation timeout in configuration

### Debug Steps

1. Test basic generation first: `generateBlogFromTopicalMapEntry()`
2. Check markdown parsing: `generateBlogFromTopicalMapWithPrismic()`
3. Test Prismic connection: `generateAndPublishBlog()`
4. Use complete pipeline: `generateBlogFromTopicalMapEntryComplete()`

## Future Enhancements

- **Content Quality Scoring**: Automatic content quality assessment
- **A/B Testing**: Multiple content variations for testing
- **SEO Optimization**: Enhanced keyword density and structure analysis
- **Multi-language Support**: Generation in multiple languages
- **Content Templates**: Reusable content structures for different industries
