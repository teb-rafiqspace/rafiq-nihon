import { motion } from 'framer-motion';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface VocabularyCardProps {
  wordJp: string;
  reading?: string;
  meaningId: string;
  exampleJp?: string;
  exampleId?: string;
  audioUrl?: string;
}

export function VocabularyCard({
  wordJp,
  reading,
  meaningId,
  exampleJp,
  exampleId,
  audioUrl,
}: VocabularyCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasJapaneseVoice, setHasJapaneseVoice] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  // Find the best Japanese female voice
  useEffect(() => {
    const findBestVoice = () => {
      const voices = speechSynthesis.getVoices();
      const japaneseVoices = voices.filter(voice => voice.lang.startsWith('ja'));
      
      if (japaneseVoices.length === 0) {
        setHasJapaneseVoice(false);
        return;
      }
      
      setHasJapaneseVoice(true);
      
      // Priority list for female Japanese voices (lively, native)
      const femaleVoiceKeywords = [
        'haruka',    // Windows - female, natural
        'nanami',    // Azure - female, cheerful
        'ayumi',     // Windows - female
        'kyoko',     // macOS/iOS - female
        'o-ren',     // Some systems
        'mizuki',    // AWS Polly style
        'female',
        'woman',
        '女性',       // Japanese for "female"
      ];
      
      // Try to find a female voice
      let bestVoice = japaneseVoices.find(voice => {
        const nameLower = voice.name.toLowerCase();
        return femaleVoiceKeywords.some(keyword => nameLower.includes(keyword));
      });
      
      // If no specific female voice found, prefer Google Japanese or first available
      if (!bestVoice) {
        bestVoice = japaneseVoices.find(v => v.name.includes('Google')) || japaneseVoices[0];
      }
      
      setSelectedVoice(bestVoice);
      console.log('Selected Japanese voice:', bestVoice?.name);
    };
    
    findBestVoice();
    speechSynthesis.onvoiceschanged = findBestVoice;
    
    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, []);
  
  const speakJapanese = (text: string) => {
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9; // Slightly faster for lively feel
    utterance.pitch = 1.1; // Slightly higher pitch for female/lively sound
    
    // Use the selected female voice
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    speechSynthesis.speak(utterance);
  };
  
  const playAudio = () => {
    if (audioUrl) {
      // Use provided audio URL
      setIsPlaying(true);
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        // Fallback to speech synthesis
        speakJapanese(wordJp);
      };
      audio.play().catch(() => {
        setIsPlaying(false);
        speakJapanese(wordJp);
      });
    } else {
      // Use speech synthesis
      speakJapanese(wordJp);
    }
  };
  
  const playExample = () => {
    if (exampleJp) {
      speakJapanese(exampleJp);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 shadow-card border border-border"
    >
      {/* Japanese Word */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <h2 className="font-jp text-4xl font-bold text-foreground">
            {wordJp}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={playAudio}
            className="rounded-full h-10 w-10 bg-primary/10 hover:bg-primary/20"
          >
            {isPlaying ? (
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            ) : (
              <Volume2 className="h-5 w-5 text-primary" />
            )}
          </Button>
        </div>
        {reading && (
          <p className="text-lg text-muted-foreground font-medium">
            {reading}
          </p>
        )}
      </div>
      
      {/* Divider */}
      <div className="h-px bg-border my-4" />
      
      {/* Indonesian Meaning */}
      <div className="text-center mb-4">
        <p className="text-xl font-semibold text-primary">
          {meaningId}
        </p>
      </div>
      
      {/* Main Audio Button */}
      <div className="flex justify-center mb-4">
        <Button
          variant="outline"
          size="lg"
          onClick={playAudio}
          className="gap-2 min-w-[200px]"
        >
          {isPlaying ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Memutar...
            </>
          ) : (
            <>
              <Volume2 className="h-5 w-5" />
              Dengarkan Pengucapan
            </>
          )}
        </Button>
      </div>
      
      {!hasJapaneseVoice && (
        <p className="text-xs text-center text-muted-foreground mb-4">
          💡 Untuk audio terbaik, gunakan Chrome atau Edge
        </p>
      )}
      
      {/* Example Sentence */}
      {exampleJp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-muted/50 rounded-xl p-4 mt-4"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium">Contoh:</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={playExample}
              className="h-7 px-2 gap-1 text-xs"
            >
              <Volume2 className="h-3 w-3" />
              Putar
            </Button>
          </div>
          <p className="font-jp text-lg mb-1">「{exampleJp}」</p>
          {exampleId && (
            <p className="text-sm text-muted-foreground">"{exampleId}"</p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
