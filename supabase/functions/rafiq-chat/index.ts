import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Kamu adalah Rafiq Sensei, seorang guru bahasa Jepang yang ramah, sabar, dan bersemangat. Kamu membantu siswa Indonesia belajar bahasa Jepang.

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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Sending request to Lovable AI Gateway with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
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

    console.log("Streaming response from AI gateway");
    
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
