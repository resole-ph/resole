import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/request-auth';
import { db } from '@/config/db';
import { and, eq, sql } from 'drizzle-orm';
import { shoe, shoeListing } from '@/db/schema';
import { 
  generateEmbedding,
  getAllShoeListing,
  getAllShoeListingForSale,
  getAllShoeListingForSwap
} from '@/features/shoe/services/service';

export async function GET(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const section = searchParams.get('section');

  let shoeListings;
  
  switch (section) {
    case 'sale-board':
      shoeListings = await getAllShoeListingForSale();
      break;
    case 'swap-board':
      shoeListings = await getAllShoeListingForSwap();
      break;
    default:
      shoeListings = await getAllShoeListing();
      break;
  }

  if (!shoeListings || shoeListings.length === 0) {
    return NextResponse.json({ error: 'Shoe listings not found' }, { status: 404 });
  }

  return NextResponse.json({ shoeListings });
}

export async function POST(request: Request) {
  const currentUser = await getAuthenticatedUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
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
    } = body;

    if (!brand || !model || !value || !colorway || !size || !conditionScore || !imageUrlTop || !imageUrlSide || !imageUrlSole || !imageUrlInsole) {
      return NextResponse.json({ error: 'Missing required listing information' }, { status: 400 });
    }

    const priceValue = Number.parseFloat(value.toString());
    const sizeValue = Number.parseFloat(size.toString());
    const scoreValue = Number.parseFloat(conditionScore.toString());

    if (Number.isNaN(priceValue) || priceValue <= 0 || Number.isNaN(sizeValue) || sizeValue <= 0 || Number.isNaN(scoreValue) || scoreValue <= 0) {
      return NextResponse.json({ error: 'Invalid numeric values provided' }, { status: 400 });
    }

    const brandStr = brand.trim();
    const modelStr = model.trim();

    let catalogShoeId: number;

    const existingShoes = await db
      .select()
      .from(shoe)
      .where(
        and(
          eq(sql`lower(${shoe.brand})`, brandStr.toLowerCase()),
          eq(sql`lower(${shoe.model})`, modelStr.toLowerCase())
        )
      )
      .limit(1);

    if (existingShoes.length > 0) {
      catalogShoeId = existingShoes[0].id;
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
        userId: currentUser.user.id,
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

    return NextResponse.json({ listing: newListing });
  } catch (error) {
    console.error('Error creating shoe listing:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}