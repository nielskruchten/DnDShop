/**
 * parse-npcs.js
 * Reads the Excel name tables from npcs/ and writes src/data/npcs.json.
 * Run with: npm run parse-npcs
 *
 * Add more races by dropping a new .xlsx file in npcs/ and adding an
 * entry to the FILES array below.
 */

import { createRequire } from 'module';
import { existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const require  = createRequire(import.meta.url);
const XLSX     = require('xlsx');
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT     = join(__dirname, '..');

const FILES = [
  { file: 'npcs/Human names.xlsx',   race: 'human' },
  { file: 'npcs/Dwarven names.xlsx', race: 'dwarf' },
  { file: 'npcs/Elven names.xlsx',   race: 'elf'   },
];

const result = {};

for (const { file, race } of FILES) {
  const fullPath = join(ROOT, file);
  if (!existsSync(fullPath)) {
    console.warn(`Warning: ${file} not found, skipping.`);
    continue;
  }

  const wb   = XLSX.readFile(fullPath);
  const ws   = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }).slice(1); // skip header row

  result[race] = {
    male:   rows.map(r => r[0]).filter(Boolean),
    female: rows.map(r => r[1]).filter(Boolean),
    family: rows.map(r => r[2]).filter(Boolean),
  };

  const { male, female, family } = result[race];
  console.log(`${race}: ${male.length} male, ${female.length} female, ${family.length} family names`);
}

const outPath = join(ROOT, 'src/data/npcs.json');
writeFileSync(outPath, JSON.stringify(result, null, 2));
console.log(`\nWrote ${outPath}`);
