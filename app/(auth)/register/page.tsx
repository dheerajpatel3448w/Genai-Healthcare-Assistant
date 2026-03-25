'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const role = searchParams.get('role')

  if (!role) {
    return <RoleSelection />
  }

  return <RegisterForm />
}

function RoleSelection() {
  const router = useRouter()

  return (
    <div className="space-y-6 rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur-xl p-8">
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
          <span className="text-xl font-bold text-white">H+</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Join HealthCare</h1>
        <p className="text-sm text-slate-400">Choose your account type to get started</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => router.push('/register?role=patient')}
          className="group relative overflow-hidden rounded-lg border border-slate-600 bg-slate-700/50 p-4 text-center transition hover:border-blue-500/50 hover:bg-slate-700"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition"></div>
          <div className="relative space-y-2">
            <div className="text-2xl">👤</div>
            <div>
              <h3 className="font-semibold text-white">Patient</h3>
              <p className="text-xs text-slate-400">Get health insights</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push('/register?role=doctor')}
          className="group relative overflow-hidden rounded-lg border border-slate-600 bg-slate-700/50 p-4 text-center transition hover:border-blue-500/50 hover:bg-slate-700"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition"></div>
          <div className="relative space-y-2">
            <div className="text-2xl">⚕️</div>
            <div>
              <h3 className="font-semibold text-white">Doctor</h3>
              <p className="text-xs text-slate-400">Manage patients</p>
            </div>
          </div>
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-slate-800/50 px-2 text-slate-400">Already have an account?</span>
        </div>
      </div>

      <Link
        href="/login"
        className="block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-center font-semibold text-slate-200 hover:bg-slate-700 transition"
      >
        Sign In Instead
      </Link>
    </div>
  )
}
