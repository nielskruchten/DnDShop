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

function parseMarkdown(content, filename, source) {
  const lines = content.split('\n');

  let name = '';
  let rarity = '';
  let type = '';
  let attunement = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ') && !name) {
      name = trimmed.slice(2).trim();
    } else if (trimmed.includes('**Rarity:**')) {
      rarity = trimmed.split('**Rarity:**')[1].trim();
    } else if (trimmed.includes('**Type:**')) {
      type = trimmed.split('**Type:**')[1].trim();
    } else if (trimmed.includes('**Attunement:**')) {
      const val = trimmed.split('**Attunement:**')[1].trim().toLowerCase();
      attunement = val.startsWith('yes');
    }
  }

  if (!name || !rarity || !type) return null;

  return {
    id: `${source.replace(/\s+/g, '-').toLowerCase()}-${filename}`,
    name,
    rarity,
    type,
    attunement,
    source,
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
