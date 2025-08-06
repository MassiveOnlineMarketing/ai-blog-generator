# AI Blog Generation System

A comprehensive AI-powered blog generation and content strategy system with complete topical map generation, automated content creation, and Prismic CMS integration using repository pattern for clean architecture.

## � Troubleshooting Common Issues

### ❌ "Entry not found" Error

```bash
Error: No entry found with ID: cm4z7xyza00108hjka13g4c7z
```

**Solution:** Check if the entry ID exists in your database:
```bash
# Verify entry exists
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.topicalMapEntry.findUnique({
  where: { id: 'your-entry-id' }
}).then(entry => {
  console.log(entry ? 'Entry found!' : 'Entry not found');
  prisma.\$disconnect();
});
"
```

### ❌ "Prismic Slice Type Not Found" Error

```bash
Error: Slice type 'text_block' not found in Prismic Custom Types
```

**Solution:** Make sure your Prismic repository has the required Custom Types:
1. Go to your Prismic dashboard
2. Navigate to "Custom Types"  
3. Ensure you have these types configured:
   - `blog_post` (with required slices)
   - Text slices: `text_block`, `quote_block`, `list_block`
   - Media slices: `image_block`, `code_block`

### ❌ Prismic Authentication Error

```bash
Error: Authentication failed. Please check your Prismic repository name and access token.
```

**Solution:** Verify your Prismic configuration:
```bash
# Check environment variables
echo "PRISMIC_REPO_NAME: $PRISMIC_REPO_NAME"
echo "PRISMIC_ACCESS_TOKEN: $PRISMIC_ACCESS_TOKEN"

# Or check src/config/prismic.ts
```

### ❌ OpenAI API Error

```bash
Error: OpenAI API request failed with status 401
```

**Solution:** Check your OpenAI configuration:
```bash
# Verify API key is set
echo "OPENAI_API_KEY: ${OPENAI_API_KEY:0:10}..."

# Check if you have sufficient credits
```

### ❌ Database Connection Error

```bash
Error: Can't reach database server
```

**Solution:** Check your database configuration:
```bash
# Run Prisma status check
npx prisma migrate status

# Verify DATABASE_URL
echo "DATABASE_URL: ${DATABASE_URL%%@*}@***"

# Test database connection
npx prisma db pull --preview-feature
```

## 📈 Performance Tips

### �🚀 Faster Generation

```bash
# Use parallel processing for batch operations
pnpm blog-examples batch "id1,id2,id3" --parallel --max-concurrent 3

# Skip markdown saving to reduce I/O
pnpm generate-blogs by-id "entry-id" --skip-markdown

# Use quick mode for testing
pnpm generate-blogs quick "topical-map-id" 5
```

### 💾 Memory Management

For large batch operations:
```bash
# Process in smaller chunks
pnpm blog-examples batch-chunked "topical-map-id" --chunk-size 10

# Or use the test mode first
pnpm generate-blogs test "topical-map-id" 50
```

## 🔄 Maintenance Commands

```bash
# Clean up failed generations
pnpm clean-failed-generations

# Regenerate Prisma client
npx prisma generate

# Reset database (⚠️ Development only!)
npx prisma migrate reset

# Check system health
pnpm health-check
```

### 1. Prerequisites
```bash
# Clone the repository
git clone <your-repo-url>
cd blog-generator

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env
# Edit .env with your API keys
```

### 2. Generate a Single Blog (Complete Pipeline)

The easiest way to generate a blog with the complete pipeline is using the examples CLI:

```bash
# Generate a specific blog by entry ID (includes AI → Markdown → Prismic → Database)
pnpm blog-examples by-id "your-entry-id"

# Quick generation without Prismic publication (for testing)
pnpm blog-examples quick "your-entry-id" --skip-prismic

# Generate with full pipeline using CLI
pnpm generate-blogs by-id "your-entry-id"
```

### 3. Generate Multiple Blogs for a Topical Map

```bash
# Generate all blogs for a topical map (limited to 5 per type for testing)
pnpm generate-blogs quick "your-topical-map-id" 5

# Generate all blogs with full pipeline
pnpm generate-blogs generate "your-topical-map-id"

# Generate specific types only
pnpm generate-blogs generate "your-topical-map-id" --types P,C --max-per-type 10
```

### 4. Using the API Directly in Code

```typescript
import { generateBlogFromTopicalMapEntryComplete } from './src/features/blog-generation/blog-generator';

// Complete pipeline: AI → Markdown → Prismic → Database
const result = await generateBlogFromTopicalMapEntryComplete('your-entry-id');

console.log(`✅ Generated: ${result.document?.data.heading}`);
console.log(`📊 Stats: ${result.stats?.wordCountEstimate} words, ${result.stats?.readingTime}min read`);
console.log(`🎯 Prismic ID: ${result.prismicId}`);
```

## � Available Commands

```bash
# Build the project
pnpm build

# Generate topical maps
pnpm topical-map

# Generate blogs (post-topical-map)
pnpm generate-blogs [command] [options]

# Run examples and demos
pnpm blog-examples [command] [options]

# Run tests
pnpm test
```

## �🚀 Features

### 📝 Complete Blog Generation Pipeline
- **Multi-type blog generation**: Pillar, Cluster, and Support content
- **AI-powered content creation** with customizable prompts per content type  
- **Markdown to Prismic conversion** with advanced formatting support
- **Repository pattern architecture** for clean separation of concerns
- **Complete database integration** for content management and tracking
- **Prismic CMS publication** with duplicate handling and error recovery
- **Content validation and statistics** (word count, reading time, etc.)

### 🗺️ Topical Map Generation
- **AI-powered content strategy creation** based on business context
- **Hierarchical content structure**: Pillars → Clusters → Support Topics  
- **SEO-optimized keyword targeting** with difficulty estimation
- **Complete content calendar generation** with 50+ blog topics
- **Database storage** for content planning and tracking

### 🔄 Post-Generation Automation
- **Bulk blog generation** for entire topical maps
- **Configurable pipeline steps** (generation, parsing, publishing, saving)
- **File export options** (markdown, Prismic JSON, upload logs)
- **Error handling and recovery** with detailed reporting
- **Rate limiting and delay controls** for API management

## 🏗️ Architecture

This project follows a modular, feature-based architecture with repository pattern:

```
src/
├── core/                          # Core functionality
│   └── ai/                       # AI models and generation utilities
├── features/                     # Main feature modules
│   ├── blog-generation/          # Complete blog generation system
│   │   ├── prompts/             # Content-type specific prompts
│   │   ├── blog-generator.ts    # Main generation pipeline
│   │   └── post-topical-map-generator.ts  # Bulk generation
│   └── topical-map/             # Topical map generation
├── shared/                       # Shared utilities and infrastructure  
│   ├── database/                # Database models and repositories
│   │   └── repositories/        # Repository pattern implementation
│   ├── types/                   # TypeScript type definitions
│   ├── utils/                   # Utility functions (parsers, etc.)
│   └── config/                  # Configuration management
├── integrations/                 # External service integrations
│   └── prismic/                 # Prismic CMS integration
```
├── cli/                         # Command-line interfaces
├── examples/                    # Usage examples and demos
└── tests/                       # Comprehensive test suite
```

## � How to Generate Blogs

### 🎯 Single Blog Generation (Recommended)

For generating a single blog with the complete pipeline:

```bash
# Method 1: Using examples CLI (most user-friendly)
pnpm blog-examples by-id "cm4z7xyza00108hjka13g4c7z"

# Method 2: Using post-topical-map CLI  
pnpm generate-blogs by-id "cm4z7xyza00108hjka13g4c7z"

# Method 3: Quick generation without Prismic (for testing)
pnpm blog-examples quick "cm4z7xyza00108hjka13g4c7z" --skip-prismic
```

**What happens in the complete pipeline:**
1. 🤖 **AI Generation** - Creates markdown content using type-specific prompts
2. 🔄 **Markdown Parsing** - Converts to Prismic slice format  
3. 📤 **Prismic Publication** - Publishes to Prismic CMS
4. 💾 **Database Storage** - Saves metadata and tracks status
5. 📊 **Statistics** - Calculates word count, reading time, etc.

### 🔄 Bulk Generation for Topical Maps

```bash
# Generate all blogs for a topical map (quick mode - 5 per type)
pnpm generate-blogs quick "your-topical-map-id" 5

# Generate all blogs with full pipeline
pnpm generate-blogs generate "your-topical-map-id"

# Generate specific types only
pnpm generate-blogs generate "your-topical-map-id" --types P,C --max-per-type 10

# Test mode (no Prismic publication)
pnpm generate-blogs test "your-topical-map-id" 3
```

### 💻 Programmatic Usage

```typescript
import { 
  generateBlogFromTopicalMapEntryComplete,
  generateBlogFromTopicalMapWithPrismic,
  generateAndPublishBlog 
} from './src/features/blog-generation/blog-generator';

// Complete pipeline with database tracking
const result = await generateBlogFromTopicalMapEntryComplete('entry-id');

// Generate with Prismic structure but no publication
const prismicResult = await generateBlogFromTopicalMapWithPrismic(entry, 'P');

// Direct generation and publication
const publishResult = await generateAndPublishBlog(entry, 'C');
```

### 🔍 Finding Entry IDs

```bash
# List all entries for a topical map
pnpm topical-map list-entries "your-topical-map-id"

# Or query your database directly
# Entry IDs look like: cm4z7xyza00108hjka13g4c7z
```

## �🛠️ Installation & Setup

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Configure your AI provider API keys, Prismic credentials, and database

# Initialize database
npx prisma generate
npx prisma db push

# Optional: Seed with sample data
npx prisma db seed
```

## 📖 Quick Start

### 1. Generate a Topical Map

Create a complete content strategy for your business:

```bash
# Using CLI
node cli/topical-map-cli.js --business "Your Business" --topic "Your Main Topic" --industry "Your Industry"

# Or programmatically
import { generateTopicalMapComplete } from './src/features/topical-map';

const result = await generateTopicalMapComplete({
  businessName: 'TechSolutions Pro',
  businessDescription: 'B2B SaaS for project management',
  targetAudience: 'Project managers and team leads',
  industry: 'Software/SaaS',
  mainTopic: 'Remote Project Management',
  keyObjectives: ['Increase organic traffic', 'Generate leads'],
  primaryKeywords: ['remote project management', 'team collaboration'],
  contentDepth: 'expert',
  contentFormat: 'mixed',
  expectedVolume: 'large'
});

console.log(`Generated ${result.result?.totalEntries} topics`);
```

### 2. Generate All Blogs for the Topical Map

After creating a topical map, generate all content:

```bash
# Quick generation (5 blogs per type)
node cli/post-topical-map-cli.js quick "your-topical-map-id"

# Test mode (no publishing)
node cli/post-topical-map-cli.js test "your-topical-map-id"

# Full customization
node cli/post-topical-map-cli.js generate "your-topical-map-id" \
  --max-per-type 10 \
  --types "P,C,S" \
  --save-markdown \
  --save-prismic \
  --delay 2000
```

### 3. Generate Individual Blogs

Generate specific blogs by type and ID:

```bash
# See all available functions and examples
node examples/blog-generation-examples.js --help

# Generate by ID
node examples/blog-generation-examples.js by-id "entry-id-123"

# Generate all support blogs for a topical map
node examples/blog-generation-examples.js all-by-type "map-id" "S" 5

# Batch generate multiple blogs
node examples/blog-generation-examples.js batch "id1,id2,id3" --continue
```

## 🎯 Content Types

### Pillar Content (P)
- **Purpose**: Comprehensive, authoritative guides
- **Length**: 2000-4000 words
- **Structure**: In-depth, multiple sections, comprehensive coverage
- **Example**: "Complete Guide to Digital Marketing Strategy"

### Cluster Content (C)  
- **Purpose**: Practical, actionable content supporting pillars
- **Length**: 1000-2000 words
- **Structure**: How-to guides, strategies, tutorials
- **Example**: "10 Proven Email Marketing Tactics"

### Support Content (S)
- **Purpose**: Answer specific questions, define terms
- **Length**: 500-1500 words  
- **Structure**: Definition-focused, educational, concise
- **Example**: "What is SEO? Definition and Examples"

## 🏛️ Repository Pattern Architecture

This project uses the repository pattern for clean separation of concerns and easy testing:

### Available Repositories

```typescript
import { TopicalMapRepository, GeneratedContentRepository } from './src/shared/database/repositories';

// TopicalMapRepository
const entries = await TopicalMapRepository.fetchEntriesByTopicalMapId('map-id', 'P', 10);
const entry = await TopicalMapRepository.findEntryById('entry-id');
await TopicalMapRepository.updateEntryStatus('entry-id', 'published');

// GeneratedContentRepository  
await GeneratedContentRepository.upsertGeneratedContent({
  topicalMapEntryId: 'entry-id',
  prismicUid: 'blog-uid',
  title: 'Blog Title',
  content: prismicDocument,
  // ... other fields
});

const stats = await GeneratedContentRepository.getGenerationStats('map-id');
```

### Benefits of Repository Pattern

- **Clean Architecture**: Business logic separated from database concerns
- **Testability**: Repositories can be easily mocked for unit tests
- **Maintainability**: Database queries centralized and reusable
- **Type Safety**: Full TypeScript support with proper interfaces

## 📚 Usage Examples

### Programmatic Blog Generation

```typescript
import { 
  generateBlogFromTopicalMapEntryComplete,
  generateAllBlogsForTopicalMap 
} from './src/features/blog-generation';

// Generate a single blog with complete pipeline
const result = await generateBlogFromTopicalMapEntryComplete('entry-id');
console.log(`Generated: ${result.document?.data.heading}`);
console.log(`Status: ${result.pipelineStatus.databaseUpdate}`);

// Generate all blogs for a topical map with options
const allResults = await generateAllBlogsForTopicalMap('map-id', {
  maxBlogsPerType: 5,
  blogTypes: ['P', 'C', 'S'],
  stepsToSave: {
    saveMarkdownFiles: true,
    savePrismicFiles: true,
    logPrismicUploads: true
  },
  continueOnError: true
});
```

### Custom Pipeline Steps

```typescript
// Generate with specific pipeline steps
const customResult = await generateAllBlogsForTopicalMap('map-id', {
  stepsToExecute: {
    generateMarkdown: true,
    parseToPrismic: true,
    publishToPrismic: false,  // Skip publishing
    saveToDatabase: false     // Skip database
  },
  stepsToSave: {
    saveMarkdownFiles: true,
    savePrismicFiles: true
  }
});
```

## 🔧 Configuration

### Environment Variables

```env
# AI Provider (choose one or both)
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bloggen

# Prismic CMS
PRISMIC_REPOSITORY_NAME=your_prismic_repo
PRISMIC_API_TOKEN=your_prismic_token
PRISMIC_ACCESS_TOKEN=your_access_token
```

### AI Model Configuration

The system uses different AI models optimized for each content type:

```typescript
// In src/core/ai/index.ts
export const BLOG_MODEL_CONFIG = {
  P: { model: 'claude-3-5-sonnet-20241022', maxTokens: 8000 },  // Pillar
  C: { model: 'claude-3-5-sonnet-20241022', maxTokens: 6000 },  // Cluster  
  S: { model: 'claude-3-5-sonnet-20241022', maxTokens: 4000 }   // Support
## 🧪 Testing

### Run Tests

```bash
# Run all tests
pnpm test

# Run specific test suite
pnpm test blog-generation

# Run tests in watch mode
pnpm test --watch
```

### Test Coverage

The test suite covers:
- ✅ **Pillar blog generation** with comprehensive content validation
- ✅ **Cluster blog generation** with practical focus validation  
- ✅ **Support blog generation** with definition focus validation
- ✅ **Markdown to Prismic parsing** with all formatting elements
- ✅ **Prismic publication** with duplicate handling and error recovery
- ✅ **Complete pipeline integration** with database updates
- ✅ **Content validation and statistics** calculation

## 🚀 Development

### Adding New Content Types

```typescript
// 1. Add to shared types
export type TopicalMapBlogType = 'P' | 'C' | 'S' | 'NEW_TYPE';

// 2. Add model configuration
export const BLOG_MODEL_CONFIG = {
  NEW_TYPE: { model: 'claude-3-5-sonnet-20241022', maxTokens: 5000 }
};

// 3. Create prompt template
export const generateNewTypeUserPrompt = (entry: TopicalMapEntry) => {
  // Your prompt logic
};

// 4. Add to blog generator switch statements
```

### Project File Structure

```
cli/                            # Command-line interfaces
├── topical-map-cli.ts         # Topical map generation
└── post-topical-map-cli.ts    # Blog generation after topical map

examples/                       # Usage examples
└── blog-generation-examples.ts # Comprehensive blog generation examples

tests/                         # Test suites
└── blog-generation.test.ts    # Complete test coverage

data/                          # Generated content storage
├── generated-blogs/           # Markdown files by type
├── prismic-blogs/            # Prismic JSON by type  
└── prismic-logs/             # Upload and error logs
```

## 📊 Pipeline Status

### ✅ Phase 1 Complete: Core Blog Generation System

- [x] **Modular architecture** with feature-based organization
- [x] **Complete blog generation pipeline** (AI → Parse → Publish → Database)
- [x] **Multi-type content support** (Pillar, Cluster, Support)
- [x] **Prismic CMS integration** with error handling and duplicate resolution
- [x] **Database integration** with full content tracking and status management
- [x] **Comprehensive CLI tools** for all generation scenarios
- [x] **Bulk generation system** for entire topical maps
- [x] **Configurable pipeline steps** and file saving options
- [x] **Complete test suite** covering all major functionality
- [x] **Example scripts and documentation** for all use cases

### 🎯 Ready for Production

The system is now **production-ready** for:
- Complete topical map generation
- Automated blog generation for all content types
- Bulk content creation with error recovery
- Prismic CMS publishing with duplicate handling
- Database-driven content management
- CLI-based operations for content teams

### � Future Enhancements

- [ ] **Analytics integration** (Google Analytics, Search Console)
- [ ] **Keyword research API** integration (Ahrefs, SEMrush)
- [ ] **Content performance tracking** and optimization suggestions
- [ ] **Multi-language support** for international content
- [ ] **Advanced content scheduling** and publishing workflows
- [ ] **AI content optimization** based on performance data

## 📖 Key Documentation

- **[Complete Blog Generation Examples](./examples/blog-generation-examples.ts)** - All generation functions and CLI usage
- **[Post Topical Map Generator](./src/features/blog-generation/post-topical-map-generator.ts)** - Bulk generation after topical map creation
- **[Test Suite](./tests/blog-generation.test.ts)** - Comprehensive testing examples
- **[CLI Tools](./cli/)** - Command-line interfaces for all operations

## 🎯 Quick Commands Reference

```bash
# Generate topical map
node cli/topical-map-cli.js --business "Your Business" --topic "Your Topic"

# Generate all blogs (quick mode)
node cli/post-topical-map-cli.js quick "topical-map-id" 5

# Generate all blogs (full customization)  
node cli/post-topical-map-cli.js generate "topical-map-id" \
  --max-per-type 10 --types "P,C,S" --save-markdown --save-prismic

# Generate specific blog
node examples/blog-generation-examples.js by-id "entry-id"

# Batch generate multiple blogs
node examples/blog-generation-examples.js batch "id1,id2,id3" --continue

# Test mode (no publishing)
node cli/post-topical-map-cli.js test "topical-map-id" 3
```

## 📋 Step-by-Step: Generate Your First Blog

### 1. Find Your Entry ID

First, you need to find a `topicalMapEntry` ID from your database:

```sql
-- SQL query to find entries
SELECT id, titelPagina, type, onderwerp 
FROM TopicalMapEntry 
WHERE topicalMapId = 'your-topical-map-id'
LIMIT 10;
```

Or use the CLI (if available):
```bash
# List all entries for a topical map
pnpm topical-map list-entries "your-topical-map-id"
```

Entry IDs look like: `cm4z7xyza00108hjka13g4c7z`

### 2. Generate the Blog

Using the **most comprehensive method** (recommended):

```bash
# Complete pipeline: AI → Markdown → Prismic → Database
pnpm blog-examples by-id "cm4z7xyza00108hjka13g4c7z"
```

This will:
- ✅ Generate AI content using type-specific prompts
- ✅ Parse markdown to Prismic slices  
- ✅ Publish to Prismic CMS
- ✅ Save metadata to database
- ✅ Handle errors and duplicates
- ✅ Provide detailed statistics

### 3. Verify the Results

The command will output:
```
🎯 Generating specific blog for entry ID: cm4z7xyza00108hjka13g4c7z
📋 Entry Details:
   Title: Complete Guide to Remote Project Management
   Type: P
   Topic: Remote Work
   Topical Map: TechSolutions Pro Content Strategy

✅ Blog generation successful!
   Document UID: complete-guide-remote-project-management-123456
   Word Count: ~2847 words
   Reading Time: 14 min
   Slices: 12
   Prismic ID: ZsK9xhAAACEA1234

📊 Pipeline Status:
   ✅ aiGeneration: success
   ✅ markdownParsing: success  
   ✅ prismicDocument: success
   ✅ prismicPublication: success
   ✅ databaseUpdate: success
```

### 4. Alternative Methods

```bash
# For testing without Prismic publication
pnpm blog-examples quick "entry-id" --skip-prismic

# Using the post-topical-map CLI
pnpm generate-blogs by-id "entry-id"

# Generate multiple blogs at once
pnpm blog-examples batch "id1,id2,id3" --continue
```

---

**🎉 Blog Generation System v1.0** - Ready for complete content strategy automation!
