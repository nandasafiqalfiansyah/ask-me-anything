import { GoogleGenAI } from '@google/genai'
import { NextRequest, NextResponse } from 'next/server'

// Server-side lazy initialization
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return null
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  })
}

const SYSTEM_INSTRUCTION = `You are NDAV AI Assistant, a friendly, professional, and knowledgeable virtual representative on Nanda Safiq Alfiansyah's personal developer portfolio website.

ABOUT NANDA SAFIQ ALFIANSYAH:
- Name: Nanda Safiq Alfiansyah (also known as NDAV)
- Title: Software Engineer & Machine Learning Specialist
- Location: East Java, Indonesia
- Email: nandasafiqalfiansyah@gmail.com
- GitHub: https://github.com/nandasafiqalfiansyah
- LinkedIn: https://linkedin.com/in/nandasafiqalfiansyah
- Status: Actively open for Software Engineer, Full-Stack Developer, and AI/ML Engineer opportunities.

CORE COMPETENCIES & TECH STACK:
- Frontend: Next.js 14/15, React, TypeScript, Tailwind CSS, Framer Motion, Redux/Zustand
- Backend & APIs: Node.js, Express, Python (FastAPI, Flask), RESTful APIs, Server Actions
- Databases: PostgreSQL, Supabase, Prisma ORM, MongoDB, Redis
- Machine Learning & AI: TensorFlow, PyTorch, Computer Vision, NLP, Gemini API, Scikit-Learn
- Cloud & DevOps: Google Cloud Platform (GCP), Docker, Vercel, Git/GitHub CI/CD

FEATURED PROJECTS:
1. Anak Sehat (Competition Winner): An AI-driven mobile health application helping parents and posyandu track child nutrition and growth metrics with automated computer-vision food analysis. Stack: React Native, Python, FastAPI, TensorFlow, PostgreSQL.
2. Histo Talk: Medical histopathology learning platform utilizing deep learning classification for microscopic tissue analysis. Stack: Next.js, PyTorch, Supabase, Tailwind.
3. Moneo App: Smart personal finance manager with automated transaction categorization, budget forecasting, and analytics. Stack: Next.js, TypeScript, PostgreSQL, Prisma.

EDUCATION & HONORS:
- Bachelor of Information Systems, Universitas Terbuka (High GPA: 3.92)
- Bangkit Academy by Google, GoTo, Traveloka (Machine Learning Cohort - Graduated with Distinction)
- Multiple certifications in Deep Learning, Cloud Computing, and Modern Web Development.

INSTRUCTIONS:
- Answer questions from HR, recruiters, engineering managers, and visitors about Nanda's background, projects, skills, and availability.
- Be concise, professional, structured, and helpful. Use bullet points where appropriate.
- If asked how to contact or hire Nanda, provide his email (nandasafiqalfiansyah@gmail.com) and invite them to connect via LinkedIn.
- Match the user's language (Indonesian, English, or Japanese).
- Emphasize Nanda's passion for building robust software, solving real-world challenges, and delivering high quality code.`

// Intelligent Rule-Based Fallback Knowledge Engine (Works without API Token/Quota)
function generateFallbackResponse(query: string, lang: string = 'id'): string {
  const q = query.toLowerCase()

  // 1. Projects / Proyek
  if (
    q.includes('proyek') ||
    q.includes('project') ||
    q.includes('anak sehat') ||
    q.includes('histo') ||
    q.includes('moneo') ||
    q.includes('portofolio') ||
    q.includes('karya') ||
    q.includes('プロジェクト') ||
    q.includes('実績')
  ) {
    if (lang === 'ja') {
      return `### 🚀 ナンダの主な代表プロジェクト

1. **Anak Sehat (コンテスト優勝作品 🏆)**
   - **概要:** コンピュータビジョンとAIを活用し、子どもの栄養状態と成長記録を自動判定するモバイルヘルスケアアプリ。
   - **技術スタック:** React Native, Python, FastAPI, TensorFlow, PostgreSQL.

2. **Histo Talk (病理画像学習プラットフォーム)**
   - **概要:** 深層学習（ディープラーニング）による顕微鏡組織分類を取り入れた医療病理学習Webアプリ。
   - **技術スタック:** Next.js, PyTorch, Supabase, Tailwind CSS.

3. **Moneo App (スマート家計簿)**
   - **概要:** 自動支出分類と予算予測機能を備えたパーソナルファイナンス管理アプリ。
   - **技術スタック:** Next.js, TypeScript, PostgreSQL, Prisma.

詳しいコードやデモは上部メニューの「プロジェクト」タブからご覧いただけます！`
    }
    if (lang === 'en') {
      return `### 🚀 Featured Projects by Nanda Safiq

1. **Anak Sehat (Competition Winner 🏆)**
   - **Summary:** AI-powered mobile healthcare app enabling parents and community health workers to track child nutrition via automated computer-vision food analysis.
   - **Stack:** React Native, Python, FastAPI, TensorFlow, PostgreSQL.

2. **Histo Talk (Medical Learning Platform)**
   - **Summary:** Histopathology diagnostic educational platform leveraging deep learning tissue classification.
   - **Stack:** Next.js, PyTorch, Supabase, Tailwind CSS.

3. **Moneo App (Smart Finance Manager)**
   - **Summary:** Production-ready personal finance app with automated transaction categorization and budget forecasting.
   - **Stack:** Next.js, TypeScript, PostgreSQL, Prisma.

You can explore full case studies and GitHub repositories in the **Projects** section!`
    }
    return `### 🚀 Proyek Unggulan Nanda Safiq

1. **Anak Sehat (Pemenang Kompetisi 🏆)**
   - **Deskripsi:** Aplikasi mobile kesehatan berbasis AI & Computer Vision untuk memantau gizi anak dan balita melalui analisis makanan otomatis.
   - **Tech Stack:** React Native, Python, FastAPI, TensorFlow, PostgreSQL.

2. **Histo Talk (Platform Medis Digital)**
   - **Deskripsi:** Platform pembelajaran histopatologi berbasis Deep Learning untuk analisis citra mikroskopis jaringan tubuh.
   - **Tech Stack:** Next.js, PyTorch, Supabase, Tailwind CSS.

3. **Moneo App (Aplikasi Manajemen Keuangan)**
   - **Deskripsi:** Aplikasi manajemen finansial pintar dengan kategorisasi pengeluaran otomatis dan analitik anggaran terdistribusi.
   - **Tech Stack:** Next.js, TypeScript, PostgreSQL, Prisma.

Anda dapat meninjau detail studi kasus dan repository kode pada halaman **Proyek** di navigasi atas!`
  }

  // 2. Tech Stack & Skills / Keahlian
  if (
    q.includes('stack') ||
    q.includes('skill') ||
    q.includes('keahlian') ||
    q.includes('teknologi') ||
    q.includes('bahasa') ||
    q.includes('kemampuan') ||
    q.includes('react') ||
    q.includes('next') ||
    q.includes('python') ||
    q.includes('ai') ||
    q.includes('ml') ||
    q.includes('スキル') ||
    q.includes('技術')
  ) {
    if (lang === 'ja') {
      return `### 🛠️ 得意な技術スタック & 専門分野

- **Frontend & Web:** Next.js (App Router), React, TypeScript, Tailwind CSS, Framer Motion
- **Backend & API:** Node.js, Express, Python (FastAPI, Flask), REST API, Server Actions
- **AI & Machine Learning:** TensorFlow, PyTorch, Computer Vision, Gemini API, Scikit-Learn
- **Database & Cloud:** PostgreSQL, Supabase, Prisma ORM, GCP, Docker, Git CI/CD

スケーラブルなWebアプリ開発とAIモデルのプロダクション統合を得意としています。`
    }
    if (lang === 'en') {
      return `### 🛠️ Core Tech Stack & Competencies

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, Framer Motion
- **Backend & APIs:** Node.js, Express, Python (FastAPI, Flask), RESTful APIs, Server Actions
- **AI / Machine Learning:** TensorFlow, PyTorch, Computer Vision, Gemini API, NLP
- **Database & DevOps:** PostgreSQL, Supabase, Prisma ORM, Google Cloud (GCP), Docker, Git CI/CD

Nanda specializes in building performant, end-to-end fullstack systems integrated with modern AI pipelines.`
    }
    return `### 🛠️ Tech Stack & Keahlian Utama Nanda

- **Frontend:** Next.js 14/15, React, TypeScript, Tailwind CSS, Framer Motion
- **Backend & API:** Node.js, Express, Python (FastAPI, Flask), RESTful APIs, Server Actions
- **AI & Machine Learning:** TensorFlow, PyTorch, Computer Vision, Gemini API, Scikit-Learn
- **Database & Cloud:** PostgreSQL, Supabase, Prisma ORM, Google Cloud (GCP), Docker, Git CI/CD

Nanda sangat berpengalaman dalam membangun arsitektur perangkat lunak dari hulu ke hilir (*end-to-end*) dengan integrasi AI modern.`
  }

  // 3. Education & Achievements / Pendidikan & Prestasi
  if (
    q.includes('pendidikan') ||
    q.includes('kuliah') ||
    q.includes('bangkit') ||
    q.includes('prestasi') ||
    q.includes('education') ||
    q.includes('sertifikat') ||
    q.includes('certificate') ||
    q.includes('honors') ||
    q.includes('award') ||
    q.includes('学歴') ||
    q.includes('資格') ||
    q.includes('受賞')
  ) {
    if (lang === 'ja') {
      return `### 🎓 学歴 & 受賞実績

- **Sistem Informasi - Universitas Terbuka** (GPA: 3.92 / 4.00)
- **Google Bangkit Academy (Machine Learning Cohort)**
  - *Distinction Graduate* (Lulusan Terbaik & Berprestasi Tinggi)
- **Sertifikasi Profesional:**
  - TensorFlow & Deep Learning Specialization
  - Google Cloud Platform & Modern Web Architecture
  - Pemenang kompetisi inovasi teknologi nasional.`
    }
    if (lang === 'en') {
      return `### 🎓 Education & Key Achievements

- **Bachelor of Information Systems - Universitas Terbuka** (High GPA: **3.92 / 4.00**)
- **Bangkit Academy by Google, GoTo, Traveloka:**
  - Machine Learning Cohort — **Graduated with Distinction** (Top Tier Graduate)
- **Notable Certifications & Awards:**
  - Deep Learning & TensorFlow Specialization
  - Google Cloud Architecture Credentials
  - Competition Winner in software and AI innovation.`
    }
    return `### 🎓 Pendidikan & Prestasi Nanda Safiq

- **Sistem Informasi - Universitas Terbuka** (IPK **3.92 / 4.00**)
- **Bangkit Academy (Google, GoTo, Traveloka):**
  - Cohort Machine Learning — **Lulus dengan Predikat Distinction** (Lulusan Berprestasi)
- **Sertifikasi & Penghargaan:**
  - Sertifikasi Deep Learning & TensorFlow
  - Sertifikasi Google Cloud Platform
  - Juara kompetisi inovasi aplikasi teknologi kesehatan.`
  }

  // 4. Contact / Hire / Rekrut
  if (
    q.includes('kontak') ||
    q.includes('email') ||
    q.includes('hubungi') ||
    q.includes('hire') ||
    q.includes('contact') ||
    q.includes('kerja') ||
    q.includes('gaji') ||
    q.includes('rekrut') ||
    q.includes('recruit') ||
    q.includes('linkedin') ||
    q.includes('github') ||
    q.includes('連絡') ||
    q.includes('採用') ||
    q.includes('メール')
  ) {
    if (lang === 'ja') {
      return `### 📬 採用・お問い合わせ情報

ナンダは現在、**Software Engineer**、**Full-Stack Developer**、**AI/ML Engineer** の正社員・プロジェクト案件に積極的に対応しています！

- 📧 **Email:** [nandasafiqalfiansyah@gmail.com](mailto:nandasafiqalfiansyah@gmail.com)
- 💼 **LinkedIn:** [linkedin.com/in/nandasafiqalfiansyah](https://linkedin.com/in/nandasafiqalfiansyah)
- 🐙 **GitHub:** [github.com/nandasafiqalfiansyah](https://github.com/nandasafiqalfiansyah)
- 📍 **所在地:** Jawa Timur, Indonesia (リモート / ハイブリッド対応可能)`
    }
    if (lang === 'en') {
      return `### 📬 Contact & Hiring Information

Nanda is actively open to **Software Engineer**, **Full-Stack Developer**, and **AI/ML Engineer** roles (Full-time, Contract, or Remote).

- 📧 **Email:** [nandasafiqalfiansyah@gmail.com](mailto:nandasafiqalfiansyah@gmail.com)
- 💼 **LinkedIn:** [linkedin.com/in/nandasafiqalfiansyah](https://linkedin.com/in/nandasafiqalfiansyah)
- 🐙 **GitHub:** [github.com/nandasafiqalfiansyah](https://github.com/nandasafiqalfiansyah)
- 📍 **Location:** East Java, Indonesia (Open to Remote / Relocation)`
    }
    return `### 📬 Kontak & Rekrutmen Nanda Safiq

Nanda sedang terbuka untuk peluang kerja sebagai **Software Engineer**, **Full-Stack Developer**, maupun **AI/ML Engineer** (Full-time, Remote, atau Kontrak).

- 📧 **Email:** [nandasafiqalfiansyah@gmail.com](mailto:nandasafiqalfiansyah@gmail.com)
- 💼 **LinkedIn:** [linkedin.com/in/nandasafiqalfiansyah](https://linkedin.com/in/nandasafiqalfiansyah)
- 🐙 **GitHub:** [github.com/nandasafiqalfiansyah](https://github.com/nandasafiqalfiansyah)
- 📍 **Lokasi:** Jawa Timur, Indonesia (Terbuka untuk Remote / Hybrid / On-site)`
  }

  // 5. Greeting / Halo / Sapaan
  if (
    q.includes('halo') ||
    q.includes('hai') ||
    q.includes('hello') ||
    q.includes('hi') ||
    q.includes('hey') ||
    q.includes('selamat') ||
    q.includes('pagi') ||
    q.includes('siang') ||
    q.includes('malam') ||
    q.includes('こんにちは') ||
    q.includes('おはよう')
  ) {
    if (lang === 'ja') {
      return `こんにちは！👋 私はナンダ・サフィック・アルフィアンシャーのAIアシスタントです。\n\nナンダの**プロジェクト**、**得意な技術スタック**、**学歴・受賞歴**、または**採用・連絡先**について何でもご質問ください！`
    }
    if (lang === 'en') {
      return `Hello! 👋 I am NDAV Assistant, the virtual representative for Nanda Safiq Alfiansyah.\n\nFeel free to ask about Nanda's **featured projects**, **tech stack**, **education & Bangkit achievements**, or **availability for hire**!`
    }
    return `Halo! 👋 Saya NDAV Assistant, asisten virtual Nanda Safiq Alfiansyah.\n\nSilakan tanyakan seputar **proyek unggulan**, **tech stack & keahlian**, **prestasi & pendidikan**, atau **ketersediaan kerja / kontak** Nanda!`
  }

  // 6. Default General Summary
  if (lang === 'ja') {
    return `**Nanda Safiq Alfiansyah (NDAV)** は、スケーラブルなWebアプリケーション、分散バックエンド、AIソリューションの開発を専門とするソフトウェアエンジニアです。

- 💻 **スタック:** Next.js, React, TypeScript, Python, FastAPI, TensorFlow, PostgreSQL
- 🏆 **実績:** Google Bangkit Machine Learning Lulusan Terbaik (Distinction) & Juara Kompetisi
- 📬 **お問い合わせ:** [nandasafiqalfiansyah@gmail.com](mailto:nandasafiqalfiansyah@gmail.com)

ご質問のキーワード（例: *proyek*, *tech stack*, *pendidikan*, *kontak*）を入力いただければ詳しくご案内します！`
  }
  if (lang === 'en') {
    return `**Nanda Safiq Alfiansyah (NDAV)** is a Software Engineer and Machine Learning distinction graduate specializing in high-performance web applications, scalable backends, and AI integrations.

- 💻 **Key Stack:** Next.js, React, TypeScript, Python, FastAPI, TensorFlow, PostgreSQL
- 🏆 **Credentials:** Google Bangkit Distinction Graduate & National Tech Competition Winner
- 📬 **Direct Contact:** [nandasafiqalfiansyah@gmail.com](mailto:nandasafiqalfiansyah@gmail.com)

Feel free to ask about specific projects, technical skills, or hiring opportunities!`
  }
  return `**Nanda Safiq Alfiansyah (NDAV)** adalah seorang Software Engineer dan lulusan program Machine Learning dengan predikat *Distinction* yang berfokus membangun aplikasi web modern, sistem backend terdistribusi, dan solusi AI.

- 💻 **Tech Stack:** Next.js, React, TypeScript, Python, FastAPI, TensorFlow, PostgreSQL
- 🏆 **Prestasi:** Lulusan Berprestasi Google Bangkit Academy & Pemenang Kompetisi Inovasi
- 📬 **Kontak Langsung:** [nandasafiqalfiansyah@gmail.com](mailto:nandasafiqalfiansyah@gmail.com)

Ketik pertanyaan mengenai *proyek unggulan*, *keahlian/stack*, *pendidikan*, atau *kontak/rekrutmen* untuk informasi lebih lanjut!`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, message, language } = body
    const activeLanguage = language || 'id'

    // Extract the latest user query
    let latestUserQuery = ''
    if (Array.isArray(messages) && messages.length > 0) {
      const userMsgs = messages.filter((m: { role: string }) => m.role === 'user')
      if (userMsgs.length > 0) {
        latestUserQuery = userMsgs[userMsgs.length - 1].content || ''
      }
    } else if (typeof message === 'string') {
      latestUserQuery = message
    }

    if (!latestUserQuery && (!messages || messages.length === 0)) {
      return NextResponse.json(
        { error: 'Message payload is required' },
        { status: 400 }
      )
    }

    // Try Gemini AI API first if token is available
    const ai = getGeminiClient()

    if (ai) {
      try {
        let promptContents: any = []

        if (Array.isArray(messages) && messages.length > 0) {
          promptContents = messages.map((m: { role: string; content: string }) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }))
        } else {
          promptContents = [{ role: 'user', parts: [{ text: latestUserQuery }] }]
        }

        const langInstruction = activeLanguage === 'ja'
          ? 'The user has selected Japanese (日本語). Answer in natural, polite Japanese (丁寧語/敬語).'
          : activeLanguage === 'en'
          ? 'The user has selected English. Answer in professional, polished English.'
          : 'The user has selected Indonesian (Bahasa Indonesia). Answer in natural, polite Indonesian (Bahasa Indonesia baku & ramah).'

        const systemPromptWithLang = `${SYSTEM_INSTRUCTION}

CURRENT LANGUAGE CONTEXT:
${langInstruction}
Also adapt naturally if the user asks in Japanese, English, or Indonesian.`

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: promptContents,
          config: {
            systemInstruction: systemPromptWithLang,
            temperature: 0.7,
            topP: 0.95
          }
        })

        if (response.text && response.text.trim()) {
          return NextResponse.json({
            role: 'assistant',
            content: response.text
          })
        }
      } catch (geminiError: any) {
        console.warn('Gemini API request failed, falling back to local knowledge engine:', geminiError?.message || geminiError)
        // Fall through to smart rule-based fallback response
      }
    }

    // Offline / Tokenless / Fallback mode: Generate structured response instantly
    const fallbackAnswer = generateFallbackResponse(latestUserQuery, activeLanguage)

    return NextResponse.json({
      role: 'assistant',
      content: fallbackAnswer
    })
  } catch (error: any) {
    console.error('Error in /api/chat:', error)
    return NextResponse.json({
      role: 'assistant',
      content: 'Halo! Anda dapat menghubungi Nanda langsung melalui email di **nandasafiqalfiansyah@gmail.com** atau terhubung via [LinkedIn](https://linkedin.com/in/nandasafiqalfiansyah).'
    })
  }
}

