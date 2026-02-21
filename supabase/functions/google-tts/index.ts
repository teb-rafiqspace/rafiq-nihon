import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, speed = 1.0, voiceId = 'ja-JP-Neural2-B', action = 'synthesize' } = await req.json();
    
    const apiKey = Deno.env.get('GOOGLE_CLOUD_TTS_API_KEY');
    
    if (!apiKey) {
      console.error('GOOGLE_CLOUD_TTS_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'TTS service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Test action - just verify API key is valid
    if (action === 'test') {
      console.log('Testing Google Cloud TTS API key...');
      
      const testResponse = await fetch(
        `https://texttospeech.googleapis.com/v1/voices?key=${apiKey}&languageCode=ja-JP`
      );
      
      if (!testResponse.ok) {
        const errorData = await testResponse.text();
        console.error('API key test failed:', errorData);
        return new Response(
          JSON.stringify({ valid: false, error: errorData }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const voices = await testResponse.json();
      const japaneseVoices = voices.voices?.filter((v: any) => 
        v.languageCodes?.includes('ja-JP') && v.name?.includes('Neural2')
      ) || [];
      
      console.log(`API key valid! Found ${japaneseVoices.length} Japanese Neural2 voices`);
      
      return new Response(
        JSON.stringify({ 
          valid: true, 
          voiceCount: japaneseVoices.length,
          voices: japaneseVoices.map((v: any) => v.name)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Synthesize action
    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Synthesizing: "${text}" with voice ${voiceId} at speed ${speed}`);

    // Tier 1: Google Cloud TTS (primary - highest quality for Japanese)
    if (apiKey && apiKey !== 'your-google-tts-key-here') {
      try {
        const response = await fetch(
          `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              input: { text },
              voice: { languageCode: 'ja-JP', name: voiceId },
              audioConfig: { audioEncoding: 'MP3', speakingRate: speed, pitch: 0 },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('Google Cloud TTS synthesis successful');
          return new Response(
            JSON.stringify({ audioContent: data.audioContent }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        console.error('Google TTS failed:', response.status);
      } catch (googleError) {
        console.error('Google TTS error:', googleError);
      }
    }

    // Tier 2: DekaLLM TTS fallback
    const DEKALLM_API_KEY = Deno.env.get('DEKALLM_API_KEY');
    if (DEKALLM_API_KEY && DEKALLM_API_KEY !== 'your-dekallm-key-here') {
      try {
        console.log('Falling back to DekaLLM TTS...');
        const dekaResponse = await fetch('https://dekallm.cloudeka.ai/v1/audio/speech', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${DEKALLM_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'tts-1',
            input: text,
            voice: 'alloy',
          }),
        });

        if (dekaResponse.ok) {
          const audioBuffer = await dekaResponse.arrayBuffer();
          const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
          console.log('DekaLLM TTS synthesis successful');
          return new Response(
            JSON.stringify({ audioContent: base64Audio }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        console.error('DekaLLM TTS failed:', dekaResponse.status);
      } catch (dekaError) {
        console.error('DekaLLM TTS error:', dekaError);
      }
    }

    return new Response(
      JSON.stringify({ error: 'All TTS providers failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
