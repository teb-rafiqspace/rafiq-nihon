import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, SkipForward, ChevronRight, Loader2, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RecordingButton } from './RecordingButton';
import { WaveformVisualizer } from './WaveformVisualizer';
import { SpeakingResultCard } from './SpeakingResultCard';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useJapaneseAudio } from '@/hooks/useJapaneseAudio';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { calculateSpeechScore, ScoringResult, getScoreColor, getScoreLabel } from '@/lib/speechScoring';
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
  const [scoringResult, setScoringResult] = useState<ScoringResult | null>(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  
  const recorder = useAudioRecorder();
  const { speak, playAudioUrl, isPlaying: isPlayingAudio, hasJapaneseVoice } = useJapaneseAudio();
  const speechRecognition = useSpeechRecognition('ja-JP');
  
  const currentItem = items[currentIndex];
  const progress = ((currentIndex + 1) / items.length) * 100;

  // Start speech recognition when recording starts
  useEffect(() => {
    if (recorder.isRecording && speechRecognition.isSupported) {
      speechRecognition.startListening();
    }
  }, [recorder.isRecording, speechRecognition.isSupported, speechRecognition.startListening]);

  // Stop speech recognition when recording stops
  useEffect(() => {
    if (!recorder.isRecording && speechRecognition.isListening) {
      speechRecognition.stopListening();
    }
  }, [recorder.isRecording, speechRecognition.isListening, speechRecognition.stopListening]);

  const handlePlayAudio = (slow = false) => {
    if (!currentItem) return;
    
    if (slow && currentItem.audio_slow_url) {
      playAudioUrl(currentItem.audio_slow_url, currentItem.japanese_text);
    } else if (!slow && currentItem.audio_url) {
      playAudioUrl(currentItem.audio_url, currentItem.japanese_text);
    } else {
      speak(currentItem.japanese_text, slow);
    }
  };

  const handleRecordStart = () => {
    speechRecognition.resetTranscript();
    recorder.startRecording();
  };

  const handleRecordStop = () => {
    recorder.stopRecording();
    speechRecognition.stopListening();
    
    // Calculate score after a brief delay to ensure transcript is final
    setTimeout(() => {
      const transcript = speechRecognition.transcript || speechRecognition.interimTranscript;
      
      if (transcript && currentItem) {
        const result = calculateSpeechScore(
          transcript,
          currentItem.japanese_text,
          currentItem.reading_hiragana,
          speechRecognition.confidence
        );
        setScoringResult(result);
        setTotalScore(prev => prev + result.overallScore);
        setCompletedCount(prev => prev + 1);
      } else {
        // No speech detected - give minimal score
        setScoringResult({
          overallScore: 0,
          pronunciationScore: 0,
          accuracyScore: 0,
          fluencyScore: 0,
          matchedText: '',
          targetText: currentItem?.japanese_text || '',
          feedback: {
            positive: [],
            improvements: ['No speech detected. Please try again.']
          },
          detailedAnalysis: {
            characterAccuracy: 0,
            wordOrder: 0,
            completeness: 0
          }
        });
      }
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
    speechRecognition.resetTranscript();
    setShowResult(false);
    setScoringResult(null);
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      recorder.resetRecording();
      speechRecognition.resetTranscript();
      setShowResult(false);
      setScoringResult(null);
      setCurrentIndex(currentIndex + 1);
    } else {
      const avgScore = completedCount > 0 ? Math.round(totalScore / completedCount) : 0;
      onComplete({ score: avgScore, completed: completedCount });
    }
  };

  const handleSkip = () => {
    if (currentIndex < items.length - 1) {
      recorder.resetRecording();
      speechRecognition.resetTranscript();
      setShowResult(false);
      setScoringResult(null);
      setCurrentIndex(currentIndex + 1);
    } else {
      const avgScore = completedCount > 0 ? Math.round(totalScore / completedCount) : 0;
      onComplete({ score: avgScore, completed: completedCount });
    }
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

        {/* Speech Recognition Status */}
        {!speechRecognition.isSupported && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
            <p className="text-sm text-yellow-800">
              ⚠️ Speech recognition not supported. Using simulated scoring.
            </p>
          </div>
        )}

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
              onClick={() => handlePlayAudio(false)}
              disabled={isPlayingAudio}
              className="flex items-center gap-2"
            >
              {isPlayingAudio ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
              Normal Speed
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePlayAudio(true)}
              disabled={isPlayingAudio}
              className="flex items-center gap-2"
            >
              🐢 Slow Speed
            </Button>
          </div>
          
          {!hasJapaneseVoice && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              💡 Untuk audio terbaik, gunakan Chrome atau Edge
            </p>
          )}
        </div>

        {/* Pronunciation Tip */}
        {currentItem.pronunciation_tips && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4"
          >
            <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-200 mb-1 flex items-center gap-2">
              💡 PRONUNCIATION TIP
            </h3>
            <p className="text-sm text-indigo-700 dark:text-indigo-300">{currentItem.pronunciation_tips}</p>
            {currentItem.pitch_pattern && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-mono">
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
              {speechRecognition.isSupported && (
                <span className={`ml-auto flex items-center gap-1 text-xs ${
                  speechRecognition.isListening ? 'text-green-500' : 'text-muted-foreground'
                }`}>
                  {speechRecognition.isListening ? (
                    <>
                      <Mic className="h-3 w-3 animate-pulse" />
                      Listening...
                    </>
                  ) : (
                    <>
                      <MicOff className="h-3 w-3" />
                      Ready
                    </>
                  )}
                </span>
              )}
            </h3>
            
            <div className="bg-muted/50 rounded-2xl p-6 flex flex-col items-center">
              {recorder.isRecording && (
                <div className="mb-4 w-full">
                  <WaveformVisualizer 
                    data={recorder.waveformData} 
                    isActive={recorder.isRecording} 
                  />
                  <div className="text-center mt-2 text-sm text-muted-foreground">
                    0:{String(recorder.duration).padStart(2, '0')} / 0:10
                  </div>
                  
                  {/* Live Transcript */}
                  <AnimatePresence>
                    {(speechRecognition.transcript || speechRecognition.interimTranscript) && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 p-2 bg-card rounded-lg text-center"
                      >
                        <p className="text-sm text-muted-foreground">Recognized:</p>
                        <p className="font-jp text-lg">
                          {speechRecognition.transcript}
                          <span className="text-muted-foreground">
                            {speechRecognition.interimTranscript}
                          </span>
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              
              <RecordingButton
                isRecording={recorder.isRecording}
                onPress={handleRecordStart}
                onRelease={handleRecordStop}
              />
              
              {speechRecognition.error && (
                <p className="text-sm text-destructive mt-2">
                  {speechRecognition.error}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Score Summary */}
            {scoringResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card rounded-2xl p-6 shadow-elevated"
              >
                <div className="text-center mb-4">
                  <div className={`text-5xl font-bold ${getScoreColor(scoringResult.overallScore)}`}>
                    {scoringResult.overallScore}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getScoreLabel(scoringResult.overallScore)}
                  </p>
                </div>
                
                {/* Score Breakdown */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold">{scoringResult.pronunciationScore}</div>
                    <p className="text-xs text-muted-foreground">Pronunciation</p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{scoringResult.accuracyScore}</div>
                    <p className="text-xs text-muted-foreground">Accuracy</p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{scoringResult.fluencyScore}</div>
                    <p className="text-xs text-muted-foreground">Fluency</p>
                  </div>
                </div>
                
                {/* What you said */}
                {scoringResult.matchedText && (
                  <div className="bg-muted/50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-muted-foreground mb-1">You said:</p>
                    <p className="font-jp text-lg">{scoringResult.matchedText}</p>
                  </div>
                )}
                
                {/* Feedback */}
                <div className="space-y-2">
                  {scoringResult.feedback.positive.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-green-600 dark:text-green-400">
                      <span>✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                  {scoringResult.feedback.improvements.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                      <span>→</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            
            {/* Actions */}
            <div className="flex gap-3">
              {recorder.audioUrl && (
                <Button
                  variant="outline"
                  onClick={playRecording}
                  disabled={isPlayingRecording}
                  className="flex-1"
                >
                  {isPlayingRecording ? '🔊 Playing...' : '🔊 Play Recording'}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleTryAgain}
                className="flex-1"
              >
                🔄 Try Again
              </Button>
            </div>
            
            <Button onClick={handleNext} className="w-full">
              {currentIndex < items.length - 1 ? 'Next →' : 'Complete ✓'}
            </Button>
          </div>
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
