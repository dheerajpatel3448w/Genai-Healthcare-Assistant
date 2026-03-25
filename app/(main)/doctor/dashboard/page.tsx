'use client'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface DoctorStats {
  totalPatients: number
  todayAppointments: number
  completedAppointments: number
  pendingConsultations: number
}

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DoctorStats>({
    totalPatients: 24,
    todayAppointments: 3,
    completedAppointments: 18,
    pendingConsultations: 5,
  })

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-slate-700 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, Dr. {user?.fullName}!
        </h1>
        <p className="text-slate-400">
          Manage your appointments, patients, and AI-powered consultations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Total Patients</p>
              <p className="text-3xl font-bold text-white">{stats.totalPatients}</p>
            </div>
            <span className="text-2xl">👥</span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Today's Appointments</p>
              <p className="text-3xl font-bold text-white">{stats.todayAppointments}</p>
            </div>
            <span className="text-2xl">📅</span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Completed</p>
              <p className="text-3xl font-bold text-white">{stats.completedAppointments}</p>
            </div>
            <span className="text-2xl">✓</span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Pending</p>
              <p className="text-3xl font-bold text-white">{stats.pendingConsultations}</p>
            </div>
            <span className="text-2xl">⏳</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/doctor/chat"
            className="group relative overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-6 transition hover:border-blue-500/50 hover:bg-slate-700/50"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition"></div>
            <div className="relative">
              <div className="text-3xl mb-3">💬</div>
              <h3 className="font-semibold text-white mb-1">DoctorBrain AI Chat</h3>
              <p className="text-sm text-slate-400">Get AI-powered patient case analysis</p>
            </div>
          </Link>

          <Link
            href="/doctor/appointments"
            className="group relative overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-6 transition hover:border-blue-500/50 hover:bg-slate-700/50"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition"></div>
            <div className="relative">
              <div className="text-3xl mb-3">📅</div>
              <h3 className="font-semibold text-white mb-1">Manage Appointments</h3>
              <p className="text-sm text-slate-400">View and manage patient appointments</p>
            </div>
          </Link>

          <Link
            href="/doctor/patients"
            className="group relative overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-6 transition hover:border-blue-500/50 hover:bg-slate-700/50"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition"></div>
            <div className="relative">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="font-semibold text-white mb-1">Patient Directory</h3>
              <p className="text-sm text-slate-400">Access patient records and history</p>
            </div>
          </Link>

          <Link
            href="/doctor/profile"
            className="group relative overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-6 transition hover:border-blue-500/50 hover:bg-slate-700/50"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition"></div>
            <div className="relative">
              <div className="text-3xl mb-3">⚕️</div>
              <h3 className="font-semibold text-white mb-1">My Profile</h3>
              <p className="text-sm text-slate-400">Manage profile and availability</p>
            </div>
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">Today's Schedule</h2>
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-6 text-center">
          <p className="text-slate-400">No appointments scheduled for today</p>
        </div>
      </div>
    </div>
  )
}
