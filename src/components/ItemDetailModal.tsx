import { useEffect } from 'react';
import { ShopItem } from '../types';
import { formatPrice } from '../lib/pricing';

const RARITY_STYLES: Record<string, { badge: string; heading: string; border: string }> = {
  Common:      { badge: 'bg-zinc-700 text-zinc-300',        heading: 'text-zinc-300',   border: 'border-zinc-600' },
  Uncommon:    { badge: 'bg-green-900/60 text-green-300',   heading: 'text-green-300',  border: 'border-green-700/50' },
  Rare:        { badge: 'bg-blue-900/60 text-blue-300',     heading: 'text-blue-300',   border: 'border-blue-700/50' },
  'Very Rare': { badge: 'bg-purple-900/60 text-purple-300', heading: 'text-purple-300', border: 'border-purple-700/50' },
  Legendary:   { badge: 'bg-orange-900/60 text-orange-300', heading: 'text-orange-300', border: 'border-orange-700/50' },
  Artifact:    { badge: 'bg-red-900/60 text-red-300',       heading: 'text-red-300',    border: 'border-red-700/50' },
  Varies:      { badge: 'bg-slate-700 text-slate-300',      heading: 'text-slate-300',  border: 'border-slate-600' },
};

// Render inline markdown: **bold** and _italic_
function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('_') && part.endsWith('_')) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

interface ItemDetailModalProps {
  shopItem: ShopItem;
  showPrice: boolean;
  onClose: () => void;
}

export default function ItemDetailModal({ shopItem, showPrice, onClose }: ItemDetailModalProps) {
  const { item, quantity, price } = shopItem;
  const style = RARITY_STYLES[item.rarity] ?? RARITY_STYLES.Common;

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const paragraphs = item.description
    ? item.description.split('\n\n').filter(p => p.trim())
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print"
      role="dialog"
      aria-modal="true"
      aria-label={item.name}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className={`
          relative bg-zinc-900 border ${style.border} rounded-2xl
          w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl
          animate-fade-in
        `}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <h2 className={`font-display text-xl font-semibold leading-tight ${style.heading}`}>
              {item.name}
            </h2>
            <button
              onClick={onClose}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors text-xl leading-none mt-0.5"
            >
              ×
            </button>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${style.badge}`}>
              {item.rarity}
            </span>
            <span className="text-xs text-zinc-400">{item.type}</span>
            {item.attunement && (
              <>
                <span className="text-zinc-700">·</span>
                <span className="text-xs text-amber-400/80">Requires attunement</span>
              </>
            )}
          </div>

          {/* Qty + Price row */}
          <div className="flex items-center gap-4 mt-3 text-sm">
            <span className="text-zinc-400">
              In stock: <span className="text-zinc-200 font-medium">{quantity}</span>
            </span>
            {showPrice && price != null && (
              <span className="text-gold-400 font-semibold">{formatPrice(price)}</span>
            )}
          </div>
        </div>

        {/* Description — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {paragraphs.length > 0 ? (
            paragraphs.map((para, i) => (
              <p key={i} className="text-zinc-300 text-sm leading-relaxed">
                <InlineText text={para} />
              </p>
            ))
          ) : (
            <p className="text-zinc-500 text-sm italic">No description available.</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 flex-shrink-0">
          <p className="text-xs text-zinc-600">{item.source}</p>
        </div>
      </div>
    </div>
  );
}
