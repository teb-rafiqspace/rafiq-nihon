import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Volume2, VolumeX, SkipForward, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RecordingButton } from './RecordingButton';
import { WaveformVisualizer } from './WaveformVisualizer';
import { SpeakingResultCard } from './SpeakingResultCard';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { SpeakingItem } from '@/hooks/useSpeaking';

interface ShadowingPracticeProps {
  lessonTitle: string;
  lessonTitleJp: string;
  items: SpeakingItem[];
  onComplete: (results: { score: number; completed: number }) => void;
  onBack: () => void;
}

export function ShadowingPractice({
  lessonTitle,
  lessonTitleJp,
  items,
  onComplete,
  onBack
}: ShadowingPracticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  
  const recorder = useAudioRecorder();
  const currentItem = items[currentIndex];
  const progress = ((currentIndex + 1) / items.length) * 100;

  const speakText = (text: string, slow = false) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = slow ? 0.6 : 0.9;
      utterance.pitch = 1.1;
      
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRecordStart = () => {
    recorder.startRecording();
  };

  const handleRecordStop = () => {
    recorder.stopRecording();
    
    // Simulate scoring (in production, this would use speech recognition API)
    setTimeout(() => {
      const randomScore = Math.floor(Math.random() * 30) + 70; // 70-100
      setScore(randomScore);
      setShowResult(true);
    }, 500);
  };

  const playRecording = () => {
    if (recorder.audioUrl) {
      const audio = new Audio(recorder.audioUrl);
      audio.onplay = () => setIsPlayingRecording(true);
      audio.onended = () => setIsPlayingRecording(false);
      audio.play();
    }
  };

  const handleTryAgain = () => {
    recorder.resetRecording();
    setShowResult(false);
    setScore(0);
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      recorder.resetRecording();
      setShowResult(false);
      setScore(0);
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete({ score: Math.round(score), completed: items.length });
    }
  };

  const handleSkip = () => {
    if (currentIndex < items.length - 1) {
      recorder.resetRecording();
      setShowResult(false);
      setScore(0);
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete({ score: 0, completed: currentIndex });
    }
  };

  const generateFeedback = () => {
    const positive = [];
    const improvements = [];
    
    if (score >= 80) positive.push('Good pace');
    if (score >= 75) positive.push('Clear pronunciation');
    if (score < 85) improvements.push('Pitch slightly off at ending');
    if (score < 75) improvements.push('Try to speak more clearly');
    
    return { positive, improvements };
  };

  if (!currentItem) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="container max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm font-medium">
              {currentIndex + 1}/{items.length}
            </span>
          </div>
          <Progress value={progress} className="h-1.5 bg-white/30" />
        </div>
      </div>

      <div className="flex-1 container max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Lesson Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-lg font-bold flex items-center justify-center gap-2">
            🎧 {lessonTitle}
          </h1>
          <p className="text-sm text-muted-foreground font-jp">{lessonTitleJp}</p>
        </motion.div>

        {/* Main Content Card */}
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card rounded-2xl p-6 shadow-elevated text-center"
        >
          <p className="text-3xl font-bold font-jp mb-2">
            {currentItem.japanese_text}
          </p>
          <p className="text-sm text-muted-foreground mb-1">
            {currentItem.reading_romaji}
          </p>
          <p className="text-base text-foreground">
            "{currentItem.meaning_id}"
          </p>
        </motion.div>

        {/* Listen Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            🔊 LISTEN
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => speakText(currentItem.japanese_text)}
              disabled={isPlayingAudio}
              className="flex items-center gap-2"
            >
              {isPlayingAudio ? (
                <Volume2 className="h-4 w-4 animate-pulse" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
              Normal Speed
            </Button>
            <Button
              variant="outline"
              onClick={() => speakText(currentItem.japanese_text, true)}
              disabled={isPlayingAudio}
              className="flex items-center gap-2"
            >
              🐢 Slow Speed
            </Button>
          </div>
        </div>

        {/* Pronunciation Tip */}
        {currentItem.pronunciation_tips && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-indigo-50 border border-indigo-200 rounded-xl p-4"
          >
            <h3 className="text-sm font-semibold text-indigo-800 mb-1 flex items-center gap-2">
              💡 PRONUNCIATION TIP
            </h3>
            <p className="text-sm text-indigo-700">{currentItem.pronunciation_tips}</p>
            {currentItem.pitch_pattern && (
              <p className="text-xs text-indigo-600 mt-1 font-mono">
                Pitch: {currentItem.pitch_pattern}
              </p>
            )}
          </motion.div>
        )}

        {/* Recording Section or Results */}
        {!showResult ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              🎤 YOUR TURN
            </h3>
            
            <div className="bg-muted/50 rounded-2xl p-6 flex flex-col items-center">
              {recorder.isRecording && (
                <div className="mb-4 w-full">
                  <WaveformVisualizer 
                    data={recorder.waveformData} 
                    isActive={recorder.isRecording} 
                  />
                  <div className="text-center mt-2 text-sm text-muted-foreground">
                    0:{String(recorder.duration).padStart(2, '0')} / 0:05
                  </div>
                </div>
              )}
              
              <RecordingButton
                isRecording={recorder.isRecording}
                onPress={handleRecordStart}
                onRelease={handleRecordStop}
              />
            </div>
          </div>
        ) : (
          <SpeakingResultCard
            audioUrl={recorder.audioUrl}
            score={score}
            feedback={generateFeedback()}
            onPlayRecording={playRecording}
            onTryAgain={handleTryAgain}
            onNext={handleNext}
            isPlaying={isPlayingRecording}
          />
        )}

        {/* Navigation */}
        {!showResult && (
          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={handleSkip}>
              <SkipForward className="h-4 w-4 mr-2" />
              Skip
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleNext}
              className="text-muted-foreground"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
