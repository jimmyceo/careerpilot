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
  const colors = ['#EF4444', '#F59E0B', '#00D26A', '#00D26A'];
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
  const [rememberMe, setRememberMe] = useState(false);

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
        data = await apiClient.login(email, password, rememberMe);
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
    `w-full px-4 py-3 rounded-md bg-white/[0.02] border text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150 ${
      touched[field] && validate().some((e) => e.toLowerCase().includes(field))
        ? 'border-[#EF4444]'
        : 'border-white/[0.08]'
    }`;

  return (
    <div className="min-h-screen flex bg-[#0B0B0F]">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#12121A] relative flex-col justify-between p-12 text-white overflow-hidden border-r border-white/[0.06]">
        {/* Decorative gradient shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3B82F6] rounded-full blur-[120px] opacity-10 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#3B82F6] rounded-full blur-[100px] opacity-5 translate-y-1/3 -translate-x-1/4" />

        {/* Top Logo */}
        <div className="relative z-10">
          <Link href="/" className="text-2xl font-medium tracking-tight text-[#E8E8ED]">
            Hunt-X
          </Link>
        </div>

        {/* Center Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h2 className="text-5xl font-medium tracking-tight mb-4 text-[#E8E8ED]" style={{ letterSpacing: '-0.96px', lineHeight: 1.0 }}>
            {isLogin ? 'Welcome Back.' : 'Start Here.'}
          </h2>
          <p className="text-lg text-[#8A8F98] mb-12">
            Your autonomous career agent is ready.
          </p>

          {/* AI Activity Indicator */}
          <div className="flex items-center gap-2 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B82F6] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3B82F6]" />
            </span>
            <span className="text-xs text-[#60A5FA] font-mono">AGENT ACTIVE — SCANNING 12,421 JOBS</span>
          </div>

          {/* Testimonial */}
          <div className="border-l-2 border-[#3B82F6] pl-6">
            <p className="text-sm italic text-[#8A8F98] leading-relaxed mb-3">
              "Hunt-X helped me land 3 interviews in my first week. The AI-generated CVs are incredible."
            </p>
            <p className="text-xs text-[#5A5E66]">
              — Sarah K., Product Designer
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs text-[#5A5E66]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Career Agent</span>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="text-2xl font-medium tracking-tight text-[#E8E8ED]">
              Hunt-X
            </Link>
          </div>

          <div className="bg-[#1A1A24] rounded-lg p-8 border border-white/[0.06]">
            {/* Tab Toggle */}
            <div className="flex mb-8 border-b border-white/[0.06]">
              <button
                onClick={() => { setIsLogin(false); setError(''); setTouched({}); }}
                className={`flex-1 pb-3 text-sm font-medium transition-colors duration-150 relative ${
                  !isLogin ? 'text-[#E8E8ED]' : 'text-[#5A5E66] hover:text-[#8A8F98]'
                }`}
              >
                Create Account
                {!isLogin && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B82F6] rounded-full" />}
              </button>
              <button
                onClick={() => { setIsLogin(true); setError(''); setTouched({}); }}
                className={`flex-1 pb-3 text-sm font-medium transition-colors duration-150 relative ${
                  isLogin ? 'text-[#E8E8ED]' : 'text-[#5A5E66] hover:text-[#8A8F98]'
                }`}
              >
                Sign In
                {isLogin && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B82F6] rounded-full" />}
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">
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
                <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">
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
                <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A5E66] hover:text-[#8A8F98] transition-colors duration-150 p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Remember Me */}
                {isLogin && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-white/[0.08] bg-white/[0.02] text-[#3B82F6] focus:ring-[#3B82F6]/20"
                    />
                    <span className="text-sm text-[#8A8F98]">Remember me for 30 days</span>
                  </label>
                )}

                {/* Password Strength */}
                {!isLogin && password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-300 rounded-full"
                          style={{
                            width: `${(strength.score / 4) * 100}%`,
                            backgroundColor: strength.color,
                          }}
                        />
                      </div>
                      <span className="text-xs text-[#5A5E66]">{strength.label}</span>
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
                          className={`flex items-center gap-1 text-xs transition-colors duration-150 ${
                            req.test ? 'text-[#00D26A]' : 'text-[#5A5E66]'
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
                    className="text-xs text-[#60A5FA] hover:text-[#3B82F6] transition-colors duration-150"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              {!isLogin && (
                <p className="text-xs text-[#5A5E66]">
                  By signing up, you agree to our{' '}
                  <Link href="#" className="text-[#60A5FA] hover:text-[#3B82F6] transition-colors duration-150">Terms</Link>
                  {' '}and{' '}
                  <Link href="#" className="text-[#60A5FA] hover:text-[#3B82F6] transition-colors duration-150">Privacy Policy</Link>.
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#3B82F6] hover:bg-[#60A5FA] text-white rounded-md font-medium transition-all duration-150 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
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
                className="text-sm text-[#5A5E66] hover:text-[#8A8F98] transition-colors duration-150"
              >
                {isLogin ? (
                  <>Don&apos;t have an account? <span className="text-[#60A5FA]">Sign up</span></>
                ) : (
                  <>Already have an account? <span className="text-[#60A5FA]">Sign in</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
