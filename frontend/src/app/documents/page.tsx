'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import { apiClient } from '@/lib/api';
import {
  FileText,
  FileSearch,
  FilePlus,
  Mail,
  MessageSquare,
  Loader2,
  Download,
  Trash2,
  ArrowRight,
  Briefcase,
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface DocumentGroup {
  evaluationId: string;
  company: string;
  jobTitle: string;
  date: string;
  resumeId?: string;
  cvId?: string;
  coverLetterId?: string;
  interviewPrepId?: string;
}

export default function DocumentsPage() {
  const [groups, setGroups] = useState<DocumentGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    setError('');
    try {
      const [evalsRes, cvsRes, coversRes, prepsRes] = await Promise.all([
        apiClient.listEvaluations(),
        apiClient.listCVs(),
        apiClient.listCoverLetters(),
        apiClient.listInterviewPreps().catch(() => ({ status: 'success', preps: [] })),
      ]);

      const evaluations = evalsRes.evaluations || [];
      const cvs = cvsRes.cvs || [];
      const covers = coversRes.cover_letters || [];
      const preps = prepsRes.preps || [];

      const grouped: Record<string, DocumentGroup> = {};

      evaluations.forEach((ev: any) => {
        grouped[ev.id] = {
          evaluationId: ev.id,
          company: ev.company || 'Unknown Company',
          jobTitle: ev.job_title || 'Unknown Role',
          date: ev.created_at?.split('T')[0] || '',
          resumeId: ev.resume_id,
        };
      });

      cvs.forEach((cv: any) => {
        const evId = cv.evaluation_id;
        if (grouped[evId]) {
          grouped[evId].cvId = cv.id;
        }
      });

      covers.forEach((c: any) => {
        const evId = c.evaluation_id;
        if (grouped[evId]) {
          grouped[evId].coverLetterId = c.id;
        }
      });

      preps.forEach((p: any) => {
        const evId = p.evaluation_id;
        if (grouped[evId]) {
          grouped[evId].interviewPrepId = p.id;
        }
      });

      setGroups(Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date)));
    } catch (err: any) {
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async (evId: string) => {
    if (!confirm('Delete all documents for this job?')) return;
    setDeleting(evId);
    setError('');
    try {
      const group = groups.find((g) => g.evaluationId === evId);
      if (!group) return;

      const deletes: Promise<any>[] = [];
      deletes.push(apiClient.deleteEvaluation(evId));
      if (group.cvId) deletes.push(apiClient.deleteCV(group.cvId));
      if (group.coverLetterId) deletes.push(apiClient.deleteCoverLetter(group.coverLetterId));
      if (group.interviewPrepId) deletes.push(apiClient.deleteInterviewPrep(group.interviewPrepId));

      await Promise.all(deletes);
      await loadDocuments();
    } catch (err: any) {
      setError(err.message || 'Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const totalDocs = groups.reduce(
    (sum, g) => sum + (g.cvId ? 1 : 0) + (g.coverLetterId ? 1 : 0) + (g.interviewPrepId ? 1 : 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      <Sidebar />
      <main className="lg:ml-[260px] min-h-screen">
        <div className="max-w-[1200px] mx-auto px-6 py-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-medium text-[#E8E8ED]">My Documents</h1>
              <p className="text-[#8A8F98] text-sm mt-1">
                {groups.length} job evaluations · {totalDocs} generated documents
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-[#60A5FA] hover:text-[#3B82F6] text-sm transition-colors duration-150 flex items-center gap-1"
            >
              Back to Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-[#3B82F6] animate-spin" />
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#3B82F6]/10 flex items-center justify-center">
                <FileText className="w-8 h-8 text-[#3B82F6]" />
              </div>
              <h3 className="text-lg font-medium text-[#E8E8ED] mb-2">No documents yet</h3>
              <p className="text-sm text-[#8A8F98] mb-6">Upload a resume and evaluate a job to generate documents.</p>
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#3B82F6] hover:bg-[#60A5FA] text-white rounded-md text-sm font-medium transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
              >
                Upload Resume <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {groups.map((group) => {
                const isOpen = expanded.has(group.evaluationId);
                const docCount =
                  (group.cvId ? 1 : 0) +
                  (group.coverLetterId ? 1 : 0) +
                  (group.interviewPrepId ? 1 : 0);

                return (
                  <div
                    key={group.evaluationId}
                    className="bg-[#1A1A24] rounded-lg border border-white/[0.06] overflow-hidden"
                  >
                    {/* Header */}
                    <button
                      onClick={() => toggleExpand(group.evaluationId)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5 text-[#3B82F6]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#E8E8ED] truncate">{group.jobTitle}</p>
                        <p className="text-xs text-[#8A8F98] truncate">{group.company}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-[#5A5E66]">{docCount} docs</span>
                        <span className="text-xs text-[#5A5E66] flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {group.date}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(group.evaluationId); }}
                          disabled={deleting === group.evaluationId}
                          className="p-1.5 text-[#5A5E66] hover:text-[#EF4444] transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-[#5A5E66]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#5A5E66]" />
                        )}
                      </div>
                    </button>

                    {/* Documents Grid */}
                    {isOpen && (
                      <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {group.cvId && (
                          <DocumentCard
                            type="cv"
                            title="Tailored CV"
                            href={`/generate?cv=${group.cvId}`}
                            onDownload={() => apiClient.downloadCV(group.cvId!)}
                          />
                        )}
                        {group.coverLetterId && (
                          <DocumentCard
                            type="cover"
                            title="Cover Letter"
                            href={`/cover-letter?id=${group.coverLetterId}`}
                            onDownload={() => apiClient.downloadCoverLetter(group.coverLetterId!)}
                          />
                        )}
                        {group.interviewPrepId && (
                          <DocumentCard
                            type="interview"
                            title="Interview Prep"
                            href={`/interview?id=${group.interviewPrepId}`}
                          />
                        )}
                        {!group.cvId && !group.coverLetterId && !group.interviewPrepId && (
                          <p className="text-sm text-[#5A5E66] col-span-full py-2">
                            No documents generated yet for this evaluation.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function DocumentCard({
  type,
  title,
  href,
  onDownload,
}: {
  type: 'cv' | 'cover' | 'interview';
  title: string;
  href: string;
  onDownload?: () => void;
}) {
  const icons = {
    cv: FilePlus,
    cover: Mail,
    interview: MessageSquare,
  };
  const Icon = icons[type];

  return (
    <div className="bg-[#12121A] rounded-lg border border-white/[0.06] p-4 hover:border-white/[0.10] transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-md bg-[#3B82F6]/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#60A5FA]" />
        </div>
        <span className="text-sm font-medium text-[#E8E8ED]">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={href}
          className="flex-1 text-center py-2 text-xs font-medium text-[#60A5FA] hover:text-[#3B82F6] bg-[#3B82F6]/10 hover:bg-[#3B82F6]/15 rounded-md transition-colors flex items-center justify-center gap-1"
        >
          View <ExternalLink className="w-3 h-3" />
        </Link>
        {onDownload && (
          <button
            onClick={onDownload}
            className="p-2 text-[#5A5E66] hover:text-[#E8E8ED] bg-white/[0.02] hover:bg-white/[0.04] rounded-md transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
