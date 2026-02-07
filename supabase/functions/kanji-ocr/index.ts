import Anthropic from "npm:@anthropic-ai/sdk@0.39.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Maximum image size in bytes (5MB)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

Deno.serve(async (req) => {
  // Handle CORS
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

    console.log("Authenticated user for kanji OCR:", userId);

    const { image } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate image size to prevent abuse
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const imageSize = base64Data.length * 0.75; // Approximate decoded size
    
    if (imageSize > MAX_IMAGE_SIZE) {
      return new Response(
        JSON.stringify({ error: "Image too large. Maximum size is 5MB." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
