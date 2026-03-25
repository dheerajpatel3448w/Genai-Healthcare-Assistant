'use client'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface DashboardStats {
  upcomingAppointments: number
  pendingReports: number
  completedAnalysis: number
}

export default function PatientDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    upcomingAppointments: 0,
    pendingReports: 0,
    completedAnalysis: 0,
  })

  useEffect(() => {
    // TODO: Fetch actual stats from API
    setStats({
      upcomingAppointments: 2,
      pendingReports: 1,
      completedAnalysis: 5,
    })
  }, [])

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="rounded-lg border border-slate-700 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.fullName}!
        </h1>
        <p className="text-slate-400">
          Here's your health overview and quick access to your healthcare services
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Upcoming Appointments</p>
              <p className="text-3xl font-bold text-white">{stats.upcomingAppointments}</p>
            </div>
            <span className="text-2xl">📅</span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Pending Reports</p>
              <p className="text-3xl font-bold text-white">{stats.pendingReports}</p>
            </div>
            <span className="text-2xl">📋</span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">AI Analysis</p>
              <p className="text-3xl font-bold text-white">{stats.completedAnalysis}</p>
            </div>
            <span className="text-2xl">🤖</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/patient/chat"
            className="group relative overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-6 transition hover:border-blue-500/50 hover:bg-slate-700/50"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition"></div>
            <div className="relative">
              <div className="text-3xl mb-3">💬</div>
              <h3 className="font-semibold text-white mb-1">Chat with HealthBrain AI</h3>
              <p className="text-sm text-slate-400">Get instant health insights and advice</p>
            </div>
          </Link>

          <Link
            href="/patient/appointments/book"
            className="group relative overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-6 transition hover:border-blue-500/50 hover:bg-slate-700/50"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition"></div>
            <div className="relative">
              <div className="text-3xl mb-3">📅</div>
              <h3 className="font-semibold text-white mb-1">Book Appointment</h3>
              <p className="text-sm text-slate-400">Schedule a consultation with a doctor</p>
            </div>
          </Link>

          <Link
            href="/patient/medical-records"
            className="group relative overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-6 transition hover:border-blue-500/50 hover:bg-slate-700/50"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition"></div>
            <div className="relative">
              <div className="text-3xl mb-3">📋</div>
              <h3 className="font-semibold text-white mb-1">Medical Records</h3>
              <p className="text-sm text-slate-400">View and manage your medical reports</p>
            </div>
          </Link>

          <Link
            href="/patient/appointments"
            className="group relative overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-6 transition hover:border-blue-500/50 hover:bg-slate-700/50"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition"></div>
            <div className="relative">
              <div className="text-3xl mb-3">✓</div>
              <h3 className="font-semibold text-white mb-1">My Appointments</h3>
              <p className="text-sm text-slate-400">View and reschedule appointments</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-6 text-center">
          <p className="text-slate-400">No recent activity yet</p>
        </div>
      </div>
    </div>
  )
}
