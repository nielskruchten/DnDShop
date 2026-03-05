import { useState } from 'react';
import { ShopItem, ShopConfig, Shopkeeper } from '../types';
import ItemCard from './ItemCard';

const FILTER_RARITIES = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary'];

const RARITY_PILL: Record<string, { label: string; active: string; inactive: string }> = {
  Common:      { label: 'C',  active: 'bg-zinc-600 text-zinc-100 border-zinc-500',         inactive: 'bg-transparent text-zinc-500 border-zinc-700' },
  Uncommon:    { label: 'U',  active: 'bg-green-900/70 text-green-300 border-green-700/60', inactive: 'bg-transparent text-zinc-500 border-zinc-700' },
  Rare:        { label: 'R',  active: 'bg-blue-900/70 text-blue-300 border-blue-700/60',    inactive: 'bg-transparent text-zinc-500 border-zinc-700' },
  'Very Rare': { label: 'VR', active: 'bg-purple-900/70 text-purple-300 border-purple-700/60', inactive: 'bg-transparent text-zinc-500 border-zinc-700' },
  Legendary:   { label: 'L',  active: 'bg-orange-900/70 text-orange-300 border-orange-700/60', inactive: 'bg-transparent text-zinc-500 border-zinc-700' },
};

const RACE_LABEL: Record<string, string> = {
  human: 'Human',
  dwarf: 'Dwarf',
  elf:   'Elf',
};

interface ShopDisplayProps {
  shopName: string;
  items: ShopItem[];
  config: ShopConfig;
  shopkeeper: Shopkeeper | null;
  onShopNameChange: (name: string) => void;
  onLockItem: (index: number) => void;
  onRegenerateItem: (index: number) => void;
  onSave: () => void;
  onExport: () => void;
  onRegenerateAll: () => void;
  onViewDetail: (item: ShopItem) => void;
  onRerollShopkeeper: () => void;
}

export default function ShopDisplay({
  shopName,
  items,
  config,
  shopkeeper,
  onShopNameChange,
  onLockItem,
  onRegenerateItem,
  onSave,
  onExport,
  onRegenerateAll,
  onViewDetail,
  onRerollShopkeeper,
}: ShopDisplayProps) {
  const [search, setSearch] = useState('');
  const [visibleRarities, setVisibleRarities] = useState<Set<string>>(
    new Set(FILTER_RARITIES),
  );

  const allSelected = FILTER_RARITIES.every(r => visibleRarities.has(r));

  const toggleRarity = (rarity: string) => {
    setVisibleRarities(prev => {
      const next = new Set(prev);
      if (next.has(rarity)) next.delete(rarity);
      else next.add(rarity);
      return next;
    });
  };

  const resetFilters = () => {
    setSearch('');
    setVisibleRarities(new Set(FILTER_RARITIES));
  };

  const filtered = items.filter(si => {
    const matchesSearch =
      search === '' || si.item.name.toLowerCase().includes(search.toLowerCase());
    const matchesRarity = allSelected || visibleRarities.has(si.item.rarity);
    return matchesSearch && matchesRarity;
  });

  const isFiltered = search !== '' || !allSelected;

  return (
    <div className="flex flex-col h-full">
      {/* Shop header */}
      <div className="no-print flex flex-col gap-1 p-4 pb-3 border-b border-zinc-800 flex-shrink-0">
        {/* Row 1: name + action buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <input
            type="text"
            value={shopName}
            onChange={e => onShopNameChange(e.target.value)}
            placeholder="Shop name…"
            className="flex-1 bg-transparent border-b border-zinc-700 focus:border-gold-500 outline-none text-xl font-display text-zinc-100 placeholder-zinc-600 pb-0.5 transition-colors"
          />

          <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onRegenerateAll}
            title="Regenerate all unlocked items"
            className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 hover:text-zinc-100 active:bg-zinc-600 transition-colors"
          >
            ↺ Reroll
          </button>
          <button
            onClick={onSave}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 hover:text-zinc-100 active:bg-zinc-600 transition-colors"
          >
            Save
          </button>
          <button
            onClick={onExport}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-sm border border-amber-500/30 hover:bg-amber-500/30 active:bg-amber-500/40 transition-colors"
          >
            Export
          </button>
          </div>
        </div>

        {/* Row 2: shopkeeper */}
        {shopkeeper && (
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm text-zinc-300 font-medium">{shopkeeper.name}</span>
            <span className="text-zinc-700">·</span>
            <span className="text-xs text-zinc-500 capitalize">{RACE_LABEL[shopkeeper.race]}</span>
            <span className="text-zinc-700">·</span>
            <span className="text-xs text-zinc-500 capitalize">{shopkeeper.gender}</span>
            <button
              onClick={onRerollShopkeeper}
              title="Reroll shopkeeper name"
              className="ml-1 w-6 h-6 flex items-center justify-center rounded-md text-zinc-600 hover:text-amber-400 hover:bg-zinc-800 transition-colors text-sm"
            >
              🎲
            </button>
          </div>
        )}
      </div>

      {/* Filter bar */}
      <div className="no-print px-4 py-2.5 flex flex-col sm:flex-row sm:items-center gap-2 border-b border-zinc-800/60 flex-shrink-0">
        {/* Search input */}
        <div className="relative flex-1 min-w-0">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">⌕</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search items…"
            className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-lg pl-7 pr-3 py-1.5 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Rarity pills */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {FILTER_RARITIES.map(rarity => {
            const pill = RARITY_PILL[rarity];
            const isActive = visibleRarities.has(rarity);
            return (
              <button
                key={rarity}
                onClick={() => toggleRarity(rarity)}
                title={rarity}
                className={`
                  h-7 min-w-[28px] px-2 rounded-md border text-xs font-semibold transition-colors
                  ${isActive ? pill.active : pill.inactive}
                `}
              >
                {pill.label}
              </button>
            );
          })}
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="h-7 px-2 rounded-md text-xs text-zinc-500 hover:text-zinc-300 transition-colors ml-0.5"
              title="Clear filters"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="no-print px-4 py-1.5 flex items-center gap-3 text-xs text-zinc-500 flex-shrink-0">
        {isFiltered ? (
          <span className="text-amber-400/70">
            Showing {filtered.length} of {items.length}
          </span>
        ) : (
          <span>{items.length} items</span>
        )}
        <span>·</span>
        <span>{items.filter(i => i.locked).length} locked</span>
        {config.showPrices && (
          <>
            <span>·</span>
            <span>{config.priceMarkup.toFixed(1)}× markup</span>
          </>
        )}
      </div>

      {/* Item grid — scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Print header */}
        <div id="print-content" className="hidden print:block">
          <h1 className="font-display text-2xl font-bold">
            {shopName || 'Magic Item Shop'}
          </h1>
          <p>Generated with DnD Magic Item Shop</p>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Type</th>
                <th>Rarity</th>
                <th>Qty</th>
                {config.showPrices && <th>Price</th>}
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {items.map(si => (
                <tr key={si.key}>
                  <td>{si.item.name}</td>
                  <td>{si.item.type}</td>
                  <td>{si.item.rarity}</td>
                  <td>{si.quantity}</td>
                  {config.showPrices && (
                    <td>{si.price != null ? `${si.price.toLocaleString()} gp` : '—'}</td>
                  )}
                  <td>{si.item.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Screen grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 print:hidden">
            {filtered.map((si, _) => {
              const realIdx = items.indexOf(si);
              return (
                <ItemCard
                  key={si.key}
                  shopItem={si}
                  showPrice={config.showPrices}
                  onLock={() => onLockItem(realIdx)}
                  onRegenerate={() => onRegenerateItem(realIdx)}
                  onViewDetail={() => onViewDetail(si)}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center print:hidden">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-zinc-400 text-sm">No items match your filters.</p>
            <button
              onClick={resetFilters}
              className="mt-3 text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
