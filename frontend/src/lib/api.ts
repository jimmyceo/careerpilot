// Use production backend unless running locally
const isLocal = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
);
const API_BASE_URL = isLocal
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
  : (process.env.NEXT_PUBLIC_API_URL || 'https://hunt-x-production-2954.up.railway.app');

function extractError(data: any): string {
  if (typeof data.detail === 'string') return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail.map((e: any) => e.msg || String(e)).join('; ');
  }
  if (data.message) return data.message;
  if (data.status === 'error' && data.code) return `${data.message || 'Request failed'} (HTTP ${data.code})`;
  return JSON.stringify(data);
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. The server may be down.');
    }
    throw new Error('Network error. Please check your connection.');
  } finally {
    clearTimeout(id);
  }
}

async function handleResponse(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = extractError(data);
    if (res.status === 404 && msg.includes('Application not found')) {
      throw new Error('Backend server is unavailable. Please try again later.');
    }
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return data;
}

export const setAuthToken = (token: string | null) => {
  if (typeof window !== 'undefined' && token) localStorage.setItem('token', token);
  else if (typeof window !== 'undefined') localStorage.removeItem('token');
};

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') return localStorage.getItem('token');
  return null;
};

const authHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const jsonHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const apiClient = {
  baseURL: API_BASE_URL,

  // ============ AUTH ============
  async register(email: string, password: string, name?: string) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await handleResponse(res);
    if (data.access_token) setAuthToken(data.access_token);
    return data;
  },

  async login(email: string, password: string, rememberMe: boolean = false) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, remember_me: rememberMe }),
    });
    const data = await handleResponse(res);
    if (data.access_token) setAuthToken(data.access_token);
    return data;
  },

  async getCurrentUser() {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/auth/me`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  async verifyEmail(code: string) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/auth/verify-email`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ code }),
    });
    return handleResponse(res);
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    return handleResponse(res);
  },

  async resendVerification() {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/auth/resend-verification`, {
      method: 'POST',
      headers: jsonHeaders(),
    });
    return handleResponse(res);
  },

  // ============ RESUME ============
  async uploadResume(file: File, email: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', email);
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/resume/upload`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData,
    });
    return handleResponse(res);
  },

  async listResumes() {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/resume/`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  async getResume(resumeId: string) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/resume/${resumeId}`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  // ============ EVALUATION ============
  async createEvaluation(resumeId: string, jobDescription: string, company: string, jobTitle: string, jobUrl?: string) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/evaluate/`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({
        resume_id: resumeId,
        job_description: jobDescription,
        company,
        job_title: jobTitle,
        job_url: jobUrl,
      }),
    });
    return handleResponse(res);
  },

  async getEvaluation(evaluationId: string) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/evaluate/${evaluationId}`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  async listEvaluations() {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/evaluate/`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  // ============ CV ============
  async generateCV(evaluationId: string, template?: string) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/cv/generate`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({
        evaluation_id: evaluationId,
        template,
      }),
    });
    return handleResponse(res);
  },

  async getCV(cvId: string) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/cv/${cvId}`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  async listCVs() {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/cv/`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  async downloadCV(cvId: string) {
    window.open(`${API_BASE_URL}/api/cv/${cvId}/download`, '_blank');
  },

  // ============ SUBSCRIPTIONS (canonical) ============
  async getPlans() {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/subscriptions/plans`);
    return handleResponse(res);
  },

  async getCurrentSubscription() {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/subscriptions/current`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  async getUsageSummary() {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/subscriptions/usage`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  async checkFeature(feature: string) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/subscriptions/check-feature`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ feature }),
    });
    return handleResponse(res);
  },

  async consumeFeature(feature: string, amount: number = 1) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/subscriptions/consume-feature`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ feature, amount }),
    });
    return handleResponse(res);
  },

  async createCheckout(tier: string) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/subscriptions/create-checkout`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ tier }),
    });
    return handleResponse(res);
  },

  async cancelSubscription(atPeriodEnd: boolean = true) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/subscriptions/cancel`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ at_period_end: atPeriodEnd }),
    });
    return handleResponse(res);
  },

  async updateProfile(name: string, phone?: string, location?: string, linkedin_url?: string, github_url?: string) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/auth/me`, {
      method: 'PUT',
      headers: jsonHeaders(),
      body: JSON.stringify({ name, phone, location, linkedin_url, github_url }),
    });
    return handleResponse(res);
  },

  // ============ PASSWORD RESET ============
  async forgotPassword(email: string) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse(res);
  },

  async resetPassword(token: string, newPassword: string) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: newPassword }),
    });
    return handleResponse(res);
  },

  // ============ INTERVIEW PREP ============
  async generateInterviewPrep(evaluationId: string) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/interview/prep`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ evaluation_id: evaluationId }),
    });
    return handleResponse(res);
  },

  async getInterviewPrep(prepId: string) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/interview/${prepId}`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  async getInterviewPrepByEvaluation(evaluationId: string) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/interview/evaluation/${evaluationId}`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  async listInterviewPreps() {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/interview/`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  // ============ APPLICATIONS ============
  async listApplications() {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/applications/`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  async createApplication(data: { company: string; role: string; stage?: string; date?: string; notes?: string; url?: string; salary?: string; location?: string }) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/applications/`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateApplication(appId: string, data: Partial<{ company: string; role: string; stage: string; date: string; notes: string; url: string; salary: string; location: string }>) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/applications/${appId}`, {
      method: 'PUT',
      headers: jsonHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteApplication(appId: string) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/applications/${appId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  // ============ COVER LETTERS ============
  async generateCoverLetter(evaluationId: string, hiringManagerName?: string, shortVersion?: boolean) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/cover-letter/generate`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({
        evaluation_id: evaluationId,
        hiring_manager_name: hiringManagerName,
        short_version: shortVersion,
      }),
    });
    return handleResponse(res);
  },

  async listCoverLetters() {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/cover-letter/list`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  async downloadCoverLetter(coverId: string) {
    window.open(`${API_BASE_URL}/api/cover-letter/${coverId}/download`, '_blank');
  },

  // ============ JOBS ============
  async scanJobs(maxResults: number = 20, minMatch: number = 3.0) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/jobs/scan`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ max_results_per_portal: maxResults, min_match_score: minMatch }),
    });
    return handleResponse(res);
  },

  async searchJobs(query: string, location: string = 'Remote', country: string = 'us') {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/jobs/search?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&country=${country}`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  async saveJob(jobId: string) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/jobs/${jobId}/save`, {
      method: 'POST',
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  async getSavedJobs() {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/jobs/saved`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  // ============ CHAT / AI CAREER COACH ============
  async startChat(jobId: string, resumeId: string) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/chat/start`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ job_id: jobId, resume_id: resumeId }),
    });
    return handleResponse(res);
  },

  async askChat(jobId: string, question: string) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/chat/${jobId}/ask`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ question }),
    });
    return handleResponse(res);
  },

  async getChatHistory(jobId: string) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/chat/${jobId}/history`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  async clearChat(jobId: string) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/chat/${jobId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  // ============ FEEDBACK ============
  async submitFeedback(rating: number, text?: string, reviewerName?: string, reviewerRole?: string) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/feedback/`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ rating, text, reviewer_name: reviewerName, reviewer_role: reviewerRole }),
    });
    return handleResponse(res);
  },

  async getApprovedFeedback(limit: number = 10) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/feedback/approved?limit=${limit}`);
    return handleResponse(res);
  },

  // ============ LEGACY COMPATIBILITY ============
  async checkPaymentStatus(email: string) {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/payment/v2/status/${email}`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },
};
