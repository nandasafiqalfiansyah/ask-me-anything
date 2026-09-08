'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import CrudSkills from '@/components/crud-skills'
import CrudExperiences from '@/components/crud-experiences'
import CrudEducation from '@/components/crud-education'
import CrudUsers from '@/components/crud-users'
import CrudCertificates from '@/components/crud-certificates'
import CrudProjects from '@/components/crud-projects'
import CrudPosts from '@/components/crud-posts'
import CrudComments from '@/components/crud-comments'
import CrudInvoices from '@/components/crud-invoices'
import { OverviewDummy } from '@/components/crud-overview'
import {
  LayoutDashboard,
  Wrench,
  Briefcase,
  GraduationCap,
  Award,
  FolderGit2,
  FileText,
  MessageSquare,
  Users,
  Receipt,
  ExternalLink,
  LogOut,
  ChevronRight,
  ShieldCheck
} from 'lucide-react'

type PageKey =
  | 'overview'
  | 'skills'
  | 'experiences'
  | 'education'
  | 'certificates'
  | 'projects'
  | 'posts'
  | 'comments'
  | 'users'
  | 'invoices'

interface NavItemDef {
  key: PageKey
  label: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  category: 'core' | 'portfolio' | 'content' | 'admin'
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [active, setActive] = useState<PageKey>('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/login')
      else {
        setUser(data.session.user)
        setLoading(false)
      }
    })
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems: NavItemDef[] = useMemo(
    () => [
      {
        key: 'overview',
        label: 'Overview',
        icon: LayoutDashboard,
        title: 'Ringkasan & Metrik Sistem',
        description: 'Statistik lengkap portofolio, metrik analitik, dan pintasan tindakan.',
        category: 'core'
      },
      {
        key: 'projects',
        label: 'Projects',
        icon: FolderGit2,
        title: 'Manajemen Proyek',
        description: 'Kelola showcase karya, link demo, repository GitHub, dan cover proyek.',
        category: 'portfolio'
      },
      {
        key: 'posts',
        label: 'Posts',
        icon: FileText,
        title: 'Artikel & Blog',
        description: 'Tulis dan publikasikan artikel blog berformat Markdown / MDX.',
        category: 'content'
      },
      {
        key: 'skills',
        label: 'Skills',
        icon: Wrench,
        title: 'Keahlian & Teknologi',
        description: 'Kelola daftar skill teknis, bahasa pemrograman, framework, dan tools.',
        category: 'portfolio'
      },
      {
        key: 'certificates',
        label: 'Certificates',
        icon: Award,
        title: 'Sertifikat & Lisensi',
        description: 'Kelola kredensial profesional, tanggal perolehan, dan file sertifikat.',
        category: 'portfolio'
      },
      {
        key: 'experiences',
        label: 'Experiences',
        icon: Briefcase,
        title: 'Pengalaman Karier',
        description: 'Riwayat pekerjaan, peran, deskripsi tugas, dan periode karier profesional.',
        category: 'portfolio'
      },
      {
        key: 'education',
        label: 'Education',
        icon: GraduationCap,
        title: 'Riwayat Pendidikan',
        description: 'Data latar belakang akademis, institusi, jurusan, dan tahun kelulusan.',
        category: 'portfolio'
      },
      {
        key: 'comments',
        label: 'Comments',
        icon: MessageSquare,
        title: 'Komentar Pengunjung',
        description: 'Moderasi dan tinjau tanggapan pembaca pada postingan blog.',
        category: 'content'
      },
      {
        key: 'invoices',
        label: 'Invoices',
        icon: Receipt,
        title: 'Invoice & Pembayaran',
        description: 'Buat tagihan profesional untuk klien, kelola status, dan ekspor invoice.',
        category: 'admin'
      },
      {
        key: 'users',
        label: 'Users',
        icon: Users,
        title: 'Manajemen Pengguna',
        description: 'Daftar pengguna terdaftar dan data akun profiles sistem.',
        category: 'admin'
      }
    ],
    []
  )

  const currentTab = navItems.find(item => item.key === active) || navItems[0]

  if (loading || !user) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <Spinner size='lg' />
          <p className='text-sm text-muted-foreground'>Memuat Dashboard Admin...</p>
        </div>
      </div>
    )
  }

  // Get user initial
  const userEmail = user.email || 'Admin'
  const userInitial = userEmail.charAt(0).toUpperCase()

  return (
    <section className='flex min-h-screen flex-col pb-24 pt-28 sm:pt-32'>
      <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col'>
        {/* Top Header Card */}
        <div className='relative mb-8 overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card/90 via-card/60 to-card/40 p-6 sm:p-8 shadow-xs backdrop-blur-md'>
          <div className='flex flex-col gap-6 md:flex-row md:items-center md:justify-between'>
            {/* User Info & Identity */}
            <div className='flex items-center gap-4'>
              <div className='relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xl shadow-md'>
                {userInitial}
                <span className='absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full ring-2 ring-card bg-emerald-500' />
              </div>
              <div className='space-y-1'>
                <div className='flex flex-wrap items-center gap-2'>
                  <h1 className='text-xl font-bold tracking-tight text-foreground sm:text-2xl'>
                    Dashboard Admin
                  </h1>
                  <span className='inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400'>
                    <ShieldCheck className='h-3.5 w-3.5' />
                    Administrator
                  </span>
                </div>
                <p className='text-xs sm:text-sm text-muted-foreground font-mono'>
                  {userEmail}
                </p>
              </div>
            </div>

            {/* Quick Actions / Link to live website */}
            <div className='flex flex-wrap items-center gap-2.5'>
              <Link href='/' target='_blank' rel='noopener noreferrer'>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-9 gap-1.5 rounded-xl text-xs font-medium'
                >
                  <span>Lihat Web Portofolio</span>
                  <ExternalLink className='h-3.5 w-3.5 text-muted-foreground' />
                </Button>
              </Link>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleLogout}
                className='h-9 gap-1.5 rounded-xl text-xs font-medium text-red-600 hover:bg-red-500/10 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10'
              >
                <LogOut className='h-3.5 w-3.5' />
                <span>Keluar</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Sticky Tab Navigation Bar */}
        <div className='sticky top-20 z-20 mb-8 rounded-2xl border border-border/80 bg-background/85 p-1.5 shadow-sm backdrop-blur-md'>
          <div className='flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 px-0.5'>
            {navItems.map(item => {
              const isActive = active === item.key
              const Icon = item.icon
              return (
                <button
                  key={item.key}
                  onClick={() => setActive(item.key)}
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                      : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Section Context Header */}
        <div className='mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-4'>
          <div className='flex items-center gap-2.5'>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary'>
              <currentTab.icon className='h-5 w-5' />
            </div>
            <div>
              <div className='flex items-center gap-1.5 text-[0.72rem] text-muted-foreground uppercase tracking-wider font-semibold'>
                <span>Dashboard</span>
                <ChevronRight className='h-3 w-3' />
                <span className='text-foreground'>{currentTab.label}</span>
              </div>
              <h2 className='text-lg font-bold text-foreground sm:text-xl'>
                {currentTab.title}
              </h2>
            </div>
          </div>
          <p className='text-xs text-muted-foreground sm:text-right max-w-md'>
            {currentTab.description}
          </p>
        </div>

        {/* Content Container */}
        <div className='w-full'>
          {active === 'overview' && <OverviewDummy onNavigate={(tab: string) => setActive(tab as PageKey)} />}

          {active === 'projects' && (
            <div className='rounded-3xl border border-border/80 bg-card/60 p-4 sm:p-6 lg:p-8 shadow-xs backdrop-blur-sm'>
              <CrudProjects />
            </div>
          )}

          {active === 'posts' && (
            <div className='rounded-3xl border border-border/80 bg-card/60 p-4 sm:p-6 lg:p-8 shadow-xs backdrop-blur-sm'>
              <CrudPosts />
            </div>
          )}

          {active === 'skills' && (
            <div className='rounded-3xl border border-border/80 bg-card/60 p-4 sm:p-6 lg:p-8 shadow-xs backdrop-blur-sm'>
              <CrudSkills />
            </div>
          )}

          {active === 'certificates' && (
            <div className='rounded-3xl border border-border/80 bg-card/60 p-4 sm:p-6 lg:p-8 shadow-xs backdrop-blur-sm'>
              <CrudCertificates />
            </div>
          )}

          {active === 'experiences' && (
            <div className='rounded-3xl border border-border/80 bg-card/60 p-4 sm:p-6 lg:p-8 shadow-xs backdrop-blur-sm'>
              <CrudExperiences />
            </div>
          )}

          {active === 'education' && (
            <div className='rounded-3xl border border-border/80 bg-card/60 p-4 sm:p-6 lg:p-8 shadow-xs backdrop-blur-sm'>
              <CrudEducation />
            </div>
          )}

          {active === 'comments' && (
            <div className='rounded-3xl border border-border/80 bg-card/60 p-4 sm:p-6 lg:p-8 shadow-xs backdrop-blur-sm'>
              <CrudComments />
            </div>
          )}

          {active === 'users' && (
            <div className='rounded-3xl border border-border/80 bg-card/60 p-4 sm:p-6 lg:p-8 shadow-xs backdrop-blur-sm'>
              <CrudUsers />
            </div>
          )}

          {active === 'invoices' && (
            <div className='rounded-3xl border border-border/80 bg-card/60 p-4 sm:p-6 lg:p-8 shadow-xs backdrop-blur-sm'>
              <CrudInvoices />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
