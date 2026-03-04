const PRICE_RANGES: Record<string, [number, number]> = {
  Common: [50, 100],
  Uncommon: [101, 500],
  Rare: [501, 5000],
  'Very Rare': [5001, 50000],
  Legendary: [50001, 200000],
};

export function calculatePrice(rarity: string, markup: number): number {
  const range = PRICE_RANGES[rarity];
  if (!range) return 0;
  const [min, max] = range;
  const base = Math.random() * (max - min) + min;
  return roundPrice(base * markup, rarity);
}

function roundPrice(price: number, rarity: string): number {
  switch (rarity) {
    case 'Common':    return Math.round(price / 5) * 5;
    case 'Uncommon':  return Math.round(price / 10) * 10;
    case 'Rare':      return Math.round(price / 50) * 50;
    case 'Very Rare': return Math.round(price / 500) * 500;
    case 'Legendary': return Math.round(price / 1000) * 1000;
    default:          return Math.round(price);
  }
}

export function formatPrice(gp: number): string {
  return `${gp.toLocaleString()} gp`;
}
