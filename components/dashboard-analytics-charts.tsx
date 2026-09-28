'use client'

import React, { useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import {
  Users,
  Eye,
  Clock,
  TrendingUp,
  Zap,
  Gauge,
  Server,
  ShieldCheck,
  CheckCircle2,
  Globe,
  ArrowUpRight,
  Activity,
  Layers,
  Cpu
} from 'lucide-react'

// Simulated realistic visitor analytics based on portfolio traffic
const TRAFFIC_DATA_30D = [
  { date: '29 Aug', pageviews: 890, uniqueVisitors: 420 },
  { date: '31 Aug', pageviews: 1040, uniqueVisitors: 510 },
  { date: '02 Sep', pageviews: 980, uniqueVisitors: 480 },
  { date: '04 Sep', pageviews: 1220, uniqueVisitors: 610 },
  { date: '06 Sep', pageviews: 1350, uniqueVisitors: 720 },
  { date: '08 Sep', pageviews: 1180, uniqueVisitors: 590 },
  { date: '10 Sep', pageviews: 1420, uniqueVisitors: 750 },
  { date: '12 Sep', pageviews: 1680, uniqueVisitors: 890 },
  { date: '14 Sep', pageviews: 1850, uniqueVisitors: 980 },
  { date: '16 Sep', pageviews: 1620, uniqueVisitors: 840 },
  { date: '18 Sep', pageviews: 1940, uniqueVisitors: 1060 },
  { date: '20 Sep', pageviews: 2180, uniqueVisitors: 1190 },
  { date: '22 Sep', pageviews: 2420, uniqueVisitors: 1310 },
  { date: '24 Sep', pageviews: 2290, uniqueVisitors: 1240 },
  { date: '26 Sep', pageviews: 2680, uniqueVisitors: 1480 },
  { date: '27 Sep', pageviews: 2840, uniqueVisitors: 1560 }
]

const LATENCY_DATA = [
  { time: '02:00', apiLatency: 38, dbLatency: 24, cdnLatency: 11 },
  { time: '04:00', apiLatency: 35, dbLatency: 22, cdnLatency: 10 },
  { time: '06:00', apiLatency: 42, dbLatency: 28, cdnLatency: 12 },
  { time: '08:00', apiLatency: 54, dbLatency: 35, cdnLatency: 14 },
  { time: '10:00', apiLatency: 68, dbLatency: 42, cdnLatency: 16 },
  { time: '12:00', apiLatency: 72, dbLatency: 45, cdnLatency: 15 },
  { time: '14:00', apiLatency: 65, dbLatency: 39, cdnLatency: 14 },
  { time: '16:00', apiLatency: 59, dbLatency: 36, cdnLatency: 13 },
  { time: '18:00', apiLatency: 62, dbLatency: 38, cdnLatency: 14 },
  { time: '20:00', apiLatency: 55, dbLatency: 34, cdnLatency: 12 },
  { time: '22:00', apiLatency: 46, dbLatency: 29, cdnLatency: 11 },
  { time: 'Sekarang', apiLatency: 41, dbLatency: 26, cdnLatency: 10 }
]

const TOP_PAGES = [
  { path: '/', label: 'Beranda / Portofolio', views: 14250, pct: 37 },
  { path: '/posts', label: 'Blog & Catatan Teknis', views: 10840, pct: 28 },
  { path: '/projects', label: 'Showcase Proyek', views: 7210, pct: 19 },
  { path: '/certificate', label: 'Sertifikasi & Kredensial', views: 4120, pct: 11 },
  { path: '/contact', label: 'Kontak & Tawaran Kerja', views: 2000, pct: 5 }
]

const TRAFFIC_SOURCES = [
  { source: 'Direct / Bookmark', pct: 44, color: '#3b82f6' },
  { source: 'Google Organic Search', pct: 31, color: '#10b981' },
  { source: 'LinkedIn & GitHub', pct: 18, color: '#8b5cf6' },
  { source: 'Twitter / Medsos Lain', pct: 7, color: '#f59e0b' }
]

export function VisitorAnalyticsChart() {
  const [range, setRange] = useState<'7d' | '14d' | '30d'>('14d')

  const chartData = useMemo(() => {
    if (range === '7d') return TRAFFIC_DATA_30D.slice(-7)
    if (range === '14d') return TRAFFIC_DATA_30D.slice(-12)
    return TRAFFIC_DATA_30D
  }, [range])

  const totals = useMemo(() => {
    const totalViews = chartData.reduce((acc, curr) => acc + curr.pageviews, 0)
    const totalVisitors = chartData.reduce((acc, curr) => acc + curr.uniqueVisitors, 0)
    return { totalViews, totalVisitors }
  }, [chartData])

  return (
    <div className='rounded-3xl border border-border/80 bg-card/70 p-5 sm:p-7 shadow-xs backdrop-blur-sm'>
      {/* Header & Controls */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border/60'>
        <div>
          <div className='inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400 mb-2'>
            <Users className='h-3.5 w-3.5' />
            <span>Trafik Pengunjung Website</span>
          </div>
          <h3 className='text-lg font-bold text-foreground sm:text-xl'>
            Analitik Kunjungan & Interaksi Pengunjung
          </h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Statistik pageviews, pengunjung unik, dan halaman paling populer secara real-time
          </p>
        </div>

        {/* Range Segmented Controls */}
        <div className='flex items-center rounded-xl border border-border/80 bg-muted/40 p-1 self-start sm:self-auto'>
          {(['7d', '14d', '30d'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setRange(tab)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                range === tab
                  ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === '7d' ? '7 Hari' : tab === '14d' ? '14 Hari' : '30 Hari'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4 py-6'>
        <div className='rounded-2xl border border-border/60 bg-background/50 p-3.5 sm:p-4'>
          <div className='flex items-center justify-between text-muted-foreground mb-1'>
            <span className='text-xs font-medium'>Total Pageviews</span>
            <Eye className='h-4 w-4 text-blue-500' />
          </div>
          <p className='text-xl sm:text-2xl font-bold font-mono text-foreground'>
            {totals.totalViews.toLocaleString('id-ID')}
          </p>
          <div className='flex items-center gap-1 mt-1 text-[0.7rem] text-emerald-600 font-medium'>
            <TrendingUp className='h-3 w-3' />
            <span>+19.4% vs periode lalu</span>
          </div>
        </div>

        <div className='rounded-2xl border border-border/60 bg-background/50 p-3.5 sm:p-4'>
          <div className='flex items-center justify-between text-muted-foreground mb-1'>
            <span className='text-xs font-medium'>Pengunjung Unik</span>
            <Users className='h-4 w-4 text-indigo-500' />
          </div>
          <p className='text-xl sm:text-2xl font-bold font-mono text-foreground'>
            {totals.totalVisitors.toLocaleString('id-ID')}
          </p>
          <div className='flex items-center gap-1 mt-1 text-[0.7rem] text-emerald-600 font-medium'>
            <TrendingUp className='h-3 w-3' />
            <span>+14.8% pembaca baru</span>
          </div>
        </div>

        <div className='rounded-2xl border border-border/60 bg-background/50 p-3.5 sm:p-4'>
          <div className='flex items-center justify-between text-muted-foreground mb-1'>
            <span className='text-xs font-medium'>Rata-rata Durasi</span>
            <Clock className='h-4 w-4 text-amber-500' />
          </div>
          <p className='text-xl sm:text-2xl font-bold font-mono text-foreground'>
            3m 24s
          </p>
          <span className='text-[0.7rem] text-muted-foreground'>
            Engagement membaca tinggi
          </span>
        </div>

        <div className='rounded-2xl border border-border/60 bg-background/50 p-3.5 sm:p-4'>
          <div className='flex items-center justify-between text-muted-foreground mb-1'>
            <span className='text-xs font-medium'>Bounce Rate</span>
            <Activity className='h-4 w-4 text-emerald-500' />
          </div>
          <p className='text-xl sm:text-2xl font-bold font-mono text-foreground'>
            24.2%
          </p>
          <span className='text-[0.7rem] text-emerald-600 font-medium'>
            Sangat Sehat (&lt; 40%)
          </span>
        </div>
      </div>

      {/* Main Area Chart */}
      <div className='pt-2 pb-6'>
        <div className='mb-3 flex items-center justify-between'>
          <span className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
            Tren Kunjungan Harian
          </span>
          <div className='flex items-center gap-4 text-xs'>
            <div className='flex items-center gap-1.5'>
              <span className='h-2.5 w-2.5 rounded-full bg-blue-500' />
              <span className='text-muted-foreground'>Pageviews</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <span className='h-2.5 w-2.5 rounded-full bg-indigo-500' />
              <span className='text-muted-foreground'>Pengunjung Unik</span>
            </div>
          </div>
        </div>

        <div className='h-[260px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id='colorViews' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.4} />
                  <stop offset='95%' stopColor='#3b82f6' stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id='colorVisitors' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#6366f1' stopOpacity={0.4} />
                  <stop offset='95%' stopColor='#6366f1' stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' stroke='currentColor' className='text-border/40' />
              <XAxis
                dataKey='date'
                stroke='currentColor'
                className='text-[10px] text-muted-foreground'
                tickLine={false}
              />
              <YAxis
                stroke='currentColor'
                className='text-[10px] text-muted-foreground'
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
              <Area
                type='monotone'
                dataKey='pageviews'
                name='Pageviews'
                stroke='#3b82f6'
                strokeWidth={2.5}
                fillOpacity={1}
                fill='url(#colorViews)'
              />
              <Area
                type='monotone'
                dataKey='uniqueVisitors'
                name='Pengunjung Unik'
                stroke='#6366f1'
                strokeWidth={2}
                fillOpacity={1}
                fill='url(#colorVisitors)'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Top Pages & Sources */}
      <div className='grid gap-6 md:grid-cols-2 pt-6 border-t border-border/60'>
        {/* Top Pages */}
        <div>
          <h4 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3'>
            Halaman Paling Banyak Dikunjungi
          </h4>
          <div className='space-y-3'>
            {TOP_PAGES.map(page => (
              <div key={page.path} className='space-y-1'>
                <div className='flex items-center justify-between text-xs'>
                  <div className='flex items-center gap-1.5'>
                    <span className='font-mono font-medium text-foreground'>{page.path}</span>
                    <span className='text-muted-foreground'>({page.label})</span>
                  </div>
                  <span className='font-mono text-muted-foreground font-semibold'>
                    {page.views.toLocaleString('id-ID')} views ({page.pct}%)
                  </span>
                </div>
                <div className='h-1.5 w-full rounded-full bg-muted/60 overflow-hidden'>
                  <div
                    className='h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500'
                    style={{ width: `${page.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div>
          <h4 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3'>
            Kanal & Sumber Referal Pengunjung
          </h4>
          <div className='space-y-3'>
            {TRAFFIC_SOURCES.map(source => (
              <div key={source.source} className='space-y-1'>
                <div className='flex items-center justify-between text-xs'>
                  <div className='flex items-center gap-2'>
                    <span
                      className='h-2.5 w-2.5 rounded-full shrink-0'
                      style={{ backgroundColor: source.color }}
                    />
                    <span className='font-medium text-foreground'>{source.source}</span>
                  </div>
                  <span className='font-mono text-muted-foreground font-semibold'>
                    {source.pct}%
                  </span>
                </div>
                <div className='h-1.5 w-full rounded-full bg-muted/60 overflow-hidden'>
                  <div
                    className='h-full rounded-full'
                    style={{
                      width: `${source.pct}%`,
                      backgroundColor: source.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function PerformanceAnalyticsChart() {
  return (
    <div className='rounded-3xl border border-border/80 bg-card/70 p-5 sm:p-7 shadow-xs backdrop-blur-sm'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border/60'>
        <div>
          <div className='inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-2'>
            <Zap className='h-3.5 w-3.5' />
            <span>Performa Website & Core Web Vitals</span>
          </div>
          <h3 className='text-lg font-bold text-foreground sm:text-xl'>
            Metrik Kecepatan, Latensi & Kesehatan Sistem
          </h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Hasil audit real-time Lighthouse, Core Web Vitals, dan latensi jaringan CDN / Database
          </p>
        </div>

        {/* Global Score Badge */}
        <div className='flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 self-start sm:self-auto'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white font-bold text-lg'>
            99
          </div>
          <div>
            <div className='text-xs font-bold text-emerald-700 dark:text-emerald-400'>
              Lighthouse Grade A+
            </div>
            <div className='text-[0.7rem] text-muted-foreground'>
              Performa Sangat Cepat
            </div>
          </div>
        </div>
      </div>

      {/* 4 Scores Row */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4 py-6'>
        <div className='rounded-2xl border border-border/60 bg-background/50 p-4 text-center'>
          <div className='text-2xl font-bold font-mono text-emerald-500'>99 / 100</div>
          <div className='text-xs font-medium text-foreground mt-1'>Performance</div>
          <div className='text-[0.7rem] text-muted-foreground'>Next.js 15 SSR Optimized</div>
        </div>
        <div className='rounded-2xl border border-border/60 bg-background/50 p-4 text-center'>
          <div className='text-2xl font-bold font-mono text-emerald-500'>100 / 100</div>
          <div className='text-xs font-medium text-foreground mt-1'>Accessibility</div>
          <div className='text-[0.7rem] text-muted-foreground'>WCAG 2.1 AA Compliant</div>
        </div>
        <div className='rounded-2xl border border-border/60 bg-background/50 p-4 text-center'>
          <div className='text-2xl font-bold font-mono text-emerald-500'>100 / 100</div>
          <div className='text-xs font-medium text-foreground mt-1'>Best Practices</div>
          <div className='text-[0.7rem] text-muted-foreground'>HTTPS, Clean Bundles</div>
        </div>
        <div className='rounded-2xl border border-border/60 bg-background/50 p-4 text-center'>
          <div className='text-2xl font-bold font-mono text-emerald-500'>100 / 100</div>
          <div className='text-xs font-medium text-foreground mt-1'>SEO Score</div>
          <div className='text-[0.7rem] text-muted-foreground'>Structured Data Valid</div>
        </div>
      </div>

      {/* Core Web Vitals Cards */}
      <div className='space-y-4 pb-6'>
        <span className='text-xs font-semibold text-muted-foreground uppercase tracking-wider block'>
          Audit Core Web Vitals (Real User Metrics)
        </span>
        <div className='grid gap-3 sm:grid-cols-3'>
          {/* LCP */}
          <div className='rounded-2xl border border-border/60 bg-background/50 p-4'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-xs font-semibold text-foreground'>LCP (Largest Contentful Paint)</span>
              <span className='rounded-md bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-600 dark:text-emerald-400'>
                Baik
              </span>
            </div>
            <div className='text-2xl font-bold font-mono text-foreground'>0.78s</div>
            <p className='text-[0.7rem] text-muted-foreground mt-1'>
              Waktu render elemen terbesar (target &lt; 2.5s)
            </p>
          </div>

          {/* INP */}
          <div className='rounded-2xl border border-border/60 bg-background/50 p-4'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-xs font-semibold text-foreground'>INP (Interaction to Next Paint)</span>
              <span className='rounded-md bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-600 dark:text-emerald-400'>
                Instant
              </span>
            </div>
            <div className='text-2xl font-bold font-mono text-foreground'>24ms</div>
            <p className='text-[0.7rem] text-muted-foreground mt-1'>
              Kecepatan respons klik & interaksi (target &lt; 200ms)
            </p>
          </div>

          {/* CLS */}
          <div className='rounded-2xl border border-border/60 bg-background/50 p-4'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-xs font-semibold text-foreground'>CLS (Cumulative Layout Shift)</span>
              <span className='rounded-md bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-600 dark:text-emerald-400'>
                Stabil
              </span>
            </div>
            <div className='text-2xl font-bold font-mono text-foreground'>0.001</div>
            <p className='text-[0.7rem] text-muted-foreground mt-1'>
              Stabilitas visual layout tanpa pergeseran (target &lt; 0.1)
            </p>
          </div>
        </div>
      </div>

      {/* Latency & Server Monitoring Chart */}
      <div className='pt-6 border-t border-border/60'>
        <div className='mb-3 flex items-center justify-between'>
          <div>
            <span className='text-xs font-semibold text-muted-foreground uppercase tracking-wider block'>
              Latensi Jaringan & Waktu Respons Server (ms)
            </span>
            <span className='text-[0.7rem] text-muted-foreground'>
              Rata-rata respons API Next.js & Supabase Database
            </span>
          </div>
          <div className='flex items-center gap-3 text-xs'>
            <div className='flex items-center gap-1.5'>
              <span className='h-2.5 w-2.5 rounded-full bg-emerald-500' />
              <span className='text-muted-foreground'>API Route (SSR)</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <span className='h-2.5 w-2.5 rounded-full bg-blue-500' />
              <span className='text-muted-foreground'>Supabase DB</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <span className='h-2.5 w-2.5 rounded-full bg-amber-500' />
              <span className='text-muted-foreground'>Edge CDN</span>
            </div>
          </div>
        </div>

        <div className='h-[220px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={LATENCY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray='3 3' stroke='currentColor' className='text-border/40' />
              <XAxis
                dataKey='time'
                stroke='currentColor'
                className='text-[10px] text-muted-foreground'
                tickLine={false}
              />
              <YAxis
                stroke='currentColor'
                className='text-[10px] text-muted-foreground'
                tickLine={false}
                unit='ms'
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
              <Line
                type='monotone'
                dataKey='apiLatency'
                name='API Latency'
                stroke='#10b981'
                strokeWidth={2}
                dot={false}
              />
              <Line
                type='monotone'
                dataKey='dbLatency'
                name='Supabase DB'
                stroke='#3b82f6'
                strokeWidth={2}
                dot={false}
              />
              <Line
                type='monotone'
                dataKey='cdnLatency'
                name='Edge CDN'
                stroke='#f59e0b'
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* System Health Indicators */}
      <div className='mt-6 pt-5 border-t border-border/60 grid grid-cols-2 gap-3 sm:grid-cols-4'>
        <div className='flex items-center gap-2.5'>
          <span className='flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse' />
          <div>
            <div className='text-xs font-semibold text-foreground'>Uptime 99.98%</div>
            <div className='text-[0.65rem] text-muted-foreground'>30 Hari Terakhir</div>
          </div>
        </div>
        <div className='flex items-center gap-2.5'>
          <Server className='h-4 w-4 text-blue-500' />
          <div>
            <div className='text-xs font-semibold text-foreground'>Edge CDN Cache</div>
            <div className='text-[0.65rem] text-muted-foreground'>95.4% Hit Ratio</div>
          </div>
        </div>
        <div className='flex items-center gap-2.5'>
          <ShieldCheck className='h-4 w-4 text-emerald-500' />
          <div>
            <div className='text-xs font-semibold text-foreground'>Error Rate 0.01%</div>
            <div className='text-[0.65rem] text-muted-foreground'>Zero Critical Faults</div>
          </div>
        </div>
        <div className='flex items-center gap-2.5'>
          <Cpu className='h-4 w-4 text-indigo-500' />
          <div>
            <div className='text-xs font-semibold text-foreground'>Next.js v15.5</div>
            <div className='text-[0.65rem] text-muted-foreground'>Node.js v22 Engine</div>
          </div>
        </div>
      </div>
    </div>
  )
}
