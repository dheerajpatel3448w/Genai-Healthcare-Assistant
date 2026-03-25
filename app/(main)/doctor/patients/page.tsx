'use client'

import { useState, useEffect } from 'react'
import { PatientProfile } from '@/types'
import { apiClient } from '@/lib/api'
import Link from 'next/link'

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientProfile[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get<{ patients: PatientProfile[] }>(
        '/doctor/getprofile'
      )
      setPatients(response.patients || [])
    } catch (err: any) {
      setError('Failed to load patients')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPatients = patients.filter(
    (patient) =>
      patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Patient Directory</h1>
        <p className="text-slate-400">
          View and manage your patient records
        </p>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search patients by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
        />
      </div>

      {/* Patients List */}
      <div>
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4 mb-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-slate-400">Loading patients...</div>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-12 text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-white mb-2">No Patients Found</h3>
            <p className="text-slate-400">
              {searchTerm ? 'No patients match your search.' : 'You have no patients yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className="rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-6"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {patient.fullName}
                    </h3>
                    <p className="text-slate-400 text-sm mb-2">{patient.email}</p>
                    {patient.phoneNumber && (
                      <p className="text-slate-400 text-sm">{patient.phoneNumber}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {patient.dateOfBirth && (
                      <p className="text-sm text-slate-400">
                        Age: {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}
                      </p>
                    )}
                  </div>
                </div>

                {patient.medicalHistory && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-slate-400 mb-1">Medical History:</p>
                    <p className="text-sm text-slate-300 line-clamp-2">
                      {patient.medicalHistory}
                    </p>
                  </div>
                )}

                {patient.allergies && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-slate-400 mb-1">Allergies:</p>
                    <p className="text-sm text-slate-300">{patient.allergies}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button className="text-sm px-4 py-2 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-700 transition">
                    View Records
                  </button>
                  <button className="text-sm px-4 py-2 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition">
                    Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
