import { Shopkeeper, ShopkeeperRace, ShopkeeperGender } from '../types';
import npcNames from '../data/npcs.json';

type NpcData = Record<ShopkeeperRace, {
  male:   string[];
  female: string[];
  family: string[];
}>;

export const SHOPKEEPER_RACES: ShopkeeperRace[] = ['human', 'dwarf', 'elf'];
const GENDERS: ShopkeeperGender[] = ['male', 'female'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function pickRandomRace(): ShopkeeperRace {
  return pick(SHOPKEEPER_RACES);
}

export function generateShopkeeper(race: ShopkeeperRace): Shopkeeper {
  const gender: ShopkeeperGender = pick(GENDERS);
  const pool = (npcNames as NpcData)[race];
  const firstName  = pick(pool[gender]);
  const familyName = pick(pool.family);
  return { name: `${firstName} ${familyName}`, race, gender };
}
