'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { useLanguage, TranslationKey } from '@/lib/language-context'
import {
  SiTypescript,
  SiNextdotjs,
  SiReact,
  SiTailwindcss,
  SiFramer,
  SiNodedotjs,
  SiExpress,
  SiPostgresql,
  SiSupabase,
  SiPrisma,
  SiPython,
  SiTensorflow,
  SiPytorch,
  SiScikitlearn,
  SiOpencv,
  SiGooglecloud,
  SiDocker,
  SiGit,
  SiGithub,
  SiGithubactions,
  SiLinux,
  SiPostman,
  SiGraphql,
  SiMongodb,
  SiRedis,
  SiFastapi,
  SiVercel,
  SiJavascript,
  SiHtml5,
  SiCss,
  SiGoogle
} from 'react-icons/si'
import {
  MagnifyingGlassIcon,
  Cross2Icon,
  ViewGridIcon,
  TokensIcon
} from '@radix-ui/react-icons'

export type SkillCategory = 'All' | 'Frontend' | 'Backend' | 'AI & ML' | 'Cloud & Tools'

export interface SkillItem {
  id?: number | string
  name: string
  category: SkillCategory
  level: string
  description: string
  color: string
  icon: React.ComponentType<{ className?: string }>
}

// Master metadata for known skills with accurate branding
const SKILL_METADATA: Record<
  string,
  {
    category: SkillCategory
    level: string
    description: string
    color: string
    icon: React.ComponentType<{ className?: string }>
  }
> = {
  typescript: {
    category: 'Frontend',
    level: 'Core Language',
    description: 'Type-safe scalable JavaScript with strict typing and interfaces',
    color: '#3178C6',
    icon: SiTypescript
  },
  'next.js': {
    category: 'Frontend',
    level: 'Primary Framework',
    description: 'App Router, Server Actions, SSR/SSG, and optimized routing',
    color: '#000000',
    icon: SiNextdotjs
  },
  'next.js 15': {
    category: 'Frontend',
    level: 'Primary Framework',
    description: 'App Router, Server Actions, Turbopack, and hybrid rendering',
    color: '#000000',
    icon: SiNextdotjs
  },
  react: {
    category: 'Frontend',
    level: 'Advanced',
    description: 'Custom hooks, state management, concurrent UI and component architecture',
    color: '#61DAFB',
    icon: SiReact
  },
  'tailwind css': {
    category: 'Frontend',
    level: 'Daily Driver',
    description: 'Utility-first styling, dark mode systems, and responsive UI design',
    color: '#06B6D4',
    icon: SiTailwindcss
  },
  'framer motion': {
    category: 'Frontend',
    level: 'Interactive UI',
    description: 'Physics-based 3D animations, layout transitions & micro-interactions',
    color: '#0055FF',
    icon: SiFramer
  },
  javascript: {
    category: 'Frontend',
    level: 'Core Language',
    description: 'ESNext features, async/await, DOM APIs, and closures',
    color: '#F7DF1E',
    icon: SiJavascript
  },
  html5: {
    category: 'Frontend',
    level: 'Semantic Web',
    description: 'Accessible semantic structures, SEO foundations & Web APIs',
    color: '#E34F26',
    icon: SiHtml5
  },
  css3: {
    category: 'Frontend',
    level: 'Styling Core',
    description: 'Flexbox, Grid, custom properties, media queries & keyframes',
    color: '#1572B6',
    icon: SiCss
  },
  css: {
    category: 'Frontend',
    level: 'Styling Core',
    description: 'Flexbox, Grid, custom properties, media queries & keyframes',
    color: '#1572B6',
    icon: SiCss
  },
  'node.js': {
    category: 'Backend',
    level: 'Backend Runtime',
    description: 'Asynchronous event-driven backend architectures and services',
    color: '#339933',
    icon: SiNodedotjs
  },
  'express / hono': {
    category: 'Backend',
    level: 'Microservices',
    description: 'RESTful API endpoints, middleware routing, and edge computing',
    color: '#E5E7EB',
    icon: SiExpress
  },
  express: {
    category: 'Backend',
    level: 'Microservices',
    description: 'RESTful APIs, routing controllers, and authentication middleware',
    color: '#E5E7EB',
    icon: SiExpress
  },
  hono: {
    category: 'Backend',
    level: 'Edge Framework',
    description: 'Ultra-fast lightweight web framework for Cloudflare and edge runtimes',
    color: '#E36002',
    icon: SiExpress
  },
  postgresql: {
    category: 'Backend',
    level: 'Relational DB',
    description: 'Complex relational schemas, ACID transactions, and index tuning',
    color: '#4169E1',
    icon: SiPostgresql
  },
  supabase: {
    category: 'Backend',
    level: 'BaaS & Auth',
    description: 'PostgreSQL database, Row-Level Security (RLS), Realtime & Storage',
    color: '#3ECF8E',
    icon: SiSupabase
  },
  'rest apis': {
    category: 'Backend',
    level: 'Architecture',
    description: 'Clean RESTful conventions, JSON schemas, and error handling',
    color: '#6366F1',
    icon: SiFastapi
  },
  graphql: {
    category: 'Backend',
    level: 'API Query',
    description: 'Declarative data fetching, schema stitching & typed resolvers',
    color: '#E10098',
    icon: SiGraphql
  },
  prisma: {
    category: 'Backend',
    level: 'ORM Tool',
    description: 'Type-safe database client, schema migrations, and queries',
    color: '#2D3748',
    icon: SiPrisma
  },
  mongodb: {
    category: 'Backend',
    level: 'NoSQL Database',
    description: 'Document-oriented database, aggregation pipelines & Atlas hosting',
    color: '#47A248',
    icon: SiMongodb
  },
  redis: {
    category: 'Backend',
    level: 'Caching Layer',
    description: 'In-memory key-value caching, rate limiting, and pub/sub messaging',
    color: '#DC382D',
    icon: SiRedis
  },
  python: {
    category: 'AI & ML',
    level: 'AI Foundation',
    description: 'Data manipulation, algorithmic modeling, automation & scripting',
    color: '#3776AB',
    icon: SiPython
  },
  tensorflow: {
    category: 'AI & ML',
    level: 'Deep Learning',
    description: 'CNN, NLP neural models, transfer learning & Bangkit specialization',
    color: '#FF6F00',
    icon: SiTensorflow
  },
  pytorch: {
    category: 'AI & ML',
    level: 'Model Building',
    description: 'Dynamic neural network computation, tensor operations & training',
    color: '#EE4C2C',
    icon: SiPytorch
  },
  'scikit-learn': {
    category: 'AI & ML',
    level: 'Classical ML',
    description: 'Regression, classification, clustering, and data preprocessing pipelines',
    color: '#F7931E',
    icon: SiScikitlearn
  },
  opencv: {
    category: 'AI & ML',
    level: 'Computer Vision',
    description: 'Image processing, contour analysis, object detection & feature extraction',
    color: '#5C3EE8',
    icon: SiOpencv
  },
  'gemini & llm apis': {
    category: 'AI & ML',
    level: 'Generative AI',
    description: 'Structured multimodal prompts, function calling & Gemini models',
    color: '#4285F4',
    icon: SiGoogle
  },
  'google cloud (gcp)': {
    category: 'Cloud & Tools',
    level: 'Cloud Platform',
    description: 'Cloud Run, Compute Engine, Artifact Registry & Vertex AI deployments',
    color: '#4285F4',
    icon: SiGooglecloud
  },
  gcp: {
    category: 'Cloud & Tools',
    level: 'Cloud Platform',
    description: 'Cloud Run, Compute Engine, Artifact Registry & Vertex AI deployments',
    color: '#4285F4',
    icon: SiGooglecloud
  },
  docker: {
    category: 'Cloud & Tools',
    level: 'Containers',
    description: 'Containerized reproducible microservices & multi-stage builds',
    color: '#2496ED',
    icon: SiDocker
  },
  'git & github': {
    category: 'Cloud & Tools',
    level: 'Version Control',
    description: 'Git flow, pull requests, branch protection & collaborative reviews',
    color: '#F05032',
    icon: SiGit
  },
  git: {
    category: 'Cloud & Tools',
    level: 'Version Control',
    description: 'Version control, atomic commits, rebasing & branch management',
    color: '#F05032',
    icon: SiGit
  },
  github: {
    category: 'Cloud & Tools',
    level: 'Collaboration',
    description: 'Code repositories, issue tracking, projects & code reviews',
    color: '#E5E7EB',
    icon: SiGithub
  },
  'ci/cd pipelines': {
    category: 'Cloud & Tools',
    level: 'DevOps Flow',
    description: 'Automated GitHub Actions workflows, tests, and deployment gates',
    color: '#2088FF',
    icon: SiGithubactions
  },
  'github actions': {
    category: 'Cloud & Tools',
    level: 'DevOps Flow',
    description: 'Automated CI/CD pipelines, security audits, and deployment triggers',
    color: '#2088FF',
    icon: SiGithubactions
  },
  linux: {
    category: 'Cloud & Tools',
    level: 'OS & Server',
    description: 'Bash scripting, system administration, and Unix tooling',
    color: '#FCC624',
    icon: SiLinux
  },
  'postman / bruno': {
    category: 'Cloud & Tools',
    level: 'API Testing',
    description: 'Automated endpoint testing, environment variables & request suites',
    color: '#FF6C37',
    icon: SiPostman
  },
  vercel: {
    category: 'Cloud & Tools',
    level: 'Deployment',
    description: 'Edge networks, preview deployments & serverless monitoring',
    color: '#000000',
    icon: SiVercel
  }
}

// Fallback curated skills list
const DEFAULT_SKILLS_LIST: SkillItem[] = [
  // Frontend
  {
    name: 'TypeScript',
    category: 'Frontend',
    level: 'Primary Language',
    description: 'Type-safe scalable application development with strict typing',
    color: '#3178C6',
    icon: SiTypescript
  },
  {
    name: 'Next.js 15',
    category: 'Frontend',
    level: 'Primary Framework',
    description: 'App Router, Server Components, SSR/SSG & Turbopack',
    color: '#000000',
    icon: SiNextdotjs
  },
  {
    name: 'React',
    category: 'Frontend',
    level: 'Advanced',
    description: 'Component architecture, custom hooks & modern state management',
    color: '#61DAFB',
    icon: SiReact
  },
  {
    name: 'Tailwind CSS',
    category: 'Frontend',
    level: 'Daily Driver',
    description: 'Responsive utilities, modern dark/light system & styling',
    color: '#06B6D4',
    icon: SiTailwindcss
  },
  {
    name: 'Framer Motion',
    category: 'Frontend',
    level: 'Interactive UI',
    description: 'Physics-based 3D animations, gesture controls & layout springs',
    color: '#0055FF',
    icon: SiFramer
  },
  // Backend
  {
    name: 'Node.js',
    category: 'Backend',
    level: 'Backend Runtime',
    description: 'Asynchronous event-driven backend architectures and REST services',
    color: '#339933',
    icon: SiNodedotjs
  },
  {
    name: 'Express / Hono',
    category: 'Backend',
    level: 'Microservices',
    description: 'RESTful API routing controllers, middleware & edge performance',
    color: '#E5E7EB',
    icon: SiExpress
  },
  {
    name: 'PostgreSQL',
    category: 'Backend',
    level: 'Relational DB',
    description: 'Complex relational schemas, query indexing & ACID guarantees',
    color: '#4169E1',
    icon: SiPostgresql
  },
  {
    name: 'Supabase',
    category: 'Backend',
    level: 'BaaS & Auth',
    description: 'PostgreSQL database, Row-Level Security, Realtime & Storage',
    color: '#3ECF8E',
    icon: SiSupabase
  },
  {
    name: 'REST APIs',
    category: 'Backend',
    level: 'Architecture',
    description: 'Clean RESTful endpoint conventions, validation & JSON schemas',
    color: '#6366F1',
    icon: SiFastapi
  },
  // AI & ML
  {
    name: 'Python',
    category: 'AI & ML',
    level: 'AI Foundation',
    description: 'Data manipulation, algorithmic modeling, automation & scripting',
    color: '#3776AB',
    icon: SiPython
  },
  {
    name: 'TensorFlow',
    category: 'AI & ML',
    level: 'Deep Learning',
    description: 'CNN, NLP models, transfer learning & Bangkit Academy track',
    color: '#FF6F00',
    icon: SiTensorflow
  },
  {
    name: 'PyTorch',
    category: 'AI & ML',
    level: 'Model Building',
    description: 'Dynamic neural network computation, tensor operations & training',
    color: '#EE4C2C',
    icon: SiPytorch
  },
  {
    name: 'Scikit-Learn',
    category: 'AI & ML',
    level: 'Classical ML',
    description: 'Regression, classification, clustering, and data pipelines',
    color: '#F7931E',
    icon: SiScikitlearn
  },
  {
    name: 'OpenCV',
    category: 'AI & ML',
    level: 'Computer Vision',
    description: 'Image processing, object detection & computer vision filters',
    color: '#5C3EE8',
    icon: SiOpencv
  },
  // Cloud & Tools
  {
    name: 'Google Cloud (GCP)',
    category: 'Cloud & Tools',
    level: 'Cloud Platform',
    description: 'Cloud Run, Compute Engine, Artifact Registry & Vertex AI',
    color: '#4285F4',
    icon: SiGooglecloud
  },
  {
    name: 'Docker',
    category: 'Cloud & Tools',
    level: 'Containers',
    description: 'Containerized reproducible microservices & multi-stage builds',
    color: '#2496ED',
    icon: SiDocker
  },
  {
    name: 'Git & GitHub',
    category: 'Cloud & Tools',
    level: 'Version Control',
    description: 'Git flow, pull requests, branch protection & collaboration',
    color: '#F05032',
    icon: SiGit
  },
  {
    name: 'CI/CD Pipelines',
    category: 'Cloud & Tools',
    level: 'Automation',
    description: 'Automated GitHub Actions workflows, tests & deployment gates',
    color: '#2088FF',
    icon: SiGithubactions
  },
  {
    name: 'Linux',
    category: 'Cloud & Tools',
    level: 'OS & Server',
    description: 'Bash scripting, system administration & Unix server tooling',
    color: '#FCC624',
    icon: SiLinux
  }
]

// Helper to resolve skill attributes dynamically
function resolveSkillMetadata(name: string, id?: number | string): SkillItem {
  const normalizedKey = name.trim().toLowerCase()
  const meta = SKILL_METADATA[normalizedKey]

  if (meta) {
    return {
      id,
      name,
      category: meta.category,
      level: meta.level,
      description: meta.description,
      color: meta.color,
      icon: meta.icon
    }
  }

  // Generic heuristic fallback for custom Supabase entries
  let category: SkillCategory = 'Frontend'
  let color = '#3B82F6'

  if (
    normalizedKey.includes('node') ||
    normalizedKey.includes('sql') ||
    normalizedKey.includes('db') ||
    normalizedKey.includes('api') ||
    normalizedKey.includes('mongo') ||
    normalizedKey.includes('back')
  ) {
    category = 'Backend'
    color = '#10B981'
  } else if (
    normalizedKey.includes('python') ||
    normalizedKey.includes('ai') ||
    normalizedKey.includes('ml') ||
    normalizedKey.includes('tensor') ||
    normalizedKey.includes('learn') ||
    normalizedKey.includes('data')
  ) {
    category = 'AI & ML'
    color = '#F59E0B'
  } else if (
    normalizedKey.includes('cloud') ||
    normalizedKey.includes('docker') ||
    normalizedKey.includes('git') ||
    normalizedKey.includes('linux') ||
    normalizedKey.includes('devops')
  ) {
    category = 'Cloud & Tools'
    color = '#6366F1'
  }

  return {
    id,
    name,
    category,
    level: 'Proficient',
    description: `Engineering capability in ${name} ecosystem`,
    color,
    icon: TokensIcon as unknown as React.ComponentType<{ className?: string }>
  }
}

const CATEGORY_TRANSLATION_MAP: Record<SkillCategory, TranslationKey> = {
  All: 'skills_cat_all',
  Frontend: 'skills_cat_frontend',
  Backend: 'skills_cat_backend',
  'AI & ML': 'skills_cat_aiml',
  'Cloud & Tools': 'skills_cat_cloud'
}

export default function RecentSkill() {
  const { t } = useLanguage()
  const [activeCategory, setActiveCategory] = useState<SkillCategory>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'cards' | 'badges'>('cards')
  const [skills, setSkills] = useState<SkillItem[]>(DEFAULT_SKILLS_LIST)
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null)

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    if (!isSupabaseConfigured()) {
      return
    }

    try {
      const { data, error } = await supabase
        .from('skills')
        .select('id, name')
        .order('id', { ascending: true })

      if (!error && data && data.length > 0) {
        const mapped = data.map((item: { id?: number; name: string }) =>
          resolveSkillMetadata(item.name, item.id)
        )
        setSkills(mapped)
      }
    } catch (err) {
      console.error('Error fetching skills:', err)
    }
  }

  const categories: SkillCategory[] = [
    'All',
    'Frontend',
    'Backend',
    'AI & ML',
    'Cloud & Tools'
  ]

  // Filter skills based on category and search query
  const filteredSkills = useMemo(() => {
    return skills.filter(item => {
      const matchesCategory =
        activeCategory === 'All' || item.category === activeCategory
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.level.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)

      return matchesCategory && matchesSearch
    })
  }, [skills, activeCategory, searchQuery])

  // Count items per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: skills.length }
    skills.forEach(s => {
      counts[s.category] = (counts[s.category] || 0) + 1
    })
    return counts
  }, [skills])

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      className='pb-16 sm:pb-24'
    >
      <div>
        {/* Section Header */}
        <div className='flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <div className='flex items-center gap-2'>
              <span className='h-2 w-2 rounded-full bg-primary animate-pulse' />
              <span className='font-mono text-xs uppercase tracking-widest text-muted-foreground'>
                {t('skills_section_badge')}
              </span>
            </div>
            <h2 className='mt-1.5 font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl'>
              {t('skills_section_title')}
            </h2>
            <p className='mt-1.5 text-xs text-muted-foreground sm:text-sm'>
              {t('skills_section_sub')}
            </p>
          </div>

          {/* View Mode & Count */}
          <div className='flex items-center gap-2 self-start sm:self-end'>
            <div className='flex items-center rounded-xl border border-border/70 bg-card/60 p-1 backdrop-blur-xs shadow-2xs'>
              <button
                type='button'
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  viewMode === 'cards'
                    ? 'bg-muted text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title='Detailed Cards View'
              >
                <ViewGridIcon className='h-3.5 w-3.5' />
                <span className='hidden sm:inline'>{t('skills_view_grid')}</span>
              </button>
              <button
                type='button'
                onClick={() => setViewMode('badges')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  viewMode === 'badges'
                    ? 'bg-muted text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title='Compact Chips View'
              >
                <TokensIcon className='h-3.5 w-3.5' />
                <span className='hidden sm:inline'>{t('skills_view_chips')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          {/* Category Tabs */}
          <div className='flex flex-wrap gap-1 rounded-xl border border-border/70 bg-card/60 p-1 backdrop-blur-xs shadow-2xs'>
            {categories.map(cat => {
              const count = categoryCounts[cat] || 0
              const isActive = activeCategory === cat
              const labelKey = CATEGORY_TRANSLATION_MAP[cat]
              const label = labelKey ? t(labelKey) : cat

              return (
                <button
                  key={cat}
                  type='button'
                  onClick={() => setActiveCategory(cat)}
                  className={`relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'text-foreground font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId='activeSkillCategory'
                      className='absolute inset-0 rounded-lg bg-muted shadow-xs'
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    />
                  )}
                  <span className='relative z-10'>{label}</span>
                  <span
                    className={`relative z-10 rounded-full px-1.5 py-0.2 text-[0.65rem] font-mono ${
                      isActive
                        ? 'bg-background/80 text-foreground font-bold'
                        : 'bg-muted/60 text-muted-foreground'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Quick Search */}
          <div className='relative min-w-[200px] sm:w-56'>
            <MagnifyingGlassIcon className='pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground' />
            <input
              type='text'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('skills_search_placeholder')}
              className='w-full rounded-xl border border-border/70 bg-card/60 py-1.5 pl-8 pr-7 text-xs text-foreground placeholder:text-muted-foreground/70 shadow-2xs backdrop-blur-xs transition-colors focus:border-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/20'
            />
            {searchQuery && (
              <button
                type='button'
                onClick={() => setSearchQuery('')}
                className='absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground'
              >
                <Cross2Icon className='h-3 w-3' />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Display Area */}
        {filteredSkills.length === 0 ? (
          <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 py-12 text-center'>
            <TokensIcon className='mb-2 h-8 w-8 text-muted-foreground/60' />
            <p className='text-sm font-medium text-foreground'>{t('skills_no_match')}</p>
            <p className='mt-1 text-xs text-muted-foreground'>
              {t('skills_no_match_sub')}
            </p>
            <button
              type='button'
              onClick={() => {
                setActiveCategory('All')
                setSearchQuery('')
              }}
              className='mt-4 rounded-lg border border-border/70 bg-muted/60 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted'
            >
              {t('skills_reset_filters')}
            </button>
          </div>
        ) : viewMode === 'cards' ? (
          /* Cards Grid Mode */
          <motion.div layout className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <AnimatePresence mode='popLayout'>
              {filteredSkills.map((skill, index) => {
                const IconComponent = skill.icon
                const isHovered = hoveredSkill === skill.name

                return (
                  <motion.div
                    key={skill.name}
                    layout
                    initial={{ opacity: 0, scale: 0.96, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25, delay: Math.min(index * 0.025, 0.2) }}
                    onMouseEnter={() => setHoveredSkill(skill.name)}
                    onMouseLeave={() => setHoveredSkill(null)}
                    whileHover={{ y: -3 }}
                    className='group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-4 shadow-2xs backdrop-blur-xs transition-all duration-300 hover:border-foreground/30 hover:bg-card hover:shadow-md'
                  >
                    {/* Brand Glow Effect on hover */}
                    <div
                      className='pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl transition-opacity duration-500'
                      style={{
                        backgroundColor: skill.color,
                        opacity: isHovered ? 0.12 : 0.02
                      }}
                    />

                    {/* Top Row: Icon + Names + Level Tag */}
                    <div className='flex items-start gap-3.5'>
                      <div
                        className='relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-background/90 p-2.5 shadow-2xs transition-transform duration-300 group-hover:scale-105'
                        style={{
                          boxShadow: isHovered ? `0 0 16px ${skill.color}25` : undefined
                        }}
                      >
                        <IconComponent
                          className='h-6 w-6 transition-transform duration-300 group-hover:scale-110'
                        />
                      </div>

                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center justify-between gap-2'>
                          <h3 className='font-serif text-sm font-bold text-foreground transition-colors group-hover:text-primary'>
                            {skill.name}
                          </h3>
                          <span className='shrink-0 rounded-md border border-border/60 bg-muted/60 px-2 py-0.5 text-[0.65rem] font-mono font-medium text-muted-foreground'>
                            {skill.level}
                          </span>
                        </div>

                        <p className='mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2'>
                          {skill.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Tag & Meta */}
                    <div className='mt-3 flex items-center justify-between border-t border-border/50 pt-2.5 text-[0.7rem] text-muted-foreground'>
                      <span className='font-mono text-[0.68rem] text-muted-foreground/80'>
                        {skill.category}
                      </span>
                      <span className='flex items-center gap-1.5 font-medium text-foreground/80 group-hover:text-foreground'>
                        <span
                          className='h-1.5 w-1.5 rounded-full'
                          style={{ backgroundColor: skill.color || 'currentColor' }}
                        />
                        {t('skills_verified_stack')}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Compact Badges / Chips Mode */
          <motion.div layout className='flex flex-wrap gap-2.5'>
            <AnimatePresence mode='popLayout'>
              {filteredSkills.map((skill, index) => {
                const IconComponent = skill.icon
                const isHovered = hoveredSkill === skill.name

                return (
                  <motion.div
                    key={skill.name}
                    layout
                    initial={{ opacity: 0, scale: 0.85, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.15) }}
                    onMouseEnter={() => setHoveredSkill(skill.name)}
                    onMouseLeave={() => setHoveredSkill(null)}
                    whileHover={{
                      scale: 1.05,
                      y: -2
                    }}
                    whileTap={{ scale: 0.96 }}
                    className='group relative flex cursor-default items-center gap-2 overflow-hidden rounded-xl border border-border/70 bg-card/80 px-3.5 py-2 text-xs font-medium text-foreground shadow-2xs backdrop-blur-xs transition-all duration-200 hover:border-foreground/30 hover:bg-card hover:shadow-md'
                  >
                    {/* Specular brand sheen */}
                    <div
                      className='pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100'
                      style={{
                        background: `radial-gradient(circle at center, ${skill.color}15, transparent 70%)`
                      }}
                    />

                    <div className='relative z-10 flex items-center gap-2'>
                      <IconComponent className='h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110' />
                      <span className='font-medium'>{skill.name}</span>
                      <span className='rounded-sm bg-muted/60 px-1.5 py-0.2 font-mono text-[0.62rem] text-muted-foreground'>
                        {skill.category}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Bottom Footer Note */}
        <div className='mt-8 flex flex-col items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4 sm:flex-row sm:px-5'>
          <div className='flex items-center gap-3 text-xs text-muted-foreground'>
            <span className='flex h-2 w-2 rounded-full bg-emerald-500' />
            <span>
              {t('skills_footer_note')}
            </span>
          </div>

          <span className='font-mono text-[0.7rem] text-muted-foreground'>
            {skills.length} {t('skills_count_suffix')}
          </span>
        </div>
      </div>
    </motion.section>
  )
}
