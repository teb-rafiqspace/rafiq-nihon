import { useState, useRef, useCallback, useEffect } from 'react';

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface WebSpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

// Extend Window interface for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

export interface SpeechRecognitionResultData {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface SpeechRecognitionState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  confidence: number;
  error: string | null;
}

export function useSpeechRecognition(language: string = 'ja-JP') {
  const [state, setState] = useState<SpeechRecognitionState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    interimTranscript: '',
    confidence: 0,
    error: null,
  });

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef<string>('');

  // Check browser support
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    setState(prev => ({
      ...prev,
      isSupported: !!SpeechRecognitionAPI
    }));
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      setState(prev => ({
        ...prev,
        error: 'Speech recognition not supported in this browser'
      }));
      return;
    }

    // Stop any existing instance
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    finalTranscriptRef.current = '';

    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setState(prev => ({
        ...prev,
        isListening: true,
        error: null,
        transcript: '',
        interimTranscript: '',
        confidence: 0
      }));
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = finalTranscriptRef.current;
      let confidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
          finalTranscript += transcript;
          confidence = result[0].confidence;
          finalTranscriptRef.current = finalTranscript;
        } else {
          interimTranscript += transcript;
        }
      }

      setState(prev => ({
        ...prev,
        transcript: finalTranscript,
        interimTranscript,
        confidence: confidence > 0 ? confidence : prev.confidence
      }));
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      let errorMessage = 'Recognition error';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied';
          break;
        case 'network':
          errorMessage = 'Network error occurred';
          break;
        case 'aborted':
          errorMessage = 'Recognition aborted';
          break;
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        isListening: false
      }));
    };

    recognition.onend = () => {
      setState(prev => ({
        ...prev,
        isListening: false
      }));
    };

    try {
      recognition.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
    }
  }, [language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = '';
    setState(prev => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
      confidence: 0,
      error: null
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
  };
}
