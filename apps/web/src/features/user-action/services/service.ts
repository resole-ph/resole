import { db } from '@/config/db';
import { eq, getTableColumns } from 'drizzle-orm';
import { referal, rating, save, user, shoe, shoeListing } from '@/db/schema';
import { 
  Referal,
  CreateReferal,
  UpdateReferal,
  Rating,
  CreateRating,
  UpdateRating,
  Save,
  CreateSave,
  UpdateSave
} from '@/features/user-action/types/types';
import { resumeToPipeableStream } from 'react-dom/server';

export async function createReferal(data: CreateReferal) {
  try {
    const result = await db
      .insert(referal)
      .values(data)
      .returning({ id: referal.id });

    return getReferalById(result[0].id);
  } catch (error) {
    console.error("Error creating referal.");
    return null;
  }
}

export async function createRating(data: CreateRating) {
  try {
    const result = await db
      .insert(rating)
      .values(data)
      .returning({ id: rating.id });

    return getRatingById(result[0].id);
  } catch (error) {
    console.error("Error creating rating.");
    return null;
  }
}

export async function createSave(data: CreateSave) {
  try {
    const result = await db
      .insert(save)
      .values(data)
      .returning({ id: rating.id });

    return getSaveById(result[0].id);
  } catch (error) {
    console.error("Error creating save.");
    return null;
  }
}

export async function getAllReferal() {
  try {
    const rows = await db
      .select({
        referedBy: getTableColumns(user),
        referedTo: getTableColumns(user),
        ...getTableColumns(referal)
      })
      .from(referal)
      .innerJoin(user, eq(referal.referedById, user.id))
      .innerJoin(user, eq(referal.referedToId, user.id));
    
    return rows as Referal[] ?? null;
  } catch (error) {
    console.error("Error fetching referals.");
    return null;
  }
}

export async function getAllRating() {
  try {
    const rows = await db
      .select({
        rater: getTableColumns(user),
        ratee: getTableColumns(user),
        ...getTableColumns(rating)
      })
      .from(rating)
      .innerJoin(user, eq(rating.raterId, user.id))
      .innerJoin(user, eq(rating.rateeId, user.id));
    
    return rows as Rating[] ?? null;
  } catch (error) {
    console.error("Error fetching ratings.");
    return null;
  }
}

export async function getAllSave() {
  try {
    const rows = await db
      .select({
        listing: getTableColumns(shoeListing),
        user: getTableColumns(user),
        ...getTableColumns(save)
      })
      .from(save)
      .innerJoin(shoe, eq(save.shoeId, shoe.id))
      .innerJoin(user, eq(save.userId, user.id));
    
    return rows ?? null;
  } catch (error) {
    console.error("Error fetching saves.");
    return null;
  }
}

export async function getReferalById(id: number) {
  try {
    const rows = await db
      .select({
        referedBy: getTableColumns(user),
        referedTo: getTableColumns(user),
        ...getTableColumns(referal)
      })
      .from(referal)
      .innerJoin(user, eq(referal.referedById, user.id))
      .innerJoin(user, eq(referal.referedToId, user.id))
      .where(eq(referal.id, id));
    
    return rows[0] as Referal ?? null;
  } catch (error) {
    console.error("Error fetching referal.");
    return null;
  }
}

export async function getReferalByReferedById(id: string) {
  try {
    const rows = await db
      .select({
        referedBy: getTableColumns(user),
        referedTo: getTableColumns(user),
        ...getTableColumns(referal)
      })
      .from(referal)
      .innerJoin(user, eq(referal.referedById, user.id))
      .innerJoin(user, eq(referal.referedToId, user.id))
      .where(eq(referal.referedById, id));
    
    return rows as Referal[] ?? null;
  } catch (error) {
    console.error("Error fetching referal.");
    return null;
  }
}

export async function getReferalByReferedToId(id: string) {
  try {
    const rows = await db
      .select({
        referedBy: getTableColumns(user),
        referedTo: getTableColumns(user),
        ...getTableColumns(referal)
      })
      .from(referal)
      .innerJoin(user, eq(referal.referedById, user.id))
      .innerJoin(user, eq(referal.referedToId, user.id))
      .where(eq(referal.referedToId, id));
    
    return rows as Referal[] ?? null;
  } catch (error) {
    console.error("Error fetching referal.");
    return null;
  }
}

export async function getRatingById(id: number) {
  try {
    const rows = await db
      .select({
        rater: getTableColumns(user),
        ratee: getTableColumns(user),
        ...getTableColumns(rating)
      })
      .from(rating)
      .innerJoin(user, eq(rating.raterId, user.id))
      .innerJoin(user, eq(rating.rateeId, user.id))
      .where(eq(rating.id, id));
    
    return rows[0] as Rating ?? null;
  } catch (error) {
    console.error("Error fetching rating.");
    return null;
  }
}

export async function getRatingByRaterId(id: string) {
  try {
    const rows = await db
      .select({
        rater: getTableColumns(user),
        ratee: getTableColumns(user),
        ...getTableColumns(rating)
      })
      .from(rating)
      .innerJoin(user, eq(rating.raterId, user.id))
      .innerJoin(user, eq(rating.rateeId, user.id))
      .where(eq(rating.raterId, id));
    
    return rows as Rating[] ?? null;
  } catch (error) {
    console.error("Error fetching rating.");
    return null;
  }
}

export async function getRatingByRateeId(id: string) {
  try {
    const rows = await db
      .select({
        rater: getTableColumns(user),
        ratee: getTableColumns(user),
        ...getTableColumns(rating)
      })
      .from(rating)
      .innerJoin(user, eq(rating.raterId, user.id))
      .innerJoin(user, eq(rating.rateeId, user.id))
      .where(eq(rating.rateeId, id));
    
    return rows as Rating[] ?? null;
  } catch (error) {
    console.error("Error fetching rating.");
    return null;
  }
}

export async function getSaveById(id: number) {
  try {
    const rows = await db
      .select({
        listing: getTableColumns(shoeListing),
        user: getTableColumns(user),
        ...getTableColumns(referal)
      })
      .from(referal)
      .innerJoin(shoe, eq(save.shoeId, shoe.id))
      .innerJoin(user, eq(save.userId, user.id))
      .where(eq(save.id, id));
    
    return rows[0] ?? null;
  } catch (error) {
    console.error("Error fetching save.");
    return null;
  }
}

export async function getSaveByListingId(id: number) {
  try {
    const rows = await db
      .select({
        listing: getTableColumns(shoeListing),
        user: getTableColumns(user),
        ...getTableColumns(referal)
      })
      .from(referal)
      .innerJoin(shoe, eq(save.shoeId, shoe.id))
      .innerJoin(user, eq(save.userId, user.id))
      .where(eq(save.shoeId, id));
    
    return rows ?? null;
  } catch (error) {
    console.error("Error fetching saves.");
    return null;
  }
}

export async function getSaveByUserId(id: string) {
  try {
    const rows = await db
      .select({
        listing: getTableColumns(shoeListing),
        user: getTableColumns(user),
        ...getTableColumns(referal)
      })
      .from(referal)
      .innerJoin(shoe, eq(save.shoeId, shoe.id))
      .innerJoin(user, eq(save.userId, user.id))
      .where(eq(save.userId, id));
    
    return rows ?? null;
  } catch (error) {
    console.error("Error fetching saves.");
    return null;
  }
}

export async function updateRating(data: UpdateRating, id: number) {
  try {
    const result = await db 
      .update(rating)
      .set(data)
      .where(eq(rating.id, id))
      .returning({ id: rating.id });

    return getRatingById(id) ?? null;
  } catch (error) {
    console.error("Error updating rating.");
    return null
  }
}

export async function deleteRating(id: number) {
  try {
    const result = await db 
      .delete(rating)
      .where(eq(rating.id, id))

    return "Rating successfully deleted.";
  } catch (error) {
    console.error("Error deleting rating.");
    return null
  }
}

export async function deleteSave(id: number) {
  try {
    const result = await db 
      .delete(save)
      .where(eq(save.id, id))

    return "Save successfully removed.";
  } catch (error) {
    console.error("Error deleting save.");
    return null
  }
}