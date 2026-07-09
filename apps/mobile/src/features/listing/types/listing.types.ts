export type FavItem = {
  id: number;
  listingId: number;
  model: string;
  brand: string;
  size: string;
  price?: string;
  colorway: string;
  savedAt: Date;
  saved: boolean;
  imageUrl?: string;
};