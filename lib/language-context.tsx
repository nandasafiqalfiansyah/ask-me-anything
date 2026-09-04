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
    greeting: 'Halo, Saya Nanda Safiq.',
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
    sec_selected_portfolio: 'Portofolio Terpilih',
    sec_all_projects: 'Semua Proyek',
    sec_view_all_projects: 'Lihat Semua Proyek',
    projects_page_title: 'Proyek & Eksperimen',
    projects_page_sub:
      'Koleksi aplikasi web, alat berbasis AI, sistem full-stack terdistribusi, dan package open-source.',
    sec_experience: 'Pengalaman Kerja & Organisasi',
    sec_experience_sub:
      'Rekam jejak kepemimpinan teknik, rekayasa perangkat lunak, dan proyek inovasi AI.',
    sec_education: 'Pendidikan & Prestasi',
    sec_education_sub:
      'Latar belakang akademis, program Google Bangkit, dan sertifikasi keahlian terverifikasi.',
    sec_recent_posts: 'Tulisan & Artikel Terbaru',
    sec_recent_posts_sub:
      'Catatan teknis, arsitektur software, dan eksplorasi kecerdasan buatan.',
    posts_page_title: 'Artikel & Catatan Teknis',
    posts_page_sub:
      'Pemikiran, tutorial rekayasa web modern, arsitektur sistem, dan inovasi kecerdasan buatan.',

    // Projects Grid / Card
    read_case_study: 'Baca Studi Kasus',
    competition_winner: 'Pemenang Kompetisi',
    btn_view_details: 'Lihat Rincian',
    btn_hide_details: 'Tutup Rincian',
    no_projects_found: 'Tidak ada proyek yang ditemukan.',
    tag_all: 'Semua',
    featured_project_label: 'Proyek Unggulan',

    // Experience & Social
    linkedin_profile: 'Profil LinkedIn',
    view_full_history_linkedin: 'Lihat riwayat lengkap di LinkedIn',

    // Tech Stack & Toolkit
    skills_section_badge: 'Keahlian & Stack',
    skills_section_title: 'Tech Stack & Toolkit',
    skills_section_sub:
      'Katalog bahasa pemrograman, framework, database, dan alat bantu yang saya gunakan.',
    skills_cat_all: 'Semua',
    skills_cat_frontend: 'Frontend',
    skills_cat_backend: 'Backend',
    skills_cat_aiml: 'AI & ML',
    skills_cat_cloud: 'Cloud & Tools',
    skills_view_grid: 'Grid',
    skills_view_chips: 'Chips',
    skills_search_placeholder: 'Cari teknologi / stack...',
    skills_no_match: 'Tidak ada teknologi yang cocok dengan filter',
    skills_no_match_sub: 'Coba ubah kata kunci pencarian atau pilih kategori lain.',
    skills_reset_filters: 'Reset Filter',
    skills_verified_stack: 'Stack Terverifikasi',
    skills_footer_note:
      'Aktif mengadopsi standar modern: Next.js 15, React 19, TypeScript, & Model Edge AI.',
    skills_count_suffix: 'Teknologi Stack',

    // Certificates Page
    cert_catalog_title: 'Sertifikasi & Kredensial',
    cert_catalog_sub:
      'Pencapaian terverifikasi, akreditasi cloud resmi, dan program sertifikasi keahlian.',
    cert_display_mode: 'Mode tampilan:',
    cert_grouped_company: 'Dikelompokkan Penerbit',
    cert_list_all: 'Daftar Semua',
    cert_verified_credential: 'Kredensial Terverifikasi',
    cert_verified: 'Terverifikasi',
    cert_issued: 'Diterbitkan',
    cert_view: 'Lihat',
    cert_verify_btn: 'Verifikasi Sertifikat',
    cert_view_pdf_btn: 'Lihat Dokumen PDF',
    cert_loading: 'Memuat data sertifikat...',
    cert_no_found: 'Belum ada sertifikat yang ditemukan',
    cert_no_preview: 'Pratinjau tidak tersedia',
    cert_description: 'Deskripsi',

    // Posts & Search
    posts_all_articles: 'Semua Artikel',
    posts_search_placeholder: 'Cari artikel...',
    posts_all_authors: 'Semua penulis',
    posts_sort_newest: 'Terbaru',
    posts_sort_oldest: 'Terlama',
    posts_sort_most_views: 'Paling banyak dilihat',
    posts_sort_least_views: 'Paling sedikit dilihat',
    posts_reset_btn: 'Reset',
    posts_no_image: 'Tanpa gambar',
    posts_views: 'kali dilihat',

    // Newsletter
    newsletter_badge: 'Newsletter',
    newsletter_title: 'Tetap Terhubung',
    newsletter_sub:
      'Dapatkan wawasan berkala seputar rekayasa web modern, eksperimen AI, proyek open-source, dan catatan teknis.',
    newsletter_placeholder: 'Masukkan alamat email Anda...',
    newsletter_btn_submitting: 'Mendaftar...',
    newsletter_btn_subscribe: 'Langganan',
    newsletter_disclaimer: 'Bebas spam. Berhenti berlangganan kapan saja dengan satu klik.',
    newsletter_success: 'Terima kasih telah berlangganan!',
    newsletter_error: 'Terjadi kesalahan! Silakan coba lagi.',

    // Contact
    contact_page_title: 'Hubungi Saya',
    contact_page_sub:
      'Punya ide proyek, tawaran kerja sama, atau ingin berdiskusi seputar teknologi? Kirimkan pesan Anda.',
    contact_name_placeholder: 'Nama Lengkap',
    contact_email_placeholder: 'Alamat Email',
    contact_message_placeholder: 'Tulis pesan Anda di sini...',
    contact_submit_btn: 'Kirim Pesan',
    contact_submitting_btn: 'Mengirim...',
    contact_privacy_agreement: 'Dengan mengirim formulir ini, Anda menyetujui',
    contact_privacy_link: 'kebijakan privasi',
    contact_success: 'Pesan berhasil terkirim!',
    contact_error: 'Gagal mengirim pesan. Silakan coba lagi.',

    // Privacy Policy Page
    privacy_title: 'Kebijakan Privasi',
    privacy_updated: 'Terakhir diperbarui: September 2024',
    privacy_sec1_title: 'Pendahuluan dan Ruang Lingkup',
    privacy_sec1_desc:
      'Kami menghormati privasi Anda dan berkomitmen untuk melindungi data pribadi Anda. Kebijakan privasi ini menjelaskan bagaimana kami mengelola data Anda saat mengunjungi situs portofolio ini dan hak-hak privasi Anda.',
    privacy_sec2_title: 'Pengumpulan Data',
    privacy_sec2_desc:
      'Kami dapat mengumpulkan informasi kontak yang Anda berikan secara sukarela (seperti nama, email, dan isi pesan) semata-mata untuk membalas pertanyaan atau komunikasi Anda.',
    privacy_sec2_li1: 'Data Identitas mencakup nama depan dan nama belakang.',
    privacy_sec2_li2: 'Data Kontak mencakup alamat email dan nomor kontak opsional.',
    privacy_sec2_li3: 'Data Teknis mencakup jenis peramban (browser) dan interaksi umum di situs.',
    privacy_sec3_title: 'Penggunaan Cookies',
    privacy_sec3_desc:
      'Situs ini menggunakan preferensi lokal (seperti preferensi tema gelap/terang dan bahasa) untuk memastikan kenyamanan navigasi Anda.',
    privacy_sec4_title: 'Penyimpanan dan Keamanan Data',
    privacy_sec4_desc:
      'Keamanan data Anda sangat penting bagi kami. Kami menerapkan standar keamanan yang tepat untuk mencegah akses yang tidak sah.',
    privacy_sec5_title: 'Berbagi Data',
    privacy_sec5_desc:
      'Kami tidak pernah menjual data pribadi Anda kepada pihak ketiga mana pun.',
    privacy_sec6_title: 'Hak Pengguna',
    privacy_sec6_desc:
      'Anda berhak meminta penghapusan atau pembaruan data kontak Anda kapan saja.',
    privacy_sec7_title: 'Hubungi Kami',
    privacy_sec7_desc:
      'Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, silakan hubungi kami melalui halaman kontak.',

    // Not Found (404)
    not_found_title: 'Halaman Tidak Ditemukan',
    not_found_sub: 'Silakan periksa kembali alamat URL yang Anda tuju.',
    not_found_btn: 'Kembali ke Beranda',

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
    ai_prompt_4: '📬 Bagaimana cara kontak/hire?',

    // Avatar Snap Effect
    avatar_snap_quote: 'Aku merasa tidak enak badan, Mr. Stark...',
    avatar_snap_restore: 'Klik untuk pulihkan avatar',
    avatar_snap_badge: 'Klik Efek Snap',
    avatar_snap_restore_tip: 'Klik untuk pulihkan avatar',
    avatar_snap_trigger_tip: 'Klik untuk efek Thanos Disintegration Snap! ✨'
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
    greeting: "Hey, I'm Nanda Safiq.",
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
    sec_selected_portfolio: 'Selected Portfolio',
    sec_all_projects: 'All Projects',
    sec_view_all_projects: 'View All Projects',
    projects_page_title: 'Projects & Experiments',
    projects_page_sub:
      'A collection of web applications, AI tools, full-stack systems, and open-source packages.',
    sec_experience: 'Work & Organization Experience',
    sec_experience_sub:
      'Track record of engineering leadership, software delivery, and AI innovations.',
    sec_education: 'Education & Honors',
    sec_education_sub:
      'Academic background, Google Bangkit graduate, and verified credentials.',
    sec_recent_posts: 'Recent Articles & Writing',
    sec_recent_posts_sub:
      'Technical writeups on full-stack architecture, ML pipelines, and software design.',
    posts_page_title: 'Articles & Notes',
    posts_page_sub:
      'Thoughts, technical tutorials, and insights on modern web engineering and AI.',

    // Projects Grid / Card
    read_case_study: 'Read Case Study',
    competition_winner: 'Competition Winner',
    btn_view_details: 'View details',
    btn_hide_details: 'Hide details',
    no_projects_found: 'No projects found.',
    tag_all: 'All',
    featured_project_label: 'Featured Project',

    // Experience & Social
    linkedin_profile: 'LinkedIn Profile',
    view_full_history_linkedin: 'View full history on LinkedIn',

    // Tech Stack & Toolkit
    skills_section_badge: 'Capabilities & Stack',
    skills_section_title: 'Tech Stack & Toolkit',
    skills_section_sub:
      'A curated catalog of languages, libraries, databases, and tools I use to build scalable products.',
    skills_cat_all: 'All',
    skills_cat_frontend: 'Frontend',
    skills_cat_backend: 'Backend',
    skills_cat_aiml: 'AI & ML',
    skills_cat_cloud: 'Cloud & Tools',
    skills_view_grid: 'Grid',
    skills_view_chips: 'Chips',
    skills_search_placeholder: 'Search tech...',
    skills_no_match: 'No technologies match your filter',
    skills_no_match_sub: 'Try changing the search query or selecting a different category.',
    skills_reset_filters: 'Reset Filters',
    skills_verified_stack: 'Verified Stack',
    skills_footer_note:
      'Actively adopting modern standards: Next.js 15, React 19, TypeScript, & Edge AI models.',
    skills_count_suffix: 'Stack Technologies',

    // Certificates Page
    cert_catalog_title: 'Certifications & Credentials',
    cert_catalog_sub:
      'Verified achievements, official cloud accreditations, and specialized learning paths.',
    cert_display_mode: 'Display mode:',
    cert_grouped_company: 'Grouped by Issuer',
    cert_list_all: 'List All',
    cert_verified_credential: 'Verified Credential',
    cert_verified: 'Verified',
    cert_issued: 'Issued',
    cert_view: 'View',
    cert_verify_btn: 'Verify Certificate',
    cert_view_pdf_btn: 'View PDF Document',
    cert_loading: 'Loading certificates...',
    cert_no_found: 'No certificates found',
    cert_no_preview: 'No preview available',
    cert_description: 'Description',

    // Posts & Search
    posts_all_articles: 'All Articles',
    posts_search_placeholder: 'Search posts...',
    posts_all_authors: 'All authors',
    posts_sort_newest: 'Newest first',
    posts_sort_oldest: 'Oldest first',
    posts_sort_most_views: 'Most views',
    posts_sort_least_views: 'Least views',
    posts_reset_btn: 'Reset',
    posts_no_image: 'No image',
    posts_views: 'views',

    // Newsletter
    newsletter_badge: 'Newsletter',
    newsletter_title: 'Stay in the loop',
    newsletter_sub:
      'Get occasional notes on modern web engineering, AI experiments, open source projects, and tech insights.',
    newsletter_placeholder: 'Enter your email...',
    newsletter_btn_submitting: 'Joining...',
    newsletter_btn_subscribe: 'Subscribe',
    newsletter_disclaimer: 'No spam ever. Unsubscribe at any time with a single click.',
    newsletter_success: 'Thank you for subscribing!',
    newsletter_error: 'An error occurred! Please try again.',

    // Contact
    contact_page_title: 'Get in Touch',
    contact_page_sub:
      'Have a project in mind, an opportunity, or just want to chat tech? Send a message.',
    contact_name_placeholder: 'Your Name',
    contact_email_placeholder: 'Your Email',
    contact_message_placeholder: 'Write your message here...',
    contact_submit_btn: 'Send Message',
    contact_submitting_btn: 'Submitting...',
    contact_privacy_agreement: 'By submitting this form, I agree to the',
    contact_privacy_link: 'privacy policy',
    contact_success: 'Message sent successfully!',
    contact_error: 'An error occurred! Please try again.',

    // Privacy Policy Page
    privacy_title: 'Privacy Policy',
    privacy_updated: 'Last updated: September 2024',
    privacy_sec1_title: 'Introduction and Scope',
    privacy_sec1_desc:
      'We respect your privacy and are committed to protecting your personal data. This privacy policy informs you about how we handle your data when visiting this website.',
    privacy_sec2_title: 'Data Collection',
    privacy_sec2_desc:
      'We may collect voluntary contact data (such as name, email, and message content) solely to respond to your inquiries and requests.',
    privacy_sec2_li1: 'Identity Data includes first name and last name.',
    privacy_sec2_li2: 'Contact Data includes email address and message contents.',
    privacy_sec2_li3: 'Technical Data includes general browser and device configuration.',
    privacy_sec3_title: 'Use of Cookies',
    privacy_sec3_desc:
      'This website uses local browser storage for theme and language preference caching.',
    privacy_sec4_title: 'Data Storage and Security',
    privacy_sec4_desc:
      'The security of your personal data is important to us. We implement appropriate safeguards.',
    privacy_sec5_title: 'Data Sharing',
    privacy_sec5_desc:
      'We do not sell or trade your personal information to any third parties.',
    privacy_sec6_title: 'User Rights',
    privacy_sec6_desc:
      'You have the right to request deletion or updates to your contact information at any time.',
    privacy_sec7_title: 'Contact Us',
    privacy_sec7_desc:
      'If you have any questions about this privacy policy, please contact us.',

    // Not Found (404)
    not_found_title: 'Page not found',
    not_found_sub: 'Please check the URL in the address bar and try again.',
    not_found_btn: 'Go back home',

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
    ai_prompt_4: '📬 How to contact or hire Nanda?',

    // Avatar Snap Effect
    avatar_snap_quote: "I don't feel so good, Mr. Stark...",
    avatar_snap_restore: 'Click to restore avatar',
    avatar_snap_badge: 'Click Snap Effect',
    avatar_snap_restore_tip: 'Click to restore avatar',
    avatar_snap_trigger_tip: 'Click for Thanos Disintegration Snap effect! ✨'
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
    greeting: 'こんにちは、ナンダ・サフィックです。',
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
    sec_selected_portfolio: '厳選ポートフォリオ',
    sec_all_projects: 'すべてのプロジェクト',
    sec_view_all_projects: 'プロジェクト一覧を見る',
    projects_page_title: 'プロジェクト・開発実績',
    projects_page_sub:
      'Webアプリケーション、AIツール、フルスタックシステム、オープンソースのライブラリ群。',
    sec_experience: '職務経歴・実績',
    sec_experience_sub:
      '技術リーダーシップ、ソフトウェア開発、AIイノベーションの実績。',
    sec_education: '学歴・認定資格',
    sec_education_sub:
      '大学での専攻、Google Bangkitプログラム、専門認定資格。',
    sec_recent_posts: '最新の記事・技術ブログ',
    sec_recent_posts_sub:
      'フルスタック設計、機械学習パイプライン、システム開発に関する技術考察。',
    posts_page_title: '技術記事・ノート',
    posts_page_sub:
      'モダンWeb開発、AI活用、クラウド設計に関する技術的知見と考察。',

    // Projects Grid / Card
    read_case_study: '詳細を見る',
    competition_winner: 'コンテスト優勝',
    btn_view_details: '詳細を表示',
    btn_hide_details: '詳細を閉じる',
    no_projects_found: 'プロジェクトが見つかりませんでした。',
    tag_all: 'すべて',
    featured_project_label: '注目のプロジェクト',

    // Experience & Social
    linkedin_profile: 'LinkedIn プロフィール',
    view_full_history_linkedin: 'LinkedInで全経歴を見る',

    // Tech Stack & Toolkit
    skills_section_badge: '技術スタック & ツール',
    skills_section_title: '開発スキル & ツールキット',
    skills_section_sub:
      'スケーラブルなプロダクト構築に使用している言語、フレームワーク、DB、ツール一覧。',
    skills_cat_all: 'すべて',
    skills_cat_frontend: 'フロントエンド',
    skills_cat_backend: 'バックエンド',
    skills_cat_aiml: 'AI・機械学習',
    skills_cat_cloud: 'クラウド・ツール',
    skills_view_grid: 'グリッド',
    skills_view_chips: 'バッジ',
    skills_search_placeholder: '技術を検索...',
    skills_no_match: '該当する技術が見つかりません',
    skills_no_match_sub: '検索キーワードを変更するか、別のカテゴリーを選択してください。',
    skills_reset_filters: 'フィルターをリセット',
    skills_verified_stack: '実務検証済みスタック',
    skills_footer_note:
      '最新標準を積極採用: Next.js 15, React 19, TypeScript, Edge AIモデル。',
    skills_count_suffix: '種類の主要技術',

    // Certificates Page
    cert_catalog_title: '資格・認定プログラム',
    cert_catalog_sub:
      '公式認定資格、クラウドプラットフォームの認証、専門教育課程の実績。',
    cert_display_mode: '表示形式:',
    cert_grouped_company: '発行元別にグループ化',
    cert_list_all: '全件リスト',
    cert_verified_credential: '認証済み資格',
    cert_verified: '認証済み',
    cert_issued: '取得時期',
    cert_view: '確認',
    cert_verify_btn: '証明書を検証',
    cert_view_pdf_btn: 'PDF書類を閲覧',
    cert_loading: '資格データを読み込み中...',
    cert_no_found: '証明書が見つかりませんでした',
    cert_no_preview: 'プレビューがありません',
    cert_description: '説明',

    // Posts & Search
    posts_all_articles: 'すべての記事',
    posts_search_placeholder: '記事を検索...',
    posts_all_authors: 'すべての著者',
    posts_sort_newest: '新しい順',
    posts_sort_oldest: '古い順',
    posts_sort_most_views: '閲覧数が多い順',
    posts_sort_least_views: '閲覧数が少ない順',
    posts_reset_btn: 'リセット',
    posts_no_image: '画像なし',
    posts_views: '回閲覧',

    // Newsletter
    newsletter_badge: 'ニュースレター',
    newsletter_title: '最新情報を受け取る',
    newsletter_sub:
      'モダンWeb開発、AI活用実験、オープンソース、技術トレンドに関する考察をお届けします。',
    newsletter_placeholder: 'メールアドレスを入力...',
    newsletter_btn_submitting: '登録中...',
    newsletter_btn_subscribe: '購読する',
    newsletter_disclaimer: 'スパムはありません。いつでもワンクリックで解除できます。',
    newsletter_success: 'ご登録ありがとうございます！',
    newsletter_error: 'エラーが発生しました。もう一度お試しください。',

    // Contact
    contact_page_title: 'お問い合わせ',
    contact_page_sub:
      'プロジェクトのご相談、採用・お仕事の依頼、技術的な質問など、お気軽にお問い合わせください。',
    contact_name_placeholder: 'お名前',
    contact_email_placeholder: 'メールアドレス',
    contact_message_placeholder: 'お問い合わせ内容を入力してください...',
    contact_submit_btn: 'メッセージを送信',
    contact_submitting_btn: '送信中...',
    contact_privacy_agreement: '送信することで、以下に同意したものとみなされます:',
    contact_privacy_link: 'プライバシーポリシー',
    contact_success: 'メッセージが正常に送信されました！',
    contact_error: '送信に失敗しました。もう一度お試しください。',

    // Privacy Policy Page
    privacy_title: 'プライバシーポリシー',
    privacy_updated: '最終更新日: 2024年9月',
    privacy_sec1_title: 'はじめにと適用範囲',
    privacy_sec1_desc:
      '私たちはユーザーのプライバシーを尊重し、個人情報の保護に努めています。本ポリシーでは、当サイトでのデータ取り扱いについて説明します。',
    privacy_sec2_title: '収集するデータ',
    privacy_sec2_desc:
      'お問い合わせ時に自発的に提供される連絡先情報（お名前、メールアドレス、メッセージ内容）のみを収集し、返信以外の目的には利用しません。',
    privacy_sec2_li1: '氏名データ: ご入力いただいたお名前。',
    privacy_sec2_li2: '連絡先データ: メールアドレスおよびメッセージ内容。',
    privacy_sec2_li3: '技術データ: ブラウザの表示設定および一般的な接続情報。',
    privacy_sec3_title: 'クッキー（Cookies）の使用',
    privacy_sec3_desc:
      '当サイトでは、言語設定やダークモードの表示設定の保存のためにローカルストレージを使用しています。',
    privacy_sec4_title: 'データの保管とセキュリティ',
    privacy_sec4_desc:
      '個人情報の安全性を確保するため、適切なセキュリティ対策を講じています。',
    privacy_sec5_title: '第三者への提供',
    privacy_sec5_desc:
      '収集した個人情報を第三者に販売または提供することはありません。',
    privacy_sec6_title: 'ユーザーの権利',
    privacy_sec6_desc:
      'ユーザーはいつでもご自身の連絡先情報の削除または変更を求める権利を有します。',
    privacy_sec7_title: 'お問い合わせ先',
    privacy_sec7_desc:
      'プライバシーポリシーに関するご質問は、お問い合わせフォームよりご連絡ください。',

    // Not Found (404)
    not_found_title: 'ページが見つかりません',
    not_found_sub: 'URLが正しいかご確認の上、再度お試しください。',
    not_found_btn: 'トップページへ戻る',

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
    ai_prompt_4: '📬 連絡・採用の問い合わせ方法',

    // Avatar Snap Effect
    avatar_snap_quote: 'スタークさん、気分が悪いんだ…',
    avatar_snap_restore: 'クリックしてアバターを復元',
    avatar_snap_badge: 'スナップエフェクト',
    avatar_snap_restore_tip: 'クリックしてアバターを復元',
    avatar_snap_trigger_tip: 'クリックでサノスのスナップ消滅エフェクト！✨'
  }
}

export type TranslationKey = keyof typeof translations.id

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
  switchEffectLang: Language | null
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default to Indonesian ('id') as requested
  const [language, setLanguageState] = useState<Language>('id')
  const [mounted, setMounted] = useState(false)
  const [switchEffectLang, setSwitchEffectLang] = useState<Language | null>(null)

  useEffect(() => {
    setMounted(true)
    const savedLang = localStorage.getItem('portfolio_lang') as Language
    if (savedLang && (savedLang === 'id' || savedLang === 'en' || savedLang === 'ja')) {
      setLanguageState(savedLang)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    setSwitchEffectLang(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolio_lang', lang)
    }
  }

  const t = (key: TranslationKey): string => {
    return translations[language]?.[key] || translations.id[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, switchEffectLang }}>
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
