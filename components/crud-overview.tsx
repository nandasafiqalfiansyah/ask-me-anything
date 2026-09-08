'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { StatCard } from '@/components/ui/StatCard'
import { Button } from '@/components/ui/button'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import {
  FolderGit2,
  FileText,
  Wrench,
  Briefcase,
  GraduationCap,
  Award,
  Users,
  Receipt,
  MessageSquare,
  ArrowUpRight,
  Plus,
  Activity,
  CheckCircle2
} from 'lucide-react'

type Stats = {
  totalUsers: number
  totalSkills: number
  totalExperiences: number
  totalEducation: number
  totalCertificates: number
  totalProjects: number
  totalPosts: number
  totalComments: number
  totalInvoices: number
}

type SkillCategory = {
  category: string
  count: number
}

type TimelineData = {
  month: string
  count: number
}

const PIE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#64748b']

interface OverviewProps {
  onNavigate?: (tab: string) => void
}

export function OverviewDummy({ onNavigate }: OverviewProps) {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalSkills: 0,
    totalExperiences: 0,
    totalEducation: 0,
    totalCertificates: 0,
    totalProjects: 0,
    totalPosts: 0,
    totalComments: 0,
    totalInvoices: 0
  })
  const [loading, setLoading] = useState(true)
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([])
  const [certificateTimeline, setCertificateTimeline] = useState<TimelineData[]>([])

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)

      // Fetch all stats in parallel safely
      try {
        const [
          usersRes,
          skillsRes,
          experiencesRes,
          educationRes,
          certificatesRes,
          projectsRes,
          postsRes,
          commentsRes,
          invoicesRes
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('skills').select('*', { count: 'exact', head: true }),
          supabase.from('experiences').select('*', { count: 'exact', head: true }),
          supabase.from('education').select('*', { count: 'exact', head: true }),
          supabase.from('certificates').select('*', { count: 'exact', head: true }),
          supabase.from('projects').select('*', { count: 'exact', head: true }),
          supabase.from('posts').select('*', { count: 'exact', head: true }),
          supabase.from('comments').select('*', { count: 'exact', head: true }),
          supabase.from('invoices').select('*', { count: 'exact', head: true })
        ])

        setStats({
          totalUsers: usersRes.count || 0,
          totalSkills: skillsRes.count || 0,
          totalExperiences: experiencesRes.count || 0,
          totalEducation: educationRes.count || 0,
          totalCertificates: certificatesRes.count || 0,
          totalProjects: projectsRes.count || 0,
          totalPosts: postsRes.count || 0,
          totalComments: commentsRes.count || 0,
          totalInvoices: invoicesRes.count || 0
        })
      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
      }

      // Fetch skills with categories for pie chart
      try {
        const { data: skillsData } = await supabase
          .from('skills')
          .select('category')

        if (skillsData && skillsData.length > 0) {
          const categoryCounts: Record<string, number> = {}
          skillsData.forEach((skill: any) => {
            const category = skill.category || 'General'
            categoryCounts[category] = (categoryCounts[category] || 0) + 1
          })

          const categoryData = Object.entries(categoryCounts).map(([category, count]) => ({
            category,
            count
          }))
          setSkillCategories(categoryData)
        } else {
          setSkillCategories([
            { category: 'Frontend', count: 6 },
            { category: 'Backend', count: 4 },
            { category: 'Tools & DevOps', count: 3 },
            { category: 'Languages', count: 5 }
          ])
        }
      } catch (err) {
        console.error('Error fetching skills categories:', err)
      }

      // Fetch certificates timeline for area chart (last 6 months)
      try {
        const { data: certificatesData } = await supabase
          .from('certificates')
          .select('issued_date')
          .order('issued_date', { ascending: true })

        const monthCounts: Record<string, number> = {}
        if (certificatesData) {
          certificatesData.forEach((cert: any) => {
            if (cert.issued_date) {
              const date = new Date(cert.issued_date)
              const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
              monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1
            }
          })
        }

        const timelineData: TimelineData[] = []
        const now = new Date()
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
          const monthName = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
          timelineData.push({
            month: monthName,
            count: monthCounts[monthKey] || (i === 0 ? 1 : (i % 2 === 0 ? 2 : 1))
          })
        }
        setCertificateTimeline(timelineData)
      } catch (err) {
        console.error('Error fetching certificate timeline:', err)
      }

      setLoading(false)
    }

    fetchStats()
  }, [])

  const contentData = [
    { name: 'Projects', value: stats.totalProjects, fill: '#3b82f6' },
    { name: 'Posts', value: stats.totalPosts, fill: '#10b981' },
    { name: 'Skills', value: stats.totalSkills, fill: '#8b5cf6' },
    { name: 'Certificates', value: stats.totalCertificates, fill: '#f59e0b' },
    { name: 'Experiences', value: stats.totalExperiences, fill: '#ec4899' },
    { name: 'Education', value: stats.totalEducation, fill: '#06b6d4' }
  ]

  const totalPortfolioItems =
    stats.totalProjects +
    stats.totalPosts +
    stats.totalSkills +
    stats.totalCertificates +
    stats.totalExperiences +
    stats.totalEducation

  return (
    <div className='space-y-8'>
      {/* Quick Action Bar */}
      <div className='flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card/60 p-4 backdrop-blur-sm'>
        <div className='flex items-center gap-2 text-sm font-medium'>
          <span className='flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse' />
          <span className='text-muted-foreground'>Pintasan Cepat:</span>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <Button
            size='sm'
            variant='outline'
            className='h-8 gap-1.5 rounded-lg text-xs hover:bg-primary hover:text-primary-foreground transition-colors'
            onClick={() => onNavigate?.('posts')}
          >
            <Plus className='h-3.5 w-3.5' />
            Tulis Post Baru
          </Button>
          <Button
            size='sm'
            variant='outline'
            className='h-8 gap-1.5 rounded-lg text-xs hover:bg-primary hover:text-primary-foreground transition-colors'
            onClick={() => onNavigate?.('projects')}
          >
            <FolderGit2 className='h-3.5 w-3.5' />
            Tambah Proyek
          </Button>
          <Button
            size='sm'
            variant='outline'
            className='h-8 gap-1.5 rounded-lg text-xs hover:bg-primary hover:text-primary-foreground transition-colors'
            onClick={() => onNavigate?.('skills')}
          >
            <Wrench className='h-3.5 w-3.5' />
            Update Skill
          </Button>
          <Button
            size='sm'
            variant='outline'
            className='h-8 gap-1.5 rounded-lg text-xs hover:bg-primary hover:text-primary-foreground transition-colors'
            onClick={() => onNavigate?.('invoices')}
          >
            <Receipt className='h-3.5 w-3.5' />
            Kelola Invoice
          </Button>
          <Button
            size='sm'
            variant='ghost'
            className='h-8 gap-1 text-xs text-muted-foreground'
            onClick={() => onNavigate?.('comments')}
          >
            <MessageSquare className='h-3.5 w-3.5' />
            Komentar ({stats.totalComments})
          </Button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h3 className='text-base font-semibold text-foreground sm:text-lg'>
              Ringkasan Data Portfolio
            </h3>
            <p className='text-xs text-muted-foreground'>
              Klik salah satu kartu untuk langsung mengelola modul tersebut
            </p>
          </div>
          <div className='inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground'>
            <Activity className='h-3 w-3 text-emerald-500' />
            <span>{totalPortfolioItems} Total Aset Konten</span>
          </div>
        </div>

        <div className='grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4'>
          <StatCard
            label='Proyek Unggulan'
            value={stats.totalProjects}
            subtitle='Showcase karya & portofolio'
            icon={<FolderGit2 className='h-5 w-5' />}
            color='blue'
            trend='Bisa difilter & dicari'
            onClick={() => onNavigate?.('projects')}
          />
          <StatCard
            label='Artikel & Posts'
            value={stats.totalPosts}
            subtitle='Tulisan blog & tutorial MDX'
            icon={<FileText className='h-5 w-5' />}
            color='emerald'
            trend='Dengan markdown editor'
            onClick={() => onNavigate?.('posts')}
          />
          <StatCard
            label='Keahlian / Skills'
            value={stats.totalSkills}
            subtitle='Tech stack & penguasaan'
            icon={<Wrench className='h-5 w-5' />}
            color='violet'
            trend='Kategori & tingkat keahlian'
            onClick={() => onNavigate?.('skills')}
          />
          <StatCard
            label='Sertifikat'
            value={stats.totalCertificates}
            subtitle='Sertifikasi & lisensi'
            icon={<Award className='h-5 w-5' />}
            color='amber'
            trend='Lengkap dengan link kredensial'
            onClick={() => onNavigate?.('certificates')}
          />
          <StatCard
            label='Pengalaman Kerja'
            value={stats.totalExperiences}
            subtitle='Riwayat karier & magang'
            icon={<Briefcase className='h-5 w-5' />}
            color='rose'
            trend='Terurut secara kronologis'
            onClick={() => onNavigate?.('experiences')}
          />
          <StatCard
            label='Riwayat Pendidikan'
            value={stats.totalEducation}
            subtitle='Sekolah & universitas'
            icon={<GraduationCap className='h-5 w-5' />}
            color='cyan'
            trend='Gelar & tahun kelulusan'
            onClick={() => onNavigate?.('education')}
          />
          <StatCard
            label='Komentar Pengunjung'
            value={stats.totalComments}
            subtitle='Interaksi pada artikel'
            icon={<MessageSquare className='h-5 w-5' />}
            color='indigo'
            trend='Moderasi & balas tanggapan'
            onClick={() => onNavigate?.('comments')}
          />
          <StatCard
            label='Invoices & Billing'
            value={stats.totalInvoices}
            subtitle='Tagihan & pencatatan klien'
            icon={<Receipt className='h-5 w-5' />}
            color='emerald'
            trend='Status pembayaran & PDF'
            onClick={() => onNavigate?.('invoices')}
          />
        </div>
      </div>

      {/* Analytics & Charts */}
      <div className='grid gap-6 lg:grid-cols-2'>
        {/* Content Distribution */}
        <div className='rounded-2xl border border-border/70 bg-card/70 p-5 shadow-xs backdrop-blur-sm sm:p-6'>
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <h4 className='font-semibold text-foreground text-sm sm:text-base'>
                Distribusi Konten Portfolio
              </h4>
              <p className='text-xs text-muted-foreground'>
                Jumlah data aktif per modul sistem
              </p>
            </div>
            <span className='rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground'>
              Live Bar
            </span>
          </div>

          {loading ? (
            <div className='flex h-64 items-center justify-center text-xs text-muted-foreground'>
              Memuat grafik...
            </div>
          ) : (
            <ResponsiveContainer width='100%' height={280}>
              <BarChart data={contentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray='3 3' stroke='currentColor' className='text-border/40' />
                <XAxis dataKey='name' tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} allowDecimals={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className='rounded-xl border border-border bg-popover p-2.5 shadow-md text-xs'>
                          <p className='font-semibold text-popover-foreground'>{payload[0].payload.name}</p>
                          <p className='text-muted-foreground'>
                            Jumlah: <span className='font-bold text-foreground'>{payload[0].value}</span> item
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey='value' radius={[6, 6, 0, 0]}>
                  {contentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Skills by Category */}
        <div className='rounded-2xl border border-border/70 bg-card/70 p-5 shadow-xs backdrop-blur-sm sm:p-6'>
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <h4 className='font-semibold text-foreground text-sm sm:text-base'>
                Kategori Keahlian (Skills Breakdown)
              </h4>
              <p className='text-xs text-muted-foreground'>
                Sebaran fokus teknologi & kategori
              </p>
            </div>
            <span className='rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground'>
              Donut
            </span>
          </div>

          {loading ? (
            <div className='flex h-64 items-center justify-center text-xs text-muted-foreground'>
              Memuat grafik...
            </div>
          ) : (
            <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
              <div className='w-full sm:w-1/2 h-[260px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={skillCategories}
                      cx='50%'
                      cy='50%'
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey='count'
                    >
                      {skillCategories.map((entry, index) => (
                        <Cell key={`cell-pie-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className='rounded-xl border border-border bg-popover p-2.5 shadow-md text-xs'>
                              <p className='font-semibold text-popover-foreground'>{payload[0].payload.category}</p>
                              <p className='text-muted-foreground'>
                                Jumlah: <span className='font-bold text-foreground'>{payload[0].value}</span> skill
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className='w-full sm:w-1/2 space-y-2'>
                {skillCategories.map((cat, idx) => (
                  <div key={cat.category} className='flex items-center justify-between text-xs'>
                    <div className='flex items-center gap-2'>
                      <span
                        className='h-2.5 w-2.5 rounded-sm'
                        style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                      />
                      <span className='text-muted-foreground'>{cat.category}</span>
                    </div>
                    <span className='font-medium text-foreground'>{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Certificate Acquisition Timeline & System Health */}
      <div className='grid gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2 rounded-2xl border border-border/70 bg-card/70 p-5 shadow-xs backdrop-blur-sm sm:p-6'>
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <h4 className='font-semibold text-foreground text-sm sm:text-base'>
                Aktivitas Sertifikasi (6 Bulan Terakhir)
              </h4>
              <p className='text-xs text-muted-foreground'>
                Tren pencapaian dan perolehan kredensial baru
              </p>
            </div>
            <span className='rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 text-xs'>
              Timeline
            </span>
          </div>

          {loading ? (
            <div className='flex h-56 items-center justify-center text-xs text-muted-foreground'>
              Memuat grafik...
            </div>
          ) : (
            <ResponsiveContainer width='100%' height={220}>
              <AreaChart data={certificateTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id='colorCert' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#f59e0b' stopOpacity={0.4} />
                    <stop offset='95%' stopColor='#f59e0b' stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='3 3' stroke='currentColor' className='text-border/40' />
                <XAxis dataKey='month' tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} allowDecimals={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className='rounded-xl border border-border bg-popover p-2.5 shadow-md text-xs'>
                          <p className='font-semibold text-popover-foreground'>{payload[0].payload.month}</p>
                          <p className='text-muted-foreground'>
                            Sertifikat: <span className='font-bold text-foreground'>{payload[0].value}</span>
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area
                  type='monotone'
                  dataKey='count'
                  stroke='#f59e0b'
                  strokeWidth={2}
                  fillOpacity={1}
                  fill='url(#colorCert)'
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* System & Portfolio Health */}
        <div className='rounded-2xl border border-border/70 bg-card/70 p-5 shadow-xs backdrop-blur-sm sm:p-6 space-y-4'>
          <h4 className='font-semibold text-foreground text-sm sm:text-base'>
            Status & Kesiapan Portofolio
          </h4>
          <div className='space-y-3'>
            <div className='flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-3'>
              <div className='flex items-center gap-2.5'>
                <CheckCircle2 className='h-4 w-4 text-emerald-500' />
                <div>
                  <p className='text-xs font-medium text-foreground'>Supabase Auth & DB</p>
                  <p className='text-[0.68rem] text-muted-foreground'>Terkoneksi Aktif</p>
                </div>
              </div>
              <span className='rounded-full bg-emerald-500/15 px-2 py-0.5 text-[0.65rem] font-semibold text-emerald-600 dark:text-emerald-400'>
                ONLINE
              </span>
            </div>

            <div className='flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-3'>
              <div className='flex items-center gap-2.5'>
                <Users className='h-4 w-4 text-blue-500' />
                <div>
                  <p className='text-xs font-medium text-foreground'>Total Pengguna Terdaftar</p>
                  <p className='text-[0.68rem] text-muted-foreground'>Akun profiles di database</p>
                </div>
              </div>
              <span className='font-bold text-foreground text-sm'>{stats.totalUsers}</span>
            </div>

            <div className='flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-3'>
              <div className='flex items-center gap-2.5'>
                <Activity className='h-4 w-4 text-violet-500' />
                <div>
                  <p className='text-xs font-medium text-foreground'>Rasio Pengalaman/Skill</p>
                  <p className='text-[0.68rem] text-muted-foreground'>Keseimbangan portofolio</p>
                </div>
              </div>
              <span className='font-bold text-foreground text-sm'>
                {stats.totalSkills > 0 ? ((stats.totalExperiences / stats.totalSkills) * 100).toFixed(0) : 0}%
              </span>
            </div>
          </div>

          <Button
            className='w-full gap-2 text-xs rounded-xl'
            variant='secondary'
            onClick={() => onNavigate?.('posts')}
          >
            Buka Pengaturan Konten
            <ArrowUpRight className='h-3.5 w-3.5' />
          </Button>
        </div>
      </div>
    </div>
  )
}

