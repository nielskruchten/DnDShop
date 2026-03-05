import { MagicItem, ShopConfig, ShopItem, RarityDistribution } from '../types';
import { calculatePrice } from './pricing';

const GENERATABLE_RARITIES = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary'];

export function generateShop(
  config: ShopConfig,
  allItems: MagicItem[],
  excludeIds: Set<string> = new Set(),
): ShopItem[] {
  const pool = buildPool(config, allItems, excludeIds);
  const byRarity = groupByRarity(pool);
  const result: ShopItem[] = [];
  const usedIds = new Set(excludeIds);

  for (let i = 0; i < config.itemCount; i++) {
    const rarity = rollRarity(config.rarityDistribution);
    const available = (byRarity[rarity] ?? []).filter(item => !usedIds.has(item.id));

    let chosen: MagicItem | null = null;

    if (available.length > 0) {
      chosen = available[Math.floor(Math.random() * available.length)];
    } else {
      // Fallback: pick any available item regardless of rarity
      const fallback = pool.filter(item => !usedIds.has(item.id));
      if (fallback.length === 0) break;
      chosen = fallback[Math.floor(Math.random() * fallback.length)];
    }

    usedIds.add(chosen.id);
    result.push(makeShopItem(chosen, config));
  }

  return result;
}

export function generateSingleItem(
  targetRarity: string,
  config: ShopConfig,
  allItems: MagicItem[],
  excludeIds: Set<string>,
): ShopItem | null {
  const pool = buildPool(config, allItems, excludeIds).filter(
    item => item.rarity === targetRarity,
  );
  if (pool.length === 0) return null;
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  return makeShopItem(chosen, config);
}

function buildPool(
  config: ShopConfig,
  allItems: MagicItem[],
  excludeIds: Set<string>,
): MagicItem[] {
  return allItems.filter(
    item =>
      config.sources.includes(item.source) &&
      config.itemTypes.includes(item.type) &&
      GENERATABLE_RARITIES.includes(item.rarity) &&
      !excludeIds.has(item.id),
  );
}

function makeShopItem(item: MagicItem, config: ShopConfig): ShopItem {
  return {
    key: `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    item,
    quantity: rollQuantity(item.rarity),
    price: config.showPrices ? calculatePrice(item.rarity, config.priceMarkup) : undefined,
    locked: false,
  };
}

function rollQuantity(rarity: string): number {
  switch (rarity) {
    case 'Common':   return Math.floor(Math.random() * 4) + 1;
    case 'Uncommon': return Math.floor(Math.random() * 3) + 1;
    case 'Rare':     return Math.floor(Math.random() * 2) + 1;
    default:         return 1;
  }
}

function rollRarity(distribution: RarityDistribution): string {
  const entries = (Object.entries(distribution) as [string, number][]).filter(
    ([, w]) => w > 0,
  );
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * total;
  for (const [rarity, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return rarity;
  }
  return entries[0][0];
}

function groupByRarity(items: MagicItem[]): Record<string, MagicItem[]> {
  return items.reduce(
    (acc, item) => {
      (acc[item.rarity] ??= []).push(item);
      return acc;
    },
    {} as Record<string, MagicItem[]>,
  );
}
