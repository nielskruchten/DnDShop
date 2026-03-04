import { ShopItem, ShopConfig } from '../types';

export function exportMarkdown(
  shopName: string,
  items: ShopItem[],
  config: ShopConfig,
): void {
  const name = shopName.trim() || 'Magic Item Shop';
  const lines: string[] = [];

  lines.push(`# ${name}`);
  lines.push('');
  lines.push('*Generated with DnD Magic Item Shop*');
  lines.push('');

  if (config.showPrices) {
    lines.push('| Item | Type | Rarity | Qty | Price |');
    lines.push('|------|------|--------|-----|-------|');
    for (const si of items) {
      const price = si.price != null ? `${si.price.toLocaleString()} gp` : '—';
      lines.push(
        `| ${si.item.name} | ${si.item.type} | ${si.item.rarity} | ${si.quantity} | ${price} |`,
      );
    }
  } else {
    lines.push('| Item | Type | Rarity | Qty |');
    lines.push('|------|------|--------|-----|');
    for (const si of items) {
      lines.push(
        `| ${si.item.name} | ${si.item.type} | ${si.item.rarity} | ${si.quantity} |`,
      );
    }
  }

  lines.push('');

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
  triggerDownload(blob, `${slugify(name)}.md`);
}

export function exportPDF(): void {
  window.print();
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
