import { db } from '@/config/db';
import { sql, gt, eq, desc, or, getTableColumns, cosineDistance } from 'drizzle-orm';
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

async function generateEmbedding(context: string): Promise<number[]> {

  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY  });

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
    console.error("Error creating shoe.");
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
    console.error("Error creating shoe pricing.");
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
    console.error("Error creating shoe listing.");
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
    console.error("Error fetching shoes.");
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
    console.error("Error fetching shoe prices.");
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
    console.error("Error fetching shoe listings.");
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
    console.error("Error fetching shoe categories.");
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
    console.error("Error fetching shoe listings.");
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
    console.error("Error fetching shoe listings.");
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
    console.error("Error fetching shoe search results.");
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
    console.error("Error fetching shoe.");
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
    console.error("Error fetching shoe pricing.");
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
    console.error("Error fetching shoe listings.");
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
    console.error("Error updating shoe.");
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
    console.error("Error updating shoe pricing.");
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
    console.error("Error updating shoe pricing.");
    return null
  }
}

export async function deleteShoe(id: number) {
  try {
    const result = await db 
      .delete(shoe)
      .where(eq(shoe.id, id))

    return "Shoe successfully deleted.";
  } catch (error) {
    console.error("Error deleting shoe.");
    return null
  }
}

export async function deleteShoeListing(id: number) {
  try {
    const result = await db 
      .delete(shoeListing)
      .where(eq(shoeListing.id, id))

    return "Shoe listing successfully deleted.";
  } catch (error) {
    console.error("Error deleting shoe listing.");
    return null
  }
}