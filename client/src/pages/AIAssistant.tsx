// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Mic, MicOff, Volume2, VolumeX, Copy, Trash2, RefreshCw, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import api from '../services/api';
import { ChatMessage } from '../types';
import clsx from 'clsx';

const genId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const SUGGESTED_PROMPTS = [
  'How do I reach Gate 4?',
  'Where is the nearest accessible restroom?',
  'Which entrance has the shortest queue?',
  'What transport is available after the match?',
  'Where can I find vegetarian food?',
  'What should I do if I lose my child?',
  'Give me step-by-step emergency guidance.',
  'Translate this announcement into Tamil.',
];

const LANGUAGES = [
  { code: 'english', label: 'English' },
  { code: 'hindi', label: 'Hindi (हिंदी)' },
  { code: 'tamil', label: 'Tamil (தமிழ்)' },
  { code: 'spanish', label: 'Español' },
  { code: 'french', label: 'Français' },
  { code: 'arabic', label: 'العربية' },
  { code: 'portuguese', label: 'Português' },
  { code: 'german', label: 'Deutsch' },
];

function parseMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/\n/g, '<br />')
    .replace(/\*(.*?)\*/g, '• $1');
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [language, setLanguage] = useState('english');
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setMessages([
      {
        id: genId(),
        role: 'assistant',
        content:
          '🏁 **Welcome to FlowBot!** I am your AI stadium assistant for FIFA World Cup 2026 at MetroFlow Arena.\n\nI can help you with:\n• Navigation to gates, seats, restrooms, and facilities\n• Transport information and route planning\n• Emergency guidance (always call 911 for life-threatening situations)\n• Crowd levels and best routes\n• Multilingual announcements\n\n_⚠️ This application is running in Demo Mode. For real AI responses, connect a Gemini API key._\n\nHow can I help you today?',
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: genId(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setError('');

    const apiKey = localStorage.getItem('sf_gemini_api_key') || undefined;

    try {
      const res = await api.post<{ response: string; conversationId: string }>('/ai/chat', {
        message: text,
        conversationId,
        language,
        apiKey,
      });
      if (res.success) {
        const botMsg: ChatMessage = {
          id: genId(),
          role: 'assistant',
          content: res.data.response,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, botMsg]);
        setConversationId(res.data.conversationId);
        if (ttsEnabled) speak(res.data.response);
      }
    } catch {
      setError('FlowBot is temporarily unavailable. Please try again.');
      setMessages(prev => [
        ...prev,
        {
          id: genId(),
          role: 'assistant',
          content:
            '⚠️ I encountered an error. Please try again or use the Emergency Support page for urgent help.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };


  const speak = (text: string) => {
    const clean = text.replace(/[*_#`]/g, '');
    const utter = new SpeechSynthesisUtterance(clean);
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  };

  const toggleVoiceInput = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      alert('Voice input is not supported in your browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SR =
      (
        window as unknown as {
          SpeechRecognition?: typeof SpeechRecognition;
          webkitSpeechRecognition?: typeof SpeechRecognition;
        }
      ).SpeechRecognition ||
      (
        window as unknown as {
          webkitSpeechRecognition?: typeof SpeechRecognition;
        }
      ).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.lang =
      language === 'arabic'
        ? 'ar'
        : language === 'hindi'
        ? 'hi-IN'
        : language === 'spanish'
        ? 'es'
        : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const clearConversation = () => {
    setMessages([]);
    setConversationId(undefined);
    setTimeout(() => {
      setMessages([
        {
          id: genId(),
          role: 'assistant',
          content: 'Conversation cleared. How can I help you?',
          timestamp: new Date().toISOString(),
        },
      ]);
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-teal-400 rounded-xl flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="section-header mb-0">FlowBot</h1>
            <p className="text-xs text-slate-500">AI Stadium Assistant • Powered by Gemini</p>
          </div>
          {localStorage.getItem('sf_gemini_api_key') ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-900/30 border border-emerald-700/40 rounded-full ml-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">Live AI</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-900/30 border border-amber-700/40 rounded-full ml-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-xs text-amber-400 font-medium">Demo Mode</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-label="Select language"
          >
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setTtsEnabled(s => !s)}
            className={clsx('btn-ghost p-2', ttsEnabled && 'text-indigo-400')}
            aria-label="Toggle text to speech"
            aria-pressed={ttsEnabled}
          >
            {ttsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          <button
            onClick={clearConversation}
            className="btn-ghost p-2"
            aria-label="Clear conversation"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div
        className="flex-1 overflow-y-auto card p-4 space-y-4 mb-4"
        role="log"
        aria-label="Chat conversation"
        aria-live="polite"
      >
        {messages.map(msg => (
          <div
            key={msg.id}
            className={clsx('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-teal-400 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={16} className="text-white" />
              </div>
            )}

            <div
              className={clsx(
                'max-w-[80%] lg:max-w-[70%] rounded-2xl px-4 py-3 relative group',
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-md'
                  : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-md'
              )}
            >
              <div
                className="chat-message text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
              />

              <div className="flex items-center justify-between mt-2 gap-2">
                <span className="text-xs opacity-50">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>

                {msg.role === 'assistant' && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => copyMessage(msg.content)}
                      className="p-1 hover:text-indigo-400 text-slate-500 transition-colors"
                      aria-label="Copy message"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      onClick={() => speak(msg.content)}
                      className="p-1 hover:text-teal-400 text-slate-500 transition-colors"
                      aria-label="Read aloud"
                    >
                      <Volume2 size={12} />
                    </button>
                    <button
                      className="p-1 hover:text-emerald-400 text-slate-500 transition-colors"
                      aria-label="Helpful"
                    >
                      <ThumbsUp size={12} />
                    </button>
                    <button
                      className="p-1 hover:text-red-400 text-slate-500 transition-colors"
                      aria-label="Not helpful"
                    >
                      <ThumbsDown size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-slate-300 text-xs font-bold">You</span>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-teal-400 rounded-xl flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
              <Loader2 size={16} className="text-indigo-400 animate-spin" />
              <span className="text-sm text-slate-400">FlowBot is thinking...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center" role="alert">
            <p className="text-sm text-red-400 mb-2">{error}</p>
            <button
              onClick={() => sendMessage(input)}
              className="btn-secondary text-xs gap-1"
            >
              <RefreshCw size={12} />
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts */}
      {messages.length <= 1 && (
        <div className="mb-3">
          <p className="text-xs text-slate-500 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                className="text-xs px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-full hover:bg-slate-700 hover:text-slate-100 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask FlowBot anything... (Press Enter to send, Shift+Enter for new line)"
            className="input-field resize-none min-h-[48px] max-h-32 py-3 pr-12 w-full"
            rows={1}
            aria-label="Message input"
            aria-describedby="chat-hint"
          />
          <p id="chat-hint" className="sr-only">
            Press Enter to send, Shift Enter for new line
          </p>
        </div>

        <button
          onClick={toggleVoiceInput}
          className={clsx(
            'btn-secondary p-3 flex-shrink-0',
            isListening && 'bg-red-900/30 border-red-700 text-red-400 animate-pulse'
          )}
          aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
          aria-pressed={isListening}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
          className="btn-primary p-3 flex-shrink-0"
          aria-label="Send message"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
}
