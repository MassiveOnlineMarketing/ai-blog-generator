import prisma from "../index";

export class GeneratedContentRepository {
  /**
   * Create or update generated content
   */
  static async upsertGeneratedContent(data: {
    topicalMapEntryId: string;
    prismicUid: string;
    title: string;
    content: any;
    wordCount: number;
    readingTime: number;
    metaTitle?: string;
    metaDescription?: string;
    targetKeywords?: string[];
    aiModel: string;
    promptVersion: string;
    generationTime: number;
    prismicId?: string;
    validationStatus: string;
    publicationStatus: string;
  }) {
    // Check if record already exists
    const existingContent = await prisma.generatedContent.findUnique({
      where: {
        topicalMapEntryId_prismicUid: {
          topicalMapEntryId: data.topicalMapEntryId,
          prismicUid: data.prismicUid
        }
      }
    });

    if (existingContent) {
      // Update existing record
      return prisma.generatedContent.update({
        where: { id: existingContent.id },
        data: {
          title: data.title,
          content: data.content,
          wordCount: data.wordCount,
          readingTime: data.readingTime,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          targetKeywords: data.targetKeywords,
          aiModel: data.aiModel,
          promptVersion: data.promptVersion,
          generationTime: data.generationTime,
          prismicId: data.prismicId,
          validationStatus: data.validationStatus,
          publicationStatus: data.publicationStatus,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new record
      return prisma.generatedContent.create({
        data: {
          topicalMapEntryId: data.topicalMapEntryId,
          title: data.title,
          content: data.content,
          wordCount: data.wordCount,
          readingTime: data.readingTime,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          targetKeywords: data.targetKeywords,
          aiModel: data.aiModel,
          promptVersion: data.promptVersion,
          generationTime: data.generationTime,
          prismicUid: data.prismicUid,
          prismicId: data.prismicId,
          validationStatus: data.validationStatus,
          publicationStatus: data.publicationStatus
        }
      });
    }
  }

  /**
   * Find generated content by Prismic UID
   */
  static async findByPrismicUid(prismicUid: string, excludeEntryId?: string) {
    return prisma.generatedContent.findFirst({
      where: {
        prismicUid: prismicUid,
        ...(excludeEntryId && {
          NOT: {
            topicalMapEntryId: excludeEntryId
          }
        })
      }
    });
  }

  /**
   * Find generated content by entry ID
   */
  static async findByEntryId(entryId: string) {
    return prisma.generatedContent.findMany({
      where: {
        topicalMapEntryId: entryId
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get generation statistics
   */
  static async getGenerationStats(topicalMapId?: string) {
    const whereClause = topicalMapId 
      ? {
          topicalMapEntry: {
            topicalMapId: topicalMapId
          }
        }
      : {};

    const stats = await prisma.generatedContent.groupBy({
      by: ['publicationStatus'],
      where: whereClause,
      _count: {
        id: true
      }
    });

    return stats.reduce((acc, stat) => {
      acc[stat.publicationStatus] = stat._count.id;
      return acc;
    }, {} as Record<string, number>);
  }
}
