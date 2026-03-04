import { ShopItem, ShopConfig } from '../types';
import { exportMarkdown, exportPDF } from '../lib/export';

interface ExportModalProps {
  shopName: string;
  items: ShopItem[];
  config: ShopConfig;
  onClose: () => void;
}

export default function ExportModal({ shopName, items, config, onClose }: ExportModalProps) {
  const handleMarkdown = () => {
    exportMarkdown(shopName, items, config);
    onClose();
  };

  const handlePDF = () => {
    onClose();
    // Slight delay so the modal closes before print dialog opens
    setTimeout(() => exportPDF(), 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="font-display text-gold-400 font-semibold text-lg mb-1">
          Export Shop
        </h2>
        <p className="text-sm text-zinc-400 mb-5">
          {shopName.trim() || 'Magic Item Shop'}
          {' · '}
          {items.length} items
        </p>

        <div className="space-y-3">
          <button
            onClick={handleMarkdown}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-700 active:bg-zinc-600 transition-colors text-left group"
          >
            <span className="text-2xl">📄</span>
            <div>
              <p className="font-semibold text-zinc-100 text-sm">Download Markdown</p>
              <p className="text-xs text-zinc-400">
                .md file — great for Obsidian, Notion, or any text editor
              </p>
            </div>
          </button>

          <button
            onClick={handlePDF}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-700 active:bg-zinc-600 transition-colors text-left group"
          >
            <span className="text-2xl">🖨️</span>
            <div>
              <p className="font-semibold text-zinc-100 text-sm">Print / Save as PDF</p>
              <p className="text-xs text-zinc-400">
                Opens your browser's print dialog — choose "Save as PDF"
              </p>
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 rounded-xl bg-zinc-800 text-zinc-400 text-sm hover:bg-zinc-700 hover:text-zinc-200 active:bg-zinc-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
