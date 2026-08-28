"use server";

import { db } from "@/db";
import {
  usersTable,
  commoditiesTable,
  farmerProfileImagesTable,
  reviewsTable,
  ImageUpload,
  categoriesTable,
} from "@/db/schema";
import { eq, and, ilike, or, sql, asc, desc, avg } from "drizzle-orm";

export async function getPublicFarmers(params?: {
  search?: string;
  location?: string;
  limit?: number;
  offset?: number;
}) {
  const conditions = [
    eq(usersTable.role, "petani"),
    eq(usersTable.status, "verified"),
  ];

  if (params?.search) {
    conditions.push(
      or(
        ilike(usersTable.fullName, `%${params.search}%`),
        ilike(usersTable.village, `%${params.search}%`),
      )!,
    );
  }
  if (params?.location) {
    conditions.push(ilike(usersTable.village, `%${params.location}%`));
  }

  const limit = params?.limit ?? 20;
  const offset = params?.offset ?? 0;

  return db
    .select({
      id: usersTable.id,
      fullName: usersTable.fullName,
      fotoProfile: usersTable.fotoProfile,
      village: usersTable.village,
      bio: usersTable.bio,
      farmingExperience: usersTable.farmingExperience,
      farmArea: usersTable.farmArea,
      farmingMethod: usersTable.farmingMethod,
      commodityCount: sql<number>`count(${commoditiesTable.id})::int`,
    })
    .from(usersTable)
    .leftJoin(
      commoditiesTable,
      and(
        eq(commoditiesTable.farmerId, usersTable.id),
        or(
          eq(commoditiesTable.status, "available"),
          eq(commoditiesTable.status, "verified"),
        ),
      ),
    )
    .where(and(...conditions))
    .groupBy(
      usersTable.id,
      usersTable.fullName,
      usersTable.fotoProfile,
      usersTable.village,
      usersTable.bio,
      usersTable.farmingExperience,
      usersTable.farmArea,
      usersTable.farmingMethod,
    )
    .orderBy(asc(usersTable.fullName))
    .limit(limit)
    .offset(offset);
}

export async function countPublicFarmers(params?: {
  search?: string;
  location?: string;
}) {
  const conditions = [
    eq(usersTable.role, "petani"),
    eq(usersTable.status, "verified"),
  ];

  if (params?.search) {
    conditions.push(
      or(
        ilike(usersTable.fullName, `%${params.search}%`),
        ilike(usersTable.village, `%${params.search}%`),
      )!,
    );
  }
  if (params?.location) {
    conditions.push(ilike(usersTable.village, `%${params.location}%`));
  }

  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(usersTable)
    .where(and(...conditions));

  return result?.count ?? 0;
}

export async function searchPublicFarmers(params?: {
  search?: string;
  location?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: string;
  limit?: number;
  offset?: number;
}) {
  const farmerConditions = [
    eq(usersTable.role, "petani"),
    eq(usersTable.status, "verified"),
  ];

  if (params?.search) {
    farmerConditions.push(
      or(
        ilike(usersTable.fullName, `%${params.search}%`),
        ilike(usersTable.village, `%${params.search}%`),
      )!,
    );
  }
  if (params?.location) {
    farmerConditions.push(ilike(usersTable.village, `%${params.location}%`));
  }

  const commodityConditions = or(
    eq(commoditiesTable.status, "available"),
    eq(commoditiesTable.status, "verified"),
  )!;

  if (params?.categoryId) {
    const catFilter = eq(commoditiesTable.categoryId, params.categoryId);
    const baseQuery = db
      .selectDistinct({ farmerId: commoditiesTable.farmerId })
      .from(commoditiesTable)
      .where(and(commodityConditions, catFilter));

    const matchingFarmerIds = (await baseQuery).map((r) => r.farmerId);
    if (matchingFarmerIds.length === 0) {
      return [];
    }
    farmerConditions.push(
      or(
        ...matchingFarmerIds.map((id) => eq(usersTable.id, id)),
      )!,
    );
  }

  const limit = params?.limit ?? 20;
  const offset = params?.offset ?? 0;

  const rows = await db
    .select({
      id: usersTable.id,
      fullName: usersTable.fullName,
      fotoProfile: usersTable.fotoProfile,
      village: usersTable.village,
      bio: usersTable.bio,
      farmingExperience: usersTable.farmingExperience,
      farmArea: usersTable.farmArea,
      farmingMethod: usersTable.farmingMethod,
      createdAt: usersTable.createdAt,
      commodityCount: sql<number>`count(${commoditiesTable.id})::int`,
      avgPrice: sql<number | null>`avg(${commoditiesTable.price}::numeric)`,
      avgRating: sql<number | null>`avg(${commoditiesTable.rating}::numeric)`,
      reviewCount: sql<number>`sum(${commoditiesTable.reviewCount})::int`,
    })
    .from(usersTable)
    .leftJoin(
      commoditiesTable,
      and(
        eq(commoditiesTable.farmerId, usersTable.id),
        commodityConditions,
      ),
    )
    .where(and(...farmerConditions))
    .groupBy(
      usersTable.id,
      usersTable.fullName,
      usersTable.fotoProfile,
      usersTable.village,
      usersTable.bio,
      usersTable.farmingExperience,
      usersTable.farmArea,
      usersTable.farmingMethod,
      usersTable.createdAt,
    );

  let filtered = rows;

  if (params?.minPrice !== undefined) {
    filtered = filtered.filter(
      (r) => r.avgPrice !== null && Number(r.avgPrice) >= params.minPrice!,
    );
  }
  if (params?.maxPrice !== undefined) {
    filtered = filtered.filter(
      (r) => r.avgPrice !== null && Number(r.avgPrice) <= params.maxPrice!,
    );
  }
  if (params?.minRating !== undefined) {
    filtered = filtered.filter(
      (r) => r.avgRating !== null && Number(r.avgRating) >= params.minRating!,
    );
  }

  switch (params?.sort) {
    case "price_asc":
      filtered.sort(
        (a, b) => (Number(a.avgPrice) || 0) - (Number(b.avgPrice) || 0),
      );
      break;
    case "price_desc":
      filtered.sort(
        (a, b) => (Number(b.avgPrice) || 0) - (Number(a.avgPrice) || 0),
      );
      break;
    case "newest":
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      break;
    case "rating":
      filtered.sort(
        (a, b) => (Number(b.avgRating) || 0) - (Number(a.avgRating) || 0),
      );
      break;
    default:
      filtered.sort((a, b) => (b.commodityCount || 0) - (a.commodityCount || 0));
  }

  return filtered.slice(offset, offset + limit).map((r) => ({
    id: r.id,
    fullName: r.fullName,
    fotoProfile: r.fotoProfile,
    village: r.village,
    bio: r.bio,
    farmingExperience: r.farmingExperience,
    farmArea: r.farmArea,
    farmingMethod: r.farmingMethod,
    commodityCount: r.commodityCount,
    avgPrice: r.avgPrice,
    avgRating: r.avgRating,
    reviewCount: r.reviewCount,
  }));
}

export async function countSearchPublicFarmers(params?: {
  search?: string;
  location?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}) {
  const farmerConditions = [
    eq(usersTable.role, "petani"),
    eq(usersTable.status, "verified"),
  ];

  if (params?.search) {
    farmerConditions.push(
      or(
        ilike(usersTable.fullName, `%${params.search}%`),
        ilike(usersTable.village, `%${params.search}%`),
      )!,
    );
  }
  if (params?.location) {
    farmerConditions.push(ilike(usersTable.village, `%${params.location}%`));
  }

  const commodityConditions = or(
    eq(commoditiesTable.status, "available"),
    eq(commoditiesTable.status, "verified"),
  )!;

  if (params?.categoryId) {
    const catFilter = eq(commoditiesTable.categoryId, params.categoryId);
    const matchingFarmerIds = (
      await db
        .selectDistinct({ farmerId: commoditiesTable.farmerId })
        .from(commoditiesTable)
        .where(and(commodityConditions, catFilter))
    ).map((r) => r.farmerId);
    if (matchingFarmerIds.length === 0) return 0;
    farmerConditions.push(or(...matchingFarmerIds.map((id) => eq(usersTable.id, id)))!);
  }

  const rows = await db
    .select({
      id: usersTable.id,
      avgPrice: sql<number | null>`avg(${commoditiesTable.price}::numeric)`,
      avgRating: sql<number | null>`avg(${commoditiesTable.rating}::numeric)`,
    })
    .from(usersTable)
    .leftJoin(
      commoditiesTable,
      and(eq(commoditiesTable.farmerId, usersTable.id), commodityConditions),
    )
    .where(and(...farmerConditions))
    .groupBy(usersTable.id);

  let count = rows.length;
  if (params?.minPrice !== undefined) {
    count = rows.filter(
      (r) => r.avgPrice !== null && Number(r.avgPrice) >= params.minPrice!,
    ).length;
  }
  if (params?.maxPrice !== undefined) {
    count = rows.filter(
      (r) => r.avgPrice !== null && Number(r.avgPrice) <= params.maxPrice!,
    ).length;
  }
  if (params?.minRating !== undefined) {
    count = rows.filter(
      (r) => r.avgRating !== null && Number(r.avgRating) >= params.minRating!,
    ).length;
  }

  return count;
}

export async function getPublicFarmerById(farmerId: number) {
  const [farmer] = await db
    .select({
      id: usersTable.id,
      fullName: usersTable.fullName,
      fotoProfile: usersTable.fotoProfile,
      village: usersTable.village,
      bio: usersTable.bio,
      address: usersTable.address,
      farmingExperience: usersTable.farmingExperience,
      farmArea: usersTable.farmArea,
      farmingMethod: usersTable.farmingMethod,
      status: usersTable.status,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(
      and(eq(usersTable.id, farmerId), eq(usersTable.role, "petani")),
    );

  if (!farmer) return null;

  const farmImages = await db
    .select()
    .from(farmerProfileImagesTable)
    .where(eq(farmerProfileImagesTable.farmerId, farmerId))
    .orderBy(asc(farmerProfileImagesTable.sortOrder));

  const ratingAgg = await db
    .select({
      avgRating: avg(reviewsTable.rating),
      reviewCount: sql<number>`count(*)::int`,
    })
    .from(reviewsTable)
    .where(eq(reviewsTable.farmerId, farmerId));

  return {
    ...farmer,
    farmImages,
    avgRating: ratingAgg[0]?.avgRating ?? null,
    reviewCount: ratingAgg[0]?.reviewCount ?? 0,
    isVerified: farmer.status === "verified",
  };
}

export async function searchFarmersForBuyer(params?: {
  search?: string;
  location?: string;
  minRating?: number;
  sort?: string;
  limit?: number;
  offset?: number;
}) {
  const search = params?.search?.trim();
  const limit = params?.limit ?? 20;
  const offset = params?.offset ?? 0;

  const commodityStatusCond = or(
    eq(commoditiesTable.status, "available"),
    eq(commoditiesTable.status, "verified"),
  )!;

  let matchingFarmerIds: number[] | null = null;

  if (search) {
    const byNameOrLocation = db
      .selectDistinct({ id: usersTable.id })
      .from(usersTable)
      .where(
        and(
          eq(usersTable.role, "petani"),
          or(
            ilike(usersTable.fullName, `%${search}%`),
            ilike(usersTable.village, `%${search}%`),
          )!,
        ),
      );

    const byCommodity = db
      .selectDistinct({ farmerId: commoditiesTable.farmerId })
      .from(commoditiesTable)
      .innerJoin(usersTable, eq(usersTable.id, commoditiesTable.farmerId))
      .where(
        and(
          eq(usersTable.role, "petani"),
          commodityStatusCond,
          or(
            ilike(commoditiesTable.name, `%${search}%`),
            ilike(commoditiesTable.location, `%${search}%`),
          )!,
        ),
      );

    const [nameResults, commodityResults] = await Promise.all([
      byNameOrLocation,
      byCommodity,
    ]);

    const idSet = new Set<number>();
    for (const r of nameResults) idSet.add(r.id);
    for (const r of commodityResults) idSet.add(r.farmerId);

    matchingFarmerIds = Array.from(idSet);
    if (matchingFarmerIds.length === 0) {
      return { farmers: [], total: 0 };
    }
  }

  const baseConditions = [
    eq(usersTable.role, "petani"),
  ];

  if (matchingFarmerIds) {
    baseConditions.push(
      or(...matchingFarmerIds.map((id) => eq(usersTable.id, id)))!,
    );
  }
  if (params?.location) {
    baseConditions.push(ilike(usersTable.village, `%${params.location}%`));
  }

  const rows = await db
    .select({
      id: usersTable.id,
      fullName: usersTable.fullName,
      fotoProfile: usersTable.fotoProfile,
      village: usersTable.village,
      bio: usersTable.bio,
      farmingExperience: usersTable.farmingExperience,
      farmArea: usersTable.farmArea,
      farmingMethod: usersTable.farmingMethod,
      createdAt: usersTable.createdAt,
      commodityCount: sql<number>`count(${commoditiesTable.id})::int`,
      avgPrice: sql<number | null>`avg(${commoditiesTable.price}::numeric)`,
    })
    .from(usersTable)
    .leftJoin(
      commoditiesTable,
      and(
        eq(commoditiesTable.farmerId, usersTable.id),
        commodityStatusCond,
      ),
    )
    .where(and(...baseConditions))
    .groupBy(
      usersTable.id,
      usersTable.fullName,
      usersTable.fotoProfile,
      usersTable.village,
      usersTable.bio,
      usersTable.farmingExperience,
      usersTable.farmArea,
      usersTable.farmingMethod,
      usersTable.createdAt,
    );

  const farmerIds = rows.map((r) => r.id);

    const reviewMap = new Map<number, { avgRating: number | null; reviewCount: number }>();
  if (farmerIds.length > 0) {
    const reviewRows = await db
      .select({
        farmerId: reviewsTable.farmerId,
        avgRating: avg(reviewsTable.rating),
        reviewCount: sql<number>`count(*)::int`,
      })
      .from(reviewsTable)
      .where(or(...farmerIds.map((id) => eq(reviewsTable.farmerId, id))))
      .groupBy(reviewsTable.farmerId);

    for (const r of reviewRows) {
      reviewMap.set(r.farmerId, {
        avgRating: r.avgRating ? Number(r.avgRating) : null,
        reviewCount: r.reviewCount,
      });
    }
  }

  let enriched = rows.map((r) => ({
    id: r.id,
    fullName: r.fullName,
    fotoProfile: r.fotoProfile,
    village: r.village,
    bio: r.bio,
    farmingExperience: r.farmingExperience,
    farmArea: r.farmArea,
    farmingMethod: r.farmingMethod,
    createdAt: r.createdAt,
    commodityCount: r.commodityCount,
    avgPrice: r.avgPrice,
    avgRating: reviewMap.get(r.id)?.avgRating ?? null,
    reviewCount: reviewMap.get(r.id)?.reviewCount ?? 0,
  }));

  if (params?.minRating !== undefined) {
    enriched = enriched.filter(
      (r) => r.avgRating !== null && Number(r.avgRating) >= params.minRating!,
    );
  }

  switch (params?.sort) {
    case "rating":
      enriched.sort(
        (a, b) => (Number(b.avgRating) || 0) - (Number(a.avgRating) || 0),
      );
      break;
    case "newest":
      enriched.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      break;
    case "products":
      enriched.sort((a, b) => (b.commodityCount || 0) - (a.commodityCount || 0));
      break;
    default:
      enriched.sort((a, b) => {
        const aRating = Number(a.avgRating) || 0;
        const bRating = Number(b.avgRating) || 0;
        const aCount = a.commodityCount || 0;
        const bCount = b.commodityCount || 0;
        if (bRating !== aRating) return bRating - aRating;
        return bCount - aCount;
      });
  }

  const total = enriched.length;
  const paged = enriched.slice(offset, offset + limit);

  return { farmers: paged, total };
}

export async function getFarmerStorePage(farmerId: number) {
  const [farmer] = await db
    .select({
      id: usersTable.id,
      fullName: usersTable.fullName,
      fotoProfile: usersTable.fotoProfile,
      village: usersTable.village,
      bio: usersTable.bio,
      address: usersTable.address,
      farmingExperience: usersTable.farmingExperience,
      farmArea: usersTable.farmArea,
      farmingMethod: usersTable.farmingMethod,
      status: usersTable.status,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(
      and(eq(usersTable.id, farmerId), eq(usersTable.role, "petani")),
    );

  if (!farmer) return null;

  const [ratingAgg] = await db
    .select({
      avgRating: avg(reviewsTable.rating),
      reviewCount: sql<number>`count(*)::int`,
    })
    .from(reviewsTable)
    .where(eq(reviewsTable.farmerId, farmerId));

  const farmImages = await db
    .select()
    .from(farmerProfileImagesTable)
    .where(eq(farmerProfileImagesTable.farmerId, farmerId))
    .orderBy(asc(farmerProfileImagesTable.sortOrder));

  const commodities = await db
    .select({
      id: commoditiesTable.id,
      name: commoditiesTable.name,
      price: commoditiesTable.price,
      minPrice: commoditiesTable.minPrice,
      maxPrice: commoditiesTable.maxPrice,
      stock: commoditiesTable.stock,
      unit: commoditiesTable.unit,
      location: commoditiesTable.location,
      image: ImageUpload.secureUrl,
      images: commoditiesTable.images,
      rating: commoditiesTable.rating,
      reviewCount: commoditiesTable.reviewCount,
      status: commoditiesTable.status,
      categoryName: categoriesTable.name,
    })
    .from(commoditiesTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, commoditiesTable.categoryId))
    .leftJoin(ImageUpload, eq(ImageUpload.id, commoditiesTable.image))
    .where(
      and(
        eq(commoditiesTable.farmerId, farmerId),
        or(
          eq(commoditiesTable.status, "available"),
          eq(commoditiesTable.status, "verified"),
        ),
      ),
    )
    .orderBy(desc(commoditiesTable.createdAt));

  return {
    ...farmer,
    farmImages,
    avgRating: ratingAgg?.avgRating ?? null,
    reviewCount: ratingAgg?.reviewCount ?? 0,
    isVerified: farmer.status === "verified",
    commodities,
  };
}
