import { db } from '@/config/db';
import { eq, getTableColumns, isNull } from 'drizzle-orm';
import { listingView, profileView, save, shoeListing } from '@/db/schema';
import { ListingView, CreateListingView, ProfileView, CreateProfileView } from '../types/types';
import { getSaveByUserId } from '@/features/user-action/services/service';

function isWithinSevenDays(date: Date) {
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  return date > sevenDaysAgo && date <= now;
}

function isWithinPreviousSevenDays(date: Date) {
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(now.getDate() - 14)

  return date > fourteenDaysAgo && date <= sevenDaysAgo;
}

export async function createListingView(data: CreateListingView) {
  try {
    const result = await db
      .insert(listingView)
      .values(data)
      .returning();

    return result[0] as ListingView ?? null;
  } catch (error) {
    console.error("Error creating listing view.", error);
    return null;
  }
}

export async function createProfileView(data: CreateProfileView) {
  try {
    const result = await db
      .insert(profileView)
      .values(data)
      .returning();

    return result[0] as ProfileView ?? null;
  } catch (error) {
    console.error("Error creating profile view.", error);
    return null;
  }
}

export async function getListingViewsBySellerId(id: string) {
  try {
    const rows = await db
      .select({
        listing: getTableColumns(shoeListing),
        ...getTableColumns(listingView)
      })
      .from(listingView)
      .innerJoin(shoeListing, eq(shoeListing.id, listingView.listingId))
      .where(eq(shoeListing.userId, id));

    if (!rows) return null;

    const thisWeekCount = rows.reduce<number>((acc, item) => {
      if (isWithinSevenDays(item.createdAt)) {
        acc++;
      }

      return acc;
    }, 0);

    const lastWeekCount = rows.reduce<number>((acc, item) => {
      if (isWithinPreviousSevenDays(item.createdAt)) {
        acc++;
      }

      return acc;
    }, 0);
    
    return {
      total: rows.length,
      thisWeek: thisWeekCount,
      lastWeek: lastWeekCount
    }
  } catch (error) {
    console.error("Error fetching listing views.", error);
    return null;
  }
}

export async function getProfileViewsByProfileUserId(id: string) {
  try {
    const rows = await db
      .select()
      .from(profileView)
      .where(eq(profileView.profileUserId, id));

    if (!rows) return null;
    
    const thisWeekCount = rows.reduce<number>((acc, item) => {
      if (isWithinSevenDays(item.createdAt)) {
        acc++;
      }

      return acc;
    }, 0);

    const lastWeekCount = rows.reduce<number>((acc, item) => {
      if (isWithinPreviousSevenDays(item.createdAt)) {
        acc++;
      }

      return acc;
    }, 0);
    
    return {
      total: rows.length,
      thisWeek: thisWeekCount,
      lastWeek: lastWeekCount
    }
  } catch (error) {
    console.error("Error fetching profile views.", error);
    return null;
  }
}

export async function getProfileListingSavesBySellerId(id: string) {
  try {
    const rows = await getSaveByUserId(id);

    if (!rows) return null;
    
    const thisWeekCount = rows.reduce<number>((acc, item) => {
      if (isWithinSevenDays(item.createdAt)) {
        acc++;
      }

      return acc;
    }, 0);

    const lastWeekCount = rows.reduce<number>((acc, item) => {
      if (isWithinPreviousSevenDays(item.createdAt)) {
        acc++;
      }

      return acc;
    }, 0);
    
    return {
      total: rows.length,
      thisWeek: thisWeekCount,
      lastWeek: lastWeekCount
    }
  } catch (error) {
    console.error("Error fetching profile listing saves.", error);
    return null;
  }
}