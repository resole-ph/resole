import vanillaPuppeteer from 'puppeteer';
import { addExtra } from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { config } from 'dotenv';
import { createShoe, createShoePrice, getShoeByModelName, updateShoePrice } from './service';

config({ path: '../../.env' });

const puppeteer = addExtra(vanillaPuppeteer as any);

puppeteer.use(StealthPlugin());

export async function scrapeShoes(gender: string, category: string): Promise<any[]> {
  const shoes: any[] = [];
  
  const browser = await puppeteer.launch({ 
    headless: true
  });
  
  const page = await browser.newPage();
  page.setDefaultTimeout(600000);
  
  for (let i = 1; i <= 3; i++) {
    await page.goto(`${process.env.SCRAPE_SITE}/${gender}/shoes/${category}?p=${i}`, { 
      waitUntil: 'networkidle0' 
    });

    const rawShoes: any[] = await page.$$eval(".product-card", (items, cat) => {
      return items.map(item => {
        const model = item.querySelector(".product-item-link")?.textContent?.trim();
        if (!model) return null;

        const brand = item.querySelector(".product-brand")?.textContent?.trim();
        const priceAttr = item.querySelector(".old-price .price-wrapper")?.getAttribute("data-price-amount") || item.querySelector(".price-wrapper-container .price-wrapper")?.getAttribute("data-price-amount");
        const price = priceAttr ? Number(priceAttr.replace(">", "")) : 0;

        return {
          model,
          brand,
          category: cat, 
          price,
          source: "Foot Locker"
        };
      }).filter(Boolean);
    }, category); 

    shoes.push(...rawShoes);
  }

  await browser.close();

  return shoes;
}

export async function insertShoes(shoes: any[]) {
  for (const shoe of shoes) {
    if (!shoe) continue;

    const existingShoe = await getShoeByModelName(shoe.model);
    if (existingShoe) {
      await updateShoePrice({ price: shoe.price }, existingShoe.id);
      continue;
    } 

    const insertShoe = await createShoe({
      model: shoe.model,
      brand: shoe.brand,
      category: shoe.category,
      embedding: []
    });

    if (!insertShoe) continue;

    await createShoePrice({
      shoeId: insertShoe?.id,
      price: shoe.price,
      source: shoe.source
    })

  }
}
