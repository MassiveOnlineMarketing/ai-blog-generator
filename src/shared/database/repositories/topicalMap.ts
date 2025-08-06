import prisma from "..";

export class TopicalMapRepository {
  /**
   * Fetch all TopicalMapEntry items for a given topicalMapId.
   * Optionally filter by type ('P', 'C', or 'S').
   */
  static async fetchEntriesByTopicalMapId(
    topicalMapId: string,
    type?: 'P' | 'C' | 'S',
    maxEntries?: number
  ) {
    return prisma.topicalMapEntry.findMany({
      where: {
        topicalMapId,
        ...(type ? { type } : {}),
      },
      orderBy: { priority: 'asc' },
      take: maxEntries, // Limit the number of entries if specified
    });
  }

  /**
   * Get a single topical map entry by ID
   */
  static async findById(id: string) {
    return prisma.topicalMapEntry.findUnique({
      where: { id },
      include: {
        topicalMap: true,
        generatedContent: true,
      }
    });
  }

  /**
   * Get all topical maps
   */
  static async getAllTopicalMaps() {
    return prisma.topicalMap.findMany({
      include: {
        _count: {
          select: {
            entries: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Get entries with filters and pagination
   */
  static async getEntriesWithFilters(
    topicalMapId: string,
    filters: {
      type?: 'P' | 'C' | 'S';
      status?: string;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    const { type, status, limit = 100, offset = 0 } = filters;
    
    return prisma.topicalMapEntry.findMany({
      where: {
        topicalMapId,
        ...(type && { type }),
        ...(status && { contentStatus: status }),
      },
      include: {
        generatedContent: true,
      },
      orderBy: { priority: 'asc' },
      take: limit,
      skip: offset,
    });
  }
}
