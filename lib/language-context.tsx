'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type Language = 'id' | 'en' | 'ja'

export interface LanguageOption {
  code: Language
  label: string
  nativeName: string
  flag: string
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'id', label: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'en', label: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'ja', label: 'Japanese', nativeName: '日本語', flag: '🇯🇵' }
]

export const translations = {
  id: {
    // Nav
    nav_home: 'Beranda',
    nav_projects: 'Proyek',
    nav_blog: 'Blog',
    nav_certificates: 'Sertifikat',
    nav_contact: 'Kontak',

    // Hero / Intro
    role_badge: 'Tersedia untuk Posisi Software Engineer',
    hero_title: 'Software Engineer & Pengembang AI',
    hero_description:
      'Lulusan Machine Learning dengan predikat Distinction dan Software Engineer yang berfokus membangun aplikasi web modern performa tinggi, sistem backend terdistribusi yang scalable, serta solusi berbasis AI.',
    btn_explore_projects: 'Jelajahi Proyek',
    btn_copy_email: 'Salin Email',
    btn_email_copied: 'Email Tersalin!',
    btn_get_in_touch: 'Hubungi Saya',

    // Section Titles
    sec_featured_projects: 'Proyek Rekayasa Unggulan',
    sec_featured_projects_sub:
      'Aplikasi web production-ready, model AI, dan arsitektur perangkat lunak pemenang kompetisi.',
    sec_all_projects: 'Semua Proyek',
    sec_view_all_projects: 'Lihat Semua Proyek',
    sec_experience: 'Pengalaman Profesional',
    sec_experience_sub: 'Rekam jejak kepemimpinan teknik, rekayasa perangkat lunak, dan proyek inovasi AI.',
    sec_education: 'Pendidikan & Prestasi',
    sec_education_sub: 'Latar belakang akademis, program Google Bangkit, dan sertifikasi keahlian.',
    sec_recent_posts: 'Tulisan & Artikel Terbaru',
    sec_recent_posts_sub: 'Catatan teknis, arsitektur software, dan eksplorasi kecerdasan buatan.',

    // Project Cards
    read_case_study: 'Baca Studi Kasus',
    competition_winner: 'Pemenang Kompetisi',
    btn_view_details: 'Lihat Rincian',
    btn_hide_details: 'Tutup Rincian',

    // Footer
    all_rights_reserved: 'Hak cipta dilindungi undang-undang.',
    privacy_policy: 'Kebijakan Privasi',
    contact_link: 'Kontak',
    admin_dashboard: 'Admin Dashboard',
    back_to_top: 'Kembali ke atas',

    // AI Chat Assistant
    ai_assistant_title: 'NDAV Assistant',
    ai_assistant_subtitle: 'Online • Respon Cepat',
    ai_welcome_msg:
      'Halo! 👋 Saya **NDAV AI Assistant**, asisten virtual Nanda Safiq Alfiansyah.\n\nSilakan tanyakan seputar **proyek**, **pengalaman**, **tech stack**, atau **ketersediaan kerja** Nanda, atau pilih topik cepat di bawah.',
    ai_popular_questions: 'Saran Pertanyaan Cepat:',
    ai_placeholder: 'Ketik pertanyaan Anda di sini...',
    ai_send_hint: 'Tekan Enter untuk kirim',
    ai_typing: 'Mengetik...',
    ai_toggle_open: 'Chat AI Assistant',
    ai_toggle_close: 'Tutup Asisten',
    ai_prompt_1: '🚀 Proyek unggulan Nanda?',
    ai_prompt_2: '🛠️ Apa saja tech stack utama?',
    ai_prompt_3: '🏆 Prestasi & pendidikan?',
    ai_prompt_4: '📬 Bagaimana cara kontak/hire?'
  },
  en: {
    // Nav
    nav_home: 'Home',
    nav_projects: 'Projects',
    nav_blog: 'Blog',
    nav_certificates: 'Certificates',
    nav_contact: 'Contact',

    // Hero / Intro
    role_badge: 'Open for Software Engineer Roles',
    hero_title: 'Software Engineer & AI Developer',
    hero_description:
      'Machine Learning distinction graduate and Software Engineer specializing in building production-ready web applications, scalable distributed backends, and AI-driven solutions.',
    btn_explore_projects: 'Explore Projects',
    btn_copy_email: 'Copy Email',
    btn_email_copied: 'Email Copied!',
    btn_get_in_touch: 'Get in touch',

    // Section Titles
    sec_featured_projects: 'Featured Engineering Projects',
    sec_featured_projects_sub:
      'Production-ready web applications, AI models, and award-winning software architectures.',
    sec_all_projects: 'All Projects',
    sec_view_all_projects: 'View All Projects',
    sec_experience: 'Work Experience',
    sec_experience_sub: 'Track record of engineering leadership, software delivery, and AI innovations.',
    sec_education: 'Education & Honors',
    sec_education_sub: 'Academic background, Google Bangkit graduate, and credentials.',
    sec_recent_posts: 'Recent Articles & Insights',
    sec_recent_posts_sub: 'Technical writeups on full-stack architecture, ML pipelines, and software design.',

    // Project Cards
    read_case_study: 'Read Case Study',
    competition_winner: 'Competition Winner',
    btn_view_details: 'View details',
    btn_hide_details: 'Hide details',

    // Footer
    all_rights_reserved: 'All rights reserved.',
    privacy_policy: 'Privacy Policy',
    contact_link: 'Contact',
    admin_dashboard: 'Admin Dashboard',
    back_to_top: 'Back to top',

    // AI Chat Assistant
    ai_assistant_title: 'NDAV Assistant',
    ai_assistant_subtitle: 'Online • Instant Reply',
    ai_welcome_msg:
      "Hello! 👋 I am **NDAV AI Assistant**, Nanda Safiq Alfiansyah's virtual representative.\n\nFeel free to ask anything about Nanda's **projects**, **work experience**, **tech stack**, or **job availability**!",
    ai_popular_questions: 'Quick Questions for Recruiters:',
    ai_placeholder: 'Ask about projects, skills & availability...',
    ai_send_hint: 'Press Enter to send',
    ai_typing: 'Thinking...',
    ai_toggle_open: 'Chat AI Assistant',
    ai_toggle_close: 'Close Assistant',
    ai_prompt_1: "🚀 What are Nanda's top projects?",
    ai_prompt_2: '🛠️ What is the primary tech stack?',
    ai_prompt_3: '🏆 Education & accomplishments?',
    ai_prompt_4: '📬 How to contact or hire Nanda?'
  },
  ja: {
    // Nav
    nav_home: 'ホーム',
    nav_projects: 'プロジェクト',
    nav_blog: 'ブログ',
    nav_certificates: '資格・認定',
    nav_contact: 'お問い合わせ',

    // Hero / Intro
    role_badge: 'ソフトウェアエンジニア募集中',
    hero_title: 'ソフトウェアエンジニア & AI開発者',
    hero_description:
      '機械学習の優秀修了生であり、高性能なモダンWebアプリケーション、スケーラブルな分散バックエンド、AIソリューションの構築を専門とするソフトウェアエンジニアです。',
    btn_explore_projects: 'プロジェクトを見る',
    btn_copy_email: 'メールをコピー',
    btn_email_copied: 'コピー完了！',
    btn_get_in_touch: '連絡する',

    // Section Titles
    sec_featured_projects: '主な開発プロジェクト',
    sec_featured_projects_sub:
      '本番稼働対応のWebアプリケーション、AIモデル、受賞歴のあるソフトウェアアーキテクチャ。',
    sec_all_projects: 'すべてのプロジェクト',
    sec_view_all_projects: 'プロジェクト一覧を見る',
    sec_experience: '職務経歴・実績',
    sec_experience_sub: '技術リーダーシップ、ソフトウェア開発、AIイノベーションの実績。',
    sec_education: '学歴・認定資格',
    sec_education_sub: '大学での専攻、Google Bangkitプログラム、専門認定資格。',
    sec_recent_posts: '最新の記事・技術ブログ',
    sec_recent_posts_sub: 'フルスタック設計、機械学習パイプライン、システム開発に関する技術考察。',

    // Project Cards
    read_case_study: '詳細を見る',
    competition_winner: 'コンテスト優勝',
    btn_view_details: '詳細を表示',
    btn_hide_details: '詳細を閉じる',

    // Footer
    all_rights_reserved: '無断転載を禁じます。',
    privacy_policy: 'プライバシーポリシー',
    contact_link: 'お問い合わせ',
    admin_dashboard: '管理者ダッシュボード',
    back_to_top: 'トップへ戻る',

    // AI Chat Assistant
    ai_assistant_title: 'NDAV アシスタント',
    ai_assistant_subtitle: 'オンライン • 即時返答',
    ai_welcome_msg:
      'こんにちは！👋 私はナンダ・サフィック・アルフィアンシャーのバーチャルAIアシスタントです。\n\nナンダの**プロジェクト**、**開発経験**、**技術スタック**、**採用・お仕事のご相談**についてお気軽にお尋ねください。',
    ai_popular_questions: '採用担当者向けのおすすめ質問:',
    ai_placeholder: 'プロジェクトや技術について質問する...',
    ai_send_hint: 'Enterキーで送信',
    ai_typing: '入力中...',
    ai_toggle_open: 'AIアシスタントに質問',
    ai_toggle_close: '閉じる',
    ai_prompt_1: '🚀 主な代表プロジェクトは？',
    ai_prompt_2: '🛠️ 得意な技術スタックは？',
    ai_prompt_3: '🏆 学歴や受賞実績について',
    ai_prompt_4: '📬 連絡・採用の問い合わせ方法'
  }
}

export type TranslationKey = keyof typeof translations.id

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default to Indonesian ('id') as requested
  const [language, setLanguageState] = useState<Language>('id')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedLang = localStorage.getItem('portfolio_lang') as Language
    if (savedLang && (savedLang === 'id' || savedLang === 'en' || savedLang === 'ja')) {
      setLanguageState(savedLang)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolio_lang', lang)
    }
  }

  const t = (key: TranslationKey): string => {
    return translations[language]?.[key] || translations.id[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
