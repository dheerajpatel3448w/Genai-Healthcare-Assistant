'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { DoctorProfile } from '@/types'
import { apiClient } from '@/lib/api'

interface ProfileForm {
  fullName: string
  email: string
  specialty: string
  qualifications: string
  experience: string
  licenseNumber: string
  hospital?: string
  consultationFee?: number
  phoneNumber?: string
}

export default function DoctorProfilePage() {
  const { user } = useAuth()
  const [form, setForm] = useState<ProfileForm>({
    fullName: user?.fullName || '',
    email: user?.email || '',
    specialty: '',
    qualifications: '',
    experience: '',
    licenseNumber: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get<{ profile: DoctorProfile }>(
        '/doctor/getprofile'
      )
      if (response.profile) {
        setForm({
          fullName: response.profile.fullName,
          email: response.profile.email,
          specialty: response.profile.specialty,
          qualifications: response.profile.qualifications,
          experience: response.profile.experience,
          licenseNumber: response.profile.licenseNumber,
          hospital: response.profile.hospital,
          consultationFee: response.profile.consultationFee,
          phoneNumber: response.profile.phoneNumber,
        })
      }
    } catch (err) {
      console.error('Failed to load profile:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSaving(true)

    try {
      await apiClient.put('/doctor/updateprofile', form)
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-12 text-slate-400">Loading profile...</div>
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Doctor Profile</h1>
        <p className="text-slate-400">
          Update your professional information and availability
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-4">
          <p className="text-sm text-green-400">{success}</p>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                disabled
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={form.phoneNumber || ''}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Professional Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Specialty
              </label>
              <input
                type="text"
                value={form.specialty}
                onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                placeholder="e.g., Cardiology, General Medicine"
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  min="0"
                  className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Consultation Fee
                </label>
                <input
                  type="number"
                  value={form.consultationFee || ''}
                  onChange={(e) => setForm({ ...form, consultationFee: e.target.value ? parseFloat(e.target.value) : undefined })}
                  min="0"
                  placeholder="Amount"
                  className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                License Number
              </label>
              <input
                type="text"
                value={form.licenseNumber}
                onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Qualifications
              </label>
              <textarea
                value={form.qualifications}
                onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
                rows={3}
                placeholder="e.g., MD, Board Certified in..."
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Hospital/Clinic
              </label>
              <input
                type="text"
                value={form.hospital || ''}
                onChange={(e) => setForm({ ...form, hospital: e.target.value })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-2.5 font-semibold text-white hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
