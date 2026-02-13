import { readFileSync } from 'fs';

// Count entries per data file
for (const f of ['_kanji-data-1.txt','_kanji-data-2.txt','_kanji-data-3.txt','_kanji-data-4.txt']) {
  const lines = readFileSync(f, 'utf-8').split('\n').filter(l => {
    const t = l.trim();
    return t && t[0] !== '#' && t.includes('|');
  });
  console.log(f, lines.length);
}

// Check kanji.json
const k = JSON.parse(readFileSync('kanji.json', 'utf-8'));
console.log('kanji.json total:', k.length);

// Trim to 385 if needed
if (k.length > 385) {
  const trimmed = k.slice(0, 385);
  const { writeFileSync } = await import('fs');
  writeFileSync('kanji.json', JSON.stringify(trimmed, null, 2));
  console.log('Trimmed to', trimmed.length);
}
