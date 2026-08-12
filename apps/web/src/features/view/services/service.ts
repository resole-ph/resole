import { db } from '@/config/db';
import { eq } from 'drizzle-orm';
import { listingView, profileView, shoeListing } from '@/db/schema';
import { ListingView, CreateListingView, ProfileView, CreateProfileView } from '../types/types';
import { getSaveBySellerId } from '@/features/user-action/services/service';

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
  fourteenDaysAgo.setDate(now.getDate() - 14);
  return date > fourteenDaysAgo && date <= sevenDaysAgo;
}

function calculateTimeframeMetrics(dates: { createdAt: Date }[]) {
  let thisWeek = 0;
  let lastWeek = 0;

  for (const item of dates) {
    if (isWithinSevenDays(item.createdAt)) {
      thisWeek++;
    } else if (isWithinPreviousSevenDays(item.createdAt)) {
      lastWeek++;
    }
  }

  return {
    total: dates.length,
    thisWeek,
    lastWeek
  };
}


export async function createListingView(data: CreateListingView) {
  try {
    const result = await db.insert(listingView).values(data).returning();
    return result[0] as ListingView ?? null;
  } catch (error) {
    console.error("Error creating listing view.", error);
    return null;
  }
}

export async function createProfileView(data: CreateProfileView) {
  try {
    const result = await db.insert(profileView).values(data).returning();
    return result[0] as ProfileView ?? null;
  } catch (error) {
    console.error("Error creating profile view.", error);
    return null;
  }
}

export async function getListingViewsBySellerId(id: string) {
  try {
    const rows = await db
      .select({ createdAt: listingView.createdAt }) 
      .from(listingView)
      .innerJoin(shoeListing, eq(shoeListing.id, listingView.listingId))
      .where(eq(shoeListing.userId, id));

    return calculateTimeframeMetrics(rows);
  } catch (error) {
    console.error("Error fetching listing views.", error);
    return null;
  }
}

export async function getProfileViewsByProfileUserId(id: string) {
  try {
    const rows = await db
      .select({ createdAt: profileView.createdAt })
      .from(profileView)
      .where(eq(profileView.profileUserId, id));

    return calculateTimeframeMetrics(rows);
  } catch (error) {
    console.error("Error fetching profile views.", error);
    return null;
  }
}

export async function getProfileListingSavesBySellerId(id: string) {
  try {
    const rows = await getSaveBySellerId(id);
    
    if (!rows || rows.length === 0) {
      return { total: 0, thisWeek: 0, lastWeek: 0 };
    }
    
    return calculateTimeframeMetrics(rows);
  } catch (error) {
    console.error("Error fetching profile listing saves.", error);
    return null;
  }
}