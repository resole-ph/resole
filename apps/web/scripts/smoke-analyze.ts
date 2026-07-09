/**
 * Smoke test for the analyze pipeline's pricing engine — the exact functions the
 * POST /api/listings/analyze handler runs (getBaselinePriceByShoe +
 * calculateSuggestedPrice), exercised directly against the real database so the
 * result is deterministic (no Gemini vision non-determinism).
 *
 * Run from apps/web:  npx tsx scripts/smoke-analyze.ts
 */
import { sql } from '@/config/db';
import { getBaselinePriceByShoe, calculateSuggestedPrice } from '@/features/shoe/services/service';

// Same shape the route's analyzeAndPriceShoe orchestrator returns under `pricing`.
async function priceFor(brand: string, model: string, conditionScore: number, aiFallbackEstimate: number) {
  const { baselinePrice, matchedShoeId, similarity } = await getBaselinePriceByShoe(brand, model);
  const catalogHit = baselinePrice !== null;
  const baseline = catalogHit ? baselinePrice : aiFallbackEstimate;
  const suggestedPrice = calculateSuggestedPrice(baseline, conditionScore);

  return {
    query: { brand, model, conditionScore },
    pricing: {
      baselinePrice,
      matchedShoeId,
      similarity,
      conditionScore,
      suggestedPrice,
      priceSource: catalogHit ? 'catalog' : 'ai-estimate',
    },
    check:
      catalogHit && baselinePrice !== null
        ? `${baselinePrice} * (${conditionScore}/10) = ${Math.round(baselinePrice * (conditionScore / 10))}`
        : `no catalog match → fell back to AI estimate ${aiFallbackEstimate} * (${conditionScore}/10)`,
  };
}

async function main() {
  const cases: Array<[string, string, number, number]> = [
    ['Nike', 'Air Jordan 1 Retro High OG', 8, 9999], // exact catalog hit
    ['Nike', 'Jordan 1 High', 6, 9999],              // fuzzy — semantic vector match
    ['Adidas', 'Samba', 9, 9999],                    // fuzzy — semantic vector match
    ['Balenciaga', 'Triple S', 7, 45000],            // NOT in catalog → ai-estimate fallback
  ];

  for (const [brand, model, score, fallback] of cases) {
    const result = await priceFor(brand, model, score, fallback);
    console.log(JSON.stringify(result, null, 2));
    console.log('---');
  }

  await sql.end();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('Smoke test failed:', err);
  await sql.end();
  process.exit(1);
});
