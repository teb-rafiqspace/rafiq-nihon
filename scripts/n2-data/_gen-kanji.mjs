// Generates kanji.json for 385 JLPT N2 kanji
// Compact format: [char, strokes, meaningId, kun[], on[], exWord, exReading, exMeaning]
import { writeFileSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));

// Load kanji data from text files
const dataFiles = ['_kanji-data-1.txt', '_kanji-data-2.txt', '_kanji-data-3.txt', '_kanji-data-4.txt'];
const kanji = [];
let idx = 1;

for (const file of dataFiles) {
  let content;
  try { content = readFileSync(join(__dir, file), 'utf-8'); } catch { continue; }

  for (const line of content.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;

    // Format: char|strokes|meaningId|kun1,kun2|on1,on2|exWord|exReading|exMeaning
    const p = t.split('|');
    if (p.length < 8) continue;

    const [char, strokes, meaningId, kunStr, onStr, exWord, exReading, exMeaning] = p;

    kanji.push({
      id: `n2_${String(idx).padStart(3, '0')}`,
      character: char.trim(),
      jlpt_level: 'N2',
      stroke_count: parseInt(strokes.trim()) || 0,
      meanings_id: meaningId.trim(),
      meanings_en: '',
      kun_readings: kunStr.trim() ? kunStr.trim().split(',') : [],
      on_readings: onStr.trim() ? onStr.trim().split(',') : [],
      example_words: [{ word: exWord.trim(), reading: exReading.trim(), meaning: exMeaning.trim() }],
      stroke_order_svg: '',
      radicals: [],
      mnemonic_id: '',
      mnemonic_en: '',
      order_index: idx,
    });
    idx++;
  }
}

writeFileSync(join(__dir, 'kanji.json'), JSON.stringify(kanji, null, 2));
console.log(`Generated ${kanji.length} kanji entries`);
