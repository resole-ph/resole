import { db } from '@/config/db';
import { eq } from 'drizzle-orm';
import { charity } from '@/db/schema';
import { Charity, CreateCharity, UpdateCharity } from '@/features/charity/types/types';

export async function createCharity(data: CreateCharity) {
  try {
    const result = await db
      .insert(charity)
      .values(data)
      .returning();

    return result[0] as Charity ?? null;
  } catch (error) {
    console.error("Error creating charity.", error);
    return null;
  }
}

export async function getAllCharity() {
  try {
    const rows = await db
      .select()
      .from(charity);
    
    return rows as Charity[] ?? null;
  } catch (error) {
    console.error("Error fetching charities.", error);
    return null;
  }
}

export async function getCharityById(id: number) {
  try {
    const rows = await db
      .select()
      .from(charity)
      .where(eq(charity.id, id));
    
    return rows[0] as Charity ?? null;
  } catch (error) {
    console.error("Error fetching charity.", error);
    return null;
  }
}

export async function updateCharity(data: UpdateCharity, id: number) {
  try {
    const rows = await db 
      .update(charity)
      .set(data)
      .where(eq(charity.id, id))
      .returning();

    return rows[0] as Charity ?? null;
  } catch (error) {
    console.error("Error updating charity.", error);
    return null
  }
}

export async function deleteCharity(id: number) {
  try {
    await db 
      .delete(charity)
      .where(eq(charity.id, id))

    return "Charity successfully deleted.";
  } catch (error) {
    console.error("Error deleting charity.", error);
    return null
  }
}