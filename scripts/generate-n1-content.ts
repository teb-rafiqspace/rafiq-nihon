/**
 * generate-n1-content.ts
 *
 * Generates JLPT N1 content data using the DekaLLM API (Lintasarta Cloudeka).
 * Outputs JSON files to scripts/n1-data/ for import by import-n1-content.ts.
 *
 * Usage:
 *   DEKALLM_API_KEY=your-key npx tsx scripts/generate-n1-content.ts
 *
 * Or set DEKALLM_API_KEY in supabase/.env.local
 *
 * This script generates content in batches per content type, with structured
 * prompts that include exact JSON schema and N2 samples for format reference.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename_compat = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
const __dirname_compat = path.dirname(__filename_compat);

const OUTPUT_DIR = path.resolve(__dirname_compat, 'n1-data');
const DEKALLM_URL = 'https://dekallm.cloudeka.ai/v1/chat/completions';
const MODEL = 'nvidia/nemotron-3-nano-30b-a3b';

// ─── Load API Key ────────────────────────────────────────────────────────────

function getApiKey(): string {
  // Check env var first
  if (process.env.DEKALLM_API_KEY) return process.env.DEKALLM_API_KEY;

  // Try supabase/.env.local
  try {
    const envPath = path.resolve(__dirname_compat, '..', 'supabase', '.env.local');
    const content = fs.readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.startsWith('DEKALLM_API_KEY=')) {
        const val = trimmed.slice('DEKALLM_API_KEY='.length).trim();
        if (val && val !== 'your-dekallm-key-here') return val;
      }
    }
  } catch { /* ignore */ }

  throw new Error(
    'DEKALLM_API_KEY not found. Set it as an env var or in supabase/.env.local'
  );
}

// ─── DekaLLM API ─────────────────────────────────────────────────────────────

async function callDekaLLM(systemPrompt: string, userPrompt: string, maxTokens = 4096): Promise<string> {
  const apiKey = getApiKey();

  const response = await fetch(DEKALLM_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DekaLLM API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

function extractJson(text: string): any {
  // Try to extract JSON array or object from response
  const match = text.match(/\[[\s\S]*\]/);
  if (match) return JSON.parse(match[0]);

  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) return JSON.parse(objMatch[0]);

  throw new Error('No JSON found in response');
}

// ─── UUID Generator ──────────────────────────────────────────────────────────

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-axxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// ─── Content Generators ──────────────────────────────────────────────────────

interface ContentGenerator {
  filename: string;
  label: string;
  generate: () => Promise<any[]>;
}

const SYSTEM_PROMPT = `You are a JLPT N1 Japanese language content expert. Generate educational content in valid JSON format. Always respond with ONLY a JSON array, no other text. Use accurate JLPT N1 level Japanese content. Explanations and descriptions should be in Indonesian (Bahasa Indonesia).`;

async function generateInBatches(
  promptFn: (batchNum: number, batchSize: number) => string,
  totalItems: number,
  batchSize: number,
  label: string,
): Promise<any[]> {
  const results: any[] = [];
  const totalBatches = Math.ceil(totalItems / batchSize);

  for (let batch = 0; batch < totalBatches; batch++) {
    const remaining = Math.min(batchSize, totalItems - results.length);
    console.log(`  Generating ${label} batch ${batch + 1}/${totalBatches} (${remaining} items)...`);

    try {
      const prompt = promptFn(batch, remaining);
      const response = await callDekaLLM(SYSTEM_PROMPT, prompt, 8192);
      const items = extractJson(response);

      if (Array.isArray(items)) {
        results.push(...items);
        console.log(`    Got ${items.length} items (total: ${results.length})`);
      } else {
        console.warn('    Warning: Non-array response, skipping batch');
      }
    } catch (error) {
      console.error(`    Error in batch ${batch + 1}:`, error);
    }

    // Rate limit pause
    await new Promise(r => setTimeout(r, 2000));
  }

  return results;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== JLPT N1 Content Generator (DekaLLM) ===\n');

  // Verify API key
  try {
    getApiKey();
    console.log('API key found.\n');
  } catch (e) {
    console.error((e as Error).message);
    process.exit(1);
  }

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Generate chapters
  console.log('1/16: Generating chapters...');
  const chaptersPrompt = `Generate 8 JLPT N1 study chapters as a JSON array. Each object:
{"id":"uuid","track":"jlpt_n1","chapter_number":1,"title_jp":"上級文法（総合）","title_id":"Tata Bahasa Lanjutan","description":"","lesson_count":6,"is_free":true,"sort_order":1}

Topics: 1.上級文法 2.敬語の極意 3.文語的表現 4.論文表現 5.慣用句 6.読解戦略 7.社会問題 8.ビジネス日本語
Only chapter 1 is is_free:true.`;

  try {
    const chaptersRaw = await callDekaLLM(SYSTEM_PROMPT, chaptersPrompt);
    const chapters = extractJson(chaptersRaw);
    // Ensure UUIDs
    chapters.forEach((c: any) => { if (!c.id || c.id === 'uuid') c.id = uuid(); });
    saveJson('chapters.json', chapters);
    console.log(`  Saved ${chapters.length} chapters\n`);

    // Generate lessons using chapter IDs
    console.log('2/16: Generating lessons...');
    const lessons: any[] = [];
    for (const chapter of chapters) {
      const lessonPrompt = `Generate 6 JLPT N1 grammar lessons for chapter "${chapter.title_jp}" as a JSON array.
Each: {"id":"uuid","chapter_id":"${chapter.id}","lesson_number":1,"title_jp":"〜ものを","title_id":"Indonesian","content":{"type":"grammar","patterns":[{"pattern":"〜ものを","meaning":"Indonesian","example":"Japanese example"}]},"xp_reward":40,"sort_order":1}`;

      try {
        const raw = await callDekaLLM(SYSTEM_PROMPT, lessonPrompt);
        const chLessons = extractJson(raw);
        chLessons.forEach((l: any, i: number) => {
          if (!l.id || l.id === 'uuid') l.id = uuid();
          l.chapter_id = chapter.id;
          l.lesson_number = i + 1;
          l.sort_order = lessons.length + i + 1;
        });
        lessons.push(...chLessons);
        console.log(`  Chapter ${chapter.chapter_number}: ${chLessons.length} lessons`);
      } catch (e) {
        console.error(`  Error generating lessons for chapter ${chapter.chapter_number}:`, e);
      }
      await new Promise(r => setTimeout(r, 1500));
    }
    saveJson('lessons.json', lessons);
    console.log(`  Saved ${lessons.length} lessons\n`);

    // Generate vocabulary using lesson IDs
    console.log('3/16: Generating vocabulary...');
    const vocab: any[] = [];
    for (const lesson of lessons) {
      const vocabPrompt = `Generate 10 JLPT N1 vocabulary words for the lesson "${lesson.title_jp}" as a JSON array.
Each: {"id":"uuid","lesson_id":"${lesson.id}","word_jp":"覆す","reading":"くつがえす","meaning_id":"Indonesian","example_jp":"Japanese example","example_id":"Indonesian translation","audio_url":"","category":"verb","jlpt_level":"N1"}`;

      try {
        const raw = await callDekaLLM(SYSTEM_PROMPT, vocabPrompt, 4096);
        const words = extractJson(raw);
        words.forEach((w: any) => {
          if (!w.id || w.id === 'uuid') w.id = uuid();
          w.lesson_id = lesson.id;
          w.jlpt_level = 'N1';
        });
        vocab.push(...words);
      } catch (e) {
        console.error(`  Error for lesson ${lesson.title_jp}:`, e);
      }
      await new Promise(r => setTimeout(r, 1000));
    }
    saveJson('vocabulary.json', vocab);
    console.log(`  Saved ${vocab.length} vocabulary words\n`);

    // Generate quiz questions
    console.log('4/16: Generating quiz questions...');
    const quizQs: any[] = [];
    for (const lesson of lessons) {
      const qqPrompt = `Generate 4 multiple-choice quiz questions for the Japanese grammar lesson "${lesson.title_jp}" as a JSON array.
Each: {"id":"uuid","lesson_id":"${lesson.id}","question_type":"multiple_choice","question_text":"fill-in-blank question","options":["opt1","opt2","opt3","opt4"],"correct_answer":"correct option text","explanation":"Indonesian explanation"}`;

      try {
        const raw = await callDekaLLM(SYSTEM_PROMPT, qqPrompt, 2048);
        const qs = extractJson(raw);
        qs.forEach((q: any) => {
          if (!q.id || q.id === 'uuid') q.id = uuid();
          q.lesson_id = lesson.id;
          q.question_type = 'multiple_choice';
        });
        quizQs.push(...qs);
      } catch (e) {
        console.error(`  Error for lesson ${lesson.title_jp}:`, e);
      }
      await new Promise(r => setTimeout(r, 1000));
    }
    saveJson('quiz_questions.json', quizQs);
    console.log(`  Saved ${quizQs.length} quiz questions\n`);

  } catch (e) {
    console.error('Error in chapter/lesson generation:', e);
  }

  // Generate remaining content types (independent of chapters)
  const independentGenerators = [
    { file: 'kanji.json', label: 'Kanji', total: 300, batch: 30 },
    { file: 'flashcard_decks.json', label: 'Flashcard Decks', total: 4, batch: 4 },
    { file: 'flashcard_cards.json', label: 'Flashcard Cards', total: 320, batch: 40 },
    { file: 'practice_quiz_sets.json', label: 'Practice Quiz Sets', total: 8, batch: 8 },
    { file: 'practice_quiz_questions.json', label: 'Practice Quiz Questions', total: 400, batch: 50 },
    { file: 'reading_passages.json', label: 'Reading Passages', total: 10, batch: 5 },
    { file: 'reading_questions.json', label: 'Reading Questions', total: 50, batch: 25 },
    { file: 'listening_items.json', label: 'Listening Items', total: 10, batch: 5 },
    { file: 'listening_questions.json', label: 'Listening Questions', total: 50, batch: 25 },
    { file: 'speaking_lessons.json', label: 'Speaking Lessons', total: 6, batch: 6 },
    { file: 'speaking_items.json', label: 'Speaking Items', total: 80, batch: 20 },
    { file: 'mock_test_questions.json', label: 'Mock Test Questions', total: 50, batch: 25 },
  ];

  for (const gen of independentGenerators) {
    // Skip if file already exists
    const outPath = path.resolve(OUTPUT_DIR, gen.file);
    if (fs.existsSync(outPath)) {
      console.log(`Skipping ${gen.label} — ${gen.file} already exists`);
      continue;
    }

    console.log(`Generating ${gen.label}...`);
    const items = await generateInBatches(
      (batchNum, size) => `Generate ${size} JLPT N1 ${gen.label.toLowerCase()} items as a JSON array. Batch ${batchNum + 1}. Use N1-level Japanese content with Indonesian explanations.`,
      gen.total,
      gen.batch,
      gen.label,
    );
    saveJson(gen.file, items);
    console.log(`  Saved ${items.length} ${gen.label.toLowerCase()}\n`);
  }

  console.log('\n=== Generation complete! ===');
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log('Next step: npx tsx scripts/import-n1-content.ts');
}

function saveJson(filename: string, data: any[]) {
  const filepath = path.resolve(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
}

main().catch(console.error);
