import { ShopItem, ShopConfig } from '../types';
import ItemCard from './ItemCard';

interface ShopDisplayProps {
  shopName: string;
  items: ShopItem[];
  config: ShopConfig;
  onShopNameChange: (name: string) => void;
  onLockItem: (index: number) => void;
  onRegenerateItem: (index: number) => void;
  onSave: () => void;
  onExport: () => void;
  onRegenerateAll: () => void;
}

export default function ShopDisplay({
  shopName,
  items,
  config,
  onShopNameChange,
  onLockItem,
  onRegenerateItem,
  onSave,
  onExport,
  onRegenerateAll,
}: ShopDisplayProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Shop header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center gap-3 p-4 pb-3 border-b border-zinc-800 flex-shrink-0">
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

      {/* Stats bar */}
      <div className="no-print px-4 py-2 flex items-center gap-4 text-xs text-zinc-500 border-b border-zinc-800/60 flex-shrink-0">
        <span>{items.length} items</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 print:hidden">
          {items.map((si, idx) => (
            <ItemCard
              key={si.key}
              shopItem={si}
              showPrice={config.showPrices}
              onLock={() => onLockItem(idx)}
              onRegenerate={() => onRegenerateItem(idx)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
