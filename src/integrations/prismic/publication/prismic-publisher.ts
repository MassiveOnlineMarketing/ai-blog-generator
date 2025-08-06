import { PRISMIC_CONFIG, PrismicError } from 'src/shared/index.js';

/**
 * Prismic publication service met error handling en AI fixing
 */
export class PrismicPublisher {
  private writeClient: any;
  private readClient: any;
  private lastDocumentId?: string; // Store last known document ID

  constructor() {
    // Use dynamic import for ESM-only @prismicio/client
    (async () => {
      const prismic = await import('@prismicio/client');
      this.writeClient = prismic.createWriteClient(PRISMIC_CONFIG.repositoryName, {
        writeToken: PRISMIC_CONFIG.writeToken
      });
      this.readClient = prismic.createClient(PRISMIC_CONFIG.repositoryName);
    })();
  }
  
  /**
   * Publiceer blog document naar Prismic
   */
  async publishToPrismic(blogDocument: any): Promise<{
    success: boolean;
    prismicId?: string;
    errors: PrismicError[];
  }> {
    try {
      console.log(`📤 Publishing blog to Prismic: ${blogDocument.data.heading}`);

      // Check if document with this UID already exists
      const existingDoc = await this.checkDocumentExists(blogDocument.uid);
      
      if (existingDoc) {
        console.log(`📝 Document with UID "${blogDocument.uid}" already exists, updating instead...`);
        return await this.updateExistingDocument(existingDoc.id, blogDocument);
      } else {
        console.log(`📄 Creating new document with UID "${blogDocument.uid}"...`);
        const createResult = await this.createNewDocument(blogDocument);
        
        // If create fails with UID conflict, try to find and update the existing document
        if (!createResult.success && createResult.errors.some(e => e.type === 'uid_conflict')) {
          console.log(`⚠️ UID conflict detected, attempting to find and update existing document...`);
          
          // Try to use the last known document ID from this session
          if (this.lastDocumentId) {
            console.log(`📝 Using cached document ID for update: ${this.lastDocumentId}`);
            return await this.updateExistingDocument(this.lastDocumentId, blogDocument);
          }
          
          // Retry checking for existing document (might have been created by another process)
          const retryExistingDoc = await this.checkDocumentExists(blogDocument.uid);
          if (retryExistingDoc) {
            console.log(`📝 Found existing document, updating: ${retryExistingDoc.id}`);
            return await this.updateExistingDocument(retryExistingDoc.id, blogDocument);
          } else {
            console.error(`❌ UID conflict reported but cannot find existing document with UID: ${blogDocument.uid}`);
            // Return a reasonable error indicating we should try update instead
            return {
              success: false,
              errors: [{
                type: 'uid_conflict',
                message: `Document with UID '${blogDocument.uid}' exists but couldn't be found for update. This might be a temporary indexing issue.`
              }]
            };
          }
        }
        
        return createResult;
      }

    } catch (error) {
      console.error('❌ Prismic publication error:', error);
      return {
        success: false,
        errors: [{
          type: 'api_error',
          message: error instanceof Error ? error.message : 'Unknown Prismic error'
        }]
      };
    }
  }

  /**
   * AI-powered Prismic error fixer
   */
  async fixPrismicErrors(
    originalDocument: any,
    prismicErrors: PrismicError[],
    originalPrompt: string
  ): Promise<{ success: boolean; fixedDocument?: any; error?: string }> {
    try {
      console.log(`🔧 Attempting to fix ${prismicErrors.length} Prismic errors with AI...`);

      const fixPrompt = this.buildPrismicFixPrompt(originalDocument, prismicErrors, originalPrompt);
      
      // Import hier om circular dependencies te voorkomen
      const { generateWithAI } = await import('../../../core/ai/index.js');
      
      const result = await generateWithAI(fixPrompt);
      const fixedContent = result.text;

      // Rebuild document structure
      const fixedDocument = this.rebuildDocumentStructure(fixedContent, originalDocument);

      console.log('✅ AI successfully fixed Prismic errors');
      return { success: true, fixedDocument };

    } catch (error) {
      console.error('❌ AI failed to fix Prismic errors:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during Prismic AI fix' 
      };
    }
  }

  /**
   * Echte Prismic API implementatie
   */
  private async callPrismicAPI(blogDocument: any, operation: 'create' | 'update' = 'create'): Promise<{
    success: boolean;
    id?: string;
    errors: PrismicError[];
  }> {
    try {
      const prismic = await import('@prismicio/client');
      console.log(`🚀 Creating Prismic migration for: ${blogDocument.data.heading}`);
      
      // Create Prismic migration
      const migration = prismic.createMigration();
      
      // Add document to migration
      const doc = migration.createDocument({
        type: 'blog',
        uid: blogDocument.uid,
        lang: blogDocument.lang || 'nl-nl',
        data: blogDocument.data
      }, blogDocument.data.heading);

      console.log(`📄 Document prepared for migration:`, {
        uid: blogDocument.uid,
        title: blogDocument.data.heading,
        slices: blogDocument.data.slices?.length || 0
      });

      // Execute migration
      let migrationSuccess = false;
      let migrationError: any = null;
      let documentId: string = `prismic-doc-${Date.now()}`; // Fallback ID

      await this.writeClient.migrate(migration, {
        reporter: (event: any) => {
          console.log(`📋 Migration event:`, event.type, event.data);
          
          if (event.type === 'documents:created' && event.data.created > 0) {
            migrationSuccess = true;
          }
          
          if (event.type === 'documents:updating' && event.data.document?.document?.id) {
            documentId = event.data.document.document.id;
            this.lastDocumentId = documentId; // Cache for potential future updates
            migrationSuccess = true;
          }
          
          if (event.type === 'documents:updated' && event.data.updated > 0) {
            migrationSuccess = true;
          }
          
          if (event.type === 'end' && event.data.migrated.documents > 0) {
            migrationSuccess = true;
          }
        }
      });

      if (migrationSuccess && documentId) {
        console.log(`✅ Successfully published to Prismic with ID: ${documentId}`);
        return { 
          success: true, 
          id: documentId, 
          errors: [] 
        };
      } else if (migrationSuccess) {
        // Success maar geen specifiek document ID
        console.log(`✅ Successfully published to Prismic`);
        return { 
          success: true, 
          id: documentId, // Gebruik fallback ID
          errors: [] 
        };
      } else {
        const errorMsg = migrationError ? migrationError.message : 'Migration completed but no document was created';
        return {
          success: false,
          errors: [{
            type: 'migration_error',
            message: errorMsg
          }]
        };
      }

    } catch (error) {
      console.error('❌ Prismic API error:', error);
      return this.parsePrismicError(error);
    }
  }

  /**
   * Parse Prismic errors into structured format
   */
  private parsePrismicError(error: any): {
    success: boolean;
    errors: PrismicError[];
  } {
    const prismicErrors: PrismicError[] = [];
    
    if (error instanceof Error) {
      const errorMessage = error.message;
      const errorResponse = (error as any).response;
      
      // Check for UID conflict in message or response
      if (errorMessage.includes('document with this UID already exists') || 
          errorMessage.includes('UID already exists') ||
          (typeof errorResponse === 'string' && errorResponse.includes('document with this UID already exists'))) {
        prismicErrors.push({
          type: 'uid_conflict',
          message: errorResponse || errorMessage
        });
      }
      // Check for detailed validation errors in response
      else if (Array.isArray(errorResponse)) {
        errorResponse.forEach((validationError: any) => {
          if (validationError.property && validationError.property.includes('slices')) {
            prismicErrors.push({
              type: 'slice_error',
              message: `${validationError.property}: ${validationError.error}`,
              sliceIndex: this.extractSliceIndexFromProperty(validationError.property)
            });
          } else {
            prismicErrors.push({
              type: 'field_error',
              message: `${validationError.property}: ${validationError.error}`,
              field: validationError.property
            });
          }
        });
      }
      // Check for common Prismic validation errors in message
      else if (errorMessage.includes('Missing required field')) {
        prismicErrors.push({
          type: 'field_error',
          message: errorMessage,
          field: this.extractFieldFromError(errorMessage)
        });
      } else if (errorMessage.includes('slice')) {
        prismicErrors.push({
          type: 'slice_error',
          message: errorMessage,
          sliceIndex: this.extractSliceIndexFromError(errorMessage)
        });
      } else {
        prismicErrors.push({
          type: 'api_error',
          message: errorMessage
        });
      }
    } else {
      prismicErrors.push({
        type: 'api_error',
        message: 'Unknown Prismic error occurred'
      });
    }

    return { success: false, errors: prismicErrors };
  }

  /**
   * Bouw AI prompt voor Prismic error fixing
   */
  private buildPrismicFixPrompt(
    originalDocument: any,
    prismicErrors: PrismicError[],
    originalPrompt: string
  ): string {
    const errorDescriptions = prismicErrors.map(error => {
      let desc = `- ${error.type}: ${error.message}`;
      if (error.sliceIndex !== undefined) desc += ` (slice ${error.sliceIndex})`;
      if (error.field) desc += ` (field: ${error.field})`;
      return desc;
    }).join('\n');

    return `${originalPrompt}

## CRITICAL: PRISMIC PUBLICATION ERROR FIXING

The blog content failed to publish to Prismic CMS due to the following issues:

${errorDescriptions}

PROBLEMATIC DOCUMENT:
${JSON.stringify(originalDocument.data, null, 2)}

INSTRUCTIONS FOR FIXING:
1. Generate content that will successfully publish to Prismic CMS
2. Fix ONLY the Prismic-specific errors listed above
3. Ensure all slices have correct slice_type and primary structure
4. Ensure all required fields are present and properly formatted
5. Maintain the same content quality and reading experience
6. Do NOT change the core content, only fix structural/formatting issues

Generate corrected content that will pass Prismic validation.`;
  }

  /**
   * Rebuild document structure na AI fix
   */
  private rebuildDocumentStructure(fixedContent: any, originalDocument: any): any {
    const processedSlices = fixedContent.slices?.map((slice: any) => ({
      ...slice,
      version: 'initial',
      items: slice.items || [],
      slice_label: null
    })) || [];

    return {
      ...originalDocument,
      data: {
        ...originalDocument.data,
        heading: fixedContent.heading,
        slices: processedSlices,
        reading_time: fixedContent.reading_time,
        meta_title: fixedContent.meta_title || fixedContent.heading,
        meta_description: fixedContent.meta_description,
      }
    };
  }

  /**
   * Check if document with UID already exists
   */
  private async checkDocumentExists(uid: string): Promise<{ id: string } | null> {
    try {
      const doc = await this.readClient.getByUID('blog', uid);
      return { id: doc.id };
    } catch (error) {
      // Document niet gevonden is normaal
      return null;
    }
  }

  /**
   * Create new document
   */
  private async createNewDocument(blogDocument: any): Promise<{
    success: boolean;
    prismicId?: string;
    errors: PrismicError[];
  }> {
    const result = await this.callPrismicAPI(blogDocument, 'create');
    return {
      success: result.success,
      prismicId: result.id,
      errors: result.errors
    };
  }

  /**
   * Update existing document
   */
  private async updateExistingDocument(documentId: string, blogDocument: any): Promise<{
    success: boolean;
    prismicId?: string;
    errors: PrismicError[];
  }> {
    try {
      console.log(`🔄 Updating existing Prismic document: ${documentId}`);
      
      console.log(`📄 Document prepared for update:`, {
        id: documentId,
        title: blogDocument.data.heading,
        slices: blogDocument.data.slices?.length || 0
      });

      // Use direct updateDocument API instead of migration for existing documents
      const result = await this.writeClient.updateDocument(documentId, {
        uid: blogDocument.uid,
        data: blogDocument.data
      });

      console.log(`✅ Successfully updated Prismic document: ${documentId}`);
      return { 
        success: true, 
        prismicId: documentId, 
        errors: [] 
      };

    } catch (error) {
      console.error('❌ Prismic update error:', error);
      return this.parsePrismicError(error);
    }
  }

  /**
   * Helper methods voor error parsing
   */
  private extractFieldFromError(errorMessage: string): string | undefined {
    const fieldMatch = errorMessage.match(/field[:\s]+['"]?(\w+)['"]?/i);
    return fieldMatch ? fieldMatch[1] : undefined;
  }

  private extractSliceIndexFromError(errorMessage: string): number | undefined {
    const sliceMatch = errorMessage.match(/slice[:\s]+(\d+)/i);
    return sliceMatch && sliceMatch[1] ? parseInt(sliceMatch[1], 10) : undefined;
  }

  private extractSliceIndexFromProperty(property: string): number | undefined {
    const sliceMatch = property.match(/slices\.(\d+)/);
    return sliceMatch && sliceMatch[1] ? parseInt(sliceMatch[1], 10) : undefined;
  }
}
