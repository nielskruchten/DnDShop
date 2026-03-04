import { useState, useEffect, useCallback } from 'react';
import { ShopConfig, ShopItem, SavedShop, MagicItem, ShopPreset, RarityDistribution } from './types';
import { generateShop, generateSingleItem } from './lib/generator';
import { loadSavedShops, persistShop, removeShop, generateId } from './lib/storage';
import Header from './components/Header';
import ShopConfigPanel from './components/ShopConfig';
import ShopDisplay from './components/ShopDisplay';
import SavedShops from './components/SavedShops';
import ExportModal from './components/ExportModal';
import ItemDetailModal from './components/ItemDetailModal';

const DEFAULT_DISTRIBUTION: RarityDistribution = {
  Common: 40,
  Uncommon: 35,
  Rare: 20,
  'Very Rare': 4,
  Legendary: 1,
};

const DEFAULT_CONFIG: ShopConfig = {
  preset: 'town' as ShopPreset,
  itemCount: 12,
  rarityDistribution: DEFAULT_DISTRIBUTION,
  sources: ['5e 2014 SRD', '5e 2024 SRD', 'Level Up A5E', 'Vault of Magic'],
  itemTypes: [],
  showPrices: true,
  priceMarkup: 1.0,
};

export default function App() {
  const [allItems, setAllItems] = useState<MagicItem[]>([]);
  const [config, setConfig] = useState<ShopConfig>(DEFAULT_CONFIG);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [shopName, setShopName] = useState('');
  const [savedShops, setSavedShops] = useState<SavedShop[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);

  // Load item data on mount
  useEffect(() => {
    import('./data/items.json')
      .then(mod => {
        setAllItems(mod.default as MagicItem[]);
      })
      .catch(() => {
        setLoadError(
          'Could not load items.json. Run "npm run parse" first, then restart the dev server.',
        );
      });
    setSavedShops(loadSavedShops());
  }, []);

  const handleGenerate = useCallback(() => {
    if (allItems.length === 0) return;

    const locked = shopItems.filter(si => si.locked);
    const lockedIds = new Set(locked.map(si => si.item.id));
    const slotsToFill = config.itemCount - locked.length;

    const newItems = generateShop({ ...config, itemCount: slotsToFill }, allItems, lockedIds);

    // Merge: locked items keep their positions, new items fill the rest
    const result: ShopItem[] = [];
    let newIdx = 0;
    for (let i = 0; i < config.itemCount; i++) {
      const existing = shopItems[i];
      if (existing?.locked) {
        result.push(existing);
      } else if (newIdx < newItems.length) {
        result.push(newItems[newIdx++]);
      }
    }
    setShopItems(result);
    // Close config panel on mobile after generating
    setShowConfig(false);
  }, [allItems, config, shopItems]);

  const handleLockItem = useCallback((index: number) => {
    setShopItems(prev =>
      prev.map((si, i) => (i === index ? { ...si, locked: !si.locked } : si)),
    );
  }, []);

  const handleRegenerateItem = useCallback(
    (index: number) => {
      const current = shopItems[index];
      if (!current || current.locked) return;

      const existingIds = new Set(shopItems.map(si => si.item.id));
      existingIds.delete(current.item.id);

      const newItem = generateSingleItem(
        current.item.rarity,
        config,
        allItems,
        existingIds,
      );
      if (!newItem) return;

      setShopItems(prev => prev.map((si, i) => (i === index ? newItem : si)));
    },
    [shopItems, config, allItems],
  );

  const handleSave = useCallback(() => {
    if (shopItems.length === 0) return;
    const name = shopName.trim() || 'Unnamed Shop';
    const shop: SavedShop = {
      id: generateId(),
      name,
      config,
      items: shopItems,
      savedAt: new Date().toISOString(),
    };
    persistShop(shop);
    setSavedShops(loadSavedShops());
  }, [shopItems, shopName, config]);

  const handleLoadShop = useCallback((shop: SavedShop) => {
    setConfig(shop.config);
    setShopItems(shop.items);
    setShopName(shop.name);
  }, []);

  const handleDeleteShop = useCallback((id: string) => {
    removeShop(id);
    setSavedShops(loadSavedShops());
  }, []);

  if (loadError) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-8">
        <div className="bg-zinc-900 border border-red-800 rounded-2xl p-8 max-w-md text-center">
          <p className="text-4xl mb-4">⚠️</p>
          <h2 className="font-display text-red-400 text-lg font-semibold mb-2">Setup Required</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-950">
      <Header
        onShowSaved={() => setShowSaved(true)}
        onToggleConfig={() => setShowConfig(v => !v)}
        configVisible={showConfig}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Config panel */}
        <aside
          className={`
            flex-shrink-0 w-72 border-r border-zinc-800 bg-zinc-950
            flex flex-col overflow-hidden
            md:flex
            ${showConfig ? 'flex absolute inset-0 z-20 w-full sm:w-80 sm:relative sm:inset-auto' : 'hidden'}
          `}
        >
          <ShopConfigPanel
            config={config}
            onChange={setConfig}
            onGenerate={handleGenerate}
            itemCount={allItems.length}
          />
        </aside>

        {/* Shop display */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {shopItems.length > 0 ? (
            <ShopDisplay
              shopName={shopName}
              items={shopItems}
              config={config}
              onShopNameChange={setShopName}
              onLockItem={handleLockItem}
              onRegenerateItem={handleRegenerateItem}
              onSave={handleSave}
              onExport={() => setShowExport(true)}
              onRegenerateAll={handleGenerate}
              onViewDetail={setSelectedItem}
            />
          ) : (
            <EmptyState
              loaded={allItems.length > 0}
              onGenerate={handleGenerate}
              onShowConfig={() => setShowConfig(true)}
            />
          )}
        </main>
      </div>

      {/* Overlays */}
      {showSaved && (
        <SavedShops
          shops={savedShops}
          onLoad={handleLoadShop}
          onDelete={handleDeleteShop}
          onClose={() => setShowSaved(false)}
        />
      )}
      {showExport && (
        <ExportModal
          shopName={shopName}
          items={shopItems}
          config={config}
          onClose={() => setShowExport(false)}
        />
      )}
      {selectedItem && (
        <ItemDetailModal
          shopItem={selectedItem}
          showPrice={config.showPrices}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

function EmptyState({
  loaded,
  onGenerate,
  onShowConfig,
}: {
  loaded: boolean;
  onGenerate: () => void;
  onShowConfig: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <p className="text-6xl mb-6 select-none">⚔️</p>
      <h2 className="font-display text-2xl text-gold-400 font-semibold mb-2">
        No shop generated yet
      </h2>
      <p className="text-zinc-400 text-sm mb-8 max-w-sm">
        {loaded
          ? 'Configure your shop on the left and hit Generate.'
          : 'Loading item data…'}
      </p>
      {loaded && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onGenerate}
            className="px-6 py-3 rounded-xl bg-amber-500 text-zinc-950 font-display font-semibold hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-amber-900/30"
          >
            Generate Shop
          </button>
          <button
            onClick={onShowConfig}
            className="px-6 py-3 rounded-xl bg-zinc-800 text-zinc-300 font-medium hover:bg-zinc-700 active:bg-zinc-600 transition-colors md:hidden"
          >
            Open Config
          </button>
        </div>
      )}
    </div>
  );
}
