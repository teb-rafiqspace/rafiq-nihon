/**
 * import-en-content.ts
 *
 * Imports English (IELTS & TOEFL) content from JSON files in scripts/en-data/ into local Supabase.
 *
 * Usage:
 *   npx tsx scripts/import-en-content.ts
 *
 * Prerequisites:
 *   - Local Supabase running (npx supabase start)
 *   - JSON data files in scripts/en-data/
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
  const filepath = path.resolve(__dirname_compat, 'en-data', filename);
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
  batchSize = 100,
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
  skipCheck?: (sb: SupabaseClient) => Promise<boolean>;
}

const importSteps: ImportStep[] = [
  // 1. Chapters
  {
    label: 'IELTS Chapters',
    table: 'chapters',
    file: 'chapters.json',
    skipFilter: { track: 'ielts' },
  },
  // 2. Lessons
  {
    label: 'Lessons',
    table: 'lessons',
    file: 'lessons.json',
    skipCheck: async (sb) => {
      // Check if any English lesson chapters exist
      const { count } = await sb
        .from('lessons')
        .select('id', { count: 'exact', head: true })
        .like('id', 'e1%');
      return (count || 0) > 0;
    },
  },
  // 3. Vocabulary
  {
    label: 'Vocabulary',
    table: 'vocabulary',
    file: 'vocabulary.json',
    skipFilter: { track: 'ielts' },
  },
  // 4. Flashcard Decks
  {
    label: 'Flashcard Decks',
    table: 'flashcard_decks',
    file: 'flashcard_decks.json',
    skipCheck: async (sb) => {
      const { count } = await sb
        .from('flashcard_decks')
        .select('id', { count: 'exact', head: true })
        .like('id', 'deck-ielts-%');
      return (count || 0) > 0;
    },
  },
  // 5. Flashcard Cards
  {
    label: 'Flashcard Cards',
    table: 'flashcard_cards',
    file: 'flashcard_cards.json',
    skipCheck: async (sb) => {
      const { count } = await sb
        .from('flashcard_cards')
        .select('id', { count: 'exact', head: true })
        .like('deck_id', 'deck-ielts-%');
      return (count || 0) > 0;
    },
  },
  // 6. Practice Quiz Sets
  {
    label: 'Practice Quiz Sets',
    table: 'practice_quiz_sets',
    file: 'practice_quiz_sets.json',
    skipCheck: async (sb) => {
      const { count } = await sb
        .from('practice_quiz_sets')
        .select('id', { count: 'exact', head: true })
        .like('id', 'pq-ielts-%');
      return (count || 0) > 0;
    },
  },
  // 7. Practice Quiz Questions
  {
    label: 'Practice Quiz Questions',
    table: 'practice_quiz_questions',
    file: 'practice_quiz_questions.json',
    skipCheck: async (sb) => {
      const { count } = await sb
        .from('practice_quiz_questions')
        .select('id', { count: 'exact', head: true })
        .like('quiz_set_id', 'pq-ielts-%');
      return (count || 0) > 0;
    },
  },
  // 8. Reading Passages
  {
    label: 'Reading Passages',
    table: 'reading_passages',
    file: 'reading_passages.json',
    skipCheck: async (sb) => {
      const { count } = await sb
        .from('reading_passages')
        .select('id', { count: 'exact', head: true })
        .like('id', 'reading-ielts-%');
      return (count || 0) > 0;
    },
  },
  // 9. Reading Questions
  {
    label: 'Reading Questions',
    table: 'reading_questions',
    file: 'reading_questions.json',
    skipCheck: async (sb) => {
      const { count } = await sb
        .from('reading_questions')
        .select('id', { count: 'exact', head: true })
        .like('passage_id', 'reading-ielts-%');
      return (count || 0) > 0;
    },
  },
  // 10. Listening Items
  {
    label: 'Listening Items',
    table: 'listening_items',
    file: 'listening_items.json',
    skipCheck: async (sb) => {
      const { count } = await sb
        .from('listening_items')
        .select('id', { count: 'exact', head: true })
        .like('id', 'listening-ielts-%');
      return (count || 0) > 0;
    },
  },
  // 11. Listening Questions
  {
    label: 'Listening Questions',
    table: 'listening_questions',
    file: 'listening_questions.json',
    skipCheck: async (sb) => {
      const { count } = await sb
        .from('listening_questions')
        .select('id', { count: 'exact', head: true })
        .like('listening_id', 'listening-ielts-%');
      return (count || 0) > 0;
    },
  },
  // 12. Speaking Lessons
  {
    label: 'Speaking Lessons',
    table: 'speaking_lessons',
    file: 'speaking_lessons.json',
    skipCheck: async (sb) => {
      const { count } = await sb
        .from('speaking_lessons')
        .select('id', { count: 'exact', head: true })
        .like('id', 'sp-ielts-%');
      return (count || 0) > 0;
    },
  },
  // 13. Speaking Items
  {
    label: 'Speaking Items',
    table: 'speaking_items',
    file: 'speaking_items.json',
    skipCheck: async (sb) => {
      const { count } = await sb
        .from('speaking_items')
        .select('id', { count: 'exact', head: true })
        .like('lesson_id', 'sp-ielts-%');
      return (count || 0) > 0;
    },
  },
  // 14. Mock Test Questions
  {
    label: 'Mock Test Questions',
    table: 'mock_test_questions',
    file: 'mock_test_questions.json',
    skipFilter: { test_type: 'ielts_mock' },
  },
  // 15. Writing Prompts
  {
    label: 'Writing Prompts',
    table: 'writing_prompts',
    file: 'writing_prompts.json',
    skipFilter: { track: 'ielts' },
  },
];

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 English (IELTS & TOEFL) Content Import\n');

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
      console.log(`⏭  already has English data, skipping (${rows.length} rows)`);
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
