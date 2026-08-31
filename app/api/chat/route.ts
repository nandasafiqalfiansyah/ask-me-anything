import { GoogleGenAI } from '@google/genai'
import { NextRequest, NextResponse } from 'next/server'

// Server-side lazy initialization
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured')
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
- Match the user's language (Indonesian or English). If asked in Indonesian, answer in natural, polite Indonesian. If asked in English, answer in polished English.
- Emphasize Nanda's passion for building robust software, solving real-world challenges, and delivering high quality code.`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, message, language } = body

    // Support both single message and conversation history
    const ai = getGeminiClient()

    let promptContents: any = []

    if (Array.isArray(messages) && messages.length > 0) {
      promptContents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }))
    } else if (message) {
      promptContents = [{ role: 'user', parts: [{ text: message }] }]
    } else {
      return NextResponse.json(
        { error: 'Message payload is required' },
        { status: 400 }
      )
    }

    const langInstruction = language === 'ja'
      ? 'The user has selected Japanese (日本語). Answer in natural, polite Japanese (丁寧語/敬語).'
      : language === 'en'
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

    const replyText = response.text || 'I apologize, I could not generate a response. Please feel free to email Nanda directly at nandasafiqalfiansyah@gmail.com.'

    return NextResponse.json({
      role: 'assistant',
      content: replyText
    })
  } catch (error: any) {
    console.error('Error in /api/chat:', error)
    return NextResponse.json(
      {
        role: 'assistant',
        content: 'I am currently unable to connect to the AI engine. You can reach Nanda directly at nandasafiqalfiansyah@gmail.com!'
      },
      { status: 200 } // Graceful fallback
    )
  }
}
