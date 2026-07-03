import { NextResponse } from 'next/server';
import { 
  scrapeShoes,
  insertShoes
} from '@/features/shoe/services/scraper';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const gender = body.gender;
    const category = body.category;

    if (!gender) {
      return NextResponse.json({ message: 'Please specify gender' }, { status: 400 });
    }
    if (!category) {
      return NextResponse.json({ message: 'Please specify category' }, { status: 400 });
    }

    const scrapedShoes = await scrapeShoes(gender, category);
    if (!scrapeShoes || scrapeShoes.length === 0) {
      return NextResponse.json({ message: 'Failed to scrape shoes' }, { status: 400 });
    }

    await insertShoes(scrapedShoes);
    return NextResponse.json({ message: `${gender} ${category} shoe scraping successful` });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}