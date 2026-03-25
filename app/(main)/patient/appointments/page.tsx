'use client'

import { useState, useEffect } from 'react'
import { Appointment } from '@/types'
import { apiClient } from '@/lib/api'
import Link from 'next/link'

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get<{ appointments: Appointment[] }>(
        '/appointment/my-appointments'
      )
      setAppointments(response.appointments || [])
    } catch (err: any) {
      setError('Failed to load appointments')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return

    try {
      await apiClient.patch(`/appointment/${appointmentId}/cancel`)
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt
        )
      )
    } catch (err) {
      console.error('Failed to cancel appointment:', err)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Appointments</h1>
        <p className="text-slate-400 mb-6">
          Manage and reschedule your doctor appointments
        </p>
        <Link
          href="/patient/appointments/book"
          className="inline-block rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-2.5 font-semibold text-white hover:from-blue-600 hover:to-cyan-600 transition"
        >
          Book New Appointment
        </Link>
      </div>

      {/* Appointments List */}
      <div>
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4 mb-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-slate-400">Loading appointments...</div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-12 text-center">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-white mb-2">No Appointments Yet</h3>
            <p className="text-slate-400 mb-6">
              You haven't booked any appointments. Schedule one with a doctor to get started.
            </p>
            <Link
              href="/patient/appointments/book"
              className="inline-block rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-2.5 font-semibold text-white hover:from-blue-600 hover:to-cyan-600 transition"
            >
              Book First Appointment
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-6"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      Appointment with Doctor
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {new Date(appointment.appointmentDate).toLocaleDateString()} at{' '}
                      {appointment.startTime}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(
                      appointment.status
                    )}`}
                  >
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </div>

                <p className="text-slate-300 mb-4">{appointment.reason}</p>

                <div className="flex gap-3">
                  <button className="text-sm px-4 py-2 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-700 transition">
                    Reschedule
                  </button>
                  {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                    <button
                      onClick={() => handleCancel(appointment.id)}
                      className="text-sm px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
