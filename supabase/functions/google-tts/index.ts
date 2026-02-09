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

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: 'ja-JP',
            name: voiceId,
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: speed,
            pitch: 0,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('TTS synthesis failed:', errorData);
      return new Response(
        JSON.stringify({ error: 'TTS synthesis failed', details: errorData }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    console.log('TTS synthesis successful');
    
    return new Response(
      JSON.stringify({ audioContent: data.audioContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
