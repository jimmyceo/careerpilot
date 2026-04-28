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
  return JSON.stringify(data);
}

async function handleResponse(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(extractError(data) || `HTTP ${res.status}`);
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
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await handleResponse(res);
    if (data.access_token) setAuthToken(data.access_token);
    return data;
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(res);
    if (data.access_token) setAuthToken(data.access_token);
    return data;
  },

  async getCurrentUser() {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  // ============ RESUME ============
  async uploadResume(email: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', email);
    const res = await fetch(`${API_BASE_URL}/api/resume/upload`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData,
    });
    return res.json();
  },

  async analyzeResume(resumeId: string) {
    const res = await fetch(`${API_BASE_URL}/api/resume/analyze`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ resume_id: resumeId }),
    });
    return res.json();
  },

  // ============ CV ============
  async generateCV(resumeId: string, jobTitle: string, company: string, jobDescription: string) {
    const res = await fetch(`${API_BASE_URL}/api/cv/generate`, {
      method: 'POST',
      headers: jsonHeaders(),
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
    const res = await fetch(`${API_BASE_URL}/api/cv/user/${userId}`, {
      headers: authHeaders(),
    });
    return res.json();
  },

  async downloadCV(cvId: string) {
    window.open(`${API_BASE_URL}/api/cv/${cvId}/download`, '_blank');
  },

  // ============ EVALUATION ============
  async createEvaluation(resumeId: string, jobDescription: string, company: string, jobTitle: string, jobUrl?: string) {
    const res = await fetch(`${API_BASE_URL}/api/evaluate/`, {
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
    return res.json();
  },

  async listEvaluations() {
    const res = await fetch(`${API_BASE_URL}/api/evaluate/`, {
      headers: authHeaders(),
    });
    return res.json();
  },

  // ============ SUBSCRIPTIONS (canonical) ============
  async getPlans() {
    const res = await fetch(`${API_BASE_URL}/api/subscriptions/plans`);
    return res.json();
  },

  async getCurrentSubscription(userId: string) {
    const res = await fetch(`${API_BASE_URL}/api/subscriptions/current?user_id=${userId}`);
    return res.json();
  },

  async createCheckout(tier: string, userId: string, email: string) {
    const res = await fetch(`${API_BASE_URL}/api/subscriptions/create-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier, user_id: userId, email }),
    });
    return res.json();
  },

  async cancelSubscription(userId: string, atPeriodEnd: boolean = true) {
    const res = await fetch(`${API_BASE_URL}/api/subscriptions/cancel`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ user_id: userId, at_period_end: atPeriodEnd }),
    });
    return res.json();
  },

  async getUsageSummary(userId: string) {
    const res = await fetch(`${API_BASE_URL}/api/subscriptions/usage?user_id=${userId}`);
    return res.json();
  },

  // ============ LEGACY COMPATIBILITY ============
  async checkPaymentStatus(email: string) {
    // Fallback to v2 legacy endpoint for backward compatibility
    const res = await fetch(`${API_BASE_URL}/api/payment/v2/status/${email}`, {
      headers: authHeaders(),
    });
    return res.json();
  },
};
