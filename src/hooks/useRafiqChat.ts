import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  feedback?: 'positive' | 'negative' | null;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rafiq-chat`;

export function useRafiqChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [remainingChats, setRemainingChats] = useState(5);

  // Load chat history
  useEffect(() => {
    const loadHistory = async () => {
      if (!user?.id) {
        setIsLoadingHistory(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(50);

        if (error) throw error;

        if (data && data.length > 0) {
          setMessages(data.map(msg => ({
            id: msg.id,
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            timestamp: new Date(msg.created_at),
            feedback: msg.feedback as 'positive' | 'negative' | null,
          })));
        }

        // Load remaining chats from subscription
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('chats_remaining, plan_type')
          .eq('user_id', user.id)
          .single();

        if (subData) {
          setRemainingChats(subData.plan_type === 'premium' ? 999 : (subData.chats_remaining ?? 5));
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, [user?.id]);

  // Save message to database
  const saveMessage = async (role: 'user' | 'assistant', content: string): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          role,
          content,
        })
        .select('id')
        .single();

      if (error) throw error;
      return data?.id || null;
    } catch (error) {
      console.error('Error saving message:', error);
      return null;
    }
  };

  // Update remaining chats
  const decrementChats = async () => {
    if (!user?.id) return;

    try {
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('chats_remaining, plan_type')
        .eq('user_id', user.id)
        .single();

      if (subData && subData.plan_type !== 'premium' && subData.chats_remaining !== null) {
        const newCount = Math.max(0, subData.chats_remaining - 1);
        await supabase
          .from('subscriptions')
          .update({ chats_remaining: newCount })
          .eq('user_id', user.id);
        setRemainingChats(newCount);
      }
    } catch (error) {
      console.error('Error updating chat count:', error);
    }
  };

  // Send message with streaming
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading || remainingChats <= 0) return;

    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Save user message
    const userMsgId = await saveMessage('user', content.trim());
    if (userMsgId) {
      setMessages(prev => prev.map(m => 
        m.id === userMessage.id ? { ...m, id: userMsgId } : m
      ));
    }

    // Decrement chat count
    await decrementChats();

    let assistantContent = '';
    const assistantId = `temp-assistant-${Date.now()}`;

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            ...messages.filter(m => m.id !== userMessage.id).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: content.trim() },
          ],
        }),
      });

      if (!resp.ok || !resp.body) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal menghubungi Rafiq Sensei');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      // Add assistant message placeholder
      setMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages(prev => prev.map(m => 
                m.id === assistantId ? { ...m, content: assistantContent } : m
              ));
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Save assistant message
      const assistantMsgId = await saveMessage('assistant', assistantContent);
      if (assistantMsgId) {
        setMessages(prev => prev.map(m => 
          m.id === assistantId ? { ...m, id: assistantMsgId } : m
        ));
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
      // Remove failed assistant message
      setMessages(prev => prev.filter(m => m.id !== assistantId));
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, remainingChats, user?.id]);

  // Submit feedback
  const submitFeedback = useCallback(async (messageId: string, feedback: 'positive' | 'negative') => {
    if (!user?.id) return;

    try {
      await supabase
        .from('chat_messages')
        .update({ feedback })
        .eq('id', messageId)
        .eq('user_id', user.id);

      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, feedback } : m
      ));

      toast.success(feedback === 'positive' ? 'Terima kasih! 😊' : 'Terima kasih atas masukannya');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  }, [user?.id]);

  return {
    messages,
    isLoading,
    isLoadingHistory,
    remainingChats,
    sendMessage,
    submitFeedback,
  };
}
