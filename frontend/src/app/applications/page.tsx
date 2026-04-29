'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import { apiClient } from '@/lib/api';
import {
  ArrowRight,
  Plus,
  Trash2,
  Briefcase,
  ChevronRight,
  Calendar,
  Edit3,
  Check,
  X,
  MoreHorizontal,
} from 'lucide-react';

type Stage = 'applied' | 'phone' | 'interview' | 'offer' | 'rejected';

interface Application {
  id: string;
  company: string;
  role: string;
  stage: Stage;
  date: string;
  notes: string;
  url?: string;
  salary?: string;
  location?: string;
}

const STAGES: { key: Stage; label: string; color: string }[] = [
  { key: 'applied', label: 'Applied', color: '#3B82F6' },
  { key: 'phone', label: 'Phone Screen', color: '#8B5CF6' },
  { key: 'interview', label: 'Interview', color: '#F59E0B' },
  { key: 'offer', label: 'Offer', color: '#00D26A' },
  { key: 'rejected', label: 'Rejected', color: '#EF4444' },
];

const STORAGE_KEY = 'hunt-x-applications';

function loadLocalApps(): Application[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalApps(apps: Application[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [editing, setEditing] = useState<Application | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadApps = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiClient.listApplications();
      if (data?.applications) {
        const mapped = data.applications.map((a: any) => ({
          id: a.id,
          company: a.company,
          role: a.role,
          stage: a.stage as Stage,
          date: a.date || '',
          notes: a.notes || '',
          url: a.url,
          salary: a.salary,
          location: a.location,
        }));
        setApps(mapped);
        saveLocalApps(mapped);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load applications');
      const local = loadLocalApps();
      if (local.length) setApps(local);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApps();
    setMounted(true);
  }, [loadApps]);

  useEffect(() => {
    if (mounted && apps.length) saveLocalApps(apps);
  }, [apps, mounted]);

  const addApp = async (app: Omit<Application, 'id'>) => {
    try {
      const data = await apiClient.createApplication({
        company: app.company,
        role: app.role,
        stage: app.stage,
        date: app.date,
        notes: app.notes,
        url: app.url,
        salary: app.salary,
        location: app.location,
      });
      if (data?.application) {
        const created: Application = {
          id: data.application.id,
          company: data.application.company,
          role: data.application.role,
          stage: data.application.stage as Stage,
          date: data.application.date || '',
          notes: data.application.notes || '',
          url: data.application.url,
          salary: data.application.salary,
          location: data.application.location,
        };
        setApps((prev) => [created, ...prev]);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to create application');
    }
    setShowAdd(false);
  };

  const updateApp = async (id: string, updates: Partial<Application>) => {
    try {
      const data = await apiClient.updateApplication(id, {
        company: updates.company,
        role: updates.role,
        stage: updates.stage,
        date: updates.date,
        notes: updates.notes,
        url: updates.url,
        salary: updates.salary,
        location: updates.location,
      });
      if (data?.application) {
        setApps((prev) =>
          prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
        );
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update application');
    }
    setEditing(null);
  };

  const deleteApp = async (id: string) => {
    try {
      await apiClient.deleteApplication(id);
      setApps((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      setError(err?.message || 'Failed to delete application');
    }
  };

  const moveStage = async (id: string, direction: 'left' | 'right') => {
    const stageKeys = STAGES.map((s) => s.key);
    const app = apps.find((a) => a.id === id);
    if (!app) return;
    const idx = stageKeys.indexOf(app.stage);
    const newIdx = direction === 'right' ? idx + 1 : idx - 1;
    if (newIdx < 0 || newIdx >= stageKeys.length) return;
    const newStage = stageKeys[newIdx];
    await updateApp(id, { stage: newStage });
  };

  const appsByStage = useCallback(() => {
    const grouped: Record<Stage, Application[]> = {
      applied: [],
      phone: [],
      interview: [],
      offer: [],
      rejected: [],
    };
    apps.forEach((a) => {
      if (grouped[a.stage]) grouped[a.stage].push(a);
    });
    return grouped;
  }, [apps])();

  const stats = {
    total: apps.length,
    active: apps.filter((a) => a.stage !== 'rejected' && a.stage !== 'offer').length,
    interviews: apps.filter((a) => a.stage === 'interview').length,
    offers: apps.filter((a) => a.stage === 'offer').length,
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0B0B0F]">
        <Sidebar />
        <main className="lg:ml-[260px] min-h-screen flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#3B82F6]/30 border-t-[#3B82F6] rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      <Sidebar />
      <main className="lg:ml-[260px] min-h-screen">
        <div className="max-w-[1200px] mx-auto px-6 py-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-medium text-[#E8E8ED]">Application Tracker</h1>
              <p className="text-[#8A8F98] text-sm mt-1">Track every application from applied to offer</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="text-[#60A5FA] hover:text-[#3B82F6] text-sm transition-colors duration-150 flex items-center gap-1"
              >
                Back to Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-[#EF4444]/10 border border-[#EF4444]/25 rounded-lg text-sm text-[#EF4444]">
              {error}
              <button
                onClick={() => setError('')}
                className="ml-2 text-[#E8E8ED] hover:text-white underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-[#1A1A24] rounded-lg border border-white/[0.06]">
              <div className="text-2xl font-medium text-[#E8E8ED]">{stats.total}</div>
              <div className="text-xs text-[#5A5E66] mt-0.5">Total</div>
            </div>
            <div className="p-4 bg-[#1A1A24] rounded-lg border border-white/[0.06]">
              <div className="text-2xl font-medium text-[#3B82F6]">{stats.active}</div>
              <div className="text-xs text-[#5A5E66] mt-0.5">Active</div>
            </div>
            <div className="p-4 bg-[#1A1A24] rounded-lg border border-white/[0.06]">
              <div className="text-2xl font-medium text-[#F59E0B]">{stats.interviews}</div>
              <div className="text-xs text-[#5A5E66] mt-0.5">Interviews</div>
            </div>
            <div className="p-4 bg-[#1A1A24] rounded-lg border border-white/[0.06]">
              <div className="text-2xl font-medium text-[#00D26A]">{stats.offers}</div>
              <div className="text-xs text-[#5A5E66] mt-0.5">Offers</div>
            </div>
          </div>

          {/* Add Button */}
          <button
            onClick={() => setShowAdd(true)}
            className="mb-6 px-4 py-2.5 bg-[#3B82F6] hover:bg-[#60A5FA] text-white rounded-md font-medium text-sm transition-all duration-150 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center gap-2 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add Application
          </button>

          {/* Add Modal */}
          {showAdd && <ApplicationForm onSubmit={addApp} onCancel={() => setShowAdd(false)} />}

          {/* Edit Modal */}
          {editing && (
            <ApplicationForm
              app={editing}
              onSubmit={(data) => updateApp(editing.id, data)}
              onCancel={() => setEditing(null)}
            />
          )}

          {/* Loading */}
          {loading && apps.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#3B82F6]/30 border-t-[#3B82F6] rounded-full animate-spin" />
            </div>
          )}

          {/* Kanban Board */}
          <div className="grid grid-cols-5 gap-3">
            {STAGES.map((stage) => (
              <div key={stage.key} className="flex flex-col">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                  <span className="text-xs font-medium text-[#8A8F98] uppercase tracking-wider">
                    {stage.label}
                  </span>
                  <span className="text-xs text-[#5A5E66] ml-auto">
                    {appsByStage[stage.key].length}
                  </span>
                </div>
                <div className="space-y-2 min-h-[120px]">
                  {appsByStage[stage.key].map((app) => (
                    <div
                      key={app.id}
                      className="bg-[#1A1A24] rounded-lg border border-white/[0.06] p-3 hover:border-white/[0.10] transition-colors duration-150 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[#E8E8ED] truncate">{app.role}</p>
                          <p className="text-xs text-[#8A8F98] truncate">{app.company}</p>
                        </div>
                        <button
                          onClick={() => setEditing(app)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-[#5A5E66] hover:text-[#E8E8ED] transition-all duration-150"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                      {app.salary && <p className="text-xs text-[#5A5E66] mt-1">{app.salary}</p>}
                      {app.notes && (
                        <p className="text-xs text-[#5A5E66] mt-1 line-clamp-2">{app.notes}</p>
                      )}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04]">
                        <span className="text-[10px] text-[#5A5E66]">{app.date}</span>
                        <div className="flex items-center gap-1">
                          {stage.key !== 'applied' && (
                            <button
                              onClick={() => moveStage(app.id, 'left')}
                              className="p-1 text-[#5A5E66] hover:text-[#8A8F98] transition-colors duration-150"
                              title="Move back"
                            >
                              <ChevronRight className="w-3 h-3 rotate-180" />
                            </button>
                          )}
                          {stage.key !== 'rejected' && (
                            <button
                              onClick={() => moveStage(app.id, 'right')}
                              className="p-1 text-[#5A5E66] hover:text-[#8A8F98] transition-colors duration-150"
                              title="Move forward"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteApp(app.id)}
                            className="p-1 text-[#5A5E66] hover:text-[#EF4444] transition-colors duration-150"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function ApplicationForm({
  app,
  onSubmit,
  onCancel,
}: {
  app?: Application;
  onSubmit: (data: Omit<Application, 'id'>) => void;
  onCancel: () => void;
}) {
  const [company, setCompany] = useState(app?.company || '');
  const [role, setRole] = useState(app?.role || '');
  const [stage, setStage] = useState<Stage>(app?.stage || 'applied');
  const [date, setDate] = useState(app?.date || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(app?.notes || '');
  const [url, setUrl] = useState(app?.url || '');
  const [salary, setSalary] = useState(app?.salary || '');
  const [location, setLocation] = useState(app?.location || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;
    onSubmit({ company, role, stage, date, notes, url, salary, location });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[#1A1A24] border border-white/[0.06] rounded-lg w-full max-w-md mx-4 p-6 animate-scale-in">
        <h2 className="text-lg font-medium text-[#E8E8ED] mb-4">
          {app ? 'Edit Application' : 'Add Application'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Company *</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Stripe"
              className="w-full px-4 py-2.5 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Role *</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className="w-full px-4 py-2.5 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as Stage)}
                className="w-full px-4 py-2.5 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
              >
                {STAGES.map((s) => (
                  <option key={s.key} value={s.key} className="bg-[#1A1A24]">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Salary</label>
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. €80k - €100k"
                className="w-full px-4 py-2.5 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote"
                className="w-full px-4 py-2.5 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Job URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Follow-up date, recruiter name, etc."
              rows={3}
              className="w-full px-4 py-2.5 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150 resize-y"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 border border-white/[0.10] text-[#E8E8ED] rounded-md font-medium transition-all duration-150 hover:bg-white/[0.04]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#3B82F6] hover:bg-[#60A5FA] text-white rounded-md font-medium transition-all duration-150 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            >
              {app ? 'Save Changes' : 'Add Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
