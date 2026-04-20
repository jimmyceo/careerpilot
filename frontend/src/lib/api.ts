// API client configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hunt-x-production.up.railway.app';

export const apiClient = {
  baseURL: API_BASE_URL,

  async uploadResume(email: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', email);

    const res = await fetch(`${API_BASE_URL}/api/resume/upload`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },

  async analyzeResume(resumeId: string) {
    const res = await fetch(`${API_BASE_URL}/api/resume/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume_id: resumeId }),
    });
    return res.json();
  },

  async generateCV(resumeId: string, jobTitle: string, company: string, jobDescription: string) {
    const res = await fetch(`${API_BASE_URL}/api/cv/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resume_id: resumeId,
        job_title: jobTitle,
        company: company,
        job_description: jobDescription,
      }),
    });
    return res.json();
  },

  async getUserCVs(userId: string) {
    const res = await fetch(`${API_BASE_URL}/api/cv/user/${userId}`);
    return res.json();
  },

  async downloadCV(cvId: string) {
    window.open(`${API_BASE_URL}/api/cv/${cvId}/download`, '_blank');
  },

  async checkPaymentStatus(email: string) {
    const res = await fetch(`${API_BASE_URL}/api/payment/status/${email}`);
    return res.json();
  },
};
