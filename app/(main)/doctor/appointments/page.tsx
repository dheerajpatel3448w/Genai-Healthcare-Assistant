'use client'

import { useState, useEffect } from 'react'
import { Appointment } from '@/types'
import { apiClient } from '@/lib/api'

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')
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

  const filteredAppointments = appointments.filter(
    (apt) => filterStatus === 'all' || apt.status === filterStatus
  )

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      await apiClient.patch(`/appointment/${appointmentId}/status`, { status: newStatus })
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: newStatus as any } : apt
        )
      )
    } catch (err) {
      console.error('Failed to update appointment:', err)
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
        <h1 className="text-3xl font-bold text-white mb-2">Appointments</h1>
        <p className="text-slate-400">
          View and manage all patient appointments
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === status
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                : 'border border-slate-600 text-slate-300 hover:border-slate-500'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
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
        ) : filteredAppointments.length === 0 ? (
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-12 text-center">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-white mb-2">No Appointments</h3>
            <p className="text-slate-400">
              No {filterStatus === 'all' ? 'appointments' : filterStatus + ' appointments'} found.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-6"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      Patient Appointment
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

                <p className="text-slate-300 mb-4">
                  <span className="font-medium">Reason:</span> {appointment.reason}
                </p>

                {appointment.notes && (
                  <p className="text-slate-400 text-sm mb-4">
                    <span className="font-medium">Notes:</span> {appointment.notes}
                  </p>
                )}

                <div className="flex gap-3 flex-wrap">
                  {appointment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                        className="text-sm px-4 py-2 rounded-lg border border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 transition"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                        className="text-sm px-4 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {appointment.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusChange(appointment.id, 'completed')}
                      className="text-sm px-4 py-2 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition"
                    >
                      Mark Complete
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
