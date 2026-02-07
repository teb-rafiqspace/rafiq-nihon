import Anthropic from "npm:@anthropic-ai/sdk@0.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract base64 data from data URL
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const mediaType = image.match(/^data:(image\/\w+);base64,/)?.[1] || "image/jpeg";

    const client = new Anthropic();

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: "text",
              text: `Analyze this image and identify ALL Japanese kanji characters visible in it. 
              
              For each kanji found, provide:
              1. The character itself
              2. A confidence score (0.0 to 1.0)
              
              Return ONLY a JSON object in this exact format, with no additional text:
              {"characters": [{"character": "日", "confidence": 0.95}, {"character": "本", "confidence": 0.90}]}
              
              If no kanji are found, return: {"characters": []}
              
              Important:
              - Only include actual kanji (not hiragana, katakana, or romaji)
              - Include all visible kanji, even partial ones with lower confidence
              - Order by confidence, highest first`,
            },
          ],
        },
      ],
    });

    // Extract text from response
    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      return new Response(
        JSON.stringify({ characters: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse JSON from response
    try {
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch {
      // If JSON parsing fails, return empty
    }

    return new Response(
      JSON.stringify({ characters: [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Kanji OCR error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to process image" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
