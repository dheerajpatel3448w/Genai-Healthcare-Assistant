'use client'

import { useState, useEffect } from 'react'
import { MedicalReport, AnalysisResult } from '@/types'
import { apiClient } from '@/lib/api'

export default function MedicalRecordsPage() {
  const [reports, setReports] = useState<MedicalReport[]>([])
  const [analysis, setAnalysis] = useState<AnalysisResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    fetchMedicalData()
  }, [])

  const fetchMedicalData = async () => {
    try {
      setIsLoading(true)
      const [reportsRes, analysisRes] = await Promise.all([
        apiClient.get<{ reports: MedicalReport[] }>('/images/upload'),
        apiClient.get<{ analysis: AnalysisResult[] }>('/analysis/analysis'),
      ])
      setReports(reportsRes.reports || [])
      setAnalysis(analysisRes.analysis || [])
    } catch (err) {
      setError('Failed to load medical records')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (!files) return

    setIsUploading(true)
    setError('')

    try {
      const formData = new FormData()
      for (let i = 0; i < Math.min(files.length, 10); i++) {
        formData.append('files', files[i])
      }

      await apiClient.post('/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setUploadProgress(100)
      setTimeout(() => {
        fetchMedicalData()
        setUploadProgress(0)
      }, 1000)
    } catch (err) {
      setError('Failed to upload files')
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Medical Records</h1>
        <p className="text-slate-400">
          Upload and view your medical reports and analysis results
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Upload Section */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Upload Medical Reports</h2>
        <label className="relative block cursor-pointer">
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="sr-only"
          />
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-blue-500/50 transition">
            <div className="text-4xl mb-2">📎</div>
            <p className="text-white font-medium mb-1">
              {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm text-slate-400">
              PDF, JPG, or PNG files (max 10 files)
            </p>
            {uploadProgress > 0 && (
              <div className="mt-4 w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        </label>
      </div>

      {/* Reports Section */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Uploaded Reports</h2>
        {isLoading ? (
          <p className="text-slate-400">Loading reports...</p>
        ) : reports.length === 0 ? (
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-8 text-center">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-slate-400">No reports uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-4 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold text-white">{report.fileName}</h3>
                  <p className="text-sm text-slate-400">
                    {new Date(report.uploadDate).toLocaleDateString()} •{' '}
                    {(report.fileSize / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button className="text-blue-400 hover:text-blue-300 transition">
                  View
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analysis Section */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">AI Analysis Results</h2>
        {analysis.length === 0 ? (
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-8 text-center">
            <div className="text-3xl mb-2">🤖</div>
            <p className="text-slate-400">No analysis results yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {analysis.map((result) => (
              <div
                key={result.id}
                className="rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-white">Analysis Report</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      result.status === 'completed'
                        ? 'bg-green-500/20 text-green-400'
                        : result.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {result.status}
                  </span>
                </div>
                <p className="text-slate-300 text-sm">{result.analysisText}</p>
                <p className="text-xs text-slate-500 mt-3">
                  {new Date(result.timestamp).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
