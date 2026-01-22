import { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { Send, Bot, Sparkles, Crown } from 'lucide-react';
import { useRafiqChat } from '@/hooks/useRafiqChat';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { SuggestedPrompts } from '@/components/chat/SuggestedPrompts';
import { WelcomeMessage } from '@/components/chat/WelcomeMessage';
import { Skeleton } from '@/components/ui/skeleton';
import { useSubscription, isPremiumActive } from '@/hooks/useSubscription';
import { PremiumUpgradeModal } from '@/components/subscription/PremiumUpgradeModal';

export default function Chat() {
  const [input, setInput] = useState('');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const { data: subscription } = useSubscription();
  const isPremium = isPremiumActive(subscription);
  
  const {
    messages,
    isLoading,
    isLoadingHistory,
    remainingChats,
    sendMessage,
    submitFeedback,
  } = useRafiqChat();
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
  
  const handleSend = async () => {
    if (!input.trim()) return;
    
    if (!isPremium && remainingChats <= 0) {
      setShowPremiumModal(true);
      return;
    }
    
    const messageContent = input;
    setInput('');
    await sendMessage(messageContent);
  };
  
  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
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
                  <h1 className="font-bold text-white">🤖 Rafiq Sensei</h1>
                  <p className="text-xs text-white/80">Tanya apa saja tentang bahasa Jepang</p>
                </div>
              </div>
              {isPremium ? (
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-full px-3 py-1.5 flex items-center gap-1.5">
                  <Crown className="h-4 w-4 text-white" />
                  <span className="text-sm font-medium text-white">Premium</span>
                </div>
              ) : (
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                  <span className="text-sm font-medium text-white">{remainingChats}/5 tersisa</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-muted/30">
          <div className="container max-w-lg mx-auto px-4 py-4">
            {isLoadingHistory ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-20 flex-1 rounded-2xl" />
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <WelcomeMessage />
            ) : (
              <AnimatePresence>
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onFeedback={message.role === 'assistant' ? submitFeedback : undefined}
                  />
                ))}
              </AnimatePresence>
            )}
            
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <TypingIndicator />
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Suggested Questions */}
        {messages.length === 0 && !isLoadingHistory && (
          <SuggestedPrompts onSelect={handleSuggestedPrompt} />
        )}
        
        {/* Premium Upsell */}
        {!isPremium && remainingChats <= 2 && remainingChats > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 py-3">
            <div className="container max-w-lg mx-auto px-4 flex items-center gap-3">
              <Crown className="h-5 w-5 text-amber-600" />
              <p className="flex-1 text-sm text-amber-800">
                Upgrade ke Premium untuk chat tanpa batas!
              </p>
              <Button variant="premium" size="sm" onClick={() => setShowPremiumModal(true)}>
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
                onChange={(e) => setInput(e.target.value.slice(0, isPremium ? 2000 : 500))}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={isPremium || remainingChats > 0 ? "Tanya Rafiq Sensei..." : "Upgrade untuk chat lagi"}
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                size="icon" 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            {input.length > 0 && (
              <p className="text-[10px] text-muted-foreground text-right mt-1">
                {input.length}/{isPremium ? 2000 : 500}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Premium Modal */}
      <PremiumUpgradeModal 
        isOpen={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)} 
      />
    </AppLayout>
  );
}
