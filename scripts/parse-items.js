import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ITEMS_DIR = join(__dirname, '..', 'Magic Items');
const OUTPUT_DIR = join(__dirname, '..', 'src', 'data');
const OUTPUT_FILE = join(OUTPUT_DIR, 'items.json');

const SOURCE_MAP = {
  '5.1_srd_(d&d_2014)': '5e 2014 SRD',
  '5.2_srd_(d&d_2024)': '5e 2024 SRD',
  'level_up_advanced_5e': 'Level Up A5E',
  'vault_of_magic': 'Vault of Magic',
};

/**
 * Some source files concatenate the table header row onto the last sentence
 * of a paragraph with no newline, e.g.:
 *   "...when 1 hour has passed. | d3 | Use fortune for |\n| --- | --- |\n..."
 * This function inserts a newline before such inline table headers so the table
 * header becomes its own line and can be parsed correctly.
 */
function normalizeTableHeaders(text) {
  const lines = text.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextTrimmed = (lines[i + 1] ?? '').trim();
    // Match: line doesn't start with |, ends with table-row content (| ... |),
    // and the very next line is a markdown table separator (| --- | --- |).
    if (
      !line.trimStart().startsWith('|') &&
      /\|[^|]*\|\s*$/.test(line) &&
      /^\|[\s:|-]+\|/.test(nextTrimmed)
    ) {
      const match = line.match(/^(.*?)\s+(\|(?:[^|\n]+\|)+\s*)$/);
      if (match && match[1].trim()) {
        out.push(match[1].trimEnd());   // text portion
        out.push(match[2].trim());      // table header portion
        continue;
      }
    }
    out.push(line);
  }
  return out.join('\n');
}

function parseMarkdown(content, filename, source) {
  const lines = content.split('\n');

  let name = '';
  let rarity = '';
  let type = '';
  let attunement = false;
  let lastMetaLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('# ') && !name) {
      name = trimmed.slice(2).trim();
    } else if (trimmed.includes('**Rarity:**')) {
      rarity = trimmed.split('**Rarity:**')[1].trim();
      lastMetaLine = i;
    } else if (trimmed.includes('**Type:**')) {
      type = trimmed.split('**Type:**')[1].trim();
      lastMetaLine = i;
    } else if (trimmed.includes('**Attunement:**')) {
      const val = trimmed.split('**Attunement:**')[1].trim().toLowerCase();
      attunement = val.startsWith('yes');
      lastMetaLine = i;
    } else if (trimmed.includes('**Source:**')) {
      lastMetaLine = i;
    }
  }

  // Everything after the last metadata line is the description.
  // Normalize inline table headers first, then split into paragraphs.
  const rawDesc = normalizeTableHeaders(lines.slice(lastMetaLine + 1).join('\n'));
  const description = rawDesc
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(p => p.length > 0 && !p.startsWith('#'))
    .join('\n\n');

  if (!name || !rarity || !type) return null;

  return {
    id: `${source.replace(/\s+/g, '-').toLowerCase()}-${filename}`,
    name,
    rarity,
    type,
    attunement,
    source,
    description,
  };
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const items = [];
  let skipped = 0;

  for (const [folder, sourceName] of Object.entries(SOURCE_MAP)) {
    const dir = join(ITEMS_DIR, folder);

    let files;
    try {
      files = await readdir(dir);
    } catch {
      console.warn(`  Skipping missing folder: ${folder}`);
      continue;
    }

    const mdFiles = files.filter(f => f.endsWith('.md'));
    console.log(`Parsing ${mdFiles.length} files from ${sourceName}...`);

    for (const file of mdFiles) {
      const content = await readFile(join(dir, file), 'utf-8');
      const item = parseMarkdown(content, file.replace('.md', ''), sourceName);
      if (item) {
        items.push(item);
      } else {
        skipped++;
      }
    }
  }

  await writeFile(OUTPUT_FILE, JSON.stringify(items, null, 2), 'utf-8');
  console.log(`\nDone! Parsed ${items.length} items (${skipped} skipped) → src/data/items.json`);

  // Print rarity breakdown
  const byRarity = {};
  for (const item of items) {
    byRarity[item.rarity] = (byRarity[item.rarity] ?? 0) + 1;
  }
  console.log('\nRarity breakdown:');
  Object.entries(byRarity).sort((a, b) => b[1] - a[1]).forEach(([r, n]) => {
    console.log(`  ${r}: ${n}`);
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
