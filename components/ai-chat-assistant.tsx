'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Maximize2,
  Minimize2
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useLanguage } from '@/lib/language-context'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export default function AIChatAssistant() {
  const { t, language } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  
  const getInitialMessage = (): Message => ({
    id: 'welcome',
    role: 'assistant',
    content: t('ai_welcome_msg'),
    timestamp: language === 'ja' ? 'たった今' : language === 'en' ? 'Just now' : 'Baru saja'
  })

  const [messages, setMessages] = useState<Message[]>([getInitialMessage()])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Update initial message when language changes if no interaction yet
  useEffect(() => {
    if (!hasInteracted) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: t('ai_welcome_msg'),
          timestamp: language === 'ja' ? 'たった今' : language === 'en' ? 'Just now' : 'Baru saja'
        }
      ])
    }
  }, [language, hasInteracted, t])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen, messages, loading])

  const quickPrompts = [
    t('ai_prompt_1'),
    t('ai_prompt_2'),
    t('ai_prompt_3'),
    t('ai_prompt_4')
  ]

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input
    if (!query.trim() || loading) return

    setHasInteracted(true)
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      const data = await response.json()

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content || (language === 'ja' ? '回答の生成中にエラーが発生しました。' : language === 'en' ? 'An error occurred while generating response.' : 'Maaf, terjadi gangguan saat memproses jawaban.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      console.error('Chat error:', err)
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: language === 'ja'
          ? 'ネットワークエラーが発生しました。直接 **nandasafiqalfiansyah@gmail.com** までご連絡ください。'
          : language === 'en'
          ? 'Network error. You can reach Nanda directly at **nandasafiqalfiansyah@gmail.com**.'
          : 'Terjadi kendala jaringan. Anda dapat menghubungi Nanda langsung via email di **nandasafiqalfiansyah@gmail.com**.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const resetChat = () => {
    setMessages([getInitialMessage()])
    setHasInteracted(false)
  }

  return (
    <aside
      aria-label='AI Portfolio Assistant'
      className='fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end'
    >
      {/* Chat Window Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`mb-3 flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-background/95 shadow-2xl backdrop-blur-md transition-all duration-300 ${
              isExpanded
                ? 'fixed inset-3 sm:inset-auto sm:right-6 sm:bottom-20 sm:h-[620px] sm:w-[480px] z-50'
                : 'h-[500px] w-[calc(100vw-2rem)] max-w-[380px] sm:h-[520px] sm:max-w-[400px]'
            }`}
          >
            {/* Header */}
            <div className='flex items-center justify-between border-b border-border/70 bg-card/90 px-4 py-3'>
              <div className='flex items-center gap-2.5 min-w-0'>
                <div className='relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-500 text-white shadow-sm'>
                  <Sparkles className='h-4 w-4 fill-white text-white' />
                  <span className='absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5'>
                    <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75' />
                    <span className='relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background' />
                  </span>
                </div>
                <div className='min-w-0'>
                  <div className='flex items-center gap-1.5'>
                    <h2 className='truncate text-xs font-semibold text-foreground sm:text-sm'>
                      {t('ai_assistant_title')}
                    </h2>
                    <span className='rounded-full bg-indigo-500/10 dark:bg-indigo-400/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 px-1.5 py-0.2 text-[0.62rem] font-medium shrink-0'>
                      Gemini AI
                    </span>
                  </div>
                  <p className='text-[0.68rem] text-muted-foreground truncate'>
                    {t('ai_assistant_subtitle')}
                  </p>
                </div>
              </div>

              {/* Window Controls */}
              <div className='flex items-center gap-1 text-muted-foreground shrink-0'>
                <button
                  type='button'
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? 'Minimize' : 'Expand'}
                  className='hidden sm:inline-flex rounded-lg p-1.5 transition-colors hover:bg-muted hover:text-foreground'
                >
                  {isExpanded ? (
                    <Minimize2 className='h-3.5 w-3.5' />
                  ) : (
                    <Maximize2 className='h-3.5 w-3.5' />
                  )}
                </button>
                <button
                  type='button'
                  onClick={resetChat}
                  title='Reset chat'
                  className='rounded-lg p-1.5 transition-colors hover:bg-muted hover:text-foreground'
                >
                  <RotateCcw className='h-3.5 w-3.5' />
                </button>
                <button
                  type='button'
                  onClick={() => setIsOpen(false)}
                  title='Close assistant'
                  className='rounded-lg p-1.5 transition-colors hover:bg-muted hover:text-foreground'
                >
                  <X className='h-4 w-4' />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className='flex-1 overflow-y-auto p-4 space-y-3.5 text-xs'>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mt-0.5'>
                      <Sparkles className='h-3.5 w-3.5 fill-current' />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-foreground text-background font-medium rounded-tr-xs'
                        : 'border border-border/70 bg-card/90 text-foreground rounded-tl-xs shadow-2xs'
                    }`}
                  >
                    <div className='prose prose-xs dark:prose-invert max-w-none text-xs break-words leading-relaxed'>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    <span
                      className={`mt-1.5 block text-[0.62rem] ${
                        msg.role === 'user'
                          ? 'text-background/70 text-right'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {msg.role === 'user' && (
                    <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-muted text-foreground mt-0.5'>
                      <User className='h-3.5 w-3.5' />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing loader */}
              {loading && (
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'>
                    <Sparkles className='h-3.5 w-3.5 animate-spin' />
                  </div>
                  <div className='inline-flex items-center gap-1.5 rounded-2xl border border-border/60 bg-card px-3.5 py-2 text-xs'>
                    <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.3s]' />
                    <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.15s]' />
                    <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500' />
                    <span className='ml-1 text-[0.68rem] text-muted-foreground'>{t('ai_typing')}</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Suggestions */}
            {messages.length <= 3 && !loading && (
              <div className='border-t border-border/50 bg-card/40 px-3.5 py-2.5'>
                <p className='mb-1.5 text-[0.68rem] font-medium text-muted-foreground'>
                  {t('ai_popular_questions')}
                </p>
                <div className='flex flex-wrap gap-1.5'>
                  {quickPrompts.map(prompt => (
                    <button
                      key={prompt}
                      type='button'
                      onClick={() => handleSend(prompt)}
                      className='rounded-lg border border-border/70 bg-background/90 px-2.5 py-1 text-[0.7rem] text-muted-foreground transition-all hover:border-foreground/30 hover:bg-muted hover:text-foreground active:scale-95'
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className='border-t border-border/70 bg-card/70 p-2.5 sm:p-3'>
              <div className='flex items-end gap-2 rounded-xl border border-border/80 bg-background p-2 shadow-2xs focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20'>
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('ai_placeholder')}
                  className='max-h-24 min-h-[24px] flex-1 resize-none bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden leading-relaxed'
                  disabled={loading}
                />
                <button
                  type='button'
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className='inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-foreground text-background transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40'
                  title={t('ai_send_hint')}
                >
                  <Send className='h-3.5 w-3.5' />
                </button>
              </div>
              <div className='mt-1.5 flex items-center justify-between px-1 text-[0.62rem] text-muted-foreground'>
                <span>{t('ai_send_hint')}</span>
                <span>Gemini Flash 3.7</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Launcher Button */}
      <motion.button
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className='group relative inline-flex h-11 sm:h-12 items-center gap-2.5 rounded-full border border-border/80 bg-foreground px-4 text-xs font-semibold text-background shadow-xl transition-all hover:shadow-2xl'
        aria-label='Toggle AI Portfolio Assistant'
      >
        <div className='relative flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 to-indigo-400 text-white shadow-xs'>
          <Sparkles className='h-3.5 w-3.5 fill-white text-white transition-transform duration-300 group-hover:rotate-12' />
          {!hasInteracted && !isOpen && (
            <span className='absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5'>
              <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75' />
              <span className='relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 border border-background' />
            </span>
          )}
        </div>
        <span className='hidden sm:inline font-medium'>
          {isOpen ? t('ai_toggle_close') : t('ai_toggle_open')}
        </span>
        <span className='sm:hidden font-medium'>
          {isOpen ? t('ai_toggle_close') : 'AI Chat'}
        </span>
      </motion.button>
    </aside>
  )
}
