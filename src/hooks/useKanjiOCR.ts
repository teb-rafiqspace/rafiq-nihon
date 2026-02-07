import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface KanjiResult {
  character: string;
  confidence: number;
  meanings_id?: string;
  meanings_en?: string;
  on_readings?: string[];
  kun_readings?: string[];
}

export function useKanjiOCR() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<KanjiResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const processImage = useCallback(async (imageData: string | Blob) => {
    setIsProcessing(true);
    setError(null);
    setResults([]);

    try {
      // Convert Blob to base64 if needed
      let base64Image: string;
      if (imageData instanceof Blob) {
        base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imageData);
        });
      } else {
        base64Image = imageData;
      }

      // Call edge function for OCR processing
      const { data, error: fnError } = await supabase.functions.invoke('kanji-ocr', {
        body: { image: base64Image }
      });

      if (fnError) throw fnError;

      if (data?.characters && data.characters.length > 0) {
        // Look up kanji details from database
        const characters = data.characters.map((c: any) => c.character);
        
        const { data: kanjiData } = await supabase
          .from('kanji_characters')
          .select('character, meanings_id, meanings_en, on_readings, kun_readings')
          .in('character', characters);

        const enrichedResults: KanjiResult[] = data.characters.map((c: any) => {
          const dbKanji = kanjiData?.find(k => k.character === c.character);
          return {
            character: c.character,
            confidence: c.confidence || 0.8,
            meanings_id: dbKanji?.meanings_id,
            meanings_en: dbKanji?.meanings_en,
            on_readings: dbKanji?.on_readings,
            kun_readings: dbKanji?.kun_readings
          };
        });

        setResults(enrichedResults);
        return enrichedResults;
      }

      setResults([]);
      return [];
    } catch (err: any) {
      const message = err.message || 'Gagal memproses gambar';
      setError(message);
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResults([]);
    setError(null);
    setIsProcessing(false);
  }, []);

  return {
    isProcessing,
    results,
    error,
    processImage,
    reset
  };
}
