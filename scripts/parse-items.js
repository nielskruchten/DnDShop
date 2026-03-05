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
 * Count the number of cells in a markdown table row (including empty ones).
 * e.g. "| a | b | |" → 3
 */
function countCells(line) {
  return line.split('|').slice(1, -1).length;
}

/**
 * Normalises inline table formatting issues from the source files:
 *
 * Pattern 1 — text + table header on the same line (no newline between them):
 *   "...when 1 hour has passed. | d3 | Use fortune for |\n| --- | --- |\n..."
 *   → splits the text from the table header by inserting a newline.
 *
 * Pattern 2 — two table rows concatenated on the same line (end of table N
 * immediately followed by the header of table N+1):
 *   "| 6 | Gelatinous Cube | 2 | 10 (3d6) | | d6 | Ooze | CR | Blood Price |"
 *   → splits at the boundary and inserts a blank line so each table is its own
 *   paragraph block and parses independently.
 */
function normalizeTableHeaders(text) {
  const lines = text.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextTrimmed = (lines[i + 1] ?? '').trim();
    const isSeparator = /^\|[\s:|-]+\|/.test(nextTrimmed);

    // Pattern 1: non-table line with an inline table header appended at the end.
    if (
      !line.trimStart().startsWith('|') &&
      /\|[^|]*\|\s*$/.test(line) &&
      isSeparator
    ) {
      const match = line.match(/^(.*?)\s+(\|(?:[^|\n]+\|)+\s*)$/);
      if (match && match[1].trim()) {
        out.push(match[1].trimEnd());   // text portion
        out.push(match[2].trim());      // table header portion
        continue;
      }
    }

    // Pattern 2: table line with two concatenated table rows (contains "| |").
    // The next line must be a separator so we know where the new table starts.
    if (
      line.trimStart().startsWith('|') &&
      line.slice(1, -1).includes('| |') &&
      isSeparator
    ) {
      const sepCols = countCells(nextTrimmed);
      // Try each "| |" occurrence as a candidate split point.
      let pos = 1;
      let found = false;
      while (true) {
        const idx = line.indexOf('| |', pos);
        if (idx === -1) break;
        const part1 = line.slice(0, idx + 1).trim();  // up to & including closing |
        const part2 = line.slice(idx + 2).trim();      // from the opening | of next row
        if (countCells(part2) === sepCols) {
          out.push(part1);
          out.push('');        // blank line → two separate table blocks
          out.push(part2);
          found = true;
          break;
        }
        pos = idx + 1;
      }
      if (found) continue;
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
