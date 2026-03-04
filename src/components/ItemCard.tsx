import { ShopItem } from '../types';
import { formatPrice } from '../lib/pricing';

const RARITY_STYLES: Record<string, { badge: string; dot: string }> = {
  Common:      { badge: 'bg-zinc-700 text-zinc-300',          dot: 'text-zinc-400' },
  Uncommon:    { badge: 'bg-green-900/60 text-green-300',     dot: 'text-green-400' },
  Rare:        { badge: 'bg-blue-900/60 text-blue-300',       dot: 'text-blue-400' },
  'Very Rare': { badge: 'bg-purple-900/60 text-purple-300',   dot: 'text-purple-400' },
  Legendary:   { badge: 'bg-orange-900/60 text-orange-300',   dot: 'text-orange-400' },
  Artifact:    { badge: 'bg-red-900/60 text-red-300',         dot: 'text-red-400' },
  Varies:      { badge: 'bg-slate-700 text-slate-300',        dot: 'text-slate-400' },
};

interface ItemCardProps {
  shopItem: ShopItem;
  showPrice: boolean;
  onLock: () => void;
  onRegenerate: () => void;
}

export default function ItemCard({ shopItem, showPrice, onLock, onRegenerate }: ItemCardProps) {
  const { item, quantity, price, locked } = shopItem;
  const style = RARITY_STYLES[item.rarity] ?? RARITY_STYLES.Common;

  return (
    <div
      className={`
        relative flex flex-col bg-zinc-900 border rounded-xl p-4 gap-2 transition-all
        animate-fade-in
        ${locked
          ? 'border-gold-500/60 shadow-[0_0_0_1px_rgba(201,168,76,0.3)]'
          : 'border-zinc-800 hover:border-zinc-600'
        }
      `}
    >
      {/* Name row */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-zinc-100 leading-snug text-sm sm:text-base">
          {item.name}
        </h3>

        {/* Lock button */}
        <button
          onClick={onLock}
          title={locked ? 'Unlock item' : 'Lock item (keeps on regenerate)'}
          className={`
            flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-base
            transition-colors
            ${locked
              ? 'text-gold-400 hover:text-gold-300'
              : 'text-zinc-600 hover:text-zinc-400'
            }
          `}
        >
          {locked ? '🔒' : '🔓'}
        </button>
      </div>

      {/* Type */}
      <p className="text-xs text-zinc-400">{item.type}</p>

      {/* Rarity badge */}
      <div className="flex items-center gap-1.5">
        <span className={`text-xs ${style.dot}`}>◆</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.badge}`}>
          {item.rarity}
        </span>
      </div>

      {/* Footer: qty + price + regen */}
      <div className="flex items-center justify-between mt-1 pt-2 border-t border-zinc-800">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-zinc-400">
            Qty: <span className="text-zinc-200 font-medium">{quantity}</span>
          </span>
          {showPrice && price != null && (
            <span className="text-gold-400 font-medium">{formatPrice(price)}</span>
          )}
        </div>

        {/* Regenerate button */}
        <button
          onClick={onRegenerate}
          disabled={locked}
          title={locked ? 'Unlock to regenerate' : 'Roll a new item'}
          className={`
            w-7 h-7 flex items-center justify-center rounded-md text-base
            transition-colors
            ${locked
              ? 'text-zinc-700 cursor-not-allowed'
              : 'text-zinc-500 hover:text-amber-400 active:scale-90'
            }
          `}
        >
          ↺
        </button>
      </div>

      {/* Source label */}
      <p className="text-[10px] text-zinc-600 -mt-1">{item.source}</p>
    </div>
  );
}
