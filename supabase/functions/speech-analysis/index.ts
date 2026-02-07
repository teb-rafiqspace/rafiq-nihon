import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SpeechAnalysisRequest {
  spokenText: string;
  targetText: string;
  targetReading?: string;
  pitchPattern?: string;
}

interface PronunciationProblem {
  type: 'missing' | 'wrong' | 'extra' | 'timing' | 'pitch';
  character: string;
  position: number;
  expected?: string;
  actual?: string;
  suggestion: string;
  severity: 'minor' | 'moderate' | 'major';
}

interface AnalysisResult {
  overallScore: number;
  pronunciationScore: number;
  accuracyScore: number;
  fluencyScore: number;
  pitchAccuracyScore: number;
  problems: PronunciationProblem[];
  feedback: {
    positive: string[];
    improvements: string[];
  };
  detailedAnalysis: {
    characterAccuracy: number;
    wordOrder: number;
    completeness: number;
    pitchAccuracy: number;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { spokenText, targetText, targetReading, pitchPattern }: SpeechAnalysisRequest = await req.json();

    if (!spokenText || !targetText) {
      return new Response(
        JSON.stringify({ error: "Missing spokenText or targetText" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use AI to analyze pronunciation
    const analysisPrompt = `You are a Japanese pronunciation analysis expert. Analyze the following speech attempt:

Target phrase: ${targetText}
${targetReading ? `Target reading (hiragana): ${targetReading}` : ''}
${pitchPattern ? `Pitch pattern: ${pitchPattern}` : ''}
User spoke: ${spokenText}

Provide a detailed analysis in the following JSON format:
{
  "overallScore": <0-100>,
  "pronunciationScore": <0-100>,
  "accuracyScore": <0-100>,
  "fluencyScore": <0-100>,
  "pitchAccuracyScore": <0-100>,
  "problems": [
    {
      "type": "<missing|wrong|extra|timing|pitch>",
      "character": "<problematic character>",
      "position": <index>,
      "expected": "<expected sound>",
      "actual": "<what was said>",
      "suggestion": "<helpful tip in English>",
      "severity": "<minor|moderate|major>"
    }
  ],
  "feedback": {
    "positive": ["<positive feedback points>"],
    "improvements": ["<improvement suggestions>"]
  },
  "detailedAnalysis": {
    "characterAccuracy": <0-100>,
    "wordOrder": <0-100>,
    "completeness": <0-100>,
    "pitchAccuracy": <0-100>
  }
}

Be encouraging but accurate. Focus on common Japanese pronunciation challenges for Indonesian learners like:
- つ (tsu) vs す (su)
- ふ (fu) - the soft f/h sound
- ら行 (ra-line) - the Japanese r sound
- Long vowels (ー)
- Double consonants (っ)
- Pitch accent patterns

Return ONLY valid JSON, no additional text.`;

    const response = await fetch("https://lovable.dev/api/ai-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a Japanese pronunciation expert. Respond only with valid JSON." },
          { role: "user", content: analysisPrompt }
        ],
        model: "google/gemini-2.5-flash"
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const aiContent = aiResponse.choices?.[0]?.message?.content || aiResponse.content || "";
    
    // Parse the AI response
    let analysis: AnalysisResult;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = aiContent.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, aiContent];
      const jsonStr = jsonMatch[1]?.trim() || aiContent.trim();
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent);
      // Fallback to basic analysis
      analysis = performBasicAnalysis(spokenText, targetText, targetReading);
    }

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Speech analysis error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Fallback basic analysis
function performBasicAnalysis(spoken: string, target: string, reading?: string): AnalysisResult {
  const normalizedSpoken = normalizeJapanese(spoken);
  const normalizedTarget = normalizeJapanese(reading || target);
  
  const similarity = calculateSimilarity(normalizedSpoken, normalizedTarget);
  const completeness = Math.min(1, normalizedSpoken.length / Math.max(normalizedTarget.length, 1));
  
  const problems: PronunciationProblem[] = [];
  const targetChars = normalizedTarget.split('');
  
  targetChars.forEach((char, index) => {
    if (!normalizedSpoken.includes(char)) {
      problems.push({
        type: 'missing',
        character: char,
        position: index,
        expected: char,
        suggestion: `Practice the "${char}" sound`,
        severity: 'moderate'
      });
    }
  });

  const overallScore = Math.round(similarity * 100);
  
  return {
    overallScore,
    pronunciationScore: Math.round(similarity * 95),
    accuracyScore: Math.round(similarity * 100),
    fluencyScore: Math.round(completeness * 90),
    pitchAccuracyScore: 70, // Default when pitch analysis unavailable
    problems,
    feedback: {
      positive: overallScore >= 70 ? ["Good attempt!"] : ["Keep practicing!"],
      improvements: overallScore < 80 ? ["Focus on pronunciation clarity"] : []
    },
    detailedAnalysis: {
      characterAccuracy: Math.round(similarity * 100),
      wordOrder: Math.round(similarity * 100),
      completeness: Math.round(completeness * 100),
      pitchAccuracy: 70
    }
  };
}

function normalizeJapanese(text: string): string {
  return text
    .replace(/[\s、。！？・「」『』（）\[\]]/g, '')
    .replace(/[\u30a1-\u30f6]/g, (match) => String.fromCharCode(match.charCodeAt(0) - 0x60))
    .replace(/ー/g, '')
    .toLowerCase();
}

function calculateSimilarity(str1: string, str2: string): number {
  if (str1.length === 0 && str2.length === 0) return 1;
  if (str1.length === 0 || str2.length === 0) return 0;
  
  const distance = levenshteinDistance(str1, str2);
  return Math.max(0, 1 - distance / Math.max(str1.length, str2.length));
}

function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j - 1] + 1, dp[i - 1][j] + 1, dp[i][j - 1] + 1);
      }
    }
  }
  
  return dp[m][n];
}
