'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import { apiClient } from '@/lib/api';
import {
  ArrowRight,
  Search,
  MapPin,
  Building2,
  Star,
  Bookmark,
  ExternalLink,
  Loader2,
  Globe,
  Filter,
  ChevronDown,
  ChevronUp,
  Briefcase,
  CheckCircle2,
  XCircle,
  Plus,
  SlidersHorizontal,
  Target,
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  archetype?: string;
  seniority?: string;
  required_skills: string[];
  salary_range?: string;
  remote_policy?: string;
  match_score?: number;
  quality_score?: number;
  url: string;
  description?: string;
}

interface Profile {
  id: string;
  name: string;
  target_roles: string[];
  preferred_location: string;
  min_salary: number | null;
  remote_preference: string;
  is_default: boolean;
}

interface Resume {
  skills: string[];
}

export default function JobsPage() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('Remote');
  const [scanning, setScanning] = useState(false);
  const [searching, setSearching] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'scan' | 'search' | 'saved'>('search');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [showPrefs, setShowPrefs] = useState(false);
  const [trackingJobId, setTrackingJobId] = useState<string | null>(null);

  useEffect(() => {
    loadSavedJobs();
    loadProfile();
    loadResumes();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await apiClient.listProfiles();
      const profiles = data?.profiles || [];
      const def = profiles.find((p: Profile) => p.is_default) || profiles[0];
      setProfile(def || null);
      if (def?.preferred_location) setLocation(def.preferred_location);
    } catch {
      // ignore
    }
  };

  const loadResumes = async () => {
    try {
      const data = await apiClient.listResumes();
      const list = data?.resumes || [];
      setResumes(list.map((r: any) => ({ skills: r.skills || [] })));
    } catch {
      // ignore
    }
  };

  const loadSavedJobs = async () => {
    try {
      const data = await apiClient.getSavedJobs();
      if (Array.isArray(data)) {
        setJobs(data);
        setSavedJobIds(new Set(data.map((j: Job) => j.id)));
      }
    } catch {
      // ignore
    }
  };

  const handleScan = async () => {
    setError('');
    setScanning(true);
    setJobs([]);
    try {
      const data = await apiClient.scanJobs(20, 3.0);
      if (Array.isArray(data)) {
        setJobs(data);
        setActiveTab('scan');
      }
    } catch (err: any) {
      setError(err.message || 'Scan failed');
    } finally {
      setScanning(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setError('');
    setSearching(true);
    setJobs([]);
    try {
      const data = await apiClient.searchJobs(query, location);
      if (data?.jobs && Array.isArray(data.jobs)) {
        setJobs(data.jobs);
        setActiveTab('search');
      } else if (Array.isArray(data)) {
        setJobs(data);
        setActiveTab('search');
      }
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleSaveJob = async (jobId: string) => {
    try {
      await apiClient.saveJob(jobId);
      setSavedJobIds((prev) => new Set(prev).add(jobId));
    } catch {
      // ignore
    }
  };

  const handleTrack = async (job: Job) => {
    setTrackingJobId(job.id);
    try {
      await apiClient.createApplication({
        company: job.company,
        role: job.title,
        stage: 'applied',
        url: job.url,
        location: job.location,
        salary: job.salary_range,
      });
      setExpandedJobId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to track application');
    } finally {
      setTrackingJobId(null);
    }
  };

  const allSkills = resumes.flatMap((r) => r.skills);

  const computeFit = (job: Job) => {
    if (!job.required_skills?.length || !allSkills.length) return null;
    const matched = job.required_skills.filter((s) =>
      allSkills.some((us) => us.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(us.toLowerCase()))
    );
    const missing = job.required_skills.filter((s) => !matched.includes(s));
    const pct = Math.round((matched.length / job.required_skills.length) * 100);
    return { matched, missing, pct };
  };

  const JobCard = ({ job }: { job: Job }) => {
    const isSaved = savedJobIds.has(job.id);
    const matchScore = job.match_score ? Math.round(job.match_score * 20) : 0;
    const isExpanded = expandedJobId === job.id;
    const fit = computeFit(job);

    return (
      <div className="bg-[#1A1A24] rounded-lg border border-white/[0.06] overflow-hidden hover:border-white/[0.10] transition-colors duration-150">
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-medium text-[#E8E8ED] truncate">{job.title}</h3>
                {matchScore > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${
                      matchScore >= 80
                        ? 'bg-[#00D26A]/[0.12] text-[#00D26A] border border-[#00D26A]/[0.25]'
                        : matchScore >= 50
                        ? 'bg-[#F59E0B]/[0.12] text-[#F59E0B] border border-[#F59E0B]/[0.25]'
                        : 'bg-[#EF4444]/[0.12] text-[#EF4444] border border-[#EF4444]/[0.25]'
                    }`}
                  >
                    {matchScore}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-[#8A8F98] mb-2">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> {job.company}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {job.location}
                </span>
                {job.remote_policy && (
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" /> {job.remote_policy}
                  </span>
                )}
              </div>
              {job.required_skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {job.required_skills.slice(0, 5).map((skill) => {
                    const hasSkill = allSkills.some(
                      (us) =>
                        us.toLowerCase().includes(skill.toLowerCase()) ||
                        skill.toLowerCase().includes(us.toLowerCase())
                    );
                    return (
                      <span
                        key={skill}
                        className={`text-xs px-2 py-0.5 rounded-full border ${
                          hasSkill
                            ? 'bg-[#00D26A]/[0.08] text-[#00D26A] border-[#00D26A]/[0.15]'
                            : 'bg-white/[0.04] text-[#8A8F98] border-white/[0.06]'
                        }`}
                      >
                        {skill}
                      </span>
                    );
                  })}
                </div>
              )}
              {job.salary_range && <p className="text-xs text-[#5A5E66]">{job.salary_range}</p>}
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={() => handleSaveJob(job.id)}
                disabled={isSaved}
                className={`p-1.5 rounded-md transition-colors duration-150 ${
                  isSaved
                    ? 'text-[#00D26A] bg-[#00D26A]/[0.12]'
                    : 'text-[#5A5E66] hover:text-[#E8E8ED] hover:bg-white/[0.04]'
                }`}
                title={isSaved ? 'Saved' : 'Save job'}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-md text-[#5A5E66] hover:text-[#60A5FA] hover:bg-[#3B82F6]/[0.12] transition-colors duration-150"
                title="Open job posting"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                className="p-1.5 rounded-md text-[#5A5E66] hover:text-[#E8E8ED] hover:bg-white/[0.04] transition-colors duration-150"
                title="Fit check"
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Fit Analysis */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-white/[0.04] animate-fade-in">
              {fit ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#3B82F6]" />
                    <span className="text-sm font-medium text-[#E8E8ED]">Fit Analysis</span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full border ${
                        fit.pct >= 70
                          ? 'bg-[#00D26A]/[0.12] text-[#00D26A] border-[#00D26A]/[0.25]'
                          : fit.pct >= 40
                          ? 'bg-[#F59E0B]/[0.12] text-[#F59E0B] border-[#F59E0B]/[0.25]'
                          : 'bg-[#EF4444]/[0.12] text-[#EF4444] border-[#EF4444]/[0.25]'
                      }`}
                    >
                      {fit.pct}% match
                    </span>
                  </div>

                  {fit.matched.length > 0 && (
                    <div>
                      <span className="text-xs text-[#5A5E66] uppercase tracking-wider">Matched Skills</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {fit.matched.map((s) => (
                          <span
                            key={s}
                            className="text-xs px-2 py-0.5 bg-[#00D26A]/[0.08] text-[#00D26A] rounded-full border border-[#00D26A]/[0.15] flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {fit.missing.length > 0 && (
                    <div>
                      <span className="text-xs text-[#5A5E66] uppercase tracking-wider">Missing Skills</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {fit.missing.map((s) => (
                          <span
                            key={s}
                            className="text-xs px-2 py-0.5 bg-[#EF4444]/[0.08] text-[#EF4444] rounded-full border border-[#EF4444]/[0.15] flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3" />
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleTrack(job)}
                      disabled={trackingJobId === job.id}
                      className="flex-1 py-2.5 bg-[#3B82F6] hover:bg-[#60A5FA] disabled:opacity-50 text-white rounded-md text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      {trackingJobId === job.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Tracking...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Track Application
                        </>
                      )}
                    </button>
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 border border-white/[0.10] text-[#E8E8ED] rounded-md text-sm font-medium transition-all duration-150 hover:bg-white/[0.04] flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Apply Now
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-[#8A8F98] mb-2">
                    Upload a resume to see how well you match this job.
                  </p>
                  <Link
                    href="/upload"
                    className="inline-flex items-center gap-1 text-sm text-[#60A5FA] hover:text-[#3B82F6]"
                  >
                    Upload Resume <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      <Sidebar />
      <main className="lg:ml-[260px] min-h-screen">
        <div className="max-w-[900px] mx-auto px-6 py-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-medium text-[#E8E8ED]">Job Search</h1>
              <p className="text-[#8A8F98] text-sm mt-1">AI-powered job discovery across the web</p>
            </div>
            <Link
              href="/dashboard"
              className="text-[#60A5FA] hover:text-[#3B82F6] text-sm transition-colors duration-150 flex items-center gap-1"
            >
              Back to Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Profile Quick Actions */}
          <div className="flex items-center gap-3 mb-4">
            {profile ? (
              <div className="flex items-center gap-2 text-xs text-[#8A8F98]">
                <Target className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>
                  Targeting: {profile.target_roles?.join(', ') || 'Any role'}
                  {profile.preferred_location && ` · ${profile.preferred_location}`}
                </span>
              </div>
            ) : (
              <button
                onClick={() => setShowPrefs(true)}
                className="text-xs text-[#60A5FA] hover:text-[#3B82F6] flex items-center gap-1 transition-colors duration-150"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Set job preferences
              </button>
            )}
          </div>

          {/* Preference Wizard Modal */}
          {showPrefs && <PreferenceWizard onClose={() => setShowPrefs(false)} onSave={loadProfile} />}

          {/* Search Bar */}
          <div className="bg-[#1A1A24] rounded-lg border border-white/[0.06] p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Job title, keywords, or company..."
                  className="w-full px-4 py-3 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
                />
              </div>
              <div className="md:w-48">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location"
                  className="w-full px-4 py-3 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={searching || !query.trim()}
                className="px-6 py-3 bg-[#3B82F6] hover:bg-[#60A5FA] disabled:opacity-50 text-white rounded-md font-medium transition-all duration-150 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {searching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Search
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={handleScan}
                disabled={scanning}
                className="text-xs text-[#60A5FA] hover:text-[#3B82F6] flex items-center gap-1 transition-colors duration-150"
              >
                {scanning ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Scanning all portals...
                  </>
                ) : (
                  <>
                    <Filter className="w-3 h-3" />
                    AI Scan All Portals
                  </>
                )}
              </button>
              <button
                onClick={loadSavedJobs}
                className={`text-xs flex items-center gap-1 transition-colors duration-150 ${
                  activeTab === 'saved' ? 'text-[#60A5FA]' : 'text-[#5A5E66] hover:text-[#8A8F98]'
                }`}
              >
                <Bookmark className="w-3 h-3" />
                Saved Jobs ({savedJobIds.size})
              </button>
              <button
                onClick={() => setShowPrefs(true)}
                className="text-xs text-[#5A5E66] hover:text-[#8A8F98] flex items-center gap-1 transition-colors duration-150"
              >
                <SlidersHorizontal className="w-3 h-3" />
                Preferences
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm flex items-start gap-2">
              <Star className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Results */}
          {jobs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#8A8F98]">{jobs.length} jobs found</span>
              </div>
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}

          {!searching && !scanning && jobs.length === 0 && (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-[#5A5E66] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#E8E8ED] mb-2">Find Your Next Role</h3>
              <p className="text-sm text-[#8A8F98] max-w-md mx-auto">
                Search for jobs by title, company, or keywords. Use AI Scan to search across LinkedIn,
                Indeed, and 50+ job portals automatically.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function PreferenceWizard({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [targetRoles, setTargetRoles] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [remotePreference, setRemotePreference] = useState('any');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!targetRoles.trim()) {
      setError('Please enter at least one target role');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await apiClient.createProfile({
        name: 'Job Search Profile',
        target_roles: targetRoles.split(',').map((s) => s.trim()).filter(Boolean),
        preferred_location: preferredLocation.trim() || undefined,
        remote_preference: remotePreference,
      });
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1A1A24] border border-white/[0.06] rounded-lg w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-medium text-[#E8E8ED] mb-1">Job Preferences</h2>
        <p className="text-sm text-[#8A8F98] mb-4">Tell us what you are looking for to get better matches.</p>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Target Roles *</label>
            <input
              type="text"
              value={targetRoles}
              onChange={(e) => setTargetRoles(e.target.value)}
              placeholder="e.g. Frontend Engineer, React Developer"
              className="w-full px-4 py-2.5 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Preferred Location</label>
            <input
              type="text"
              value={preferredLocation}
              onChange={(e) => setPreferredLocation(e.target.value)}
              placeholder="e.g. Remote, London"
              className="w-full px-4 py-2.5 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Remote Preference</label>
            <select
              value={remotePreference}
              onChange={(e) => setRemotePreference(e.target.value)}
              className="w-full px-4 py-2.5 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
            >
              <option value="any" className="bg-[#1A1A24]">Any</option>
              <option value="remote" className="bg-[#1A1A24]">Remote Only</option>
              <option value="hybrid" className="bg-[#1A1A24]">Hybrid</option>
              <option value="onsite" className="bg-[#1A1A24]">On-site</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-white/[0.10] text-[#E8E8ED] rounded-md font-medium transition-all duration-150 hover:bg-white/[0.04]"
          >
            Skip
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 bg-[#3B82F6] hover:bg-[#60A5FA] disabled:opacity-50 text-white rounded-md font-medium transition-all duration-150 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Briefcase className="w-4 h-4" />
                Save Preferences
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
