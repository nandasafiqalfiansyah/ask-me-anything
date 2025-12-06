'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { StatCard } from '@/components/ui/StatCard'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'

type Stats = {
  totalUsers: number
  totalSkills: number
  totalExperiences: number
  totalEducation: number
  totalCertificates: number
}

type SkillCategory = {
  category: string
  count: number
}

type TimelineData = {
  month: string
  count: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function OverviewDummy() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalSkills: 0,
    totalExperiences: 0,
    totalEducation: 0,
    totalCertificates: 0
  })
  const [loading, setLoading] = useState(true)
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([])
  const [certificateTimeline, setCertificateTimeline] = useState<TimelineData[]>([])

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)

      // Fetch all stats in parallel
      const [usersRes, skillsRes, experiencesRes, educationRes, certificatesRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('skills').select('*', { count: 'exact', head: true }),
        supabase.from('experiences').select('*', { count: 'exact', head: true }),
        supabase.from('education').select('*', { count: 'exact', head: true }),
        supabase.from('certificates').select('*', { count: 'exact', head: true })
      ])

      setStats({
        totalUsers: usersRes.count || 0,
        totalSkills: skillsRes.count || 0,
        totalExperiences: experiencesRes.count || 0,
        totalEducation: educationRes.count || 0,
        totalCertificates: certificatesRes.count || 0
      })

      // Fetch skills with categories for pie chart
      const { data: skillsData } = await supabase
        .from('skills')
        .select('category')

      if (skillsData) {
        const categoryCounts: Record<string, number> = {}
        skillsData.forEach((skill: any) => {
          const category = skill.category || 'Uncategorized'
          categoryCounts[category] = (categoryCounts[category] || 0) + 1
        })
        
        const categoryData = Object.entries(categoryCounts).map(([category, count]) => ({
          category,
          count
        }))
        setSkillCategories(categoryData)
      }

      // Fetch certificates timeline for line chart (last 6 months)
      const { data: certificatesData } = await supabase
        .from('certificates')
        .select('issued_date')
        .order('issued_date', { ascending: true })

      if (certificatesData) {
        const monthCounts: Record<string, number> = {}
        certificatesData.forEach((cert: any) => {
          const date = new Date(cert.issued_date)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1
        })

        // Get last 6 months
        const timelineData: TimelineData[] = []
        const now = new Date()
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
          const monthName = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          timelineData.push({
            month: monthName,
            count: monthCounts[monthKey] || 0
          })
        }
        setCertificateTimeline(timelineData)
      }

      setLoading(false)
    }

    fetchStats()
  }, [])

  const contentData = [
    { name: 'Skills', value: stats.totalSkills },
    { name: 'Experiences', value: stats.totalExperiences },
    { name: 'Education', value: stats.totalEducation },
    { name: 'Certificates', value: stats.totalCertificates }
  ]

  return (
    <div className='space-y-6'>
      {/* Stats Cards */}
      <div className='rounded-2xl border p-6'>
        <h3 className='mb-4 text-lg font-semibold'>Dashboard Statistics</h3>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-5'>
          <StatCard label='Total Users' value={String(stats.totalUsers)} />
          <StatCard label='Total Skills' value={String(stats.totalSkills)} />
          <StatCard label='Experiences' value={String(stats.totalExperiences)} />
          <StatCard label='Education' value={String(stats.totalEducation)} />
          <StatCard label='Certificates' value={String(stats.totalCertificates)} />
        </div>
      </div>

      {/* Charts Section */}
      <div className='grid gap-6 lg:grid-cols-2'>
        {/* Content Distribution Bar Chart */}
        <div className='rounded-2xl border p-6'>
          <h3 className='mb-4 text-lg font-semibold'>Content Distribution</h3>
          {loading ? (
            <div className='flex h-64 items-center justify-center text-sm text-muted-foreground'>
              Loading chart...
            </div>
          ) : (
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={contentData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey='value' fill='#8884d8' />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Skills by Category Pie Chart */}
        <div className='rounded-2xl border p-6'>
          <h3 className='mb-4 text-lg font-semibold'>Skills by Category</h3>
          {loading ? (
            <div className='flex h-64 items-center justify-center text-sm text-muted-foreground'>
              Loading chart...
            </div>
          ) : skillCategories.length > 0 ? (
            <ResponsiveContainer width='100%' height={300}>
              <PieChart>
                <Pie
                  data={skillCategories}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={(entry: any) =>
                    `${entry.category}: ${(entry.percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill='#8884d8'
                  dataKey='count'
                >
                  {skillCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className='flex h-64 items-center justify-center text-sm text-muted-foreground'>
              No skill data available
            </div>
          )}
        </div>
      </div>

      {/* Certificate Timeline */}
      <div className='rounded-2xl border p-6'>
        <h3 className='mb-4 text-lg font-semibold'>Certificate Acquisition Timeline (Last 6 Months)</h3>
        {loading ? (
          <div className='flex h-64 items-center justify-center text-sm text-muted-foreground'>
            Loading chart...
          </div>
        ) : (
          <ResponsiveContainer width='100%' height={300}>
            <LineChart data={certificateTimeline}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='month' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type='monotone' dataKey='count' stroke='#8884d8' activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Quick Insights */}
      <div className='rounded-2xl border p-6'>
        <h3 className='mb-4 text-lg font-semibold'>Quick Insights</h3>
        <div className='grid gap-3 sm:grid-cols-2'>
          <div className='rounded-lg border p-4'>
            <div className='text-2xl font-bold text-primary'>
              {stats.totalExperiences + stats.totalEducation + stats.totalCertificates}
            </div>
            <p className='text-sm text-muted-foreground'>Total Portfolio Items</p>
          </div>
          <div className='rounded-lg border p-4'>
            <div className='text-2xl font-bold text-primary'>
              {stats.totalSkills > 0 ? (stats.totalExperiences / stats.totalSkills * 100).toFixed(0) : 0}%
            </div>
            <p className='text-sm text-muted-foreground'>Experience to Skills Ratio</p>
          </div>
        </div>
      </div>
    </div>
  )
}
