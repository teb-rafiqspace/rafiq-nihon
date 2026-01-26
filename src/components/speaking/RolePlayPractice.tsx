import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, Eye, SkipForward, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecordingButton } from './RecordingButton';
import { WaveformVisualizer } from './WaveformVisualizer';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { RoleplayScenario } from '@/hooks/useSpeaking';

interface Message {
  id: string;
  speaker: string;
  isUser: boolean;
  text: string;
  translation?: string;
}

interface RolePlayPracticeProps {
  scenario: RoleplayScenario;
  onComplete: (results: { score: number; objectivesCompleted: number }) => void;
  onBack: () => void;
}

export function RolePlayPractice({
  scenario,
  onComplete,
  onBack
}: RolePlayPracticeProps) {
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [objectivesCompleted, setObjectivesCompleted] = useState<Set<number>>(new Set());
  const [showHint, setShowHint] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  const recorder = useAudioRecorder();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const totalTurns = 8;
  const totalScore = useRef(0);

  const aiResponses = [
    { text: 'それでは、自己紹介をお願いします。', translation: 'Silakan perkenalkan diri Anda.' },
    { text: 'はい、分かりました。なぜこの仕事に興味がありますか。', translation: 'Baik, saya mengerti. Mengapa Anda tertarik dengan pekerjaan ini?' },
    { text: 'いい回答ですね。日本語の勉強はどうですか。', translation: 'Jawaban yang bagus. Bagaimana dengan belajar bahasa Jepangnya?' },
    { text: 'それは素晴らしいですね。最後に質問はありますか。', translation: 'Itu luar biasa. Terakhir, ada pertanyaan?' }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStart = () => {
    setStarted(true);
    // AI starts the conversation
    setTimeout(() => {
      addAIMessage(aiResponses[0]);
    }, 1000);
  };

  const addAIMessage = (response: { text: string; translation: string }) => {
    const newMessage: Message = {
      id: `ai-${Date.now()}`,
      speaker: scenario.ai_role,
      isUser: false,
      text: response.text,
      translation: response.translation
    };
    setMessages(prev => [...prev, newMessage]);
    speakText(response.text);
  };

  const handleRecordStart = () => {
    recorder.startRecording();
    setShowHint(false);
  };

  const handleRecordStop = () => {
    recorder.stopRecording();
    
    // Simulate user response and AI follow-up
    setTimeout(() => {
      const score = Math.floor(Math.random() * 20) + 80;
      totalScore.current += score;
      
      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        speaker: 'You',
        isUser: true,
        text: scenario.key_phrases?.[currentTurn] || 'よろしくお願いします。'
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Mark objective as completed
      if (currentTurn < (scenario.objectives?.length || 0)) {
        setObjectivesCompleted(prev => new Set([...prev, currentTurn]));
      }
      
      const nextTurn = currentTurn + 1;
      setCurrentTurn(nextTurn);
      recorder.resetRecording();
      
      // Check if conversation should continue
      if (nextTurn < 4 && nextTurn < aiResponses.length) {
        setTimeout(() => {
          addAIMessage(aiResponses[nextTurn]);
        }, 1500);
      } else {
        // Complete
        setTimeout(() => {
          onComplete({
            score: Math.round(totalScore.current / Math.max(currentTurn, 1)),
            objectivesCompleted: objectivesCompleted.size + 1
          });
        }, 2000);
      }
    }, 500);
  };

  const handleSkipTurn = () => {
    const nextTurn = currentTurn + 1;
    setCurrentTurn(nextTurn);
    
    if (nextTurn < 4 && nextTurn < aiResponses.length) {
      setTimeout(() => {
        addAIMessage(aiResponses[nextTurn]);
      }, 500);
    }
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
          <div className="container max-w-lg mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onBack}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <span className="text-sm font-medium">Role-Play</span>
              <div className="w-10" />
            </div>
          </div>
        </div>

        <div className="flex-1 container max-w-lg mx-auto px-4 py-6 space-y-6">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
              🎭 {scenario.title_ja}
            </h1>
            <p className="text-muted-foreground">{scenario.title_id}</p>
          </motion.div>

          {/* Scenario Description */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-4 shadow-card"
          >
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              📋 SCENARIO
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {scenario.scenario_description_id}
            </p>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">👤 Your Role:</span>
                <span>{scenario.user_role}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">🤖 AI Role:</span>
                <span>{scenario.ai_role}</span>
              </div>
              {scenario.location && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">📍 Location:</span>
                  <span>{scenario.location}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Objectives */}
          {scenario.objectives && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <h3 className="font-semibold flex items-center gap-2">
                🎯 OBJECTIVES
              </h3>
              {scenario.objectives.map((obj, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-5 h-5 rounded-full border-2 border-muted-foreground flex items-center justify-center">
                    {i + 1}
                  </div>
                  <span>{obj}</span>
                </div>
              ))}
            </motion.div>
          )}

          {/* Key Phrases */}
          {scenario.key_phrases && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <h3 className="font-semibold flex items-center gap-2">
                💡 KEY PHRASES TO USE
              </h3>
              <div className="flex flex-wrap gap-2">
                {scenario.key_phrases.map((phrase, i) => (
                  <span 
                    key={i}
                    className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-jp"
                  >
                    • {phrase}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Start Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={handleStart}
              className="w-full h-14 text-lg bg-gradient-to-r from-purple-500 to-pink-600"
            >
              🎭 Start Role-Play
              <span className="text-sm ml-2 opacity-80">
                Est. {scenario.estimated_minutes} min
              </span>
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white sticky top-0 z-10">
        <div className="container max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm font-medium">
              {currentTurn + 1}/8 turns
            </span>
            <div className="w-10" />
          </div>
        </div>
      </div>

      {/* Scenario Title */}
      <div className="bg-card border-b border-border px-4 py-3">
        <div className="container max-w-lg mx-auto">
          <h2 className="font-bold flex items-center gap-2">
            🎭 {scenario.title_ja}
          </h2>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`
                  max-w-[85%] rounded-2xl p-4
                  ${message.isUser 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-br-md' 
                    : 'bg-card shadow-card rounded-bl-md'
                  }
                `}
              >
                {!message.isUser && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🎭</span>
                    <span className="font-semibold text-sm">{message.speaker}</span>
                  </div>
                )}
                
                <p className="font-jp text-lg">"{message.text}"</p>
                
                {message.translation && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {message.translation}
                  </p>
                )}
                
                {!message.isUser && (
                  <button
                    onClick={() => speakText(message.text)}
                    className="mt-2 text-purple-500 hover:text-purple-600"
                  >
                    <Volume2 className={`h-4 w-4 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Objectives Progress */}
      {scenario.objectives && (
        <div className="bg-muted/50 px-4 py-2">
          <div className="container max-w-lg mx-auto">
            <p className="text-xs text-muted-foreground mb-1">🎯 Current Objective:</p>
            <p className="text-sm font-medium">
              → {scenario.objectives[Math.min(currentTurn, scenario.objectives.length - 1)]}
            </p>
          </div>
        </div>
      )}

      {/* Recording Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky bottom-0 bg-card border-t border-border p-4"
      >
        {showHint && scenario.key_phrases && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-3 p-3 bg-purple-50 rounded-xl text-sm"
          >
            <p className="text-purple-800 font-medium mb-1">💡 Consider saying:</p>
            <p className="font-jp text-purple-700">
              "{scenario.key_phrases[currentTurn % scenario.key_phrases.length]}"
            </p>
          </motion.div>
        )}

        <div className="flex flex-col items-center gap-3">
          {recorder.isRecording && (
            <WaveformVisualizer 
              data={recorder.waveformData} 
              isActive={recorder.isRecording} 
            />
          )}
          
          <RecordingButton
            isRecording={recorder.isRecording}
            onPress={handleRecordStart}
            onRelease={handleRecordStop}
          />
        </div>

        <div className="flex justify-between mt-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowHint(!showHint)}
          >
            <Eye className="h-4 w-4 mr-1" />
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleSkipTurn}
          >
            <SkipForward className="h-4 w-4 mr-1" />
            Skip Turn
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
