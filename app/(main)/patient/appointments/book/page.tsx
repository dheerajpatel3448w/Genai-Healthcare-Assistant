'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DoctorProfile } from '@/types'
import { apiClient } from '@/lib/api'

interface BookingForm {
  doctorId: string
  appointmentDate: string
  startTime: string
  reason: string
}

export default function BookAppointmentPage() {
  const router = useRouter()
  const [doctors, setDoctors] = useState<DoctorProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<BookingForm>({
    doctorId: '',
    appointmentDate: '',
    startTime: '',
    reason: '',
  })

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const response = await apiClient.get<{ doctors: DoctorProfile[] }>(
        '/doctor/all'
      )
      setDoctors(response.doctors || [])
      if (response.doctors && response.doctors.length > 0) {
        setForm((prev) => ({ ...prev, doctorId: response.doctors[0].id }))
      }
    } catch (err) {
      setError('Failed to load doctors')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await apiClient.post('/appointment/create', {
        doctorId: form.doctorId,
        appointmentDate: form.appointmentDate,
        startTime: form.startTime,
        reason: form.reason,
      })
      router.push('/patient/appointments')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book appointment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Book an Appointment</h1>
        <p className="text-slate-400">
          Schedule a consultation with one of our healthcare providers
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Select Doctor */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Select a Doctor</h2>
          
          {isLoading ? (
            <p className="text-slate-400">Loading doctors...</p>
          ) : doctors.length === 0 ? (
            <p className="text-slate-400">No doctors available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map((doctor) => (
                <label
                  key={doctor.id}
                  className={`p-4 rounded-lg border cursor-pointer transition ${
                    form.doctorId === doctor.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="doctor"
                    value={doctor.id}
                    checked={form.doctorId === doctor.id}
                    onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                    className="sr-only"
                  />
                  <div>
                    <h3 className="font-semibold text-white">Dr. {doctor.fullName}</h3>
                    <p className="text-sm text-slate-400">{doctor.specialty}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {doctor.experience} years experience
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Appointment Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Date
            </label>
            <input
              type="date"
              value={form.appointmentDate}
              onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Time
            </label>
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              required
              className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Reason for Visit
            </label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              required
              rows={4}
              placeholder="Describe your symptoms or reason for the appointment"
              className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 rounded-lg border border-slate-600 bg-slate-700/50 px-6 py-2.5 font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !form.doctorId}
            className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-2.5 font-semibold text-white hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isSubmitting ? 'Booking...' : 'Book Appointment'}
          </button>
        </div>
      </form>
    </div>
  )
}
