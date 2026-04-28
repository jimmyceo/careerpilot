'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiClient.forgotPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f9fc] px-4"
      style={{ fontFamily: 'sohne-var, SF Pro Display, system-ui, sans-serif' }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl p-8 border border-[#e5edf5] shadow-[0_15px_35px_rgba(23,23,23,0.08)]">
          <Link href="/auth" className="inline-flex items-center gap-1 text-sm text-[#64748d] hover:text-[#061b31] transition mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>

          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-[#15be53] mx-auto mb-4" />
              <h2 className="text-xl font-light text-[#061b31] mb-2">Check your email</h2>
              <p className="text-[#64748d] text-sm mb-6">
                If an account exists for <strong className="text-[#061b31]">{email}</strong>, you will receive a password reset link.
              </p>
              <Link href="/auth" className="text-[#533afd] hover:text-[#4128c9] text-sm">
                Return to sign in
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-light text-[#061b31] mb-2">Reset Password</h2>
              <p className="text-[#64748d] text-sm mb-6">
                Enter your email address and we will send you a link to reset your password.
              </p>

              {error && (
                <div className="mb-4 p-4 rounded-lg bg-[#ea2261]/10 border border-[#ea2261]/20 text-[#ea2261] text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#273951] mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white border border-[#e5edf5] text-[#061b31] placeholder:text-[#64748d]/50 focus:outline-none focus:border-[#533afd] focus:ring-1 focus:ring-[#533afd]/20 transition"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-[#533afd] hover:bg-[#4338ca] text-white rounded-lg font-medium transition disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
