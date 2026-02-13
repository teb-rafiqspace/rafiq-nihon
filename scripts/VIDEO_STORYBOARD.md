# Rafiq Nihon Demo Video Storyboard

**Duration:** ~3-4 minutes
**Account for demo:** munanjar@gmail.com
**Resolution:** Record at 1080x1920 (portrait/mobile) or use browser DevTools mobile mode

---

## Scene 1: Landing Page (10 sec)
**Screen:** `/` (landing page)
**Action:**
1. Show the landing page with logo animation and floating Japanese characters
2. Pause briefly on the tagline "Teman setia belajar bahasa Jepang"
3. Scroll down to show feature cards (Materi Lengkap, AI Assistant, Gamifikasi)
4. Click **"Mulai Belajar Gratis"**

---

## Scene 2: Registration (15 sec)
**Screen:** `/auth`
**Action:**
1. Tab is on "Daftar" (Register)
2. Type full name: **"Datu Rajab Munanjar"**
3. Type email: (use a new email or show the form being filled)
4. Type password
5. Click **"Daftar"**
6. Show the email verification screen briefly

**Tip:** For the video, you can just log in with the existing account (munanjar@gmail.com) instead of creating a new one. Skip to login if needed.

---

## Scene 3: Onboarding (20 sec)
**Screen:** `/onboarding`
**Action:**
1. Welcome screen - click Next
2. Select goal: **"Kemnaker / IM Japan"** (factory icon)
3. Select level: **"Pemula"** (beginner)
4. Select time: **"15 min"** (Konsisten)
5. Completion screen shows "Kamu siap! Ganbatte!"
6. Click to continue to Home

**Note:** Onboarding only shows once. To re-trigger it, you may need to clear the profile's onboarding_completed flag.

---

## Scene 4: Home Dashboard (15 sec)
**Screen:** `/home`
**Action:**
1. Show the greeting and stats (XP: 2450, Level: 8, Streak: 12, Lessons: 35)
2. Scroll to show the learning tracks with progress bars
3. Show Quick Actions (Belajar, Bicara, Latihan, Ujian, Rafiq)
4. Show Daily Challenge card
5. Click **"Belajar"** quick action

---

## Scene 5: Learn Page (15 sec)
**Screen:** `/learn`
**Action:**
1. Show the chapter list for Kemnaker track
2. Scroll through chapters to show progress
3. Click on a chapter to enter it

---

## Scene 6: Chapter & Lesson (20 sec)
**Screen:** `/chapter/:id` then `/lesson/:id`
**Action:**
1. Show chapter detail with lesson list
2. Click on a lesson
3. Show lesson content (sections, key points, grammar patterns)
4. Scroll through the lesson content
5. Complete the lesson (if there's a completion action)
6. Go back to Home

---

## Scene 7: Practice Page - Sertifikasi Tab (15 sec)
**Screen:** `/practice?tab=certification`
**Action:**
1. Navigate to Practice page via bottom nav
2. Show the tab bar - tap **"Sertifikasi"** tab
3. Show the gold-accented certification test cards
4. Note: IM Japan Kakunin shows green checkmark (already has certificate)
5. Show the "Skor terbaik: 83%" on Kakunin card
6. Click **"Mulai Sertifikasi"** on **JLPT N5**

---

## Scene 8: Certification Test (30 sec)
**Screen:** `/certification-test?type=cert_jlpt_n5`
**Action:**
1. Show the Test Start Screen (test info, sections, passing score)
2. Click **"Mulai Tes"**
3. Show the timer running and first question
4. Answer a few questions (show selecting options)
5. Click the grid icon to show Section Navigation Grid
6. Show navigating between sections
7. Flag a question (show the flag feature)
8. Navigate to last question
9. Click **"Selesai"** to show submit confirmation dialog
10. Click **"Ya, Kumpulkan"** to submit

**Tip:** Answer all questions correctly for a passing score. The correct answers are in the JSON files in `scripts/cert-data/cert_jlpt_n5.json`.

---

## Scene 9: Results & Certificate Unlocked (15 sec)
**Screen:** Results screen + Certificate modal
**Action:**
1. Show the results screen (score, pass/fail, section breakdown)
2. If passed: confetti animation plays!
3. Certificate Unlocked modal appears with gold theme
4. Show the certificate number and score
5. Click **"Lihat Sertifikat"**

---

## Scene 10: Certificate View (15 sec)
**Screen:** `/certificate/:id`
**Action:**
1. Show the full gold-themed certificate card
2. Scroll to show section score details
3. Click **"Download PDF"** - show the PDF being downloaded
4. Click Share button - show WhatsApp/Twitter/Copy options
5. Click "Salin Teks" to copy

---

## Scene 11: My Certificates Collection (10 sec)
**Screen:** `/certificates`
**Action:**
1. Navigate to Profile via bottom nav
2. Click **"Sertifikat Saya"** menu item
3. Show the certificates list (Kakunin cert from before + new JLPT N5 cert)
4. Click on the Kakunin certificate to show it

---

## Scene 12: Closing (5 sec)
**Action:**
1. Go back to Home
2. Show updated XP/stats
3. Fade out

---

## Recording Tips

1. **Browser DevTools:** Press F12 > Toggle device toolbar (Ctrl+Shift+M) > Select iPhone 12/13 (390x844) for consistent mobile look
2. **Dark/Light mode:** Record in light mode for better visibility on video
3. **Speed:** Use normal speed for interactions, can speed up typing in post-production
4. **Screen recorder:** OBS Studio (free) or Windows Game Bar (Win+G)
5. **For the test:** Open `scripts/cert-data/cert_jlpt_n5.json` on a second monitor to see correct answers while recording

## Demo Account Details

- **Email:** munanjar@gmail.com
- **Profile:** Datu Rajab Munanjar (Level 8, 2450 XP, 12-day streak, 35 lessons)
- **Existing Certificate:** IM Japan Kakunin (83%, issued 2026-02-10)
- **Local Supabase:** http://127.0.0.1:54321
- **App:** http://localhost:8080
