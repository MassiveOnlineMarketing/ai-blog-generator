import prisma from "../index";
import { TopicalMapBlogType } from "../../types";

export class TopicalMapRepository {
  /**
   * Fetch all TopicalMapEntry items for a given topicalMapId.
   * Optionally filter by type ('P', 'C', or 'S').
   */
  static async fetchEntriesByTopicalMapId(
    topicalMapId: string,
    type?: TopicalMapBlogType,
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
   * Find a single topical map entry by ID
   */
  static async findEntryById(entryId: string) {
    return prisma.topicalMapEntry.findUnique({
      where: { id: entryId },
      include: {
        topicalMap: true,
        generatedContent: true,
        contentDuplicationAnalysis: true
      }
    });
  }

  /**
   * Find a topical map by ID
   */
  static async findTopicalMapById(topicalMapId: string) {
    return prisma.topicalMap.findUnique({
      where: { id: topicalMapId }
    });
  }

  /**
   * Update topical map entry status
   */
  static async updateEntryStatus(entryId: string, status: string) {
    return prisma.topicalMapEntry.update({
      where: { id: entryId },
      data: { 
        contentStatus: status,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Update topical map status
   */
  static async updateTopicalMapStatus(topicalMapId: string, status: string) {
    return prisma.topicalMap.update({
      where: { id: topicalMapId },
      data: {
        status: status,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Get all topical map entries with optional filtering
   */
  static async findAllEntries(filters?: {
    topicalMapId?: string;
    type?: TopicalMapBlogType;
    status?: string;
    limit?: number;
  }) {
    return prisma.topicalMapEntry.findMany({
      where: {
        ...(filters?.topicalMapId && { topicalMapId: filters.topicalMapId }),
        ...(filters?.type && { type: filters.type }),
        ...(filters?.status && { contentStatus: filters.status }),
      },
      orderBy: { priority: 'asc' },
      take: filters?.limit,
      include: {
        topicalMap: true,
      }
    });
  }
}
