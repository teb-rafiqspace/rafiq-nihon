/**
 * import-cert-questions.ts
 *
 * Imports certification test questions from JSON files in scripts/cert-data/ into Supabase.
 *
 * Usage:
 *   npx tsx scripts/import-cert-questions.ts
 *
 * Prerequisites:
 *   - Local Supabase running (npx supabase start)
 *   - JSON data files in scripts/cert-data/
 *   - supabase/.env.local with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
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

// ─── Types ──────────────────────────────────────────────────────────────────

interface CertQuestion {
  test_type: string;
  section: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  sort_order: number;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const { supabaseUrl, supabaseKey } = loadEnv();
  const supabase = createClient(supabaseUrl, supabaseKey);

  const dataDir = path.resolve(__dirname_compat, 'cert-data');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

  console.log(`Found ${files.length} JSON files in cert-data/`);

  let totalImported = 0;

  for (const file of files) {
    const filepath = path.join(dataDir, file);
    const content = fs.readFileSync(filepath, 'utf-8');
    const questions: CertQuestion[] = JSON.parse(content);

    const testType = questions[0]?.test_type || file.replace('.json', '');
    console.log(`\nProcessing ${file}: ${questions.length} questions (${testType})`);

    // Delete existing questions for this test type (idempotent)
    const { error: deleteError } = await supabase
      .from('certification_test_questions')
      .delete()
      .eq('test_type', testType);

    if (deleteError) {
      console.error(`  Error deleting existing ${testType}:`, deleteError.message);
      continue;
    }

    // Validate questions
    let valid = true;
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.options.includes(q.correct_answer)) {
        console.error(`  ERROR: Question ${i + 1} correct_answer "${q.correct_answer}" not in options: ${JSON.stringify(q.options)}`);
        valid = false;
      }
    }

    if (!valid) {
      console.error(`  Skipping ${file} due to validation errors`);
      continue;
    }

    // Insert in batches of 50
    const batchSize = 50;
    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize).map(q => ({
        test_type: q.test_type,
        section: q.section,
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation || null,
        sort_order: q.sort_order,
      }));

      const { error: insertError } = await supabase
        .from('certification_test_questions')
        .insert(batch);

      if (insertError) {
        console.error(`  Error inserting batch at ${i}:`, insertError.message);
      } else {
        totalImported += batch.length;
        console.log(`  Inserted ${batch.length} questions (${i + batch.length}/${questions.length})`);
      }
    }
  }

  console.log(`\nDone! Total imported: ${totalImported} questions`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
