import { db } from '@/config/db';
import { sql, gt, eq, desc, asc, or, and, getTableColumns, cosineDistance, inArray, isNull, count, ilike, avg, max, gte, lte, lt } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import { shoe, shoePrice, shoeListing, user, shoeAnalysis, rating, transaction } from '@/db/schema';
import {
  Shoe,
  CreateShoe,
  UpdateShoe,
  ShoePrice,
  CreateShoePrice,
  UpdateShoePrice,
  ShoeListing,
  CreateShoeListing,
  UpdateShoeListing,
  ShoeAnalysis,
  ShoeAnalysisResult
} from '@/features/shoe/types/types';
import { MIN_US_MENS, MAX_US_MENS } from '@/features/shoe/utils/size-conversion';
import { GoogleGenAI } from "@google/genai";

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = parseInt(process.env.EMBEDDING_DIMENSIONS || "1536", 10);
const BASELINE_MATCH_THRESHOLD = parseFloat(process.env.BASELINE_MATCH_THRESHOLD || "0.75");

/**
 * Average star rating per rated user. Left-joined onto listing queries so cards can
 * show a seller's real score; sellers with no ratings yield null, not a default.
 */
const sellerRating = db
  .select({
    rateeId: rating.rateeId,
    average: avg(rating.rating).as('average'),
  })
  .from(rating)
  .where(isNull(rating.deletedAt))
  .groupBy(rating.rateeId)
  .as('seller_rating');

/**
 * Retail reference price per shoe, from the scraped catalog. This is the price of a
 * NEW pair — it is not a previous asking price for the listing, so present it labelled
 * as retail rather than as a strikethrough discount.
 */
const shoeRetailPrice = db
  .select({
    shoeId: shoePrice.shoeId,
    retail: max(shoePrice.price).as('retail'),
  })
  .from(shoePrice)
  .groupBy(shoePrice.shoeId)
  .as('shoe_retail_price');

export async function generateEmbedding(context: string): Promise<number[]> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: context,
    config: { outputDimensionality: EMBEDDING_DIMENSIONS },
  });

  const values = response.embeddings?.[0]?.values;
  if (!values) {
    throw new Error('Failed to generate embedding');
  }

  return values as number[];
}

export async function createShoe(data: CreateShoe) {
  try {
    if (data.embedding.length === 0) {
      data.embedding = await generateEmbedding(data.model);
    }

    const result = await db
      .insert(shoe)
      .values(data)
      .returning();

    return result[0] as Shoe ?? null;
  } catch (error) {
    console.error("Error creating shoe.", error);
    return null;
  }
}

export async function createShoePrice(data: CreateShoePrice) {
  try {
    const result = await db
      .insert(shoePrice)
      .values(data)
      .returning({ id: shoe.id });

    return getShoePriceByShoeId(result[0].id);
  } catch (error) {
    console.error("Error creating shoe pricing.", error);
    return null;
  }
}

export async function createShoeListing(data: CreateShoeListing) {
  try {
    const result = await db
      .insert(shoeListing)
      .values(data)
      .returning({ id: shoeListing.id });

    return getShoeListingById(result[0].id);
  } catch (error) {
    console.error("Error creating shoe listing.", error);
    return null;
  }
}

export async function createShoeAnalysis(data: ShoeAnalysisResult) {
  try {
    const result = await db.insert(shoeAnalysis).values({
      brand: data.brand,
      model: data.model,
      colorway: data.colorway,
      size: data.size,
      year: data.year,
      conditionScore: data.conditionScore.toString(),
      description: data.description,
      estimatedPrice: data.estimatedPrice.toString(),
      defects: data.defects,
      pricing: data.pricing,
    }).returning();

    return result[0];
  } catch (error) {
    console.error("Error creating shoe analysis.", error);
    return null;
  }
}

export async function getAllShoe() {
  try {
    const rows = await db
      .select()
      .from(shoe);
    
    return rows as Shoe[] ?? null;
  } catch (error) {
    console.error("Error fetching shoes.", error);
    return null;
  }
}

export async function getAllShoePrice() {
  try {
    const rows = await db
      .select({
        shoe: getTableColumns(shoe),
        ...getTableColumns(shoePrice)
      })
      .from(shoePrice)
      .innerJoin(shoe, eq(shoePrice.shoeId, shoe.id));
    
    return rows as ShoePrice[] ?? null;
  } catch (error) {
    console.error("Error fetching shoe prices.", error);
    return null;
  }
}

export type ShoeListingFilters = {
  brand?: string;
  search?: string;
};

export type OwnedShoeListingFilters = {
  sizes?: string[];
  colors?: string[];
  conditions?: Array<'Like New' | 'Excellent' | 'Good' | 'Fair' | 'Poor'>;
  minRating?: number;
  priceMin?: number;
  priceMax?: number;
  sort?: 'newest' | 'oldest' | 'price_low' | 'price_high';
};

function buildShoeListingFilters(filters?: ShoeListingFilters) {
  const conditions = [];

  if (filters?.brand) {
    conditions.push(ilike(shoe.brand, filters.brand));
  }

  if (filters?.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(shoe.brand, term),
        ilike(shoe.model, term),
        ilike(shoeListing.colorway, term)
      )!
    );
  }

  return conditions;
}

function getConditionFilter(condition: NonNullable<OwnedShoeListingFilters['conditions']>[number]): SQL {
  switch (condition) {
    case 'Like New':
      return gte(shoeListing.conditionScore, '9');
    case 'Excellent':
      return and(gte(shoeListing.conditionScore, '8'), lt(shoeListing.conditionScore, '9'))!;
    case 'Good':
      return and(gte(shoeListing.conditionScore, '6.5'), lt(shoeListing.conditionScore, '8'))!;
    case 'Fair':
      return and(gte(shoeListing.conditionScore, '4'), lt(shoeListing.conditionScore, '6.5'))!;
    case 'Poor':
      return lt(shoeListing.conditionScore, '4');
  }
}

function buildOwnedShoeListingFilters(filters?: OwnedShoeListingFilters) {
  const conditions: SQL[] = [];

  if (filters?.sizes?.length) {
    conditions.push(inArray(shoeListing.size, filters.sizes));
  }

  if (filters?.colors?.length) {
    conditions.push(inArray(shoeListing.colorway, filters.colors));
  }

  if (filters?.conditions?.length) {
    conditions.push(or(...filters.conditions.map(getConditionFilter))!);
  }

  if (filters?.minRating) {
    conditions.push(gte(sellerRating.average, filters.minRating.toString()));
  }

  if (filters?.priceMin !== undefined) {
    conditions.push(gte(shoeListing.value, filters.priceMin.toString()));
  }

  if (filters?.priceMax !== undefined) {
    conditions.push(lte(shoeListing.value, filters.priceMax.toString()));
  }

  return conditions;
}

function getOwnedShoeListingOrder(sort?: OwnedShoeListingFilters['sort']) {
  switch (sort) {
    case 'oldest':
      return asc(shoeListing.createdAt);
    case 'price_low':
      return asc(shoeListing.value);
    case 'price_high':
      return desc(shoeListing.value);
    case 'newest':
      return desc(shoeListing.createdAt);
    default:
      return desc(shoeListing.updatedAt);
  }
}

export async function getAllShoeListing(filters?: ShoeListingFilters) {
  try {
    const rows = await db
      .select({
        seller: { ...getTableColumns(user), rating: sellerRating.average },
        shoe: { ...getTableColumns(shoe), originalPrice: shoeRetailPrice.retail },
        ...getTableColumns(shoeListing)
      })
      .from(shoeListing)
      .innerJoin(shoe, eq(shoeListing.shoeId, shoe.id))
      .innerJoin(user, eq(shoeListing.userId, user.id))
      .leftJoin(sellerRating, eq(sellerRating.rateeId, user.id))
      .leftJoin(shoeRetailPrice, eq(shoeRetailPrice.shoeId, shoe.id))
      .where(
        and(
          eq(shoeListing.isAvailable, true), 
          ...buildShoeListingFilters(filters)
        )
      )
      .orderBy(desc(shoeListing.updatedAt))
      .limit(20);

    return rows as ShoeListing[] ?? null;
  } catch (error) {
    console.error("Error fetching shoe listings.", error);
    return null;
  }
}

export async function getAllShoeListingForSale(filters?: ShoeListingFilters) {
  try {
    const rows = await db
      .select({
        seller: { ...getTableColumns(user), rating: sellerRating.average },
        shoe: { ...getTableColumns(shoe), originalPrice: shoeRetailPrice.retail },
        ...getTableColumns(shoeListing)
      })
      .from(shoeListing)
      .innerJoin(shoe, eq(shoeListing.shoeId, shoe.id))
      .innerJoin(user, eq(shoeListing.userId, user.id))
      .leftJoin(sellerRating, eq(sellerRating.rateeId, user.id))
      .leftJoin(shoeRetailPrice, eq(shoeRetailPrice.shoeId, shoe.id))
      .where(and(
        eq(shoeListing.isAvailable, true),
        or(eq(shoeListing.listingMode, 'Sale'), eq(shoeListing.listingMode, 'Both')),
        ...buildShoeListingFilters(filters)
      ));

    return rows as ShoeListing[] ?? null;
  } catch (error) {
    console.error("Error fetching shoe listings.", error);
    return null;
  }
}

export async function getAllShoeListingForSwap(filters?: ShoeListingFilters) {
  try {
    const rows = await db
      .select({
        seller: { ...getTableColumns(user), rating: sellerRating.average },
        shoe: { ...getTableColumns(shoe), originalPrice: shoeRetailPrice.retail },
        ...getTableColumns(shoeListing)
      })
      .from(shoeListing)
      .innerJoin(shoe, eq(shoeListing.shoeId, shoe.id))
      .innerJoin(user, eq(shoeListing.userId, user.id))
      .leftJoin(sellerRating, eq(sellerRating.rateeId, user.id))
      .leftJoin(shoeRetailPrice, eq(shoeRetailPrice.shoeId, shoe.id))
      .where(and(
        eq(shoeListing.isAvailable, true),
        or(eq(shoeListing.listingMode, 'Swap'), eq(shoeListing.listingMode, 'Both')),
        ...buildShoeListingFilters(filters)
      ));

    return rows as ShoeListing[] ?? null;
  } catch (error) {
    console.error("Error fetching shoe listings.", error);
    return null;
  }
}

export async function getShoeAnalysisById(id: number) {
  try {
    const result = await db
      .select()
      .from(shoeAnalysis)
      .where(eq(shoeAnalysis.id, id))

    return result[0] ?? null;
  } catch (error) {
    console.error("Error fetching shoe prices.", error);
    return null;
  }
}

export async function getShoeByModelName(name: string) {
  try {
    const result = await db
      .select()
      .from(shoe)
      .where(eq(shoe.model, name));
    
    return result[0] as Shoe ?? null;
  } catch (error) {
    console.error("Error fetching shoe.", error);
    return null;
  }
}

export async function getShoeListingsByUserId(
  userId: string,
  filters?: OwnedShoeListingFilters,
  includeArchived = false,
) {
  try {
    const rows = await db
      .select({
        model: shoe.model,
        brand: shoe.brand,
        seller: { ...getTableColumns(user), rating: sellerRating.average },
        shoe: { ...getTableColumns(shoe), originalPrice: shoeRetailPrice.retail },
        ...getTableColumns(shoeListing)
      })
      .from(shoeListing)
      .innerJoin(shoe, eq(shoeListing.shoeId, shoe.id))
      .innerJoin(user, eq(shoeListing.userId, user.id))
      .leftJoin(sellerRating, eq(sellerRating.rateeId, user.id))
      .leftJoin(shoeRetailPrice, eq(shoeRetailPrice.shoeId, shoe.id))
      .where(
        and(
          eq(shoeListing.userId, userId), 
          ...(includeArchived ? [] : [eq(shoeListing.isAvailable, true), isNull(shoeListing.archivedAt)]),
          ...buildOwnedShoeListingFilters(filters)
        )
      )
      .orderBy(getOwnedShoeListingOrder(filters?.sort));

    return rows ?? null;
  } catch (error) {
    console.error("Error fetching user shoe listings.", error);
    return null;
  }
}

export async function getShoeListingSummaryByUserId(userId: string) {
  try {
    const rows = await db
      .select({
        total: count(shoeListing.id),
        active: sql<number>`count(*) filter (where ${shoeListing.isAvailable} = true)`,
        unavailable: sql<number>`count(*) filter (where ${shoeListing.isAvailable} = false)`,
      })
      .from(shoeListing)
      .where(eq(shoeListing.userId, userId));

    const summary = rows[0];

    return {
      total: Number(summary?.total ?? 0),
      active: Number(summary?.active ?? 0),
      unavailable: Number(summary?.unavailable ?? 0),
    };
  } catch (error) {
    console.error("Error fetching user shoe listing summary.", error);
    return null;
  }
}

export async function getShoeCategories() {
  try {
    const rows = await db
      .selectDistinct({ categories: shoe.category })
      .from(shoe);
    
    return rows ?? null;
  } catch (error) {
    console.error("Error fetching shoe categories.", error);
    return null;
  }
}

export async function getShoeBrands() {
  try {
    const rows = await db
      .selectDistinct({ categories: shoe.brand })
      .from(shoe);
    
    return rows.map(item => item.categories) ?? null;
  } catch (error) {
    console.error("Error fetching shoe brands.", error);
    return null;
  }
}

export async function getShoeBySearch(query: string) {
  try {
    const embedding = await generateEmbedding(query);

    const similarity = sql<number>`1 - (${cosineDistance(shoe.embedding, embedding)})`;
    
    const result = await db
      .select({
        shoe,
        similarity
      })
      .from(shoe)
      .where(gt(similarity, 0.5))
      .orderBy(desc(similarity))
      .limit(20);
    
    const searchResults = result.map(item => item.shoe);  

    return searchResults as Shoe[] ?? null;
  } catch (error) {
    console.error("Error fetching shoe search results.", error);
    return null;
  }
}

export async function getShoeListingsBySearch(query: string) {
  try {
    const shoes = await getShoeBySearch(query) || [];
    const shoeNames = shoes.map(item => item.model);
    const listingResults: ShoeListing[] = [];

    for (const shoeName of shoeNames) {
      const fetchedListings = await getShoeListingByModelName(shoeName) || [];
      listingResults.push(...fetchedListings);
      if (listingResults.length >= 20) {
        listingResults.length = 20;
        break;
      }
    }

    return listingResults as ShoeListing[] ?? null;
  } catch (error) {
    console.error("Error fetching shoe listing search results.", error);
    return null;
  }
}

export async function getShoeById(id: number) {
  try {
    const rows = await db
      .select()
      .from(shoe)
      .where(eq(shoe.id, id));
    
    return rows[0] as Shoe ?? null;
  } catch (error) {
    console.error("Error fetching shoe.", error);
    return null;
  }
}

export async function getShoePriceByShoeId(id: number) {
  try {
    const rows = await db
      .select({
        shoe: getTableColumns(shoe),
        ...getTableColumns(shoePrice)
      })
      .from(shoePrice)
      .innerJoin(shoe, eq(shoePrice.shoeId, shoe.id))
      .where(eq(shoe.id, id));
    
    return rows[0] as ShoePrice ?? null;
  } catch (error) {
    console.error("Error fetching shoe pricing.", error);
    return null;
  }
}

export async function getShoeListingById(id: number) {
  try {
    const rows = await db
      .select({
        seller: { ...getTableColumns(user), rating: sellerRating.average },
        shoe: { ...getTableColumns(shoe), originalPrice: shoeRetailPrice.retail },
        ...getTableColumns(shoeListing)
      })
      .from(shoeListing)
      .innerJoin(shoe, eq(shoeListing.shoeId, shoe.id))
      .innerJoin(user, eq(shoeListing.userId, user.id))
      .leftJoin(sellerRating, eq(sellerRating.rateeId, user.id))
      .leftJoin(shoeRetailPrice, eq(shoeRetailPrice.shoeId, shoe.id))
      .where(eq(shoeListing.id, id));
    
    return rows[0] as ShoeListing ?? null;
  } catch (error) {
    console.error("Error fetching shoe listing.", error);
    return null;
  }
}

/**
 * `getShoeListingById` for a set of ids. Callers that need several listings at
 * once — an inbox thread renders one card per offer — would otherwise pay a
 * round trip each.
 */
export async function getShoeListingsByIds(ids: number[]) {
  if (ids.length === 0) {
    return [];
  }

  try {
    const rows = await db
      .select({
        seller: { ...getTableColumns(user), rating: sellerRating.average },
        shoe: { ...getTableColumns(shoe), originalPrice: shoeRetailPrice.retail },
        ...getTableColumns(shoeListing)
      })
      .from(shoeListing)
      .innerJoin(shoe, eq(shoeListing.shoeId, shoe.id))
      .innerJoin(user, eq(shoeListing.userId, user.id))
      .leftJoin(sellerRating, eq(sellerRating.rateeId, user.id))
      .leftJoin(shoeRetailPrice, eq(shoeRetailPrice.shoeId, shoe.id))
      .where(inArray(shoeListing.id, ids));

    return rows as ShoeListing[];
  } catch (error) {
    console.error("Error fetching shoe listings.", error);
    return [];
  }
}

export async function getShoeListingByModelName(model: string) {
  try {
    const rows = await db
      .select({
        seller: { ...getTableColumns(user), rating: sellerRating.average },
        shoe: { ...getTableColumns(shoe), originalPrice: shoeRetailPrice.retail },
        ...getTableColumns(shoeListing)
      })
      .from(shoeListing)
      .innerJoin(shoe, eq(shoeListing.shoeId, shoe.id))
      .innerJoin(user, eq(shoeListing.userId, user.id))
      .leftJoin(sellerRating, eq(sellerRating.rateeId, user.id))
      .leftJoin(shoeRetailPrice, eq(shoeRetailPrice.shoeId, shoe.id))
      .where(
        and(
          eq(shoeListing.isAvailable, true),
          eq(shoe.model, model)
        )
      );
    
    return rows as ShoeListing[] ?? null;
  } catch (error) {
    console.error("Error fetching shoe listing.", error);
    return null;
  }
}

export async function updateShoe(data: UpdateShoe, id: number) {
  try {
    const result = await db 
      .update(shoe)
      .set(data)
      .where(eq(shoe.id, id))
      .returning();

    return result[0] as Shoe ?? null;
  } catch (error) {
    console.error("Error updating shoe.", error);
    return null
  }
}

export async function updateShoePrice(data: UpdateShoePrice, id: number) {
  try {
    const result = await db 
      .update(shoePrice)
      .set(data)
      .where(eq(shoePrice.shoeId, id))
      .returning({ id: shoePrice.shoeId });

    return getShoePriceByShoeId(result[0].id);
  } catch (error) {
    console.error("Error updating shoe pricing.", error);
    return null
  }
}

export async function updateShoeListing(data: UpdateShoeListing, id: number) {
  try {
    const result = await db 
      .update(shoeListing)
      .set(data)
      .where(eq(shoeListing.id, id))
      .returning({ id: shoeListing.id });

    return getShoeListingById(result[0].id);
  } catch (error) {
    console.error("Error updating shoe pricing.", error);
    return null
  }
}

export async function deleteShoe(id: number) {
  try {
    await db 
      .delete(shoe)
      .where(eq(shoe.id, id))

    return "Shoe successfully deleted.";
  } catch (error) {
    console.error("Error deleting shoe.", error);
    return null
  }
}

export class ListingNotArchivedError extends Error {}
export class ListingHasTransactionHistoryError extends Error {}

export async function permanentlyDeleteShoeListing(userId: string, id: number) {
  const [existing] = await db
    .select({ isAvailable: shoeListing.isAvailable })
    .from(shoeListing)
    .where(and(eq(shoeListing.id, id), eq(shoeListing.userId, userId)));

  if (!existing) {
    return null;
  }

  if (existing.isAvailable) {
    throw new ListingNotArchivedError('Archive the listing before deleting it permanently.');
  }

  const [existingTransaction] = await db
    .select({ id: transaction.id })
    .from(transaction)
    .where(eq(transaction.listingId, id));

  if (existingTransaction) {
    throw new ListingHasTransactionHistoryError('This listing has transaction history and cannot be permanently deleted.');
  }

  try {
    await db
      .delete(shoeListing)
      .where(and(eq(shoeListing.id, id), eq(shoeListing.userId, userId)));

    return "Shoe listing successfully deleted.";
  } catch (error) {
    console.error("Error permanently deleting shoe listing.", error);
    return null;
  }
}

export async function deleteUserShoeListing(userId: string, id: number) {
  try {
    const result = await db
      .update(shoeListing)
      .set({
        isAvailable: false,
        updatedAt: new Date()
      })
      .where(and(eq(shoeListing.id, id), eq(shoeListing.userId, userId)))
      .returning({ id: shoeListing.id });

    return result[0] ? "Shoe listing successfully deleted." : null;
  } catch (error) {
    console.error("Error deleting user shoe listing.", error);
    return null;
  }
}

export class InvalidShoePhotoError extends Error {}

export async function analyzeShoePhotos(photoUrls: {
  top: string;
  leftSide: string;
  rightSide: string;
  sole: string;
  insoleRight?: string;
  insoleLeft?: string;
  insole?: string;
}): Promise<ShoeAnalysis> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('Google API key is not configured');
  }

  const urls = {
    top: photoUrls.top,
    leftSide: photoUrls.leftSide,
    rightSide: photoUrls.rightSide,
    sole: photoUrls.sole,
    insoleRight: photoUrls.insoleRight || photoUrls.insole || '',
    insoleLeft: photoUrls.insoleLeft || photoUrls.insole || '',
  };

  const imageParts = await Promise.all(
    Object.entries(urls).map(async ([key, url]) => {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to download ${key} image from URL`);
      }
      const buffer = Buffer.from(await res.arrayBuffer());

      return {
        inlineData: {
          mimeType: res.headers.get('content-type') || 'image/jpeg',
          data: buffer.toString('base64'),
        },
      };
    })
  );

  const ai = new GoogleGenAI({ apiKey });
  const prompt = [
    'You are an expert sneaker authenticator, appraiser, and visual inspector.',
    '',
    'INPUT PHOTOS:',
    'These 6 photos show ONE pair of shoes (left + right) together in every frame, provided in this exact order:',
    '1. "Top View" — top view of both shoes',
    '2. "Left Side View" — outer face of the LEFT shoe (right shoe also visible)',
    '3. "Right Side View" — outer face of the RIGHT shoe (left shoe also visible)',
    '4. "Sole View" — both shoes flipped over, outsoles visible',
    '5. "Insole Right" — right shoe tilted open, insole and size label visible',
    '6. "Insole Left" — left shoe tilted open, insole and size label visible',
    '',
    'LIGHTING & QUALITY ASSESSMENT:',
    '• Photos are ideally clear and well-lit so details, stitching, logos, sole wear, and size tags are easy to inspect.',
    '• Be LENIENT about lighting — never reject the whole photo set just because lighting is imperfect. Do your best to identify brand, model, condition, and defects even from photos with dim, shadowed, or glare-y lighting, as long as the shoe itself and its key details are still discernible.',
    '',
    'VALIDATION RULES:',
    '1. Set `isValidPhotoSet` to FALSE ONLY if:',
    '   a) Any photo clearly does NOT show footwear (e.g. random scene, person, non-shoe object, blank/corrupted image).',
    '   b) Any photo is so pitch-black, blown-out, or blurred that literally NOTHING about the shoe is visible or usable — not merely dim or somewhat shadowed.',
    '2. If `isValidPhotoSet` is FALSE:',
    '   • Set `rejectionReason` naming the offending photo(s) ONLY by their exact label from the list above (e.g. "Sole View", "Insole Right", "Insole Left") — NEVER reference them by number.',
    '   • Fill all other schema fields with neutral placeholders (empty string / 0 / empty array).',
    '3. If `isValidPhotoSet` is TRUE:',
    '   • If one or more photos have noticeably poor lighting (dim, shadowed, or glare) that made analysis harder but still possible, set `rejectionReason` to a short, friendly, non-alarming one-sentence lighting tip naming the affected photo(s) by label (e.g. "The \'Sole View\' photo is a bit dark — retaking it in brighter light can improve accuracy."). This is just a tip, NOT a rejection — the set is still valid.',
    '   • Otherwise (lighting was fine), set `rejectionReason` to "".',
    '',
    'ANGLE VERIFICATION:',
    '• For each of the 6 labeled photos, check whether it plausibly shows the angle named by its label above.',
    '• If one or more photos clearly show the wrong angle for their slot (e.g. the "Sole View" slot actually contains a side-view shot), set `angleWarning` to a short, friendly, non-alarming one-sentence heads-up naming the mismatched photo(s) by label (e.g. "The \'Sole View\' photo looks like a side view — double-check you uploaded the outsole photo in that slot."). This is just a heads-up, NOT a rejection.',
    '• Minor tilt/framing differences do NOT count as a mismatch — only flag photos that clearly show a different angle than labeled.',
    '• If all photos reasonably match their labels, set `angleWarning` to "".',
    '• Angle mismatches never affect `isValidPhotoSet` — that field is governed solely by the VALIDATION RULES above.',
    '',
    'ANALYSIS & VALUATION RULES:',
    '• Brand/Model/Colorway/Size: Read from whichever photo gives the clearest view under good lighting (especially tongue/insole size tag). Size must be a plain US MEN\'S size number string like "10" or "10.5" — if the tag only shows a women\'s or EU size, convert it to US Men\'s first. Never return a bare women\'s size.',
    '• Condition & Defects: Set conditionScore (0-10, where 10 = brand new/unworn) based on the worse shoe of the pair. Prefix each defect entry with "Left: ", "Right: ", or "Both: ".',
    '• Estimated Price: Estimate typical brand-new retail price in PHP for this shoe model.',
    '• Year: Provide a valid Gregorian calendar year (e.g., 2026, 2016, 2006) of the release of the model.',
  ].join('\n');

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [prompt, ...imageParts],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          isValidPhotoSet: { type: 'BOOLEAN' },
          rejectionReason: { type: 'STRING' },
          angleWarning: { type: 'STRING' },
          brand: { type: 'STRING' },
          model: { type: 'STRING' },
          colorway: { type: 'STRING' },
          size: { type: 'STRING' },
          year: { type: 'NUMBER' },
          conditionScore: { type: 'NUMBER' },
          description: { type: 'STRING' },
          defects: { type: 'ARRAY', items: { type: 'STRING' } },
          estimatedPrice: { type: 'NUMBER' },
        },
        required: ['isValidPhotoSet', 'rejectionReason', 'angleWarning', 'brand', 'model', 'colorway', 'size', 'year', 'conditionScore', 'description', 'defects', 'estimatedPrice'],
      },
    },
  });

  const resultText = response.text;
  if (!resultText) {
    throw new Error('Failed to generate content from AI model');
  }

  const parsed = JSON.parse(resultText) as ShoeAnalysis & { isValidPhotoSet: boolean; rejectionReason: string; angleWarning: string };

  if (!parsed.isValidPhotoSet) {
    throw new InvalidShoePhotoError(parsed.rejectionReason || 'One or more uploaded photos do not appear to show a pair of shoes.');
  }

  // Valid sets repurpose `rejectionReason` as a non-blocking lighting tip.
  const { isValidPhotoSet, rejectionReason, angleWarning, ...analysis } = parsed;
  return { ...analysis, lightingWarning: rejectionReason || undefined, angleWarning: angleWarning || undefined };
}

/**
 * Pricing engine: find the closest catalog shoe to `${brand} ${model}` via pgvector
 * cosine similarity and return its baseline market price from shoe_price. Returns
 * null fields when there is no confident match (e.g. an empty/sparse catalog).
 */
export async function getBaselinePriceByShoe(brand: string, model: string) {
  try {
    const embedding = await generateEmbedding(`${brand} ${model}`);

    // cosine distance is `<=>`; similarity = 1 - distance.
    const similarity = sql<number>`1 - (${cosineDistance(shoe.embedding, embedding)})`;

    const rows = await db
      .select({
        shoeId: shoe.id,
        price: shoePrice.price,
        similarity,
      })
      .from(shoe)
      .innerJoin(shoePrice, eq(shoePrice.shoeId, shoe.id))
      // gemini-embedding-001 keeps even unrelated short phrases in the ~0.6 range,
      // so require a high similarity to accept a catalog match; below this we fall
      // back to the AI's own price estimate.
      .where(gt(similarity, BASELINE_MATCH_THRESHOLD))
      .orderBy(desc(similarity))
      .limit(1);

    const top = rows[0];
    if (!top) {
      return { baselinePrice: null, matchedShoeId: null, similarity: null };
    }

    return {
      baselinePrice: Number(top.price),
      matchedShoeId: top.shoeId,
      similarity: Number(top.similarity),
    };
  } catch (error) {
    console.error('Error fetching baseline price.', error);
    return { baselinePrice: null, matchedShoeId: null, similarity: null };
  }
}

/** Depreciation math: baseline price scaled by condition (score / 10), clamped to 0–10. */
export function calculateSuggestedPrice(baselinePrice: number, conditionScore: number): number {
  const score = Math.min(Math.max(conditionScore, 0), 10);
  return Math.round(baselinePrice * (score / 10));
}

/**
 * Full analyze pipeline: Gemini vision → pgvector baseline lookup → depreciation.
 * When no catalog baseline is found, falls back to Gemini's own estimatedPrice so a
 * suggested price is always produced.
 */
export async function analyzeAndPriceShoe(photoUrls: {
  top: string;
  leftSide: string;
  rightSide: string;
  sole: string;
  insoleRight?: string;
  insoleLeft?: string;
  insole?: string;
}): Promise<ShoeAnalysisResult> {
  const analysis = await analyzeShoePhotos(photoUrls);

  const { baselinePrice, matchedShoeId, similarity } = await getBaselinePriceByShoe(analysis.brand, analysis.model);

  const catalogHit = baselinePrice !== null;
  const baseline = catalogHit ? baselinePrice : analysis.estimatedPrice;
  const suggestedPrice = calculateSuggestedPrice(baseline, analysis.conditionScore);

  return {
    ...analysis,
    pricing: {
      baselinePrice,
      matchedShoeId,
      similarity,
      conditionScore: analysis.conditionScore,
      suggestedPrice,
      priceSource: catalogHit ? 'catalog' : 'ai-estimate',
    },
  };
}

export async function getShoeByModelAndBrand(brand: string, model: string) {
  try {
    const rows = await db
      .select()
      .from(shoe)
      .where(
        and(
          eq(sql`lower(${shoe.brand})`, brand.toLowerCase().trim()),
          eq(sql`lower(${shoe.model})`, model.toLowerCase().trim())
        )
      )
      .limit(1);

    return rows[0] as Shoe ?? null;
  } catch (error) {
    console.error('Error fetching shoe by model and brand:', error);
    return null;
  }
}

export async function publishShoeListing(userId: string, data: any) {
  const {
    brand,
    model,
    category = 'other',
    value,
    description,
    colorway,
    size,
    conditionScore,
    defects = [],
    isRefurbished = false,
    isFinalPrice = false,
    listingMode = 'both',
    imageUrlTop,
    imageUrlLeftSide,
    imageUrlRightSide,
    imageUrlSole,
    imageUrlInsole,
    imageUrlInsoleRight,
    imageUrlInsoleLeft,
  } = data;

  const resolvedInsole = imageUrlInsole || imageUrlInsoleRight || imageUrlInsoleLeft;

  if (!brand || !model || !value || !colorway || !size || !conditionScore || !imageUrlTop || !imageUrlLeftSide || !imageUrlRightSide || !imageUrlSole || !resolvedInsole) {
    throw new Error('Missing required listing information');
  }

  const priceValue = Number.parseFloat(value.toString());
  const sizeValue = Number.parseFloat(size.toString());
  const scoreValue = Number.parseFloat(conditionScore.toString());

  if (Number.isNaN(priceValue) || priceValue <= 0) {
    throw new Error('Invalid price value provided');
  }
  // Sizes are stored as US Men's. The bounds match the conversion chart, so
  // anything outside them cannot be displayed or converted meaningfully.
  if (Number.isNaN(sizeValue) || sizeValue < MIN_US_MENS || sizeValue > MAX_US_MENS) {
    throw new Error(`Invalid size provided — expected a US Men's size between ${MIN_US_MENS} and ${MAX_US_MENS}`);
  }
  if (Number.isNaN(scoreValue) || scoreValue <= 0 || scoreValue > 10) {
    throw new Error('Invalid score values provided');
  }

  const brandStr = brand.trim();
  const modelStr = model.trim();

  let catalogShoeId: number;

  const existingShoe = await getShoeByModelAndBrand(brandStr, modelStr);

  if (existingShoe) {
    catalogShoeId = existingShoe.id;
  } else {
    const embeddingText = `${brandStr} ${modelStr} ${category}`;
    const embedding = await generateEmbedding(embeddingText);

    const [newShoe] = await db
      .insert(shoe)
      .values({
        brand: brandStr,
        model: modelStr,
        category,
        co2Footprint: '10.0',
        embedding,
      })
      .returning();

    catalogShoeId = newShoe.id;
  }

  const [newListing] = await db
    .insert(shoeListing)
    .values({
      userId,
      shoeId: catalogShoeId,
      value: priceValue.toString(),
      description,
      colorway,
      size: sizeValue.toString(),
      conditionScore: scoreValue.toString(),
      defects,
      isRefurbished,
      isFinalPrice,
      listingMode,
      imageUrlTop,
      imageUrlLeftSide,
      imageUrlRightSide,
      imageUrlSole,
      imageUrlInsole: resolvedInsole,
      imageUrlInsoleRight: imageUrlInsoleRight || resolvedInsole,
      imageUrlInsoleLeft: imageUrlInsoleLeft || resolvedInsole,
      isAvailable: true,
    })
    .returning();

  return getShoeListingById(newListing.id);
}
