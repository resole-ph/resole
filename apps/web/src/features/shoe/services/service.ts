import { db } from '@/config/db';
import { sql, gt, eq, desc, or, and, getTableColumns, cosineDistance, isNull, count } from 'drizzle-orm';
import { shoe, shoePrice, shoeListing, user, shoeAnalysis } from '@/db/schema';
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
import { GoogleGenAI } from "@google/genai";
import { detectIfShoe } from '@/features/shoe/services/detector';

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = parseInt(process.env.EMBEDDING_DIMENSIONS || "1536", 10);
const BASELINE_MATCH_THRESHOLD = parseFloat(process.env.BASELINE_MATCH_THRESHOLD || "0.75");

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
      conditionScore: data.conditionScore,
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

export async function getAllShoeListing() {
  try {
    const rows = await db
      .select({
        seller: getTableColumns(user),
        shoe: getTableColumns(shoe),
        ...getTableColumns(shoeListing)
      })
      .from(shoeListing)
      .innerJoin(shoe, eq(shoeListing.shoeId, shoe.id))
      .innerJoin(user, eq(shoeListing.userId, user.id))
      .where(eq(shoeListing.isAvailable, true))
      .orderBy(desc(shoeListing.updatedAt))
      .limit(20);
    
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

export async function getShoeListingsByUserId(userId: string) {
  try {
    const rows = await db
      .select({
        model: shoe.model,
        brand: shoe.brand,
        seller: getTableColumns(user),
        shoe: getTableColumns(shoe),
        ...getTableColumns(shoeListing)
      })
      .from(shoeListing)
      .innerJoin(shoe, eq(shoeListing.shoeId, shoe.id))
      .innerJoin(user, eq(shoeListing.userId, user.id))
      .where(and(eq(shoeListing.userId, userId), isNull(shoeListing.deletedAt)))
      .orderBy(desc(shoeListing.updatedAt));

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
        active: sql<number>`count(*) filter (where ${shoeListing.isAvailable} = true and ${shoeListing.deletedAt} is null)`,
        unavailable: sql<number>`count(*) filter (where ${shoeListing.isAvailable} = false and ${shoeListing.deletedAt} is null)`,
        deleted: sql<number>`count(*) filter (where ${shoeListing.deletedAt} is not null)`,
      })
      .from(shoeListing)
      .where(eq(shoeListing.userId, userId));

    const summary = rows[0];

    return {
      total: Number(summary?.total ?? 0),
      active: Number(summary?.active ?? 0),
      unavailable: Number(summary?.unavailable ?? 0),
      deleted: Number(summary?.deleted ?? 0),
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
    
    return rows ?? null;
  } catch (error) {
    console.error("Error fetching shoe brands.", error);
    return null;
  }
}

export async function getAllShoeListingForSale() {
  try {
    const rows = await db
      .select({
        seller: getTableColumns(user),
        shoe: getTableColumns(shoe),
        ...getTableColumns(shoeListing)
      })
      .from(shoeListing)
      .innerJoin(shoe, eq(shoeListing.shoeId, shoe.id))
      .innerJoin(user, eq(shoeListing.userId, user.id))
      .where(or(eq(shoeListing.listingMode, 'Sale'), eq(shoeListing.listingMode, 'Both')));
    
    return rows as ShoeListing[] ?? null;
  } catch (error) {
    console.error("Error fetching shoe listings.", error);
    return null;
  }
}

export async function getAllShoeListingForSwap() {
  try {
    const rows = await db
      .select({
        seller: getTableColumns(user),
        shoe: getTableColumns(shoe),
        ...getTableColumns(shoeListing)
      })
      .from(shoeListing)
      .innerJoin(shoe, eq(shoeListing.shoeId, shoe.id))
      .innerJoin(user, eq(shoeListing.userId, user.id))
      .where(or(eq(shoeListing.listingMode, 'Swap'), eq(shoeListing.listingMode, 'Both')));
    
    return rows as ShoeListing[] ?? null;
  } catch (error) {
    console.error("Error fetching shoe listings.", error);
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
        seller: getTableColumns(user),
        shoe: getTableColumns(shoe),
        ...getTableColumns(shoeListing)
      })
      .from(shoeListing)
      .innerJoin(shoe, eq(shoeListing.shoeId, shoe.id))
      .innerJoin(user, eq(shoeListing.userId, user.id))
      .where(eq(shoeListing.id, id));
    
    return rows[0] as ShoeListing ?? null;
  } catch (error) {
    console.error("Error fetching shoe listing.", error);
    return null;
  }
}

export async function getShoeListingByModelName(model: string) {
  try {
    const rows = await db
      .select({
        seller: getTableColumns(user),
        shoe: getTableColumns(shoe),
        ...getTableColumns(shoeListing)
      })
      .from(shoeListing)
      .innerJoin(shoe, eq(shoeListing.shoeId, shoe.id))
      .innerJoin(user, eq(shoeListing.userId, user.id))
      .where(eq(shoe.model, model));
    
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

export async function deleteShoeListing(id: number) {
  try {
    await db 
      .delete(shoeListing)
      .where(eq(shoeListing.id, id))

    return "Shoe listing successfully deleted.";
  } catch (error) {
    console.error("Error deleting shoe listing.", error);
    return null
  }
}

export async function deleteUserShoeListing(userId: string, id: number) {
  try {
    const result = await db
      .update(shoeListing)
      .set({
        isAvailable: false,
        deletedAt: new Date(),
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

export async function analyzeShoePhotos(photoUrls: { top: string; side: string; sole: string; insole: string }): Promise<ShoeAnalysis> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('Google API key is not configured');
  }

  const imageParts: Array<{ inlineData: { mimeType: string; data: string } }> = [];
  const urls = {
    top: photoUrls.top,
    side: photoUrls.side,
    sole: photoUrls.sole,
    insole: photoUrls.insole,
  };

  for (const [key, url] of Object.entries(urls)) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to download ${key} image from URL`);
    }
    const buffer = Buffer.from(await res.arrayBuffer());

    if (key === 'side') {
      const isShoe = await detectIfShoe(buffer);
      if (!isShoe) {
        throw new Error(`Image for ${key} does not appear to be a shoe`);
      }
    }

    const base64 = buffer.toString('base64');
    const contentType = res.headers.get('content-type') || 'image/jpeg';

    imageParts.push({
      inlineData: {
        mimeType: contentType,
        data: base64,
      },
    });
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = [
    'Analyze these four photos of a shoe representing its top, side, sole, and insole.',
    'Accurately identify:',
    '- brand and model',
    '- colorway (the common name for the color scheme, e.g. "Chicago", "Bred", or a plain description)',
    '- size: the US size, read from any label on the insole or tongue, as a plain number string (e.g. "10" or "10.5"). If unreadable, give your best visual estimate.',
    '- year: the approximate release or production year as a number.',
    '- conditionScore: a condition score from 0 to 10 (10 = brand new, unworn).',
    '- description: a short paragraph outlining wear, condition, and visible defects.',
    '- defects: an array of short strings, one per distinct visible defect (empty array if none).',
    '- estimatedPrice: the typical BRAND-NEW / retail market price in PHP (Philippine Peso) for this model, NOT adjusted for condition.',
  ].join('\n');

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [prompt, ...imageParts],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
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
        required: ['brand', 'model', 'colorway', 'size', 'year', 'conditionScore', 'description', 'defects', 'estimatedPrice'],
      },
    },
  });

  const resultText = response.text;
  if (!resultText) {
    throw new Error('Failed to generate content from AI model');
  }

  return JSON.parse(resultText) as ShoeAnalysis;
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
export async function analyzeAndPriceShoe(photoUrls: { top: string; side: string; sole: string; insole: string }): Promise<ShoeAnalysisResult> {
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
    listingMode = 'both',
    imageUrlTop,
    imageUrlSide,
    imageUrlSole,
    imageUrlInsole,
  } = data;

  if (!brand || !model || !value || !colorway || !size || !conditionScore || !imageUrlTop || !imageUrlSide || !imageUrlSole || !imageUrlInsole) {
    throw new Error('Missing required listing information');
  }

  const priceValue = Number.parseFloat(value.toString());
  const sizeValue = Number.parseFloat(size.toString());
  const scoreValue = Number.parseFloat(conditionScore.toString());

  if (Number.isNaN(priceValue) || priceValue <= 0 || Number.isNaN(sizeValue) || sizeValue <= 0 || Number.isNaN(scoreValue) || scoreValue <= 0) {
    throw new Error('Invalid numeric values provided');
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
      listingMode,
      imageUrlTop,
      imageUrlSide,
      imageUrlSole,
      imageUrlInsole,
      isAvailable: true,
    })
    .returning();

  return getShoeListingById(newListing.id);
}
