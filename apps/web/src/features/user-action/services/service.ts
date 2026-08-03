import { db } from '@/config/db';
import { aliasedTable, and, desc, eq, getTableColumns, inArray, isNull } from 'drizzle-orm';
import { referal, rating, save, user, shoe, shoeListing, transaction } from '@/db/schema';
import { 
  Referal,
  CreateReferal,
  Rating,
  CreateRating,
  UpdateRating,
  CreateSave,
} from '@/features/user-action/types/types';

export async function createReferal(data: CreateReferal) {
  try {
    const result = await db
      .insert(referal)
      .values(data)
      .returning({ id: referal.id });

    return getReferalById(result[0].id);
  } catch (error) {
    console.error("Error creating referal.", error);
    return null;
  }
}

export async function createRating(data: CreateRating) {
  const result = await db
    .insert(rating)
    .values(data)
    .returning({ id: rating.id });

  return getRatingById(result[0].id);
}

export async function createSave(data: CreateSave) {
  try {
    const result = await db
      .insert(save)
      .values(data)
      .returning({ id: rating.id });

    return getSaveById(result[0].id);
  } catch (error) {
    console.error("Error creating save.", error);
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
    console.error("Error fetching referals.", error);
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
    console.error("Error fetching ratings.", error);
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
      .innerJoin(shoeListing, eq(save.listingId, shoeListing.id))
      .innerJoin(user, eq(save.userId, user.id));
    
    return rows ?? null;
  } catch (error) {
    console.error("Error fetching saves.", error);
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
    console.error("Error fetching referal.", error);
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
    console.error("Error fetching referal.", error);
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
    console.error("Error fetching referal.", error);
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
    console.error("Error fetching rating.", error);
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
    console.error("Error fetching rating.", error);
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
    console.error("Error fetching rating.", error);
    return null;
  }
}

export async function getRatingByTransactionId(id: number) {
  try {
    const rows = await db
      .select({
        rater: getTableColumns(user),
        ratee: getTableColumns(user),
        transaction: getTableColumns(transaction),
        ...getTableColumns(rating)
      })
      .from(rating)
      .innerJoin(user, eq(rating.raterId, user.id))
      .innerJoin(user, eq(rating.rateeId, user.id))
      .innerJoin(transaction, eq(rating.transactionId, transaction.id))
      .innerJoin(shoeListing, eq(transaction.listingId, shoeListing.id))
      .where(eq(rating.transactionId, id));
    
    return rows[0] as Rating ?? null;
  } catch (error) {
    console.error("Error fetching rating.", error);
    return null;
  }
}

export async function getSaveById(id: number) {
  try {
    const rows = await db
      .select({
        listing: getTableColumns(shoeListing),
        user: getTableColumns(user),
        ...getTableColumns(save)
      })
      .from(save)
      .innerJoin(shoeListing, eq(save.listingId, shoeListing.id))
      .innerJoin(user, eq(save.userId, user.id))
      .where(eq(save.id, id));
    
    return rows[0] ?? null;
  } catch (error) {
    console.error("Error fetching save.", error);
    return null;
  }
}

export async function getSaveByListingId(id: number) {
  try {
    const rows = await db
      .select({
        listing: getTableColumns(shoeListing),
        user: getTableColumns(user),
        ...getTableColumns(save)
      })
      .from(save)
      .innerJoin(shoeListing, eq(save.listingId, shoeListing.id))
      .innerJoin(user, eq(save.userId, user.id))
      .where(eq(save.listingId, id));
    
    return rows ?? null;
  } catch (error) {
    console.error("Error fetching saves.", error);
    return null;
  }
}

export async function getSaveByUserId(id: string) {
  try {
    const rows = await db
      .select({
        listing: getTableColumns(shoeListing),
        user: getTableColumns(user),
        ...getTableColumns(save)
      })
      .from(save)
      .innerJoin(shoeListing, eq(save.listingId, shoeListing.id))
      .innerJoin(user, eq(save.userId, user.id))
      .where(eq(save.userId, id));
    
    return rows ?? null;
  } catch (error) {
    console.error("Error fetching saves.", error);
    return null;
  }
}

export async function getSaveBySellerId(id: string) {
  try {
    const rows = await db
      .select({
        listing: getTableColumns(shoeListing),
        user: getTableColumns(user),
        ...getTableColumns(save)
      })
      .from(save)
      .innerJoin(shoeListing, eq(save.listingId, shoeListing.id))
      .innerJoin(user, eq(save.userId, user.id))
      .where(eq(shoeListing.userId, id));
    
    return rows ?? null;
  } catch (error) {
    console.error("Error fetching saves.", error);
    return null;
  }
}

export async function updateRating(data: UpdateRating, id: number) {
  try {
    await db 
      .update(rating)
      .set(data)
      .where(eq(rating.id, id))
      .returning({ id: rating.id });

    return getRatingById(id) ?? null;
  } catch (error) {
    console.error("Error updating rating.", error);
    return null
  }
}

export async function deleteRating(id: number) {
  try {
    await db 
      .delete(rating)
      .where(eq(rating.id, id))

    return "Rating successfully deleted.";
  } catch (error) {
    console.error("Error deleting rating.", error);
    return null
  }
}

export async function deleteSave(id: number) {
  try {
    await db 
      .delete(save)
      .where(eq(save.id, id))

    return "Save successfully removed.";
  } catch (error) {
    console.error("Error deleting save.", error);
    return null
  }
}

export async function getFavouriteListingsByUserId(userId: string) {
  try {
    const rows = await db
      .select({
        details: {
          id: save.id,
          model: shoe.model,
          brand: shoe.brand,
          size: shoeListing.size,
          price: shoeListing.value,
          colorway: shoeListing.colorway,
          savedAt: save.createdAt,
        },
        listing: getTableColumns(shoeListing),
        shoe: getTableColumns(shoe),
        user: getTableColumns(user),
      })
      .from(save)
      .innerJoin(shoeListing, eq(save.listingId, shoeListing.id))
      .innerJoin(shoe, eq(shoeListing.shoeId, shoe.id))
      .innerJoin(user, eq(shoeListing.userId, user.id))
      .where(and(eq(save.userId, userId), isNull(save.removedAt)));

    return rows;
  } catch (error) {
    console.error("Error fetching favourite listings.");
    return null;
  }
}

export async function saveFavouriteListing(userId: string, listingId: number) {
  try {
    const existing = await db
      .select({ id: save.id })
      .from(save)
      .where(
        and(
          eq(save.userId, userId),
          eq(save.listingId, listingId),
          isNull(save.removedAt),
        ),
      )
      .limit(1);

    if (existing[0]) {
      return existing[0];
    }

    const result = await db
      .insert(save)
      .values({ userId, listingId })
      .returning({ id: save.id });

    return result[0] ?? null;
  } catch (error) {
    console.error("Error saving favourite listing.");
    return null;
  }
}

export async function removeFavouriteListing(userId: string, listingId: number) {
  try {
    await db
      .delete(save)
      .where(and(eq(save.userId, userId), eq(save.listingId, listingId)));

    return true;
  } catch (error) {
    console.error("Error removing favourite listing.");
    return null;
  }
}

/**
 * Reviews written *about* a user, newest first, with the reviewer attached.
 *
 * `getRatingByRateeId` joins `user` twice under the same name, which Postgres
 * rejects — only the reviewer is needed here, so this aliases that one join.
 */
export async function getReviewsForUser(userId: string) {
  try {
    const rater = aliasedTable(user, 'rater');

    const rows = await db
      .select({
        id: rating.id,
        rating: rating.rating,
        comment: rating.comment,
        createdAt: rating.createdAt,
        rater: {
          id: rater.id,
          name: rater.name,
          image: rater.image,
        },
      })
      .from(rating)
      .innerJoin(rater, eq(rating.raterId, rater.id))
      .where(and(eq(rating.rateeId, userId), isNull(rating.deletedAt)))
      .orderBy(desc(rating.createdAt));

    return rows;
  } catch (error) {
    console.error("Error fetching reviews for user.", error);
    return null;
  }
}

/** Which of these transactions already carry a rating — one query for the whole set. */
export async function getRatedTransactionIds(transactionIds: number[]): Promise<Set<number>> {
  if (transactionIds.length === 0) {
    return new Set();
  }

  try {
    const rows = await db
      .select({ transactionId: rating.transactionId })
      .from(rating)
      .where(inArray(rating.transactionId, transactionIds));

    return new Set(
      rows
        .map((row) => row.transactionId)
        .filter((transactionId): transactionId is number => transactionId != null)
    );
  } catch (error) {
    console.error("Error fetching rated transactions.", error);
    return new Set();
  }
}

export async function checkIfTransactionIsRated(transactionId: number): Promise<boolean> {
  const existingRating = await db.query.rating.findFirst({
    where: eq(rating.transactionId, transactionId),
    columns: { id: true }, 
  });

  return !!existingRating;
}