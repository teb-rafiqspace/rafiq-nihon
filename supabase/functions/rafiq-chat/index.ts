import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SENSEI_PROMPT = `Kamu adalah Rafiq Sensei, seorang guru bahasa Jepang yang ramah, sabar, dan bersemangat. Kamu membantu siswa Indonesia belajar bahasa Jepang.

Panduan:
1. Jawab dalam Bahasa Indonesia, tetapi sertakan contoh dalam bahasa Jepang
2. Gunakan format: [Kanji/Hiragana] - [Romaji] - [Arti]
3. Berikan penjelasan yang mudah dipahami dengan contoh praktis
4. Sertakan tips budaya Jepang jika relevan
5. Gunakan emoji untuk membuat respons lebih menarik 🎌
6. Fokus pada bahasa Jepang untuk kerja (Kemnaker) dan JLPT N5
7. Jika ditanya di luar topik bahasa Jepang, arahkan kembali dengan sopan
8. Batasi respons maksimal 300 kata agar mudah dibaca

Contoh format respons:
"Bagus sekali! 🌸

**Kata:** おはようございます
**Romaji:** Ohayou gozaimasu
**Arti:** Selamat pagi (formal)

**Tips:** Gunakan ini di tempat kerja atau kepada orang yang lebih tua. Untuk teman, cukup 'おはよう' (Ohayou) saja!

Ada yang ingin kamu tanyakan lagi? 😊"`;

const CONVERSATION_PROMPT = `Kamu adalah teman percakapan bahasa Jepang. Balas terutama dalam bahasa Jepang.

Panduan:
1. Balas terutama dalam bahasa Jepang
2. Sertakan furigana/reading dalam tanda kurung setelah kanji: 今日(きょう)は天気(てんき)がいいですね。
3. Tambahkan terjemahan bahasa Indonesia di bawah respons Jepang
4. Gunakan level JLPT N5-N3 (kosakata dan grammar sederhana)
5. Perbaiki kesalahan bahasa Jepang pengguna dengan lembut
6. Jaga percakapan mengalir alami seperti teman
7. Jika pengguna menulis dalam bahasa Indonesia, jawab dalam bahasa Jepang tetapi tetap sertakan terjemahan
8. Batasi respons 200 kata agar mudah dibaca

Format respons:
🇯🇵 今日(きょう)は何(なに)をしましたか？

🇮🇩 Hari ini kamu ngapain?`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("Missing or invalid Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's JWT
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify JWT and get user claims
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      console.error("JWT verification failed:", claimsError?.message);
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    if (!userId) {
      console.error("No user ID in claims");
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check subscription and chat limits
    const { data: subscription, error: subError } = await supabaseClient
      .from("subscriptions")
      .select("plan_type, chats_remaining")
      .eq("user_id", userId)
      .single();

    if (subError) {
      console.error("Error fetching subscription:", subError.message);
      return new Response(
        JSON.stringify({ error: "Subscription check failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Enforce chat limits for non-premium users
    if (!subscription || (subscription.plan_type !== "premium" && (subscription.chats_remaining ?? 0) <= 0)) {
      console.log("Chat limit reached for user:", userId);
      return new Response(
        JSON.stringify({ error: "Batas chat harian tercapai. Upgrade ke Premium untuk chat tanpa batas." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages, mode } = await req.json();
    const systemPrompt = mode === 'conversation' ? CONVERSATION_PROMPT : SENSEI_PROMPT;

    console.log("Authenticated user:", userId, "- Sending request with", messages.length, "messages, mode:", mode || "sensei");

    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // Tier 1: DekaLLM API
    const DEKALLM_API_KEY = Deno.env.get("DEKALLM_API_KEY");
    if (DEKALLM_API_KEY && DEKALLM_API_KEY !== "your-dekallm-key-here") {
      try {
        console.log("Trying DekaLLM API for chat...");
        const dekaResponse = await fetch("https://dekallm.cloudeka.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${DEKALLM_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "nvidia/nemotron-3-nano-30b-a3b",
            messages: chatMessages,
            stream: true,
          }),
        });

        if (dekaResponse.ok) {
          console.log("Streaming response from DekaLLM for user:", userId);
          return new Response(dekaResponse.body, {
            headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
          });
        }
        console.error("DekaLLM error:", dekaResponse.status);
      } catch (dekaError) {
        console.error("DekaLLM failed:", dekaError);
      }
    }

    // Tier 2: Lovable API fallback
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY || LOVABLE_API_KEY === "your-lovable-key-here") {
      throw new Error("No AI API keys configured (DEKALLM_API_KEY and LOVABLE_API_KEY both missing)");
    }

    console.log("Falling back to Lovable API for chat...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: chatMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Terlalu banyak permintaan. Coba lagi nanti." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Kredit AI habis. Hubungi administrator." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Gagal menghubungi AI. Coba lagi nanti." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Streaming response from Lovable API for user:", userId);

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("rafiq-chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
