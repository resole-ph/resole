/**
 * Seed a small shoe catalog (with embeddings) + baseline market prices so the
 * pgvector pricing engine has something to match against.
 *
 * Run from apps/web:  npx tsx scripts/seed-shoes.ts
 */
import { and, eq } from 'drizzle-orm';
import { db, sql } from '@/config/db';
import { shoe, shoePrice } from '@/db/schema';
import { generateEmbedding } from '@/features/shoe/services/service';

type Category = 'running' | 'basketball' | 'football' | 'casual' | 'other';

const CATALOG: Array<{
  brand: string;
  model: string;
  category: Category;
  co2Footprint: string;
  price: string; // baseline / brand-new market price in PHP
}> = [
  { brand: 'Nike', model: 'Air Force 1 Low', category: 'casual', co2Footprint: '12.5', price: '6495' },
  { brand: 'Nike', model: 'Air Jordan 1 Retro High OG', category: 'basketball', co2Footprint: '14.0', price: '11895' },
  { brand: 'Adidas', model: 'Samba OG', category: 'casual', co2Footprint: '10.5', price: '6500' },
  { brand: 'New Balance', model: '550', category: 'casual', co2Footprint: '11.0', price: '8995' },
  { brand: 'Converse', model: 'Chuck Taylor All Star', category: 'casual', co2Footprint: '8.0', price: '3990' },
];

async function main() {
  for (const item of CATALOG) {
    const existing = await db
      .select()
      .from(shoe)
      .where(and(eq(shoe.brand, item.brand), eq(shoe.model, item.model)))
      .limit(1);

    let shoeId: number;

    if (existing[0]) {
      shoeId = existing[0].id;
      console.log(`• exists: ${item.brand} ${item.model} (#${shoeId})`);
    } else {
      const embedding = await generateEmbedding(`${item.brand} ${item.model} ${item.category}`);
      const [row] = await db
        .insert(shoe)
        .values({
          brand: item.brand,
          model: item.model,
          category: item.category,
          co2Footprint: item.co2Footprint,
          embedding,
        })
        .returning();
      shoeId = row.id;
      console.log(`✓ inserted shoe: ${item.brand} ${item.model} (#${shoeId})`);
    }

    const existingPrice = await db
      .select()
      .from(shoePrice)
      .where(eq(shoePrice.shoeId, shoeId))
      .limit(1);

    if (existingPrice[0]) {
      console.log(`    price exists: PHP ${existingPrice[0].price}`);
    } else {
      await db.insert(shoePrice).values({ shoeId, price: item.price, source: 'seed' });
      console.log(`    + baseline price: PHP ${item.price}`);
    }
  }

  console.log('\nSeed complete.');
  await sql.end();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('Seed failed:', err);
  await sql.end();
  process.exit(1);
});
