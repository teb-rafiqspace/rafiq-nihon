# Rafiq Nihon - Aplikasi Belajar Bahasa Jepang

**Rafiq Nihon** adalah Progressive Web App (PWA) untuk belajar bahasa Jepang, dirancang khusus untuk pelajar Indonesia yang mempersiapkan ujian JLPT (N5-N1) dan sertifikasi Kemnaker (IM Japan). Aplikasi ini juga mendukung pembelajaran bahasa Inggris (IELTS & TOEFL).

---

## Teknologi

| Komponen | Teknologi |
|----------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Backend | Supabase (Auth, Database, Edge Functions, Storage) |
| Styling | Tailwind CSS, shadcn/ui |
| State Management | React Query (TanStack Query), React Context |
| Animasi | Framer Motion |
| PWA | Vite PWA Plugin (offline support) |
| AI Chat | DekaLLM API (Lintasarta Cloudeka), Google Gemini |
| TTS | Google Cloud TTS (Neural2 Japanese voices) |
| OCR | DekaLLM Vision (Qwen2-VL), Anthropic Claude |
| Speech | Web Speech API (SpeechRecognition) |
| PDF | html2canvas + jspdf |

---

## Jalur Pembelajaran (Learning Tracks)

| Track | Level | Emoji | Deskripsi |
|-------|-------|-------|-----------|
| Kemnaker | IM Japan | :factory: | Persiapan bahasa Jepang untuk program Kemnaker/IM Japan |
| JLPT N5 | Pemula | :scroll: | Level dasar - hiragana, katakana, kosakata dasar |
| JLPT N4 | Dasar | :book: | Level dasar lanjutan - percakapan sehari-hari |
| JLPT N3 | Menengah | :blue_book: | Level menengah - membaca & mendengar |
| JLPT N2 | Lanjutan | :closed_book: | Level lanjutan - tata bahasa kompleks |
| JLPT N1 | Mahir | :closed_book: | Level tertinggi - penguasaan penuh |
| IELTS | Bahasa Inggris | :mortar_board: | Persiapan ujian IELTS (tersembunyi) |
| TOEFL | Bahasa Inggris | :memo: | Persiapan ujian TOEFL (tersembunyi) |

---

## Alur Pengguna (User Workflow)

### 1. Registrasi & Onboarding

```
Landing Page (/) --> Daftar/Masuk (/auth) --> Onboarding (/onboarding) --> Dashboard (/home)
```

**Registrasi:**
- Daftar dengan email & password, atau login dengan Google OAuth
- Verifikasi email (opsional)
- Lupa password dengan reset link via email

**Onboarding (5 langkah):**
1. Layar selamat datang
2. Pilih tujuan belajar: Kemnaker, JLPT, Umum
3. Pilih level kemampuan: Pemula, Sedikit Tahu, Menengah
4. Atur target harian: 10/15/20/30 menit
5. Selesai - masuk ke dashboard

### 2. Dashboard (Home)

Setelah onboarding selesai, pengguna masuk ke halaman utama dengan:
- Salam berdasarkan waktu (Selamat pagi/siang/sore/malam)
- Statistik: Streak, XP, Level, Pelajaran Selesai
- **Lanjutkan Belajar** - progress bar per track
- **Aksi Cepat** - 5 tombol: Belajar, Bicara, Latihan, Ujian, Rafiq
- **Tantangan Harian** - "Selesaikan 3 pelajaran hari ini" (+50 XP)
- **Rekomendasi** - saran pelajaran berdasarkan progress
- **Papan Peringkat** - top performer minggu ini

### 3. Belajar (Learn)

```
Pilih Track --> Pilih Bab --> Pilih Pelajaran --> Selesaikan & Dapat XP
```

**Navigasi:**
- Tab bahasa (Jepang / Inggris)
- Tab track (Kemnaker, N5, N4, N3, N2, N1)
- Konten khusus per level (Kana, Kanji, Membaca, Mendengar, Budaya)

**Sistem Bab:**
- Bab pertama selalu gratis
- Bab berikutnya terkunci (perlu Premium atau ditandai gratis)
- Setiap bab berisi 4-6 pelajaran
- Pelajaran dibuka secara berurutan (harus selesaikan sebelumnya)
- Setiap pelajaran memberikan XP (25-40 XP)

### 4. Latihan (Practice)

5 tab latihan tersedia:

**Tab 1: Flashcard**
- Deck siap pakai per level & kategori
- Buat deck kustom
- Sistem spaced repetition

**Tab 2: Kuis**
- Soal pilihan ganda, isi kosong, mendengar, mencocokkan
- Dikelompokkan per topik/level
- Feedback langsung

**Tab 3: Tes (Mock Test)**
- Simulasi ujian resmi
- Riwayat tes (10 percobaan terakhir)
- Free: 1x/hari, Premium: unlimited

**Tab 4: Sertifikasi**
- 6 jenis tes sertifikasi (lihat detail di bawah)
- Sertifikat digital setelah lulus
- Download PDF

**Tab 5: Progres**
- Statistik mingguan
- Grafik XP
- Tren penyelesaian pelajaran

### 5. Bicara (Speaking)

6 mode latihan berbicara:

| Mode | Deskripsi |
|------|-----------|
| Shadowing | Dengar & ulangi dengan perbandingan audio |
| Pronunciation | Latihan pengucapan yang benar |
| Conversation | Dialog dengan AI |
| Role Play | Latihan berbasis skenario |
| Read Aloud | Baca nyaring untuk kelancaran |
| Pitch Accent | Pelajari intonasi & aksen |

**Fitur:**
- Skor akurasi, kelancaran, dan kepercayaan diri
- Riwayat sesi latihan
- Rekaman suara & feedback AI
- Tombol cek pengucapan di seluruh aplikasi (vocabulary, flashcard, kanji, grammar)

### 6. Chat AI (Rafiq Sensei)

2 mode percakapan:

| Mode | Bahasa | Fungsi |
|------|--------|--------|
| Sensei | Indonesia | Tanya jawab tentang bahasa Jepang |
| Kaiwa (Percakapan) | Jepang | Praktik percakapan dalam bahasa Jepang |

**Fitur:**
- Input suara (mikrofon) - pengenalan bahasa Jepang
- TTS playback pada pesan AI (Google Neural2)
- Free: 5 pesan/hari (500 karakter), Premium: unlimited (2000 karakter)
- Streaming response (real-time)

### 7. Ujian Sertifikasi

```
Pilih Tes --> Setup Proctoring --> Kerjakan Soal --> Lihat Hasil --> Dapat Sertifikat (jika lulus)
```

**6 Jenis Tes:**

| Tes | Soal | Durasi | Lulus | XP |
|-----|------|--------|-------|----|
| Kakunin (IM Japan) | 30 | 30 menit | 75% | 100 |
| JLPT N5 | 55 | 60 menit | 65% | 150 |
| JLPT N4 | 55 | 75 menit | 65% | 200 |
| JLPT N3 | 70 | 90 menit | 65% | 250 |
| JLPT N2 | 90 | 105 menit | 65% | 300 |
| JLPT N1 | 120 | 120 menit | 65% | 400 |

**Bagian soal per tes:**
- **Kakunin:** Kosakata (15), Tata Bahasa (10), Pemahaman (5)
- **JLPT N5:** Hiragana (10), Katakana (5), Kosakata (15), Tata Bahasa (15), Pemahaman (10)
- **JLPT N4:** Kosakata (15), Tata Bahasa (15), Membaca (15), Mendengar (10)
- **JLPT N3:** Kosakata (20), Tata Bahasa (20), Membaca (15), Mendengar (15)
- **JLPT N2:** Kosakata (25), Tata Bahasa (25), Membaca (20), Mendengar (20)
- **JLPT N1:** Kosakata (30), Tata Bahasa (30), Membaca (30), Mendengar (30)

**Fitur Tes:**
- Soal diacak setiap percobaan (dalam setiap bagian)
- Opsi jawaban diacak
- Auto-save progress setiap 30 detik
- Resume tes jika browser tertutup (berlaku 2 jam)
- Timer countdown
- Navigasi soal (lompat ke nomor tertentu)
- Tandai soal untuk review
- Mode review setelah submit

**Sertifikat Digital:**
- Desain kartu emas (gold-themed)
- Nomor sertifikat unik
- Nama, skor, tanggal
- Download sebagai PDF
- Halaman sertifikat saya (/certificates)

### 8. Sistem Anti-Kecurangan (Proctoring)

3 tingkat pengawasan untuk tes sertifikasi:

**Tier 1: Browser Lockdown**
- Fullscreen wajib
- Deteksi pindah tab (visibilitychange)
- Deteksi blur window
- Blokir copy/paste/right-click
- Deteksi DevTools

**Tier 2: Kamera**
- Webcam aktif selama tes
- Preview kamera di sudut kanan bawah
- Deteksi wajah setiap 15 detik (FaceDetector API / skin-tone fallback)
- Deteksi: tidak ada wajah, lebih dari satu wajah
- Snapshot saat pelanggaran

**Tier 3: Mikrofon**
- Monitoring suara ambient
- Deteksi frekuensi bicara (85-255 Hz)
- Alert jika bicara terdeteksi >2 detik

**Sistem Peringatan:**
- Peringatan 1: Modal warning + lanjutkan
- Peringatan 2: Modal warning + "Satu pelanggaran lagi akan mengakhiri tes"
- Peringatan 3: Tes otomatis di-submit

---

## Jumlah Konten

### Ringkasan per Sumber Data

| Sumber | Jumlah Item |
|--------|-------------|
| Data Dasar (CSV seed) | 2.717 |
| Konten N2 (JSON) | 2.649 |
| Konten N1 (JSON) | 2.036 |
| Soal Sertifikasi | 420 |
| Konten Bahasa Inggris | 1.709 |
| **Total** | **~9.531** |

### Detail per Jenis Konten

| Jenis Konten | Jumlah |
|-------------|--------|
| Kosakata (Vocabulary) | ~2.091 |
| Kartu Flashcard | ~906 |
| Pelajaran (Lessons) | ~250 |
| Soal Kuis Latihan | ~880 |
| Soal Kuis Pelajaran | ~594 |
| Item Berbicara | ~375 |
| Soal Tes Simulasi | ~384 |
| Soal Sertifikasi | 420 |
| Karakter Kanji | ~905 |
| Soal Membaca | ~109 |
| Soal Mendengar | ~99 |
| Deck Flashcard | ~24 |
| Pelajaran Berbicara | ~59 |
| Teks Bacaan | ~30 |
| Item Mendengar | ~27 |
| Bab (Chapters) | ~44 |
| Set Kuis | ~53 |
| Karakter Kana | 183 |
| Lainnya (badge, tip budaya, dll) | ~98 |

### Detail Konten per Level JLPT

**JLPT N5 (Pemula)**
- 15 bab, 84 pelajaran
- 403 kosakata
- 103+ karakter kanji
- 183 karakter kana (hiragana + katakana)
- 194 soal kuis
- 55 soal tes simulasi
- 55 soal sertifikasi

**JLPT N4 (Dasar)**
- Konten terintegrasi dalam data dasar
- 55 soal sertifikasi

**JLPT N3 (Menengah)**
- Konten terintegrasi dalam data dasar
- 70 soal sertifikasi

**JLPT N2 (Lanjutan)**
- 6 bab, 26 pelajaran
- 988 kosakata
- 385 karakter kanji
- 239 kartu flashcard (3 deck)
- 240 soal kuis latihan (8 set)
- 208 soal kuis pelajaran
- 50 soal tes simulasi
- 90 soal sertifikasi
- 6 teks bacaan, 18 soal membaca
- 5 item mendengar, 15 soal mendengar
- 60 item berbicara (6 pelajaran)

**JLPT N1 (Mahir)**
- 8 bab, 48 pelajaran
- 500 kosakata
- 300 karakter kanji
- 320 kartu flashcard (4 deck: grammar, vocab, keigo, idiom)
- 400 soal kuis latihan (8 set)
- 192 soal kuis pelajaran
- 50 soal tes simulasi
- 120 soal sertifikasi
- 10 teks bacaan, 50 soal membaca
- 10 item mendengar, 50 soal mendengar
- 80 item berbicara (6 pelajaran)

**Kemnaker (IM Japan)**
- 30 soal sertifikasi Kakunin
- Konten terintegrasi dengan data dasar N5

---

## Navigasi Aplikasi

### Menu Bawah (Bottom Navigation)

| Ikon | Label | Halaman |
|------|-------|---------|
| Home | Home | Dashboard utama |
| Book | Learn | Belajar - pilih track & bab |
| Mic | Speaking | Latihan berbicara |
| Layers | Practice | Flashcard, kuis, tes, sertifikasi, progres |
| User | Profile | Profil, pengaturan, sertifikat |

### Peta Halaman

```
/ (Landing Page)
|
+-- /auth (Login / Daftar)
+-- /forgot-password (Lupa Password)
+-- /reset-password (Reset Password)
+-- /onboarding (Setup Awal)
|
+-- /home (Dashboard)
|   +-- Aksi Cepat: Belajar, Bicara, Latihan, Ujian, Chat
|
+-- /learn (Belajar)
|   +-- /chapter/:id (Detail Bab)
|   |   +-- /lesson/:id (Pelajaran)
|   |   +-- /jlpt-lesson/:id (Pelajaran JLPT)
|   +-- /kana (Hiragana & Katakana)
|   +-- /kanji (Kanji N5-N1)
|   +-- /reading (Latihan Membaca)
|   +-- /listening (Latihan Mendengar)
|   +-- /cultural-tips (Tips Budaya)
|
+-- /speaking (Latihan Berbicara)
|   +-- 6 mode: Shadowing, Pronunciation, Conversation,
|       Role Play, Read Aloud, Pitch Accent
|
+-- /practice (Latihan)
|   +-- Tab Flashcard --> /flashcard
|   +-- Tab Kuis (inline)
|   +-- Tab Tes --> /mock-test?type=
|   +-- Tab Sertifikasi --> /certification-test?type=
|   +-- Tab Progres --> /analytics
|
+-- /profile (Profil)
|   +-- /certificates (Sertifikat Saya)
|   |   +-- /certificate/:id (Lihat Sertifikat)
|   +-- /bookmarks (Bookmark Saya)
|   +-- /analytics (Analitik Lengkap)
|   +-- /settings (Pengaturan)
|   +-- /leaderboard (Papan Peringkat)
|   |   +-- /friends (Teman)
|   +-- /install (Instal Aplikasi)
|
+-- /chat (Chat AI - Rafiq Sensei)
+-- /exam (Ujian)
```

---

## Fitur Utama

### Gamifikasi
- **XP (Experience Points)** - didapat dari menyelesaikan pelajaran, kuis, tes
- **Level** - naik berdasarkan total XP
- **Streak** - hitung hari berturut-turut belajar
- **Tantangan Harian** - target 3 pelajaran/hari
- **Badge/Achievement** - penghargaan khusus
- **Papan Peringkat** - semua waktu, bulanan, mingguan

### Premium vs Gratis

| Fitur | Gratis | Premium |
|-------|--------|---------|
| Bab pertama | Ya | Ya |
| Bab lainnya | Terkunci | Terbuka |
| Chat AI | 5 pesan/hari | Unlimited |
| Batas karakter chat | 500 | 2.000 |
| Tes simulasi | 1x/hari | Unlimited |
| Sertifikasi | Ya | Ya |
| Flashcard premium | Terkunci | Terbuka |

### Aksesibilitas
- Tema: Terang, Gelap, Sistem
- Ukuran font dapat diatur
- Mode kontras tinggi
- Text-to-speech
- Dukungan keyboard
- Input suara

### Offline Support
- Download audio untuk offline
- Sinkronisasi & backup data
- PWA - install sebagai aplikasi

### Bahasa Antarmuka
- Indonesia (default)
- English
- Japanese

---

## Database

### Tabel Utama (36 tabel)

**Konten Pembelajaran:**
- `chapters` - Bab pembelajaran
- `lessons` - Pelajaran
- `vocabulary` - Kosakata
- `kanji` - Karakter kanji
- `kana` - Hiragana & katakana
- `reading_passages` - Teks bacaan
- `reading_questions` - Soal membaca
- `listening_items` - Item mendengar
- `listening_questions` - Soal mendengar
- `cultural_tips` - Tips budaya

**Flashcard & Kuis:**
- `flashcard_decks` - Deck flashcard
- `flashcard_cards` - Kartu flashcard
- `quiz_questions` - Soal kuis per pelajaran
- `practice_quiz_sets` - Set kuis latihan
- `practice_quiz_questions` - Soal kuis latihan

**Tes & Sertifikasi:**
- `mock_test_questions` - Soal tes simulasi
- `test_attempts` - Riwayat tes
- `certification_test_questions` - Soal sertifikasi
- `certificates` - Sertifikat yang diperoleh

**Berbicara:**
- `speaking_lessons` - Pelajaran berbicara
- `speaking_items` - Item latihan berbicara
- `conversation_scripts` - Skenario percakapan
- `conversation_lines` - Baris dialog
- `roleplay_scenarios` - Skenario role play
- `user_speaking_progress` - Progres berbicara
- `speaking_sessions` - Sesi latihan
- `user_recordings` - Rekaman pengguna

**Menulis (Bahasa Inggris):**
- `writing_prompts` - Tugas menulis
- `writing_submissions` - Kiriman menulis

**Pengguna:**
- `profiles` - Profil pengguna
- `user_progress` - Progres belajar
- `subscriptions` - Langganan
- `badges` / `user_badges` - Achievement
- `chat_messages` - Riwayat chat

### Edge Functions (6 fungsi)

| Fungsi | Kegunaan | Provider |
|--------|----------|----------|
| `rafiq-chat` | Chat AI | DekaLLM --> Lovable (fallback) |
| `speech-analysis` | Analisis pengucapan | DekaLLM --> Lovable --> Basic |
| `kanji-ocr` | Pengenalan kanji dari gambar | DekaLLM Vision --> Anthropic Claude |
| `google-tts` | Text-to-speech Jepang | Google Cloud TTS --> DekaLLM TTS |
| `delete-account` | Hapus akun pengguna | Supabase Admin |
| `manage-sessions` | Kelola sesi aktif | Supabase Admin |

---

## Deployment

| Komponen | Detail |
|----------|--------|
| Server | Ubuntu, IP 202.138.242.12 |
| Frontend | Vite Preview (port 4173 --> 3603) |
| Database | Supabase lokal (port 54321 --> 3604) |
| Proses | tmux session `rafiq` |
| Deploy | Manual copy (WinSCP/FileZilla) |

### Langkah Deploy

```bash
# 1. Build di lokal
cd rafiq-nihon
npm run build

# 2. Copy dist/ dan package.json ke server
# (via WinSCP/FileZilla dengan .ppk key)

# 3. Di server
cd ~/Documents/rafiq-nihon
npm install
chmod -R +x node_modules/.bin/

# 4. Jalankan di tmux
tmux attach -t rafiq
npx vite preview --host 0.0.0.0 --port 4173
```

### Import Data

```bash
# Data dasar (Kemnaker, N5, N4, N3)
bash scripts/seed-db.sh

# Data N2
npx tsx scripts/import-en-content.ts

# Data N1
npx tsx scripts/import-n1-content.ts

# Soal sertifikasi (semua level)
npx tsx scripts/import-cert-questions.ts
```

---

## Versi

- **Versi:** 1.0.0
- **Terakhir diperbarui:** Februari 2026
- **Platform:** Web (PWA - dapat diinstal di Android/iOS)
