'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import { apiClient } from '@/lib/api';
import {
  ArrowRight,
  Sparkles,
  Star,
  AlertTriangle,
  Briefcase,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Mic,
  Crown,
  FileText,
  Building2,
  User,
} from 'lucide-react';

interface Evaluation {
  id: string;
  company: string;
  role: string;
  global_score: number;
  created_at: string;
}

interface Resume {
  id: string;
  filename: string;
  created_at: string;
}

interface STARStory {
  requirement: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  reflection: string;
  estimated_duration: string;
}

interface RedFlag {
  question: string;
  answer: string;
  key_message: string;
}

interface CaseStudy {
  project: string;
  framing: string;
  key_points: string[];
  potential_questions: string[];
}

interface QuestionToAsk {
  category: string;
  question: string;
  why_good: string;
}

interface InterviewPrepResult {
  id: string;
  star_stories: STARStory[];
  red_flags: RedFlag[];
  case_study: CaseStudy;
  questions_to_ask: QuestionToAsk[];
  created_at: string;
}

type Tab = 'star' | 'redflags' | 'casestudy' | 'questions';
type Mode = 'evaluation' | 'jd';

export default function InterviewPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedEvalId, setSelectedEvalId] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [loadingEvals, setLoadingEvals] = useState(true);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<InterviewPrepResult | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('star');
  const [expandedStories, setExpandedStories] = useState<Set<number>>(new Set([0]));
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [mode, setMode] = useState<Mode>('evaluation');

  // JD mode inputs
  const [jdCompany, setJdCompany] = useState('');
  const [jdRole, setJdRole] = useState('');
  const [jdText, setJdText] = useState('');

  useEffect(() => {
    loadEvaluations();
    loadResumes();
  }, []);

  const loadEvaluations = async () => {
    setLoadingEvals(true);
    try {
      const data = await apiClient.listEvaluations();
      if (Array.isArray(data)) {
        setEvaluations(data);
        if (data.length > 0) {
          setSelectedEvalId(data[0].id);
          checkExistingPrep(data[0].id);
        }
      }
    } catch (err: any) {
      console.error('Failed to load evaluations:', err);
    } finally {
      setLoadingEvals(false);
    }
  };

  const loadResumes = async () => {
    setLoadingResumes(true);
    try {
      const data = await apiClient.listResumes();
      const list = data?.resumes || [];
      setResumes(list);
      if (list.length > 0) setSelectedResumeId(list[0].id);
    } catch (err: any) {
      console.error('Failed to load resumes:', err);
    } finally {
      setLoadingResumes(false);
    }
  };

  const checkExistingPrep = async (evalId: string) => {
    setCheckingExisting(true);
    try {
      const data = await apiClient.getInterviewPrepByEvaluation(evalId);
      if (data?.id) {
        setResult(data);
      }
    } catch {
      // No existing prep, that's fine
    } finally {
      setCheckingExisting(false);
    }
  };

  const handleSelectEvaluation = (evalId: string) => {
    setSelectedEvalId(evalId);
    setResult(null);
    setError('');
    checkExistingPrep(evalId);
  };

  const handleGenerate = async () => {
    setError('');
    setGenerating(true);
    try {
      let evalId = selectedEvalId;

      if (mode === 'jd') {
        if (!selectedResumeId || !jdCompany.trim() || !jdRole.trim() || !jdText.trim()) {
          setError('Please fill in company, role, job description, and select a resume.');
          setGenerating(false);
          return;
        }
        const evData = await apiClient.createEvaluation(
          selectedResumeId,
          jdText,
          jdCompany,
          jdRole
        );
        evalId = evData?.evaluation?.id || evData?.id;
        if (!evalId) {
          setError('Failed to create evaluation from job description.');
          setGenerating(false);
          return;
        }
      }

      if (!evalId) {
        setError('Please select an evaluation or enter job details.');
        setGenerating(false);
        return;
      }

      const data = await apiClient.generateInterviewPrep(evalId);
      if (data?.id) {
        setResult(data);
        setActiveTab('star');
        setExpandedStories(new Set([0]));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate interview prep');
    } finally {
      setGenerating(false);
    }
  };

  const toggleStory = (idx: number) => {
    setExpandedStories((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const selectedEval = evaluations.find((e) => e.id === selectedEvalId);
  const matchScore = selectedEval ? Math.round(selectedEval.global_score * 20) : 0;

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'star', label: 'STAR Stories', icon: <Star className="w-4 h-4" />, count: result?.star_stories?.length || 0 },
    { key: 'redflags', label: 'Red Flags', icon: <AlertTriangle className="w-4 h-4" />, count: result?.red_flags?.length || 0 },
    { key: 'casestudy', label: 'Case Study', icon: <Briefcase className="w-4 h-4" />, count: result?.case_study ? 1 : 0 },
    { key: 'questions', label: 'Questions to Ask', icon: <MessageCircle className="w-4 h-4" />, count: result?.questions_to_ask?.length || 0 },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      <Sidebar />
      <main className="lg:ml-[260px] min-h-screen">
        <div className="max-w-[900px] mx-auto px-6 py-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-medium text-[#E8E8ED]">Interview Prep</h1>
              <p className="text-[#8A8F98] text-sm mt-1">
                AI-generated STAR stories, red flags, and practice questions
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-[#60A5FA] hover:text-[#3B82F6] text-sm transition-colors duration-150 flex items-center gap-1"
            >
              Back to Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pro Teaser */}
          <div className="mb-6 p-4 bg-[#1A1A24] rounded-lg border border-[#3B82F6]/[0.15] flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center shrink-0">
              <Mic className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#E8E8ED]">Voice Mock Interview</span>
                <span className="text-[10px] px-2 py-0.5 bg-[#3B82F6]/[0.15] text-[#60A5FA] rounded-full border border-[#3B82F6]/[0.25] flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Pro
                </span>
              </div>
              <p className="text-xs text-[#8A8F98] mt-0.5">
                Practice with AI-generated voice questions. Coming soon for Pro subscribers.
              </p>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-1 mb-4 bg-[#12121A] rounded-lg p-1 border border-white/[0.06] w-fit">
            <button
              onClick={() => { setMode('evaluation'); setResult(null); setError(''); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                mode === 'evaluation'
                  ? 'bg-[#3B82F6]/[0.15] text-[#60A5FA]'
                  : 'text-[#8A8F98] hover:text-[#E8E8ED]'
              }`}
            >
              <FileText className="w-4 h-4" />
              From Evaluation
            </button>
            <button
              onClick={() => { setMode('jd'); setResult(null); setError(''); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                mode === 'jd'
                  ? 'bg-[#3B82F6]/[0.15] text-[#60A5FA]'
                  : 'text-[#8A8F98] hover:text-[#E8E8ED]'
              }`}
            >
              <Building2 className="w-4 h-4" />
              From Job Description
            </button>
          </div>

          {/* Input Panel */}
          <div className="bg-[#1A1A24] rounded-lg border border-white/[0.06] p-6 mb-6">
            {mode === 'evaluation' ? (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">
                  Select Job Evaluation
                </label>
                {loadingEvals ? (
                  <div className="flex items-center gap-2 text-[#8A8F98] text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading evaluations...
                  </div>
                ) : evaluations.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-[#8A8F98] text-sm mb-3">No evaluations found.</p>
                    <Link
                      href="/generate"
                      className="inline-block px-4 py-2 bg-[#3B82F6] hover:bg-[#60A5FA] text-white rounded-md text-sm font-medium transition-all duration-150"
                    >
                      Create an Evaluation First
                    </Link>
                  </div>
                ) : (
                  <>
                    <select
                      value={selectedEvalId}
                      onChange={(e) => handleSelectEvaluation(e.target.value)}
                      className="w-full px-4 py-3 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
                    >
                      {evaluations.map((e) => (
                        <option key={e.id} value={e.id} className="bg-[#1A1A24]">
                          {e.role} at {e.company} — Match: {Math.round(e.global_score * 20)}%
                        </option>
                      ))}
                    </select>
                    {selectedEval && (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-[#8A8F98]">Match Score:</span>
                        <span className={`font-medium ${matchScore >= 80 ? 'text-[#00D26A]' : matchScore >= 50 ? 'text-[#F59E0B]' : 'text-[#EF4444]'}`}>
                          {matchScore}%
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Company *</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A5E66]" />
                      <input
                        type="text"
                        value={jdCompany}
                        onChange={(e) => setJdCompany(e.target.value)}
                        placeholder="e.g. Stripe"
                        className="w-full pl-10 pr-4 py-2.5 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Role *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A5E66]" />
                      <input
                        type="text"
                        value={jdRole}
                        onChange={(e) => setJdRole(e.target.value)}
                        placeholder="e.g. Senior Frontend Engineer"
                        className="w-full pl-10 pr-4 py-2.5 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Select Resume *</label>
                  {loadingResumes ? (
                    <div className="flex items-center gap-2 text-[#8A8F98] text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading resumes...
                    </div>
                  ) : resumes.length === 0 ? (
                    <Link
                      href="/upload"
                      className="inline-block px-4 py-2 bg-[#3B82F6] hover:bg-[#60A5FA] text-white rounded-md text-sm font-medium transition-all duration-150"
                    >
                      Upload a Resume First
                    </Link>
                  ) : (
                    <select
                      value={selectedResumeId}
                      onChange={(e) => setSelectedResumeId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150"
                    >
                      {resumes.map((r) => (
                        <option key={r.id} value={r.id} className="bg-[#1A1A24]">
                          {r.filename}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Job Description *</label>
                  <textarea
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    placeholder="Paste the full job description here..."
                    rows={6}
                    className="w-full px-4 py-2.5 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150 resize-y"
                  />
                </div>
              </div>
            )}

            {(mode === 'evaluation' ? evaluations.length > 0 : resumes.length > 0) && (
              <button
                onClick={handleGenerate}
                disabled={generating || checkingExisting}
                className="mt-4 w-full py-3 px-4 bg-[#3B82F6] hover:bg-[#60A5FA] disabled:opacity-50 text-white rounded-md font-medium transition-all duration-150 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {mode === 'jd' ? 'Creating Evaluation & Generating Prep...' : 'Generating Interview Prep...'}
                  </>
                ) : checkingExisting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Checking existing prep...
                  </>
                ) : result ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Regenerate Interview Prep
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Interview Prep
                  </>
                )}
              </button>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="animate-fade-in">
              {/* Tabs */}
              <div className="flex gap-1 mb-6 bg-[#12121A] rounded-lg p-1 border border-white/[0.06]">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-sm font-medium transition-all duration-150 ${
                      activeTab === tab.key
                        ? 'bg-[#3B82F6]/[0.15] text-[#60A5FA] shadow-[0_0_16px_rgba(59,130,246,0.12)]'
                        : 'text-[#8A8F98] hover:text-[#E8E8ED] hover:bg-white/[0.02]'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.key ? 'bg-[#3B82F6]/[0.25] text-[#60A5FA]' : 'bg-white/[0.06] text-[#5A5E66]'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* STAR Stories */}
              {activeTab === 'star' && (
                <div className="space-y-3">
                  {result.star_stories.map((story, idx) => (
                    <div
                      key={idx}
                      className="bg-[#1A1A24] rounded-lg border border-white/[0.06] overflow-hidden"
                    >
                      <button
                        onClick={() => toggleStory(idx)}
                        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors duration-150 text-left"
                      >
                        <div>
                          <div className="text-xs text-[#5A5E66] mb-0.5 uppercase tracking-wider">
                            {story.requirement}
                          </div>
                          <div className="text-sm font-medium text-[#E8E8ED]">
                            {story.title}
                          </div>
                        </div>
                        {expandedStories.has(idx) ? (
                          <ChevronUp className="w-4 h-4 text-[#5A5E66] shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#5A5E66] shrink-0" />
                        )}
                      </button>
                      {expandedStories.has(idx) && (
                        <div className="px-4 pb-4 space-y-3 animate-fade-in">
                          <div className="grid grid-cols-1 gap-2">
                            <StarSection label="Situation" content={story.situation} />
                            <StarSection label="Task" content={story.task} />
                            <StarSection label="Action" content={story.action} />
                            <StarSection label="Result" content={story.result} highlight />
                          </div>
                          <div className="p-3 bg-[#12121A] rounded-md border border-white/[0.06]">
                            <span className="text-xs text-[#5A5E66] uppercase tracking-wider">Reflection</span>
                            <p className="text-sm text-[#8A8F98] mt-1">{story.reflection}</p>
                          </div>
                          <div className="text-xs text-[#5A5E66]">
                            Estimated duration: {story.estimated_duration}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Red Flags */}
              {activeTab === 'redflags' && (
                <div className="space-y-3">
                  {result.red_flags.map((rf, idx) => (
                    <div
                      key={idx}
                      className="bg-[#1A1A24] rounded-lg border border-white/[0.06] p-4"
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-[#F59E0B] mt-0.5 shrink-0" />
                        <div className="space-y-2 flex-1">
                          <p className="text-sm font-medium text-[#E8E8ED]">{rf.question}</p>
                          <div className="p-3 bg-[#12121A] rounded-md border border-white/[0.06]">
                            <span className="text-xs text-[#5A5E66] uppercase tracking-wider">Answer</span>
                            <p className="text-sm text-[#8A8F98] mt-1">{rf.answer}</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-xs text-[#00D26A] font-medium shrink-0">Key Message:</span>
                            <span className="text-xs text-[#8A8F98]">{rf.key_message}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Case Study */}
              {activeTab === 'casestudy' && result.case_study && (
                <div className="bg-[#1A1A24] rounded-lg border border-white/[0.06] p-6 space-y-6">
                  <div>
                    <span className="text-xs text-[#5A5E66] uppercase tracking-wider">Project</span>
                    <h3 className="text-lg font-medium text-[#E8E8ED] mt-1">{result.case_study.project}</h3>
                  </div>
                  <div>
                    <span className="text-xs text-[#5A5E66] uppercase tracking-wider">Framing</span>
                    <p className="text-sm text-[#8A8F98] mt-1 leading-relaxed">{result.case_study.framing}</p>
                  </div>
                  <div>
                    <span className="text-xs text-[#5A5E66] uppercase tracking-wider">Key Points</span>
                    <ul className="mt-2 space-y-1.5">
                      {result.case_study.key_points.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#8A8F98]">
                          <span className="text-[#3B82F6] mt-0.5 shrink-0">—</span>
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-xs text-[#5A5E66] uppercase tracking-wider">Potential Questions</span>
                    <ul className="mt-2 space-y-1.5">
                      {result.case_study.potential_questions.map((q, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#8A8F98]">
                          <span className="text-[#F59E0B] mt-0.5 shrink-0">?</span>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Questions to Ask */}
              {activeTab === 'questions' && (
                <div className="space-y-3">
                  {result.questions_to_ask.map((q, idx) => (
                    <div
                      key={idx}
                      className="bg-[#1A1A24] rounded-lg border border-white/[0.06] p-4"
                    >
                      <div className="flex items-start gap-3">
                        <MessageCircle className="w-5 h-5 text-[#3B82F6] mt-0.5 shrink-0" />
                        <div className="space-y-1 flex-1">
                          <span className="text-xs text-[#5A5E66] uppercase tracking-wider">{q.category}</span>
                          <p className="text-sm font-medium text-[#E8E8ED]">{q.question}</p>
                          <p className="text-xs text-[#8A8F98]">{q.why_good}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Empty state when no result yet */}
          {!result && !generating && !checkingExisting && (mode === 'evaluation' ? evaluations.length > 0 : resumes.length > 0) && (
            <div className="text-center py-16">
              <Sparkles className="w-12 h-12 text-[#5A5E66] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#E8E8ED] mb-2">Ready to Prep</h3>
              <p className="text-sm text-[#8A8F98] max-w-md mx-auto">
                {mode === 'evaluation'
                  ? 'Select a job evaluation above and click generate to create STAR stories, red flag answers, case study framing, and questions to ask.'
                  : 'Fill in the job details above and click generate to create interview prep tailored to this role.'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StarSection({ label, content, highlight = false }: { label: string; content: string; highlight?: boolean }) {
  return (
    <div className={`p-3 rounded-md border ${highlight ? 'bg-[#00D26A]/[0.06] border-[#00D26A]/[0.15]' : 'bg-[#12121A] border-white/[0.06]'}`}>
      <span className={`text-xs uppercase tracking-wider ${highlight ? 'text-[#00D26A]' : 'text-[#5A5E66]'}`}>
        {label}
      </span>
      <p className="text-sm text-[#8A8F98] mt-1">{content}</p>
    </div>
  );
}
