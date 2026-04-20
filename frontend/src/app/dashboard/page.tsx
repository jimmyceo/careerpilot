'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api'

interface CV {
  id: string
  job_title: string
  company: string
  created_at: string
}

interface Resume {
  id: string
  file_name: string
  uploaded_at: string
  ai_analysis?: any
}

export default function Dashboard() {
  const [cvs, setCvs] = useState<CV[]>([])
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    // For MVP, we'll just set loading to false
    // In production, you'd fetch from API
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-900 text-white p-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-400">Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Link
            href="/generate"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
          >
            + New CV
          </Link>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-slate-800 rounded-xl">
            <div className="text-2xl font-bold">{resumes.length}</div>
            <div className="text-slate-400">Resumes</div>
          </div>
          <div className="p-4 bg-slate-800 rounded-xl">
            <div className="text-2xl font-bold">{cvs.length}</div>
            <div className="text-slate-400">CVs Generated</div>
          </div>
          <div className="p-4 bg-slate-800 rounded-xl">
            <div className="text-2xl font-bold">Unlimited</div>
            <div className="text-slate-400">Remaining</div>
          </div>
        </div>

        {/* Generated CVs */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Your CVs</h2>
          {cvs.length === 0 ? (
            <div className="p-8 bg-slate-800/50 rounded-xl text-center">
              <p className="text-slate-400 mb-4">No CVs generated yet</p>
              <Link
                href="/generate"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
              >
                Generate Your First CV
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {cvs.map((cv) => (
                <div key={cv.id} className="p-4 bg-slate-800 rounded-xl flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{cv.job_title}</div>
                    <div className="text-slate-400 text-sm">{cv.company}</div>
                  </div>
                  <button className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 rounded transition text-sm">
                    Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload History */}
        <div>
          <h2 className="text-xl font-bold mb-4">Resumes</h2>
          {resumes.length === 0 ? (
            <p className="text-slate-400">No resumes uploaded</p>
          ) : (
            <div className="space-y-2">
              {resumes.map((resume) => (
                <div key={resume.id} className="p-4 bg-slate-800 rounded-xl">
                  <div className="font-semibold">{resume.file_name}</div>
                  <div className="text-slate-400 text-sm">
                    Uploaded: {new Date(resume.uploaded_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
