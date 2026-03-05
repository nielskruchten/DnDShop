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

// ─── Markdown block parsing ───────────────────────────────────────────────────

type ParsedBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'table-caption'; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'list'; items: string[] };

function isSeparatorRow(line: string): boolean {
  const cells = line.split('|').slice(1, -1).map(c => c.trim());
  return cells.length > 0 && cells.every(c => /^:?-+:?$/.test(c));
}

function parseTableRow(line: string): string[] {
  return line.split('|').slice(1, -1).map(c => c.trim());
}

function parseDescription(description: string): ParsedBlock[] {
  const rawBlocks = description.split('\n\n').filter(b => b.trim());
  const blocks: ParsedBlock[] = [];

  for (const block of rawBlocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l);

    // Table: all lines start with |
    if (lines.every(l => l.startsWith('|'))) {
      const dataRows = lines.filter(l => !isSeparatorRow(l)).map(parseTableRow);
      if (dataRows.length >= 1) {
        blocks.push({ type: 'table', headers: dataRows[0], rows: dataRows.slice(1) });
      }
      continue;
    }

    // Table caption: single line with "(table)" or "Table:" prefix
    if (lines.length === 1) {
      const line = lines[0];
      if (/\(table\)/i.test(line) || /^Table:/i.test(line)) {
        const text = line
          .replace(/\*\*/g, '')
          .replace(/\s*\(table\)\s*/i, '')
          .replace(/^Table:\s*/i, '')
          .trim();
        blocks.push({ type: 'table-caption', text });
        continue;
      }
    }

    // Bullet list: all non-empty lines start with - or *
    if (lines.length > 0 && lines.every(l => l.startsWith('- ') || l.startsWith('* '))) {
      const items = lines.map(l => l.replace(/^[-*]\s+/, ''));
      blocks.push({ type: 'list', items });
      continue;
    }

    // Default: paragraph
    blocks.push({ type: 'paragraph', text: block });
  }

  return blocks;
}

// ─── Inline markdown renderer ─────────────────────────────────────────────────
// Handles: **bold**, *italic*, _italic_

function InlineText({ text }: { text: string }) {
  // Split on bold (double *) first, then single * or _ italic
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*|_[^_\n]+_)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold text-zinc-200">{part.slice(2, -2)}</strong>;
        }
        if (
          (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) ||
          (part.startsWith('_') && part.endsWith('_'))
        ) {
          return <em key={i} className="italic text-zinc-300">{part.slice(1, -1)}</em>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ─── Block renderers ──────────────────────────────────────────────────────────

function BlockParagraph({ text }: { text: string }) {
  return (
    <p className="text-zinc-300 text-sm leading-relaxed">
      <InlineText text={text} />
    </p>
  );
}

function BlockTableCaption({ text }: { text: string }) {
  return (
    <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider pt-1">
      {text}
    </p>
  );
}

function BlockList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="text-zinc-300 text-sm leading-relaxed flex gap-2.5">
          <span className="text-zinc-500 flex-shrink-0 mt-px select-none">–</span>
          <InlineText text={item} />
        </li>
      ))}
    </ul>
  );
}

function BlockTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-700/60 -mx-1">
      <table className="w-full text-xs text-left border-collapse">
        <thead>
          <tr className="bg-zinc-800">
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-3 py-2 font-semibold text-zinc-300 border-b border-zinc-700 whitespace-nowrap first:w-px"
              >
                <InlineText text={h} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-800/40'}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-3 py-2 text-zinc-300 border-b border-zinc-800/60 align-top leading-relaxed"
                >
                  <InlineText text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderBlock(block: ParsedBlock, i: number) {
  switch (block.type) {
    case 'paragraph':     return <BlockParagraph     key={i} text={block.text} />;
    case 'table-caption': return <BlockTableCaption  key={i} text={block.text} />;
    case 'list':          return <BlockList          key={i} items={block.items} />;
    case 'table':         return <BlockTable         key={i} headers={block.headers} rows={block.rows} />;
  }
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ItemDetailModalProps {
  shopItem: ShopItem;
  showPrice: boolean;
  onClose: () => void;
}

export default function ItemDetailModal({ shopItem, showPrice, onClose }: ItemDetailModalProps) {
  const { item, quantity, price } = shopItem;
  const style = RARITY_STYLES[item.rarity] ?? RARITY_STYLES.Common;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const blocks = item.description ? parseDescription(item.description) : [];

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
          {blocks.length > 0 ? (
            blocks.map(renderBlock)
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
