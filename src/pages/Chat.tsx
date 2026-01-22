import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { Send, Bot, Sparkles, Crown } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Konnichiwa! 👋 Saya Rafiq, asisten AI kamu untuk belajar bahasa Jepang. Apa yang ingin kamu pelajari hari ini?',
    timestamp: new Date(),
  },
];

const suggestedQuestions = [
  'Bagaimana cara memperkenalkan diri?',
  'Apa perbedaan は dan が?',
  'Cara menghitung dalam bahasa Jepang',
  'Kalimat untuk di tempat kerja',
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [remainingChats, setRemainingChats] = useState(5);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSend = async () => {
    if (!input.trim() || remainingChats <= 0) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setRemainingChats((prev) => prev - 1);
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        `Pertanyaan bagus! Mari kita pelajari tentang "${input}". 

Dalam bahasa Jepang, kita bisa menggunakan beberapa cara untuk mengekspresikan ini. Contohnya:

**Contoh:**
- わたしは [nama] です。
- Watashi wa [nama] desu.
- Saya adalah [nama].

Coba praktikkan dengan nama kamu! 😊`,
        `Hai! Untuk menjawab pertanyaan tentang "${input}", saya akan jelaskan dengan sederhana.

**Tips:** 
Ingat bahwa dalam bahasa Jepang, partikel sangat penting. Partikel は (wa) digunakan untuk menandai topik, sedangkan が (ga) untuk subjek.

Ada yang ingin kamu tanyakan lagi? 🎌`,
      ];
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };
  
  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };
  
  return (
    <AppLayout>
      <div className="flex flex-col h-[100dvh]">
        {/* Header */}
        <div className="bg-gradient-xp pt-safe">
          <div className="container max-w-lg mx-auto px-4 pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-white">Rafiq</h1>
                  <p className="text-xs text-white/80">Asisten AI kamu</p>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-yellow-300" />
                <span className="text-sm font-medium text-white">{remainingChats}/5</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-muted/30">
          <div className="container max-w-lg mx-auto px-4 py-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-xp rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-secondary text-secondary-foreground rounded-br-md'
                        : 'bg-card shadow-card rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mb-4"
              >
                <div className="w-8 h-8 bg-gradient-xp rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-card shadow-card rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Suggested Questions */}
        {messages.length <= 1 && (
          <div className="bg-background border-t border-border py-3">
            <div className="container max-w-lg mx-auto px-4">
              <p className="text-xs text-muted-foreground mb-2">Coba tanyakan:</p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestedQuestion(q)}
                    className="flex-shrink-0 bg-muted hover:bg-muted/80 text-foreground text-sm px-3 py-2 rounded-full transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Premium Upsell */}
        {remainingChats <= 2 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 py-3">
            <div className="container max-w-lg mx-auto px-4 flex items-center gap-3">
              <Crown className="h-5 w-5 text-amber-600" />
              <p className="flex-1 text-sm text-amber-800">
                Upgrade ke Premium untuk chat tanpa batas!
              </p>
              <Button variant="premium" size="sm">
                Upgrade
              </Button>
            </div>
          </div>
        )}
        
        {/* Input */}
        <div className="bg-background border-t border-border pb-safe">
          <div className="container max-w-lg mx-auto px-4 py-3">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={remainingChats > 0 ? "Ketik pertanyaanmu..." : "Upgrade untuk chat lagi"}
                disabled={remainingChats <= 0}
                className="flex-1"
              />
              <Button 
                size="icon" 
                onClick={handleSend}
                disabled={!input.trim() || remainingChats <= 0}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
