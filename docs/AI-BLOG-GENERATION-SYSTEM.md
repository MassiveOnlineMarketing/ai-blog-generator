# AI Blog Generation System

## Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Architectuur](#architectuur)
3. [Blog Types & Topical Map](#blog-types--topical-map)
4. [De Complete Pipeline](#de-complete-pipeline)
5. [AI Content Generation](#ai-content-generation)
6. [Content Validation & Fixing](#content-validation--fixing)
7. [Prismic Publication](#prismic-publication)
8. [Database Integration](#database-integration)
9. [Interlinking System](#interlinking-system)
10. [Error Handling & Recovery](#error-handling--recovery)
11. [API & Interfaces](#api--interfaces)
12. [Gebruik](#gebruik)

---

## Overzicht

Het AI Blog Generation System is een volledig geautomatiseerde pipeline die blog content genereert, valideert, publiceert en beheert voor een Prismic CMS. Het systeem is specifiek ontworpen voor SEO-geoptimaliseerde content die gebaseerd is op een topical map structuur uit de database.

### Hoofdkenmerken

- **Database-driven**: Content wordt gegenereerd op basis van TopicalMapEntry records uit de database
- **AI-powered**: Gebruikt GPT-4 voor intelligente content generatie
- **Automatische validatie**: Zod-schema validatie met AI-powered error fixing
- **Prismic integratie**: Directe publicatie naar Prismic CMS met conflict handling
- **Interlinking**: Automatische interne linking tussen gerelateerde content
- **Error recovery**: Robuuste error handling met AI-powered fixes
- **Status tracking**: Volledige pipeline status tracking in de database

---

## Architectuur

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Database      │    │   AI Generation  │    │   Validation    │
│                 │───▶│                  │───▶│                 │
│ TopicalMapEntry │    │ GPT-4 + Prompts  │    │ Zod + AI Fixer  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
┌─────────────────┐    ┌──────────────────┐             │
│  Database       │◀───│     Prismic      │◀────────────┘
│                 │    │                  │
│ GeneratedContent│    │ Publication + AI │
└─────────────────┘    │ Error Fixing     │
                       └──────────────────┘
```

### Kerncomponenten

1. **Blog Generator** (`src/ai/blog-generator.ts`)
   - Hoofdorchestrator voor de pipeline
   - Beheert alle stappen van generatie tot publicatie

2. **Content Validator** (`src/validation/content-validator.ts`)
   - Zod schema validatie
   - AI-powered error fixing

3. **Prismic Publisher** (`src/publication/prismic-publisher.ts`)
   - Prismic API integratie
   - UID conflict handling
   - AI-powered Prismic error fixing

4. **Schema Definitions** (`src/schemas/`)
   - Zod schemas voor content structuur
   - Prismic slice definitions
   - Type safety door de hele pipeline

---

## Blog Types & Topical Map

Het systeem werkt met drie verschillende blog types gebaseerd op de topical map methodologie:

### 1. Pillar Pages (Type: P)
**Functie**: Hoofdonderwerpen die een breed overzicht geven
**Kenmerken**:
- 15-25 minuten leestijd
- 60-70% Typography slices (uitgebreide content)
- 15-20% Accordion slices (FAQ secties)
- 5-10% Notification slices (belangrijke tips)
- 5-10% ProsConsSlice (vergelijkingen)
- 2-5% Divider slices (structuur)

**Voorbeeld**: "Complete SEO Gids voor 2025"

### 2. Cluster Content (Type: C)
**Functie**: Specifieke onderwerpen binnen een pillar
**Kenmerken**:
- 8-12 minuten leestijd
- 50-60% Typography slices (hoofdcontent)
- 20-25% Accordion slices (specifieke Q&A)
- 10-15% Notification slices (tips, waarschuwingen)
- 5-10% ProsConsSlice (waar relevant)
- 0-5% Divider slices

**Voorbeeld**: "Keyword Research: Complete Guide"

### 3. Support Content (Type: S)
**Functie**: Specifieke vragen, definities, how-to's
**Kenmerken**:
- 3-6 minuten leestijd
- 60-70% Typography slices (directe content)
- 15-25% Notification slices (tips, waarschuwingen)
- 10-20% Accordion slices (aanvullende Q&A)
- 0% Divider slices (te kort)

**Voorbeeld**: "Wat is SEO? (Definitie + Voorbeelden)"

---

## De Complete Pipeline

De volledige pipeline doorloopt 5 hoofdstappen:

### Stap 1: Database Data Loading
```typescript
const entry = await prisma.topicalMapEntry.findUnique({
  where: { id: entryId },
  include: {
    topicalMap: true,
    generatedContent: true,
    contentDuplicationAnalysis: true
  }
});
```

**Acties**:
- Laadt TopicalMapEntry uit database
- Includeert gerelateerde data (topical map, bestaande content)
- Update status naar 'generating'
- Extraheert linking informatie

### Stap 2: AI Content Generation
```typescript
const generationResult = await generateBlogFromTopicalMapWithLinks(
  blogType, 
  options, 
  internalLinks
);
```

**Acties**:
- Bepaalt blog type (P/C/S → pillar/cluster/support)
- Bouwt type-specifieke prompts
- Voegt interlinking context toe
- Genereert content met GPT-4
- Post-processing voor Prismic compatibiliteit

### Stap 3: Content Validation & AI Fixing
```typescript
const validationResult = await validator.validateAndFix(
  generationResult.document.data,
  originalPrompt
);
```

**Acties**:
- Zod schema validatie van gegenereerde content
- Bij errors: AI-powered fixing met specifieke fix prompts
- Retry mechanisme
- Content rebuild met gefixte data

### Stap 4: Prismic Publication & AI Fixing
```typescript
const publicationResult = await publisher.publishToPrismic(finalDocument);
```

**Acties**:
- Check voor bestaande documenten (UID conflict handling)
- Create of update operatie
- Bij Prismic errors: AI-powered fixing
- Document ID caching voor toekomstige updates

### Stap 5: Database Update
```typescript
await prisma.topicalMapEntry.update({
  where: { id: entryId },
  data: { contentStatus: finalStatus }
});

await prisma.generatedContent.create({
  data: { /* content record */ }
});
```

**Acties**:
- Update TopicalMapEntry status
- Creëer GeneratedContent record
- Sla metadata op (word count, reading time, etc.)
- Prismic referenties (UID, document ID)

---

## AI Content Generation

### Prompt System

Het systeem gebruikt een modulaire prompt architectuur:

#### Base Prompts (`src/ai/prompts/base-prompts.ts`)
```typescript
export function getBasePromptTemplate(options: BasePromptOptions): string {
  return `
ONDERWERP: "${topic}"
DOELGROEP: ${targetAudience}
TOON: ${tone}
FOCUS KEYWORDS: ${keywords.join(', ')}

ALGEMENE RICHTLIJNEN:
- Schrijf in het Nederlands
- Gebruik een ${tone} toon
- Zorg voor goede SEO optimalisatie
...
`;
}
```

#### Type-specifieke Prompts
- **Pillar Prompts** (`pillar-prompts.ts`): Voor uitgebreide overzichtsartikelen
- **Cluster Prompts** (`cluster-prompts.ts`): Voor specifieke onderwerpen
- **Support Prompts** (`support-prompts.ts`): Voor korte, gerichte content

### Slice Guidelines

Elke prompt bevat specifieke instructies voor de toegestane slice types:

```typescript
export const SLICE_GUIDELINES = {
  typography: `
TYPOGRAPHY SLICES:
- Gebruik headings (h2/h3) voor structuur
- Paragraphs voor hoofdcontent
- Lists waar relevant voor opsommingen`,

  notification: `
NOTIFICATION SLICES:
- Gebruik voor belangrijke tips, waarschuwingen
- Kies juiste variation (default, base100, purple, orange)`,

  accordion: `
ACCORDION SLICES:
- Gebruik voor FAQ, uitgebreide uitleg
- 2-6 items per accordion
- Duidelijke vraag-antwoord structuur`,
  // etc...
};
```

### Content Generatie Flow

1. **Type Detection**: Database entry type → blog type mapping
2. **Options Building**: Extract relevante data uit database entry
3. **Prompt Building**: Combineer base prompt + type prompt + linking context
4. **AI Generation**: GPT-4 generatie met Zod schema enforcement
5. **Post-processing**: Voeg Prismic-specifieke velden toe

---

## Content Validation & Fixing

### Zod Schema Validatie

Het systeem gebruikt strikte Zod schemas voor content validatie:

```typescript
export const CompleteBlogGenerationSchema = z.object({
  heading: z.string().min(10).max(100),
  author: z.enum(['Guido van der Reijden', 'Julian Koren']),
  reading_time: z.number().int().min(1).max(30),
  meta_title: z.string().max(60).optional(),
  meta_description: z.string().max(160).optional(),
  slices: z.array(z.discriminatedUnion("slice_type", [
    TypographySlice,
    NotificationSlice,
    AccordionSlice,
    ProsConsSlice,
    DividerSlice,
    BlogLinkSlice
  ]))
});
```

### AI-Powered Error Fixing

Wanneer validatie faalt, wordt er automatisch een AI fix geprobeerd:

```typescript
async fixValidationErrors(
  originalContent: any,
  validationErrors: ValidationError[],
  originalPrompt: string
): Promise<{ success: boolean; fixedContent?: CompleteBlogGeneration; error?: string }>
```

**Fix Prompt Structuur**:
1. Originele prompt context
2. Specifieke validatie errors
3. Problematische content
4. Fix instructies
5. Schema requirements

### Validation States

- **success**: Content voldoet direct aan schema
- **fixed**: Content gefixed door AI en nu valide
- **failed**: AI kon errors niet fixen

---

## Prismic Publication

### Publication Flow

#### 1. UID Conflict Detection
```typescript
const existingDoc = await this.checkDocumentExists(blogDocument.uid);
if (existingDoc) {
  return await this.updateExistingDocument(existingDoc.id, blogDocument);
}
```

#### 2. Create vs Update Logic
- **Create**: Voor nieuwe documenten
- **Update**: Voor bestaande documenten (UID conflict)
- **Retry**: Bij UID conflicts die niet gevonden kunnen worden

#### 3. Document ID Caching
```typescript
if (event.type === 'documents:updating' && event.data.document?.document?.id) {
  documentId = event.data.document.document.id;
  this.lastDocumentId = documentId; // Cache for future updates
}
```

### AI-Powered Prismic Error Fixing

Bij Prismic-specifieke errors (validation, UID conflicts, etc.):

```typescript
async fixPrismicErrors(
  originalDocument: any,
  prismicErrors: PrismicError[],
  originalPrompt: string
): Promise<{ success: boolean; fixedDocument?: any; error?: string }>
```

**Prismic Error Types**:
- `uid_conflict`: Document met UID bestaat al
- `slice_error`: Problemen met slice structuur
- `field_error`: Ontbrekende of incorrecte velden
- `api_error`: Algemene API fouten

### Migration Events Handling

```typescript
await this.writeClient.migrate(migration, {
  reporter: (event: any) => {
    if (event.type === 'documents:created') migrationSuccess = true;
    if (event.type === 'documents:updating') {
      documentId = event.data.document.document.id;
      this.lastDocumentId = documentId;
    }
  }
});
```

---

## Database Integration

### Database Schema

#### TopicalMapEntry
```sql
- id: string (UUID)
- titelPagina: string
- type: string (P/C/S)
- belangrijksteZoekwoorden: string[]
- doelgroep: string
- contentStatus: enum (planned/generating/generated/published/failed)
- linktNaarPillar: string[]
- linktNaarCluster: string[]
- linktNaarSupport: string[]
- linktNaarTools: string[]
- linktNaarBestaande: string[]
```

#### GeneratedContent
```sql
- id: string (UUID)
- topicalMapEntryId: string
- title: string
- content: JSON
- wordCount: number
- readingTime: number
- prismicUid: string
- prismicId: string
- validationStatus: enum (valid/fixed/failed)
- publicationStatus: enum (generated/published/failed)
```

### Status Tracking

Het systeem tracked de volledige pipeline status:

```typescript
interface ExtendedBlogGenerationResult {
  pipelineStatus: {
    aiGeneration: 'success' | 'failed';
    validation: 'success' | 'failed' | 'fixed';
    prismicPublication: 'success' | 'failed' | 'fixed' | 'skipped';
    databaseUpdate: 'success' | 'failed';
  };
  prismicId?: string;
  errors: Array<{
    stage: string;
    error: string;
    fixed: boolean;
  }>;
}
```

---

## Interlinking System

### Link Types

Het systeem ondersteunt verschillende types interne links:

1. **Pillar Links**: Links naar hoofdonderwerpen
2. **Cluster Links**: Links naar gerelateerde cluster content
3. **Support Links**: Links naar specifieke support artikelen
4. **Tool Links**: Links naar tools en case studies
5. **Existing Links**: Links naar bestaande website pagina's

### Linking Context Building

```typescript
function buildLinkingContext(internalLinks: {
  pillarLinks: string[];
  clusterLinks: string[];
  supportLinks: string[];
  toolLinks: string[];
  existingLinks: string[];
}): string {
  return `
## INTERLINKING INSTRUCTIES:
Gebruik deze URLs voor interne linking in je content:

### Pillar pagina's:
${internalLinks.pillarLinks.map(link => `- ${link}`).join('\n')}

### Cluster content:
${internalLinks.clusterLinks.map(link => `- ${link}`).join('\n')}
...
`;
}
```

### Automatische Link Plaatsing

- Links worden automatisch in de content geplaatst door de AI
- Contextual relevantie wordt geëvalueerd
- Anchor tekst wordt geoptimaliseerd voor SEO
- Links worden verspreid over verschillende slices

---

## Error Handling & Recovery

### Error Categorieën

#### 1. AI Generation Errors
- Schema validation failures tijdens generatie
- API rate limiting
- Model availability issues

**Recovery**: Raw content parsing + validation pipeline

#### 2. Validation Errors
- Zod schema mismatches
- Slice type errors
- Field requirement violations

**Recovery**: AI-powered content fixing

#### 3. Prismic Errors
- UID conflicts
- API validation errors
- Network/authentication issues

**Recovery**: AI content fixing + retry logic

#### 4. Database Errors
- Connection issues
- Constraint violations
- Transaction failures

**Recovery**: Status rollback + error logging

### Error Storage

```typescript
errors: Array<{
  stage: string;        // Welke pipeline stage
  error: string;        // Error beschrijving
  fixed: boolean;       // Of de error is gefixed
}>
```

### Recovery Strategies

1. **Graceful Degradation**: Partial success waar mogelijk
2. **AI Fixing**: Automatische content correctie
3. **Retry Logic**: Voor tijdelijke failures
4. **Status Rollback**: Database consistency bij failures

---

## API & Interfaces

### Hoofd Entry Point

```typescript
generateBlogFromTopicalMapEntry(entryId: string): Promise<ExtendedBlogGenerationResult>
```

### Type Definitions

#### Blog Options
```typescript
interface TopicalMapBlogOptions {
  topic: string;
  targetAudience?: string;
  tone?: 'professional' | 'casual' | 'educational' | 'persuasive';
  keywords?: string[];
  author?: 'Guido van der Reijden' | 'Julian Koren';
}

interface PillarBlogOptions extends TopicalMapBlogOptions {
  clusterTopics?: string[];
  industryFocus?: string;
}

interface ClusterBlogOptions extends TopicalMapBlogOptions {
  pillarTopic: string;
  relatedClusters?: string[];
  practicalFocus?: boolean;
}

interface SupportBlogOptions extends TopicalMapBlogOptions {
  clusterTopic: string;
  pillarTopic?: string;
  contentType?: 'faq' | 'definition' | 'howto' | 'comparison';
}
```

#### Result Interfaces
```typescript
interface BlogGenerationResult {
  document: BlogDocument;
  stats: {
    sliceCount: number;
    readingTime: number;
    wordCountEstimate: number;
    sliceBreakdown: Record<string, number>;
  };
}

interface ExtendedBlogGenerationResult extends BlogGenerationResult {
  pipelineStatus: PipelineStatus;
  prismicId?: string;
  errors: PipelineError[];
}
```

### Helper Functions

```typescript
// Type-specifieke generators
generatePillarBlog(options: PillarBlogOptions): Promise<BlogGenerationResult>
generateClusterBlog(options: ClusterBlogOptions): Promise<BlogGenerationResult>
generateSupportBlog(options: SupportBlogOptions): Promise<BlogGenerationResult>

// Validation & export
validateBlogDocument(document: unknown): BlogDocument
blogDocumentToJSON(result: BlogGenerationResult): string

// Utility
generateUID(topic: string, blogType: TopicalMapBlogType): string
calculateBlogStats(document: BlogDocument): BlogStats
```

---

## Gebruik

### Database-driven Generatie

```typescript
import { generateBlogFromTopicalMapEntry } from './src/ai/blog-generator';

// Genereer blog vanuit database entry
const result = await generateBlogFromTopicalMapEntry('entry-uuid');

console.log(`Status: ${result.pipelineStatus.aiGeneration}`);
console.log(`Prismic ID: ${result.prismicId}`);
console.log(`Slices: ${result.stats.sliceCount}`);
```

### Standalone Generatie

```typescript
import { generatePillarBlog } from './src/ai/blog-generator';

const result = await generatePillarBlog({
  topic: 'Complete SEO Guide',
  targetAudience: 'Marketing professionals',
  keywords: ['SEO', 'search optimization', 'rankings'],
  author: 'Guido van der Reijden'
});
```

### Test Scripts

Het systeem bevat verschillende test scripts:

```bash
# Database-driven test
npm run test:db-generation test <entry-id>

# List beschikbare entries
npm run test:db-generation list

# Reset entry statuses
npx tsx scripts/reset-entries.ts
```

### Pipeline Monitoring

De pipeline biedt uitgebreide logging voor monitoring:

```
🔍 Starting complete blog generation pipeline for entry: cd36d3a0-...
📊 Step 1: Loading data from database...
📋 Found entry: "Wat is SEO? (Definitie + Voorbeelden)" (S)
🤖 Step 2: AI content generation...
✅ AI generation successful
🔍 Step 3: Content validation and fixing...
✅ Content validation successful
📤 Step 4: Prismic publication...
✅ Prismic publication successful: aI4nHREAAC0AjAw-
💾 Step 5: Database update...
✅ Database update successful
🎉 Complete pipeline finished successfully
```

---

## Configuratie

### Environment Variables

```env
# Prismic configuratie
PRISMIC_REPOSITORY_NAME=your-repo
PRISMIC_WRITE_TOKEN=your-write-token

# AI configuratie  
OPENAI_API_KEY=your-openai-key

# Database
DATABASE_URL=your-database-connection
```

### Prismic Setup

Het systeem verwacht specifieke Prismic configuratie:

```typescript
export const PRISMIC_CONFIG = {
  repositoryName: process.env.PRISMIC_REPOSITORY_NAME!,
  writeToken: process.env.PRISMIC_WRITE_TOKEN!
};
```

---

Deze documentatie beschrijft het complete AI Blog Generation System zoals het nu geïmplementeerd is. Het systeem biedt een robuuste, volledig geautomatiseerde oplossing voor het genereren van SEO-geoptimaliseerde blog content vanuit een database-driven topical map structuur.

---

## TypeScript Types Organisatie

### Type Extractie Best Practice

Voor maintainability en herbruikbaarheid zijn alle TypeScript types geëxtraheerd naar dedicated files in `src/types/`:

#### `src/types/blog-generation.ts`
Bevat alle interfaces en types gerelateerd aan blog generatie:

```typescript
// Core types
export type TopicalMapBlogType = 'pillar' | 'cluster' | 'support';

// Option interfaces per blog type
export interface TopicalMapBlogOptions { ... }
export interface PillarBlogOptions extends TopicalMapBlogOptions { ... }
export interface ClusterBlogOptions extends TopicalMapBlogOptions { ... }
export interface SupportBlogOptions extends TopicalMapBlogOptions { ... }

// Result interfaces
export interface BlogGenerationResult { ... }
export interface ExtendedBlogGenerationResult extends BlogGenerationResult { ... }

// Pipeline tracking
export interface PipelineStatus { ... }
export interface PipelineError { ... }

// Configuration objects
export const READING_TIME_RANGES: Record<TopicalMapBlogType, ReadingTimeRange> = {
  pillar: { min: 15, max: 25 },
  cluster: { min: 8, max: 12 },
  support: { min: 3, max: 6 }
};
```

#### `src/types/generation-pipeline.ts`
Bevat validation en error types:

```typescript
export interface ValidationError { ... }
export interface PrismicError { ... }
```

#### `src/types/index.ts`
Re-exporteert alle types voor eenvoudige imports:

```typescript
export * from './blog-generation';
export * from './generation-pipeline';
```

### Waarom Types Extraheren?

1. **Herbruikbaarheid**: Types kunnen door meerdere files gebruikt worden
2. **Maintainability**: Centraal beheer van type definities
3. **Code Organisation**: Scheiding van business logic en type definities  
4. **Type Safety**: Betere IntelliSense en compile-time checking
5. **Documentation**: Types serveren als levende documentatie

### Import Patterns

```typescript
// Type-only imports (geen runtime overhead)
import type {
  TopicalMapBlogType,
  BlogGenerationResult,
  ExtendedBlogGenerationResult
} from '../types/blog-generation';

// Value imports (voor runtime configuratie)
import { READING_TIME_RANGES } from '../types/blog-generation';

// Gecombineerd via index
import type { PipelineStatus } from '../types';
```

### File Organisatie

```
src/
├── types/
│   ├── index.ts                    # Re-exports
│   ├── blog-generation.ts          # Blog generation types
│   └── generation-pipeline.ts      # Pipeline validation types
├── ai/
│   └── blog-generator.ts          # Business logic (geen type definitions)
├── validation/
│   └── content-validator.ts       # Business logic
└── publication/
    └── prismic-publisher.ts       # Business logic
```

Deze organisatie zorgt voor een schone scheiding tussen type definities en implementatie logic.

---
