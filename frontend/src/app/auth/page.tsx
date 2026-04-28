'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Sparkles, Check, X, ArrowRight } from 'lucide-react';
import { apiClient, setAuthToken } from '@/lib/api';

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#ea2261', '#9b6829', '#15be53', '#15be53'];
  return { score, label: labels[Math.min(score, 3)], color: colors[Math.min(score, 3)] };
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const validate = () => {
    const errs: string[] = [];
    if (!email.trim()) errs.push('Email is required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.push('Invalid email address');
    if (!password) errs.push('Password is required');
    else if (password.length < 6) errs.push('Password must be at least 6 characters');
    if (!isLogin && !name.trim()) errs.push('Name is required');
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTouched({ email: true, password: true, name: true });

    const errs = validate();
    if (errs.length > 0) {
      setError(errs[0]);
      return;
    }

    setLoading(true);
    try {
      let data;
      if (isLogin) {
        data = await apiClient.login(email, password);
      } else {
        data = await apiClient.register(email, password, name);
      }

      if (data.access_token) {
        setAuthToken(data.access_token);
        window.location.href = '/upload';
      } else {
        setError('Unexpected response from server');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-lg bg-white border text-[#061b31] placeholder:text-[#64748d]/50 focus:outline-none focus:border-[#533afd] focus:ring-1 focus:ring-[#533afd]/20 transition ${
      touched[field] && validate().some((e) => e.toLowerCase().includes(field))
        ? 'border-[#ea2261]'
        : 'border-[#e5edf5]'
    }`;

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'sohne-var, SF Pro Display, system-ui, sans-serif' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#1c1e54] relative flex-col justify-between p-12 text-white overflow-hidden">
        {/* Decorative gradient shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#533afd] rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#f96bee] rounded-full blur-[100px] opacity-15 translate-y-1/3 -translate-x-1/4" />

        {/* Top Logo */}
        <div className="relative z-10">
          <Link href="/" className="text-2xl font-normal tracking-tight text-white">
            Hunt-X
          </Link>
        </div>

        {/* Center Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h2 className="text-5xl font-light tracking-tight mb-4" style={{ letterSpacing: '-0.96px' }}>
            {isLogin ? 'Welcome Back.' : 'Start Here.'}
          </h2>
          <p className="text-lg text-white/70 font-light mb-12">
            Your next career move starts here.
          </p>

          {/* Testimonial */}
          <div className="border-l-2 border-[#533afd] pl-6">
            <p className="text-sm italic text-white/50 leading-relaxed mb-3">
              "Hunt-X helped me land 3 interviews in my first week. The AI-generated CVs are incredible."
            </p>
            <p className="text-xs text-white/40">
              — Sarah K., Product Designer
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Job Search</span>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center bg-[#f6f9fc] p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="text-2xl font-normal tracking-tight text-[#061b31]">
              Hunt-X
            </Link>
          </div>

          <div className="bg-white rounded-xl p-8 border border-[#e5edf5] shadow-[0_15px_35px_rgba(23,23,23,0.08)]">
            {/* Tab Toggle */}
            <div className="flex mb-8 border-b border-[#e5edf5]">
              <button
                onClick={() => { setIsLogin(false); setError(''); setTouched({}); }}
                className={`flex-1 pb-3 text-sm font-normal transition relative ${
                  !isLogin ? 'text-[#061b31]' : 'text-[#64748d] hover:text-[#061b31]'
                }`}
              >
                Create Account
                {!isLogin && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#533afd] rounded-full" />}
              </button>
              <button
                onClick={() => { setIsLogin(true); setError(''); setTouched({}); }}
                className={`flex-1 pb-3 text-sm font-normal transition relative ${
                  isLogin ? 'text-[#061b31]' : 'text-[#64748d] hover:text-[#061b31]'
                }`}
              >
                Sign In
                {isLogin && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#533afd] rounded-full" />}
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 rounded-lg bg-[#ea2261]/10 border border-[#ea2261]/20 text-[#ea2261] text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-[#273951] mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                    className={inputClass('name')}
                    placeholder="John Doe"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#273951] mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  className={inputClass('email')}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#273951] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    className={`${inputClass('password')} pr-12`}
                    placeholder="••••••••"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748d] hover:text-[#061b31] transition p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength */}
                {!isLogin && password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-1 bg-[#e5edf5] rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-300 rounded-full"
                          style={{
                            width: `${(strength.score / 4) * 100}%`,
                            backgroundColor: strength.color,
                          }}
                        />
                      </div>
                      <span className="text-xs text-[#64748d]">{strength.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {[
                        { test: password.length >= 8, text: '8+ chars' },
                        { test: /[A-Z]/.test(password), text: 'Uppercase' },
                        { test: /[0-9]/.test(password), text: 'Number' },
                        { test: /[^A-Za-z0-9]/.test(password), text: 'Special char' },
                      ].map((req) => (
                        <span
                          key={req.text}
                          className={`flex items-center gap-1 text-xs transition ${
                            req.test ? 'text-[#15be53]' : 'text-[#64748d]/60'
                          }`}
                        >
                          {req.test ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {req.text}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isLogin && (
                <div className="flex justify-end">
                  <Link
                    href="/auth/reset"
                    className="text-xs text-[#533afd] hover:text-[#4128c9] transition"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              {!isLogin && (
                <p className="text-xs text-[#64748d]">
                  By signing up, you agree to our{' '}
                  <Link href="#" className="text-[#533afd] hover:underline">Terms</Link>
                  {' '}and{' '}
                  <Link href="#" className="text-[#533afd] hover:underline">Privacy Policy</Link>.
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#533afd] hover:bg-[#4338ca] text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setTouched({});
                }}
                className="text-sm text-[#64748d] hover:text-[#061b31] transition"
              >
                {isLogin ? (
                  <>Don&apos;t have an account? <span className="text-[#533afd]">Sign up</span></>
                ) : (
                  <>Already have an account? <span className="text-[#533afd]">Sign in</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
