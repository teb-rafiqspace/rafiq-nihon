import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, Mic, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecordingButton } from './RecordingButton';
import { WaveformVisualizer } from './WaveformVisualizer';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { ConversationLine } from '@/hooks/useSpeaking';

interface Message {
  id: string;
  speaker: string;
  isUser: boolean;
  japanese: string;
  translation: string;
  score?: number;
  feedback?: string;
}

interface ConversationPracticeProps {
  scriptTitle: string;
  scriptTitleJp: string;
  scenario: string;
  location: string;
  lines: ConversationLine[];
  onComplete: (results: { score: number; turnsCompleted: number }) => void;
  onBack: () => void;
}

export function ConversationPractice({
  scriptTitle,
  scriptTitleJp,
  scenario,
  location,
  lines,
  onComplete,
  onBack
}: ConversationPracticeProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [waitingForUserInput, setWaitingForUserInput] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  const recorder = useAudioRecorder();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentLine = lines[currentLineIndex];
  const totalScore = useRef(0);
  const turnsCompleted = useRef(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (currentLineIndex < lines.length && !waitingForUserInput) {
      const line = lines[currentLineIndex];
      
      if (line.is_user_turn) {
        setWaitingForUserInput(true);
        setShowSuggestions(true);
      } else {
        // AI turn - add message after delay
        setTimeout(() => {
          addAIMessage(line);
          setCurrentLineIndex(prev => prev + 1);
        }, 1000);
      }
    } else if (currentLineIndex >= lines.length) {
      // Conversation complete
      setTimeout(() => {
        const avgScore = turnsCompleted.current > 0 
          ? Math.round(totalScore.current / turnsCompleted.current)
          : 0;
        onComplete({ score: avgScore, turnsCompleted: turnsCompleted.current });
      }, 1500);
    }
  }, [currentLineIndex, lines, waitingForUserInput]);

  const addAIMessage = (line: ConversationLine) => {
    const newMessage: Message = {
      id: line.id,
      speaker: line.speaker,
      isUser: false,
      japanese: line.japanese_text,
      translation: line.meaning_id
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleUserResponse = (response: string, translation: string) => {
    // Simulate scoring
    const score = Math.floor(Math.random() * 20) + 80;
    totalScore.current += score;
    turnsCompleted.current += 1;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      speaker: 'You',
      isUser: true,
      japanese: response,
      translation: translation,
      score: score,
      feedback: score >= 85 ? '✅ Great! Natural response.' : '👍 Good job!'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setWaitingForUserInput(false);
    setShowSuggestions(false);
    recorder.resetRecording();
    setCurrentLineIndex(prev => prev + 1);
  };

  const handleRecordStart = () => {
    recorder.startRecording();
  };

  const handleRecordStop = () => {
    recorder.stopRecording();
    
    // Simulate processing and use first suggested response
    setTimeout(() => {
      if (currentLine?.acceptable_responses?.length) {
        handleUserResponse(
          currentLine.acceptable_responses[0],
          'Your response'
        );
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white sticky top-0 z-10">
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
            <span className="text-sm font-medium">Conversation</span>
            <div className="w-10" />
          </div>
        </div>
      </div>

      {/* Scenario Info */}
      <div className="bg-card border-b border-border px-4 py-3">
        <div className="container max-w-lg mx-auto">
          <h2 className="font-bold text-lg flex items-center gap-2">
            💬 {scriptTitleJp}
          </h2>
          <p className="text-sm text-foreground">{scriptTitle}</p>
          <p className="text-xs text-muted-foreground mt-1">
            📍 {scenario}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`
                  max-w-[85%] rounded-2xl p-4
                  ${message.isUser 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-md' 
                    : 'bg-card shadow-card rounded-bl-md'
                  }
                `}
              >
                {!message.isUser && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">👤</span>
                    <span className="font-semibold text-sm">{message.speaker}</span>
                  </div>
                )}
                
                <p className={`font-jp text-lg ${message.isUser ? '' : 'mb-1'}`}>
                  "{message.japanese}"
                </p>
                
                <p className={`text-sm ${message.isUser ? 'text-white/80' : 'text-muted-foreground'}`}>
                  {message.translation}
                </p>
                
                {!message.isUser && (
                  <button
                    onClick={() => speakText(message.japanese)}
                    className="mt-2 text-indigo-500 hover:text-indigo-600"
                  >
                    <Volume2 className={`h-4 w-4 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                  </button>
                )}
                
                {message.isUser && message.score && (
                  <div className="mt-2 pt-2 border-t border-white/20 text-sm">
                    {message.feedback} Score: {message.score}/100
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* User Input Area */}
      {waitingForUserInput && currentLine && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-0 bg-card border-t border-border p-4 space-y-4"
        >
          <div className="text-center">
            <h3 className="font-semibold text-sm flex items-center justify-center gap-2 mb-1">
              🎤 YOUR TURN
            </h3>
            {currentLine.response_hints?.[0] && (
              <p className="text-xs text-muted-foreground">
                💡 {currentLine.response_hints[0]}
              </p>
            )}
          </div>

          {recorder.isRecording ? (
            <div className="flex flex-col items-center gap-3">
              <WaveformVisualizer 
                data={recorder.waveformData} 
                isActive={recorder.isRecording} 
              />
              <RecordingButton
                isRecording={recorder.isRecording}
                onPress={handleRecordStart}
                onRelease={handleRecordStop}
              />
            </div>
          ) : (
            <div className="flex justify-center">
              <RecordingButton
                isRecording={recorder.isRecording}
                onPress={handleRecordStart}
                onRelease={handleRecordStop}
              />
            </div>
          )}

          {/* Suggested Responses */}
          {showSuggestions && currentLine.acceptable_responses && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">
                SUGGESTED RESPONSES:
              </p>
              {currentLine.acceptable_responses.map((response, i) => (
                <button
                  key={i}
                  onClick={() => handleUserResponse(response, 'Selected response')}
                  className="w-full p-3 bg-muted rounded-xl text-left hover:bg-muted/80 transition-colors"
                >
                  <span className="font-jp">"{response}"</span>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
