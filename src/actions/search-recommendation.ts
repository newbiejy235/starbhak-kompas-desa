"use server";

import { db } from "@/db";
import {
  commoditiesTable,
  categoriesTable,
  usersTable,
  ordersTable,
} from "@/db/schema";
import { eq, and, or, ilike, sql, desc } from "drizzle-orm";

export type SearchRecommendation = {
  id: number;
  name: string;
  type: "commodity" | "category" | "farmer";
  transactionCount?: number;
};

/**
 * Get popular search recommendations based on transaction count.
 * Used when the search bar is empty and focused.
 */
export async function getPopularRecommendations(): Promise<SearchRecommendation[]> {
  const popularCommodities = await db
    .select({
      id: commoditiesTable.id,
      name: commoditiesTable.name,
      transactionCount: sql<number>`count(${ordersTable.id})::int`,
    })
    .from(commoditiesTable)
    .leftJoin(
      ordersTable,
      and(
        eq(ordersTable.commodityId, commoditiesTable.id),
        or(
          eq(ordersTable.status, "completed"),
          eq(ordersTable.status, "confirmed"),
          eq(ordersTable.status, "processing"),
          eq(ordersTable.status, "shipped"),
        ),
      ),
    )
    .where(
      or(
        eq(commoditiesTable.status, "available"),
        eq(commoditiesTable.status, "verified"),
      ),
    )
    .groupBy(commoditiesTable.id, commoditiesTable.name)
    .orderBy(
      desc(sql`count(${ordersTable.id})`),
      desc(commoditiesTable.reviewCount),
    )
    .limit(8);

  return popularCommodities.map((c) => ({
    id: c.id,
    name: c.name,
    type: "commodity" as const,
    transactionCount: c.transactionCount,
  }));
}

/**
 * Get search suggestions based on a query string.
 * Matches commodity names, category names, and farmer names with prefix prioritization.
 * Used when user types 2+ characters.
 */
export async function getSearchRecommendations(
  query: string,
): Promise<SearchRecommendation[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const limit = 8;

  const [commodityResults, categoryResults, farmerResults] = await Promise.all([
    db
      .select({
        id: commoditiesTable.id,
        name: commoditiesTable.name,
        transactionCount: sql<number>`count(${ordersTable.id})::int`,
        isPrefix: sql<boolean>`CASE WHEN ${commoditiesTable.name} ILIKE ${`${trimmed}%`} THEN true ELSE false END`,
      })
      .from(commoditiesTable)
      .leftJoin(
        ordersTable,
        and(
          eq(ordersTable.commodityId, commoditiesTable.id),
          or(
            eq(ordersTable.status, "completed"),
            eq(ordersTable.status, "confirmed"),
            eq(ordersTable.status, "processing"),
            eq(ordersTable.status, "shipped"),
          ),
        ),
      )
      .where(
        and(
          or(
            eq(commoditiesTable.status, "available"),
            eq(commoditiesTable.status, "verified"),
          ),
          ilike(commoditiesTable.name, `%${trimmed}%`),
        ),
      )
      .groupBy(
        commoditiesTable.id,
        commoditiesTable.name,
      )
      .orderBy(
        desc(sql`CASE WHEN ${commoditiesTable.name} ILIKE ${`${trimmed}%`} THEN 0 ELSE 1 END`),
        desc(sql`count(${ordersTable.id})`),
      )
      .limit(limit),

    db
      .select({
        id: categoriesTable.id,
        name: categoriesTable.name,
        isPrefix: sql<boolean>`CASE WHEN ${categoriesTable.name} ILIKE ${`${trimmed}%`} THEN true ELSE false END`,
      })
      .from(categoriesTable)
      .where(ilike(categoriesTable.name, `%${trimmed}%`))
      .orderBy(
        desc(sql`CASE WHEN ${categoriesTable.name} ILIKE ${`${trimmed}%`} THEN 0 ELSE 1 END`),
      )
      .limit(3),

    db
      .select({
        id: usersTable.id,
        name: usersTable.fullName,
        isPrefix: sql<boolean>`CASE WHEN ${usersTable.fullName} ILIKE ${`${trimmed}%`} THEN true ELSE false END`,
      })
      .from(usersTable)
      .where(
        and(
          eq(usersTable.role, "petani"),
          ilike(usersTable.fullName, `%${trimmed}%`),
        ),
      )
      .orderBy(
        desc(sql`CASE WHEN ${usersTable.fullName} ILIKE ${`${trimmed}%`} THEN 0 ELSE 1 END`),
      )
      .limit(3),
  ]);

  const results: SearchRecommendation[] = [];

  for (const c of commodityResults) {
    results.push({
      id: c.id,
      name: c.name,
      type: "commodity",
      transactionCount: c.transactionCount,
    });
  }

  for (const c of categoryResults) {
    results.push({
      id: c.id,
      name: c.name,
      type: "category",
    });
  }

  for (const f of farmerResults) {
    results.push({
      id: f.id,
      name: f.name,
      type: "farmer",
    });
  }

  return results.slice(0, limit);
}
