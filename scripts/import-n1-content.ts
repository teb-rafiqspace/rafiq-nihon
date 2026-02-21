/**
 * import-n1-content.ts
 *
 * Imports JLPT N1 content from JSON files in scripts/n1-data/ into local Supabase.
 *
 * Usage:
 *   npx tsx scripts/import-n1-content.ts
 *
 * Prerequisites:
 *   - Local Supabase running (npx supabase start)
 *   - JSON data files in scripts/n1-data/
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename_compat = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
const __dirname_compat = path.dirname(__filename_compat);

// ─── Env loading ────────────────────────────────────────────────────────────

function loadEnv(): { supabaseUrl: string; supabaseKey: string } {
  const envPath = path.resolve(__dirname_compat, '..', 'supabase', '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const vars: Record<string, string> = {};
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    vars[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
  }

  const supabaseUrl = vars.SUPABASE_URL;
  const supabaseKey = vars.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in supabase/.env.local');
  }

  return { supabaseUrl, supabaseKey };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function readJsonFile<T>(filename: string): T {
  const filepath = path.resolve(__dirname_compat, 'n1-data', filename);
  const content = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(content);
}

function tryReadJsonFile<T>(filename: string): T | null {
  try {
    return readJsonFile<T>(filename);
  } catch {
    return null;
  }
}

async function insertRows(
  sb: SupabaseClient,
  table: string,
  rows: any[],
  batchSize = 50,
): Promise<number> {
  if (rows.length === 0) return 0;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await sb.from(table).insert(batch);
    if (error) {
      throw new Error(`Insert into "${table}" failed at batch ${Math.floor(i / batchSize) + 1}: ${error.message}\nSample row: ${JSON.stringify(batch[0]).slice(0, 200)}`);
    }
    inserted += batch.length;
  }
  return inserted;
}

async function countExisting(
  sb: SupabaseClient,
  table: string,
  filter: Record<string, string>,
): Promise<number> {
  let q = sb.from(table).select('id', { count: 'exact', head: true });
  for (const [col, val] of Object.entries(filter)) {
    q = q.eq(col, val);
  }
  const { count, error } = await q;
  if (error) return 0;
  return count || 0;
}

// ─── Import steps ───────────────────────────────────────────────────────────

interface ImportStep {
  label: string;
  table: string;
  file: string;
  skipFilter?: Record<string, string>;
  /** Column to check for existing data with a different filter approach */
  skipCheck?: (sb: SupabaseClient) => Promise<boolean>;
}

const importSteps: ImportStep[] = [
  // 1. Chapters (skip if already exist)
  {
    label: 'Chapters',
    table: 'chapters',
    file: 'chapters.json',
    skipFilter: { track: 'jlpt_n1' },
  },
  // 2. Lessons
  {
    label: 'Lessons',
    table: 'lessons',
    file: 'lessons.json',
    skipCheck: async (sb) => {
      // Check if any lessons exist for N1 chapters
      const { data: chapters } = await sb
        .from('chapters')
        .select('id')
        .eq('track', 'jlpt_n1');
      if (!chapters || chapters.length === 0) return false;
      const chapterIds = chapters.map((c: any) => c.id);
      const { count } = await sb
        .from('lessons')
        .select('id', { count: 'exact', head: true })
        .in('chapter_id', chapterIds);
      return (count || 0) > 0;
    },
  },
  // 3. Vocabulary
  {
    label: 'Vocabulary',
    table: 'vocabulary',
    file: 'vocabulary.json',
    skipFilter: { jlpt_level: 'N1' },
  },
  // 4. Quiz Questions
  {
    label: 'Quiz Questions',
    table: 'quiz_questions',
    file: 'quiz_questions.json',
    skipCheck: async (sb) => {
      // Check if any quiz questions exist for N1 lessons
      const { data: chapters } = await sb
        .from('chapters')
        .select('id')
        .eq('track', 'jlpt_n1');
      if (!chapters || chapters.length === 0) return false;
      const chapterIds = chapters.map((c: any) => c.id);
      const { data: lessons } = await sb
        .from('lessons')
        .select('id')
        .in('chapter_id', chapterIds)
        .limit(5);
      if (!lessons || lessons.length === 0) return false;
      const lessonIds = lessons.map((l: any) => l.id);
      const { count } = await sb
        .from('quiz_questions')
        .select('id', { count: 'exact', head: true })
        .in('lesson_id', lessonIds);
      return (count || 0) > 0;
    },
  },
  // 5. Kanji
  {
    label: 'Kanji Characters',
    table: 'kanji_characters',
    file: 'kanji.json',
    skipFilter: { jlpt_level: 'N1' },
  },
  // 6. Flashcard Decks
  {
    label: 'Flashcard Decks',
    table: 'flashcard_decks',
    file: 'flashcard_decks.json',
    skipFilter: { track: 'jlpt_n1' },
  },
  // 7. Flashcard Cards
  {
    label: 'Flashcard Cards',
    table: 'flashcard_cards',
    file: 'flashcard_cards.json',
    skipCheck: async (sb) => {
      const { count } = await sb
        .from('flashcard_cards')
        .select('id', { count: 'exact', head: true })
        .like('deck_id', 'deck-n1-%');
      return (count || 0) > 0;
    },
  },
  // 8. Practice Quiz Sets
  {
    label: 'Practice Quiz Sets',
    table: 'practice_quiz_sets',
    file: 'practice_quiz_sets.json',
    skipFilter: { track: 'jlpt_n1' },
  },
  // 9. Practice Quiz Questions
  {
    label: 'Practice Quiz Questions',
    table: 'practice_quiz_questions',
    file: 'practice_quiz_questions.json',
    skipCheck: async (sb) => {
      const { count } = await sb
        .from('practice_quiz_questions')
        .select('id', { count: 'exact', head: true })
        .like('quiz_set_id', 'pq-n1-%');
      return (count || 0) > 0;
    },
  },
  // 10. Reading Passages
  {
    label: 'Reading Passages',
    table: 'reading_passages',
    file: 'reading_passages.json',
    skipFilter: { jlpt_level: 'N1' },
  },
  // 11. Reading Questions
  {
    label: 'Reading Questions',
    table: 'reading_questions',
    file: 'reading_questions.json',
    skipCheck: async (sb) => {
      const { count } = await sb
        .from('reading_questions')
        .select('id', { count: 'exact', head: true })
        .like('passage_id', 'reading-n1-%');
      return (count || 0) > 0;
    },
  },
  // 12. Listening Items
  {
    label: 'Listening Items',
    table: 'listening_items',
    file: 'listening_items.json',
    skipFilter: { jlpt_level: 'N1' },
  },
  // 13. Listening Questions
  {
    label: 'Listening Questions',
    table: 'listening_questions',
    file: 'listening_questions.json',
    skipCheck: async (sb) => {
      const { count } = await sb
        .from('listening_questions')
        .select('id', { count: 'exact', head: true })
        .like('listening_id', 'listening-n1-%');
      return (count || 0) > 0;
    },
  },
  // 14. Speaking Lessons
  {
    label: 'Speaking Lessons',
    table: 'speaking_lessons',
    file: 'speaking_lessons.json',
    skipFilter: { track: 'jlpt_n1' },
  },
  // 15. Speaking Items
  {
    label: 'Speaking Items',
    table: 'speaking_items',
    file: 'speaking_items.json',
    skipCheck: async (sb) => {
      const { count } = await sb
        .from('speaking_items')
        .select('id', { count: 'exact', head: true })
        .like('lesson_id', 'sp-n1-%');
      return (count || 0) > 0;
    },
  },
  // 16. Mock Test Questions
  {
    label: 'Mock Test Questions',
    table: 'mock_test_questions',
    file: 'mock_test_questions.json',
    skipFilter: { test_type: 'jlpt_n1' },
  },
];

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 JLPT N1 Content Import\n');

  const { supabaseUrl, supabaseKey } = loadEnv();
  const sb = createClient(supabaseUrl, supabaseKey);

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const step of importSteps) {
    process.stdout.write(`  ${step.label}... `);

    // Check if file exists
    const rows = tryReadJsonFile<any[]>(step.file);
    if (!rows) {
      console.log('⏭  file not found, skipping');
      continue;
    }

    // Check if data already exists
    let exists = false;
    if (step.skipCheck) {
      exists = await step.skipCheck(sb);
    } else if (step.skipFilter) {
      const count = await countExisting(sb, step.table, step.skipFilter);
      exists = count > 0;
    }

    if (exists) {
      console.log(`⏭  already has N1 data, skipping (${rows.length} rows)`);
      totalSkipped += rows.length;
      continue;
    }

    // Insert
    try {
      const count = await insertRows(sb, step.table, rows);
      console.log(`✅ inserted ${count} rows`);
      totalInserted += count;
    } catch (err: any) {
      console.log(`❌ ERROR: ${err.message}`);
      // Continue with other steps
    }
  }

  console.log(`\n📊 Summary: ${totalInserted} rows inserted, ${totalSkipped} rows skipped`);
  console.log('Done!\n');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
