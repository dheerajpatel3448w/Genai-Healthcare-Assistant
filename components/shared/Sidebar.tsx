'use client'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const patientLinks = [
  { href: '/patient/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/patient/chat', label: 'AI Chat', icon: '💬' },
  { href: '/patient/appointments', label: 'Appointments', icon: '📅' },
  { href: '/patient/medical-records', label: 'Medical Records', icon: '📋' },
  { href: '/patient/profile', label: 'Profile', icon: '👤' },
]

const doctorLinks = [
  { href: '/doctor/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/doctor/chat', label: 'AI Chat', icon: '💬' },
  { href: '/doctor/appointments', label: 'Appointments', icon: '📅' },
  { href: '/doctor/patients', label: 'Patients', icon: '👥' },
  { href: '/doctor/profile', label: 'Profile', icon: '⚕️' },
]

export function Sidebar() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const links = user?.role === 'doctor' ? doctorLinks : patientLinks

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed bottom-6 right-6 lg:hidden z-50 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 border-r border-slate-700 bg-slate-800/50 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:translate-x-0 z-40`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                <span className="text-lg font-bold text-white">H+</span>
              </div>
              <h1 className="text-lg font-bold text-white">HealthCare</h1>
            </div>

            <nav className="space-y-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive(link.href)
                      ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-6 border-t border-slate-700">
            <div className="text-xs text-slate-500">
              <p>GenAI Healthcare Assistant</p>
              <p>v1.0.0</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}
    </>
  )
}
