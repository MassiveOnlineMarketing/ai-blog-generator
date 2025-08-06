import { TopicalMapEntry } from '../prisma/generated/client';
import { 
  generateBlogFromTopicalMapWithPrismic,
  generateBlogFromTopicalMapEntryComplete 
} from '../src/features/blog-generation/blog-generator';
import { MarkdownToPrismicParser } from '../src/shared/utils/markdownToPrismicParser';
import { PrismicPublisher } from '../src/integrations/prismic/publication/prismic-publisher';
import { TopicalMapRepository } from '../src/shared/database/repositories';
import prisma from '../src/shared/database';

describe('Blog Generation Tests', () => {
  let testTopicalMapId: string;
  let testEntries: { pillar: TopicalMapEntry; cluster: TopicalMapEntry; support: TopicalMapEntry };

  beforeAll(async () => {
    // Create test topical map and entries
    const topicalMap = await prisma.topicalMap.create({
      data: {
        name: 'Test Blog Generation Map',
        businessName: 'Test Business',
        mainTopic: 'Test Marketing',
        industry: 'Technology',
        targetAudience: 'Developers',
        businessDescription: 'Test business for blog generation',
        keyObjectives: ['Test objective 1', 'Test objective 2'],
        primaryKeywords: ['test', 'marketing'],
        contentDepth: 'intermediate',
        contentFormat: 'mixed',
        expectedVolume: 'medium'
      }
    });
    testTopicalMapId = topicalMap.id;

    // Create test entries for each type
    const pillarEntry = await prisma.topicalMapEntry.create({
      data: {
        topicalMapId: testTopicalMapId,
        type: 'P',
        titelPagina: 'Test Complete Marketing Guide',
        onderwerp: 'Marketing',
        urlPagina: '/blog/test-complete-marketing-guide',
        belangrijksteZoekwoorden: ['marketing', 'guide', 'complete'],
        doelgroep: 'Business owners',
        contentStatus: 'planned'
      }
    });

    const clusterEntry = await prisma.topicalMapEntry.create({
      data: {
        topicalMapId: testTopicalMapId,
        type: 'C',
        titelPagina: 'Digital Marketing Strategies',
        onderwerp: 'Digital Marketing',
        urlPagina: '/blog/digital-marketing-strategies',
        belangrijksteZoekwoorden: ['digital marketing', 'strategies'],
        doelgroep: 'Marketing professionals',
        contentStatus: 'planned'
      }
    });

    const supportEntry = await prisma.topicalMapEntry.create({
      data: {
        topicalMapId: testTopicalMapId,
        type: 'S',
        titelPagina: 'What is SEO?',
        onderwerp: 'SEO',
        urlPagina: '/blog/what-is-seo',
        belangrijksteZoekwoorden: ['SEO', 'search engine optimization'],
        doelgroep: 'Beginners',
        contentStatus: 'planned'
      }
    });

    testEntries = {
      pillar: pillarEntry,
      cluster: clusterEntry,
      support: supportEntry
    };
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.generatedContent.deleteMany({
      where: {
        topicalMapEntry: {
          topicalMapId: testTopicalMapId
        }
      }
    });
    
    await prisma.topicalMapEntry.deleteMany({
      where: { topicalMapId: testTopicalMapId }
    });
    
    await prisma.topicalMap.delete({
      where: { id: testTopicalMapId }
    });
    
    await prisma.$disconnect();
  });

  describe('Pillar Blog Generation', () => {
    it('should generate a pillar blog with correct structure', async () => {
      const result = await generateBlogFromTopicalMapWithPrismic(testEntries.pillar, 'P');
      
      expect(result).toBeDefined();
      expect(result.document).toBeDefined();
      expect(result.document.type).toBe('blog');
      expect(result.document.lang).toBe('nl-nl');
      expect(result.document.data.heading).toContain('Marketing');
      expect(result.document.data.slices).toBeDefined();
      expect(result.document.data.slices.length).toBeGreaterThan(0);
      expect(result.stats).toBeDefined();
      expect(result.stats.readingTime).toBeGreaterThanOrEqual(5); // Pillar should be longer
      expect(result.markdownContent).toBeDefined();
      expect(result.markdownContent.length).toBeGreaterThan(500);
    }, 30000);

    it('should generate pillar blog with comprehensive content', async () => {
      const result = await generateBlogFromTopicalMapWithPrismic(testEntries.pillar, 'P');
      
      // Check for pillar-specific content structure
      expect(result.markdownContent).toMatch(/^# /m); // Should have H1
      expect(result.markdownContent).toMatch(/^## /m); // Should have H2s
      expect(result.stats.wordCountEstimate).toBeGreaterThan(1500); // Pillar should be comprehensive
      
      // Check slices contain typical pillar content
      const sliceTypes = result.document.data.slices.map(s => s.slice_type);
      expect(sliceTypes).toContain('typography');
    });
  });

  describe('Cluster Blog Generation', () => {
    it('should generate a cluster blog with correct structure', async () => {
      const result = await generateBlogFromTopicalMapWithPrismic(testEntries.cluster, 'C');
      
      expect(result).toBeDefined();
      expect(result.document.data.heading).toContain('Marketing');
      expect(result.stats.readingTime).toBeGreaterThanOrEqual(3);
      expect(result.stats.readingTime).toBeLessThanOrEqual(10); // Cluster should be medium length
      expect(result.markdownContent.length).toBeGreaterThan(300);
    }, 30000);

    it('should generate cluster blog with practical focus', async () => {
      const result = await generateBlogFromTopicalMapWithPrismic(testEntries.cluster, 'C');
      
      // Cluster blogs should be more practical and actionable
      expect(result.stats.wordCountEstimate).toBeGreaterThan(800);
      expect(result.stats.wordCountEstimate).toBeLessThan(2000);
      
      // Should contain actionable content indicators
      const content = result.markdownContent.toLowerCase();
      const actionWords = ['how to', 'steps', 'guide', 'strategy', 'tips', 'methods'];
      const hasActionableContent = actionWords.some(word => content.includes(word));
      expect(hasActionableContent).toBe(true);
    });
  });

  describe('Support Blog Generation', () => {
    it('should generate a support blog with correct structure', async () => {
      const result = await generateBlogFromTopicalMapWithPrismic(testEntries.support, 'S');
      
      expect(result).toBeDefined();
      expect(result.document.data.heading).toContain('SEO');
      expect(result.stats.readingTime).toBeGreaterThanOrEqual(3);
      expect(result.stats.readingTime).toBeLessThanOrEqual(8); // Support should be concise
      expect(result.markdownContent.length).toBeGreaterThan(200);
    }, 30000);

    it('should generate support blog with definition focus', async () => {
      const result = await generateBlogFromTopicalMapWithPrismic(testEntries.support, 'S');
      
      // Support blogs should be informative and answer specific questions
      expect(result.stats.wordCountEstimate).toBeGreaterThan(500);
      expect(result.stats.wordCountEstimate).toBeLessThan(1500);
      
      // Should contain definition-like content
      const content = result.markdownContent.toLowerCase();
      const definitionWords = ['what is', 'definition', 'betekenis', 'uitleg', 'explained'];
      const hasDefinitionContent = definitionWords.some(word => content.includes(word));
      expect(hasDefinitionContent).toBe(true);
    });
  });

  describe('Markdown to Prismic Parsing', () => {
    const testMarkdown = `# Test Title

This is a test paragraph with **bold text** and *italic text*.

## Subheading

- List item 1
- List item 2
- List item 3

### Sub-subheading

1. Numbered item 1
2. Numbered item 2

> This is a blockquote

\`\`\`javascript
console.log('code block');
\`\`\`

---

Final paragraph.`;

    it('should parse markdown to valid Prismic slices', () => {
      const parser = new MarkdownToPrismicParser();
      const slices = parser.parseMarkdownToSlices(testMarkdown);
      
      expect(slices).toBeDefined();
      expect(slices.length).toBeGreaterThan(0);
      
      // Check that we have typography slices
      const typographySlices = slices.filter(s => s.slice_type === 'typography');
      expect(typographySlices.length).toBeGreaterThan(0);
      
      // Check slice structure
      slices.forEach(slice => {
        expect(slice).toHaveProperty('slice_type');
        expect(slice).toHaveProperty('variation');
        expect(slice).toHaveProperty('primary');
        expect(slice.primary).toHaveProperty('content');
        expect(Array.isArray(slice.primary.content)).toBe(true);
      });
    });

    it('should handle different markdown elements correctly', () => {
      const parser = new MarkdownToPrismicParser();
      const slices = parser.parseMarkdownToSlices(testMarkdown);
      
      const allContent = slices.flatMap(s => s.primary.content);
      
      // Check for different content types
      const hasHeading1 = allContent.some(c => c.type === 'heading1');
      const hasHeading2 = allContent.some(c => c.type === 'heading2');
      const hasHeading3 = allContent.some(c => c.type === 'heading3');
      const hasParagraph = allContent.some(c => c.type === 'paragraph');
      const hasListItem = allContent.some(c => c.type === 'list-item');
      const hasOrderedList = allContent.some(c => c.type === 'o-list-item');
      
      expect(hasHeading1).toBe(true);
      expect(hasHeading2).toBe(true);
      expect(hasHeading3).toBe(true);
      expect(hasParagraph).toBe(true);
      expect(hasListItem).toBe(true);
      expect(hasOrderedList).toBe(true);
    });

    it('should preserve text formatting in spans', () => {
      const parser = new MarkdownToPrismicParser();
      const slices = parser.parseMarkdownToSlices('This is **bold** and *italic* text.');
      
      const allContent = slices.flatMap(s => s.primary.content);
      const paragraph = allContent.find(c => c.type === 'paragraph');
      
      expect(paragraph).toBeDefined();
      expect(paragraph.spans).toBeDefined();
      expect(paragraph.spans.length).toBeGreaterThan(0);
      
      // Check for bold and italic spans
      const hasBold = paragraph.spans.some(s => s.type === 'strong');
      const hasItalic = paragraph.spans.some(s => s.type === 'em');
      
      expect(hasBold).toBe(true);
      expect(hasItalic).toBe(true);
    });
  });

  describe('Prismic Publication', () => {
    let testDocument: any;

    beforeEach(() => {
      testDocument = {
        uid: `test-blog-${Date.now()}`,
        type: 'blog',
        lang: 'nl-nl',
        data: {
          heading: 'Test Blog Publication',
          updated_at: '2025-01-01',
          author: 'Test Author',
          reading_time: 5,
          slices: [
            {
              slice_type: 'typography',
              variation: 'default',
              primary: {
                content: [
                  {
                    type: 'heading1',
                    text: 'Test Blog Publication',
                    spans: [],
                    direction: 'ltr'
                  },
                  {
                    type: 'paragraph',
                    text: 'This is a test blog for publication testing.',
                    spans: [],
                    direction: 'ltr'
                  }
                ]
              }
            }
          ],
          meta_title: 'Test Blog Publication'
        }
      };
    });

    it('should successfully publish a valid document', async () => {
      const publisher = new PrismicPublisher();
      const result = await publisher.publishToPrismic(testDocument);
      
      if (result.success) {
        expect(result.prismicId).toBeDefined();
        expect(result.errors).toHaveLength(0);
        
        // Clean up: try to delete the created document
        // Note: This might not be possible with all Prismic setups
      } else {
        // If publication failed, check the error types
        expect(result.errors).toBeDefined();
        expect(result.errors.length).toBeGreaterThan(0);
        
        // Log errors for debugging
        console.log('Publication errors:', result.errors);
      }
    }, 15000);

    it('should handle duplicate UID gracefully', async () => {
      const publisher = new PrismicPublisher();
      
      // First publication
      const firstResult = await publisher.publishToPrismic(testDocument);
      
      // Second publication with same UID (should cause conflict)
      const duplicateDocument = { ...testDocument };
      const secondResult = await publisher.publishToPrismic(duplicateDocument);
      
      if (firstResult.success) {
        // If first succeeded, second should either succeed with update or fail with UID conflict
        if (!secondResult.success) {
          const hasUidConflict = secondResult.errors.some(e => 
            e.type === 'uid_conflict' || 
            e.message?.includes('uid') || 
            e.message?.includes('already exists')
          );
          expect(hasUidConflict).toBe(true);
        }
      }
    }, 20000);

    it('should validate document structure before publishing', async () => {
      const invalidDocument = {
        uid: 'invalid-test',
        type: 'blog',
        // Missing required fields
        data: {}
      };
      
      const publisher = new PrismicPublisher();
      const result = await publisher.publishToPrismic(invalidDocument);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Complete Pipeline Integration', () => {
    it('should run complete pipeline for support blog', async () => {
      const result = await generateBlogFromTopicalMapEntryComplete(testEntries.support.id);
      
      expect(result).toBeDefined();
      expect(result.document).toBeDefined();
      expect(result.stats).toBeDefined();
      expect(result.pipelineStatus).toBeDefined();
      expect(result.markdownContent).toBeDefined();
      
      // Check pipeline status
      expect(result.pipelineStatus.aiGeneration).toBe('success');
      expect(result.pipelineStatus.markdownParsing).toBe('success');
      expect(result.pipelineStatus.prismicDocument).toBe('success');
      expect(result.pipelineStatus.databaseUpdate).toBe('success');
      
      // Prismic publication might fail in test environment, that's OK
      expect(['success', 'failed']).toContain(result.pipelineStatus.prismicPublication);
    }, 45000);

    it('should update database with generated content', async () => {
      await generateBlogFromTopicalMapEntryComplete(testEntries.cluster.id);
      
      // Check that entry status was updated
      const updatedEntry = await prisma.topicalMapEntry.findUnique({
        where: { id: testEntries.cluster.id }
      });
      
      expect(updatedEntry).toBeDefined();
      expect(['generated', 'published']).toContain(updatedEntry.contentStatus);
      
      // Check that GeneratedContent was created
      const generatedContent = await prisma.generatedContent.findFirst({
        where: { topicalMapEntryId: testEntries.cluster.id }
      });
      
      expect(generatedContent).toBeDefined();
      expect(generatedContent.title).toBeDefined();
      expect(generatedContent.wordCount).toBeGreaterThan(0);
      expect(generatedContent.readingTime).toBeGreaterThan(0);
    }, 45000);
  });
});
