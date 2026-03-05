import { useState } from 'react';
import { ShopConfig, ShopPreset, ItemSource, RarityDistribution, ShopkeeperRace } from '../types';

const ALL_SOURCES: { id: ItemSource; label: string }[] = [
  { id: '5e 2014 SRD',   label: 'D&D 2014 SRD' },
  { id: '5e 2024 SRD',   label: 'D&D 2024 SRD' },
  { id: 'Level Up A5E',  label: 'Level Up A5E' },
  { id: 'Vault of Magic', label: 'Vault of Magic' },
];

const ALL_TYPES = [
  'Wondrous Item', 'Weapon', 'Armor', 'Ring',
  'Staff', 'Wand', 'Rod', 'Potion', 'Scroll',
];

const PRESETS: Record<ShopPreset, {
  label: string;
  description: string;
  distribution: RarityDistribution;
}> = {
  village: {
    label: 'Village Peddler',
    description: 'Mostly common goods',
    distribution: { Common: 60, Uncommon: 30, Rare: 9, 'Very Rare': 1, Legendary: 0 },
  },
  town: {
    label: 'Town Shop',
    description: 'A decent spread for adventurers',
    distribution: { Common: 40, Uncommon: 35, Rare: 20, 'Very Rare': 4, Legendary: 1 },
  },
  city: {
    label: 'City Emporium',
    description: 'Well-stocked arcane shop',
    distribution: { Common: 20, Uncommon: 30, Rare: 30, 'Very Rare': 15, Legendary: 5 },
  },
  arcane: {
    label: 'Arcane Tower',
    description: 'Rare and legendary items abound',
    distribution: { Common: 10, Uncommon: 20, Rare: 35, 'Very Rare': 25, Legendary: 10 },
  },
  custom: {
    label: 'Custom',
    description: 'Set your own distribution',
    distribution: { Common: 25, Uncommon: 25, Rare: 25, 'Very Rare': 15, Legendary: 10 },
  },
};

interface ThemeDef {
  id: string;
  label: string;
  emoji: string;
  description: string;
  itemTypes: string[];
}

const THEMES: ThemeDef[] = [
  { id: 'general',  label: 'General',        emoji: '🏪', description: 'All item types',              itemTypes: ALL_TYPES },
  { id: 'combat',   label: 'War Camp',        emoji: '⚔️', description: 'Weapons & armor',             itemTypes: ['Weapon', 'Armor'] },
  { id: 'temple',   label: 'Temple',          emoji: '⛪', description: 'Potions, scrolls & relics',   itemTypes: ['Potion', 'Scroll', 'Wondrous Item'] },
  { id: 'arcane',   label: 'Arcane Supplier', emoji: '🔮', description: 'Staves, wands & scrolls',     itemTypes: ['Staff', 'Wand', 'Rod', 'Scroll', 'Wondrous Item'] },
  { id: 'stealth',  label: 'Thieves Guild',   emoji: '🗡️', description: 'Utility & subtlety items',    itemTypes: ['Potion', 'Ring', 'Wondrous Item'] },
  { id: 'curio',    label: 'Curio Shop',      emoji: '🪄', description: 'Oddities & curiosities',      itemTypes: ['Ring', 'Wondrous Item', 'Rod'] },
];

const RARITY_KEYS: (keyof RarityDistribution)[] = [
  'Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary',
];

const RARITY_COLORS: Record<string, string> = {
  Common:      'text-zinc-300',
  Uncommon:    'text-green-400',
  Rare:        'text-blue-400',
  'Very Rare': 'text-purple-400',
  Legendary:   'text-orange-400',
};

/** Detect which theme matches the current itemTypes, if any. */
function detectTheme(itemTypes: string[]): string {
  const sorted = [...itemTypes].sort().join(',');
  const match = THEMES.find(t => [...t.itemTypes].sort().join(',') === sorted);
  return match?.id ?? '';
}

/** Map party level (1–20) to a shop preset. */
function levelToPreset(level: number): ShopPreset {
  if (level <= 4)  return 'village';
  if (level <= 10) return 'town';
  if (level <= 16) return 'city';
  return 'arcane';
}

interface ShopConfigProps {
  config: ShopConfig;
  onChange: (config: ShopConfig) => void;
  onGenerate: () => void;
  itemCount: number; // total items parsed
}

export default function ShopConfigPanel({ config, onChange, onGenerate, itemCount }: ShopConfigProps) {
  const [partyLevel, setPartyLevel] = useState(5);

  const update = (partial: Partial<ShopConfig>) => onChange({ ...config, ...partial });

  const handlePreset = (preset: ShopPreset) => {
    update({ preset, rarityDistribution: { ...PRESETS[preset].distribution } });
  };

  const handleDistributionChange = (key: keyof RarityDistribution, value: number) => {
    update({
      rarityDistribution: { ...config.rarityDistribution, [key]: Math.max(0, value) },
    });
  };

  const toggleSource = (source: ItemSource) => {
    const sources = config.sources.includes(source)
      ? config.sources.filter(s => s !== source)
      : [...config.sources, source];
    update({ sources });
  };

  const toggleType = (type: string) => {
    const itemTypes = config.itemTypes.includes(type)
      ? config.itemTypes.filter(t => t !== type)
      : [...config.itemTypes, type];
    update({ itemTypes });
  };

  const handleTheme = (theme: ThemeDef) => {
    update({ itemTypes: [...theme.itemTypes] });
  };

  const handleSuggestTier = () => {
    const preset = levelToPreset(partyLevel);
    update({ preset, rarityDistribution: { ...PRESETS[preset].distribution } });
  };

  const activeThemeId = detectTheme(config.itemTypes);
  const totalWeight = RARITY_KEYS.reduce((s, k) => s + config.rarityDistribution[k], 0);

  const canGenerate =
    config.sources.length > 0 &&
    config.itemTypes.length > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-5">

        {/* Party Level */}
        <section>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Party Level
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={20}
              value={partyLevel}
              onChange={e => setPartyLevel(Number(e.target.value))}
              className="flex-1 accent-amber-500"
            />
            <span className="w-6 text-center font-semibold text-zinc-200 text-sm">
              {partyLevel}
            </span>
          </div>
          <button
            onClick={handleSuggestTier}
            className="mt-2 w-full py-1.5 rounded-lg border border-zinc-700 bg-zinc-800/50 text-zinc-300 text-xs hover:bg-zinc-700 hover:text-zinc-100 transition-colors"
          >
            Suggest tier for level {partyLevel} →{' '}
            <span className="text-amber-400 font-medium">
              {PRESETS[levelToPreset(partyLevel)].label}
            </span>
          </button>
        </section>

        {/* Item count */}
        <section>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Item Count
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={4}
              max={20}
              value={config.itemCount}
              onChange={e => update({ itemCount: Number(e.target.value) })}
              className="flex-1 accent-amber-500"
            />
            <span className="w-8 text-center font-semibold text-zinc-200">
              {config.itemCount}
            </span>
          </div>
        </section>

        {/* Preset */}
        <section>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Shop Tier
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {(Object.keys(PRESETS) as ShopPreset[]).map(preset => (
              <button
                key={preset}
                onClick={() => handlePreset(preset)}
                className={`
                  text-left px-3 py-2 rounded-lg border text-sm transition-colors
                  ${config.preset === preset
                    ? 'border-gold-500 bg-gold-500/10 text-gold-300'
                    : 'border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800'
                  }
                `}
              >
                <span className="font-medium">{PRESETS[preset].label}</span>
                <span className="text-zinc-500 ml-2 text-xs">{PRESETS[preset].description}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Custom distribution */}
        {config.preset === 'custom' && (
          <section>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Rarity Weights
            </label>
            <div className="space-y-2">
              {RARITY_KEYS.map(rarity => {
                const pct = totalWeight > 0
                  ? Math.round((config.rarityDistribution[rarity] / totalWeight) * 100)
                  : 0;
                return (
                  <div key={rarity} className="flex items-center gap-2">
                    <span className={`text-xs w-20 flex-shrink-0 ${RARITY_COLORS[rarity]}`}>
                      {rarity}
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      value={config.rarityDistribution[rarity]}
                      onChange={e =>
                        handleDistributionChange(rarity, Number(e.target.value))
                      }
                      className="flex-1 accent-amber-500"
                    />
                    <span className="text-xs text-zinc-400 w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Shop Theme */}
        <section>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Shop Theme
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => handleTheme(theme)}
                title={theme.description}
                className={`
                  text-left px-2.5 py-2 rounded-lg border text-xs transition-colors
                  ${activeThemeId === theme.id
                    ? 'border-gold-500 bg-gold-500/10 text-gold-300'
                    : 'border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800'
                  }
                `}
              >
                <span className="mr-1.5">{theme.emoji}</span>
                <span className="font-medium">{theme.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-600 mt-1.5">Sets item type filter for the shop.</p>
        </section>

        {/* Shopkeeper Race */}
        <section>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Shopkeeper Race
          </label>
          <div className="flex flex-wrap gap-1.5">
            {([
              { id: 'random', label: 'Random' },
              { id: 'human',  label: 'Human'  },
              { id: 'dwarf',  label: 'Dwarf'  },
              { id: 'elf',    label: 'Elf'    },
            ] as { id: ShopkeeperRace | 'random'; label: string }[]).map(opt => (
              <button
                key={opt.id}
                onClick={() => update({ shopkeeperRace: opt.id })}
                className={`
                  px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors
                  ${config.shopkeeperRace === opt.id
                    ? 'border-gold-500 bg-gold-500/10 text-gold-300'
                    : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Sources */}
        <section>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Sources
          </label>
          <div className="space-y-1.5">
            {ALL_SOURCES.map(s => (
              <label key={s.id} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={config.sources.includes(s.id)}
                  onChange={() => toggleSource(s.id)}
                  className="w-4 h-4 rounded accent-amber-500"
                />
                <span className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">
                  {s.label}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Item types */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Item Types
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => update({ itemTypes: [...ALL_TYPES] })}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                All
              </button>
              <button
                onClick={() => update({ itemTypes: [] })}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                None
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {ALL_TYPES.map(type => {
              const active = config.itemTypes.includes(type);
              return (
                <label key={type} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleType(type)}
                    className="w-4 h-4 rounded accent-amber-500"
                  />
                  <span className="text-xs text-zinc-300 group-hover:text-zinc-100 transition-colors">
                    {type}
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        {/* Prices */}
        <section>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Prices
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={config.showPrices}
              onChange={e => update({ showPrices: e.target.checked })}
              className="w-4 h-4 rounded accent-amber-500"
            />
            <span className="text-sm text-zinc-300">Show prices</span>
          </label>

          {config.showPrices && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-zinc-400">Shop markup</span>
                <span className="text-xs font-semibold text-zinc-200">
                  {config.priceMarkup.toFixed(1)}×
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={3.0}
                step={0.1}
                value={config.priceMarkup}
                onChange={e => update({ priceMarkup: Number(e.target.value) })}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-xs text-zinc-600 mt-0.5">
                <span>0.5× discount</span>
                <span>3× premium</span>
              </div>
            </div>
          )}
        </section>

        <p className="text-xs text-zinc-600 pb-2">
          {itemCount.toLocaleString()} items loaded across all sources.
        </p>
      </div>

      {/* Generate button — sticky at bottom */}
      <div className="p-4 border-t border-zinc-800 no-print">
        <button
          onClick={onGenerate}
          disabled={!canGenerate}
          className={`
            w-full py-3 rounded-xl font-display text-base font-semibold tracking-wide
            transition-all active:scale-95
            ${canGenerate
              ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400 shadow-lg shadow-amber-900/30'
              : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }
          `}
        >
          Generate Shop
        </button>
      </div>
    </div>
  );
}
