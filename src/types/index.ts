export type Rarity =
  | 'Common'
  | 'Uncommon'
  | 'Rare'
  | 'Very Rare'
  | 'Legendary'
  | 'Artifact'
  | 'Varies';

export type ItemSource =
  | '5e 2014 SRD'
  | '5e 2024 SRD'
  | 'Level Up A5E'
  | 'Vault of Magic';

export type ShopPreset = 'village' | 'town' | 'city' | 'arcane' | 'custom';

export interface RarityDistribution {
  Common: number;
  Uncommon: number;
  Rare: number;
  'Very Rare': number;
  Legendary: number;
}

export interface MagicItem {
  id: string;
  name: string;
  rarity: string;
  type: string;
  attunement: boolean;
  source: ItemSource;
}

export interface ShopItem {
  key: string;
  item: MagicItem;
  quantity: number;
  price?: number;
  locked: boolean;
}

export interface ShopConfig {
  preset: ShopPreset;
  itemCount: number;
  rarityDistribution: RarityDistribution;
  sources: ItemSource[];
  itemTypes: string[];
  showPrices: boolean;
  priceMarkup: number;
}

export interface SavedShop {
  id: string;
  name: string;
  config: ShopConfig;
  items: ShopItem[];
  savedAt: string;
}
