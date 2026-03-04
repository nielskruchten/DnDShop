import { SavedShop } from '../types';

interface SavedShopsProps {
  shops: SavedShop[];
  onLoad: (shop: SavedShop) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function SavedShops({ shops, onLoad, onDelete, onClose }: SavedShopsProps) {
  return (
    <div className="fixed inset-0 z-50 flex no-print" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="flex-1 bg-black/60"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="w-80 max-w-full bg-zinc-900 border-l border-zinc-800 flex flex-col animate-slide-in">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <h2 className="font-display text-gold-400 font-semibold">Saved Shops</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors text-lg"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {shops.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">
              No saved shops yet. Generate a shop and click Save.
            </p>
          ) : (
            shops.map(shop => (
              <div
                key={shop.id}
                className="bg-zinc-800 rounded-xl p-3 border border-zinc-700 hover:border-zinc-600 transition-colors"
              >
                <p className="font-semibold text-zinc-100 text-sm truncate">
                  {shop.name || 'Unnamed Shop'}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {shop.items.length} items ·{' '}
                  {new Date(shop.savedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>

                <div className="flex gap-2 mt-2.5">
                  <button
                    onClick={() => { onLoad(shop); onClose(); }}
                    className="flex-1 py-1.5 rounded-lg bg-amber-500 text-zinc-950 text-xs font-semibold hover:bg-amber-400 active:bg-amber-600 transition-colors"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${shop.name || 'this shop'}"?`)) {
                        onDelete(shop.id);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-700 text-zinc-300 text-xs hover:bg-red-900/60 hover:text-red-300 active:bg-red-900 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
