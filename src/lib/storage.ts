import { SavedShop } from '../types';

const KEY = 'dnd-magic-shop-saves';

export function loadSavedShops(): SavedShop[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedShop[]) : [];
  } catch {
    return [];
  }
}

export function persistShop(shop: SavedShop): void {
  const shops = loadSavedShops();
  const idx = shops.findIndex(s => s.id === shop.id);
  if (idx >= 0) {
    shops[idx] = shop;
  } else {
    shops.unshift(shop);
  }
  localStorage.setItem(KEY, JSON.stringify(shops));
}

export function removeShop(id: string): void {
  const shops = loadSavedShops().filter(s => s.id !== id);
  localStorage.setItem(KEY, JSON.stringify(shops));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
