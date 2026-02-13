// Generates vocabulary.json from _vocab-data-*.txt files
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));

const dataFiles = readdirSync(__dir)
  .filter(f => f.startsWith('_vocab-data-') && f.endsWith('.txt'))
  .sort();

const vocab = [];

for (const file of dataFiles) {
  const content = readFileSync(join(__dir, file), 'utf-8');
  let currentLessonId = null;

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (trimmed.startsWith('===')) {
      currentLessonId = trimmed.replace(/===/g, '').trim();
      continue;
    }

    const parts = trimmed.split('|');
    if (parts.length < 3) continue;

    const [word_jp, reading, meaning_id, example_jp, example_id, category] = parts;

    vocab.push({
      id: randomUUID(),
      lesson_id: currentLessonId,
      word_jp: word_jp.trim(),
      reading: reading.trim(),
      meaning_id: meaning_id.trim(),
      example_jp: (example_jp || '').trim(),
      example_id: (example_id || '').trim(),
      audio_url: '',
      category: (category || 'noun').trim(),
      jlpt_level: 'N2'
    });
  }
}

writeFileSync(join(__dir, 'vocabulary.json'), JSON.stringify(vocab, null, 2));
console.log(`Generated ${vocab.length} vocabulary entries from ${dataFiles.length} data files`);
