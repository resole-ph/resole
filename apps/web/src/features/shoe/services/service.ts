import { db } from '@/config/db';
import { sql, gt, eq, desc, or, and, getTableColumns, cosineDistance } from 'drizzle-orm';
import { shoe, shoePrice, shoeListing, user } from '@/db/schema';
import { 
  Shoe, 
  CreateShoe, 
  UpdateShoe,
  ShoePrice,
  CreateShoePrice,
  UpdateShoePrice,
  ShoeListing,
  CreateShoeListing,
  UpdateShoeListing 
} from '@/features/shoe/types/types';
import { GoogleGenAI } from "@google/genai";

export async function generateEmbedding(context: string): Promise<number[]> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.embedContent({
    model: 'gemini-embedding-2',
    contents: context,
  });

  return response.embeddings as number[];
}

export async function createShoe(data: CreateShoe) {
  try {
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
        user: getTableColumns(user),
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

export async function getAllShoeListingForSale() {
  try {
    const rows = await db
      .select({
        user: getTableColumns(user),
        shoe: getTableColumns(shoe),
        ...getTableColumns(shoeListing)
      })
      .from(shoeListing)
      .innerJoin(shoe, eq(shoeListing.shoeId, shoe.id))
      .innerJoin(user, eq(shoeListing.userId, user.id))
      .where(or(eq(shoeListing.listingMode, 'sale'), eq(shoeListing.listingMode, 'both')));
    
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
        user: getTableColumns(user),
        shoe: getTableColumns(shoe),
        ...getTableColumns(shoeListing)
      })
      .from(shoeListing)
      .innerJoin(shoe, eq(shoeListing.shoeId, shoe.id))
      .innerJoin(user, eq(shoeListing.userId, user.id))
      .where(or(eq(shoeListing.listingMode, 'swap'), eq(shoeListing.listingMode, 'both')));
    
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
        user: getTableColumns(user),
        shoe: getTableColumns(shoe),
        ...getTableColumns(shoeListing)
      })
      .from(shoeListing)
      .innerJoin(shoe, eq(shoeListing.shoeId, shoe.id))
      .innerJoin(user, eq(shoeListing.userId, user.id))
      .where(eq(shoeListing.id, id));
    
    return rows[0] as ShoeListing ?? null;
  } catch (error) {
    console.error("Error fetching shoe listings.", error);
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
      .where(eq(shoe.id, id))
      .returning({ id: shoe.id });

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

export async function analyzeShoePhotos(photoUrls: { top: string; side: string; sole: string; insole: string }) {
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
  const prompt = 'Analyze these four photos of a shoe representing its top, side, sole, and insole. Accurately identify the brand, model, provide a description outlining its wear, condition, and visible defects, estimate a condition score from 1 to 10 (where 10 is brand new), and suggest a fair resale pricing value in PHP (Philippine Peso) based on its current condition.';

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
          conditionScore: { type: 'NUMBER' },
          description: { type: 'STRING' },
          estimatedPrice: { type: 'NUMBER' },
        },
        required: ['brand', 'model', 'conditionScore', 'description', 'estimatedPrice'],
      },
    },
  });

  const resultText = response.text;
  if (!resultText) {
    throw new Error('Failed to generate content from AI model');
  }

  return JSON.parse(resultText);
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