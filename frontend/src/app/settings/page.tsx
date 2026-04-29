'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { apiClient } from '@/lib/api';
import { useSubscription } from '@/lib/subscription-context';
import {
  Check,
  AlertTriangle,
  User,
  Shield,
  CreditCard,
  Settings,
  Database,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  X,
} from 'lucide-react';

type Tab = 'account' | 'security' | 'billing' | 'preferences' | 'data';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('account');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.getCurrentUser()
      .then((u) => { setUser(u); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'account', label: 'Account', icon: User },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'billing', label: 'Billing', icon: CreditCard },
    { key: 'preferences', label: 'Preferences', icon: Settings },
    { key: 'data', label: 'Data', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      <Sidebar />
      <main className="lg:ml-[260px] min-h-screen">
        <div className="max-w-[800px] mx-auto px-6 py-6">
          <div className="mb-8">
            <h1 className="text-2xl font-medium text-[#E8E8ED]">Settings</h1>
            <p className="text-[#8A8F98] text-sm mt-1">Manage your account, security, and preferences</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-white/[0.06] overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors duration-150 relative shrink-0 ${
                  activeTab === tab.key ? 'text-[#E8E8ED]' : 'text-[#5A5E66] hover:text-[#8A8F98]'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B82F6] rounded-full" />
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-[#3B82F6] animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === 'account' && <AccountTab user={user} onUpdate={setUser} />}
              {activeTab === 'security' && <SecurityTab user={user} />}
              {activeTab === 'billing' && <BillingTab />}
              {activeTab === 'preferences' && <PreferencesTab />}
              {activeTab === 'data' && <DataTab />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

/* ========== Account Tab ========== */
function AccountTab({ user, onUpdate }: { user: any; onUpdate: (u: any) => void }) {
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [linkedin, setLinkedin] = useState(user?.linkedin_url || '');
  const [github, setGithub] = useState(user?.github_url || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const updated = await apiClient.updateProfile(name, phone || undefined, location || undefined, linkedin || undefined, github || undefined);
      onUpdate(updated);
      setMessage('Profile updated successfully');
    } catch (err: any) {
      setMessage(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150';

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="bg-[#1A1A24] rounded-lg border border-white/[0.06] p-6 space-y-5">
        <h2 className="text-lg font-medium text-[#E8E8ED]">Profile Information</h2>

        <div>
          <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Full Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Email</label>
          <div className="flex items-center gap-3">
            <div className="flex-1 px-4 py-3 rounded-md bg-white/[0.02] border border-white/[0.06] text-[#5A5E66] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#5A5E66]" />
              {user?.email || '—'}
            </div>
            {user?.email_verified ? (
              <span className="flex items-center gap-1 text-xs text-[#00D26A] px-2 py-1 bg-[#00D26A]/10 rounded-md">
                <Check className="w-3 h-3" /> Verified
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-[#F59E0B] px-2 py-1 bg-[#F59E0B]/10 rounded-md">
                <AlertTriangle className="w-3 h-3" /> Unverified
              </span>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A5E66]" />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 890" className={`${inputClass} pl-10`} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A5E66]" />
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="San Francisco, CA" className={`${inputClass} pl-10`} />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">LinkedIn</label>
            <div className="relative">
              <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A5E66]" />
              <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." className={`${inputClass} pl-10`} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">GitHub</label>
            <div className="relative">
              <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A5E66]" />
              <input type="url" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/..." className={`${inputClass} pl-10`} />
            </div>
          </div>
        </div>

        {message && (
          <div className={`text-sm flex items-center gap-2 ${message.includes('success') ? 'text-[#00D26A]' : 'text-[#EF4444]'}`}>
            {message.includes('success') ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-[#3B82F6] hover:bg-[#60A5FA] text-white rounded-md font-medium transition-all duration-150 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50 active:scale-[0.98] flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Save Changes
        </button>
      </div>
    </form>
  );
}

/* ========== Security Tab ========== */
function SecurityTab({ user }: { user: any }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      await apiClient.changePassword(currentPassword, newPassword);
      setMessage('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage(err.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150';

  return (
    <div className="space-y-6">
      <div className="bg-[#1A1A24] rounded-lg border border-white/[0.06] p-6 space-y-5">
        <h2 className="text-lg font-medium text-[#E8E8ED]">Change Password</h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A5E66]" />
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className={`${inputClass} pl-10 pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A5E66] hover:text-[#8A8F98] transition-colors"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A5E66]" />
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className={`${inputClass} pl-10 pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A5E66] hover:text-[#8A8F98] transition-colors"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A5E66]" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          {message && (
            <div className={`text-sm flex items-center gap-2 ${message.includes('success') ? 'text-[#00D26A]' : 'text-[#EF4444]'}`}>
              {message.includes('success') ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#3B82F6] hover:bg-[#60A5FA] text-white rounded-md font-medium transition-all duration-150 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50 active:scale-[0.98] flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Update Password
          </button>
        </form>
      </div>

      {!user?.email_verified && (
        <div className="bg-[#1A1A24] rounded-lg border border-[#F59E0B]/20 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-[#E8E8ED]">Email not verified</h3>
              <p className="text-sm text-[#8A8F98] mt-1">Verify your email to unlock all features and receive important notifications.</p>
              <a
                href="/auth/verify"
                className="inline-flex items-center gap-1 text-sm text-[#60A5FA] hover:text-[#3B82F6] mt-3 transition-colors"
              >
                Verify now <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========== Billing Tab ========== */
function BillingTab() {
  const { subscription, usage, isLoading, refreshUsage } = useSubscription();
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState('');

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will keep access until the end of your billing period.')) return;
    setCancelling(true);
    setMessage('');
    try {
      await apiClient.cancelSubscription(true);
      await refreshUsage();
      setMessage('Subscription cancelled. You keep access until the end of your billing period.');
    } catch (err: any) {
      setMessage(err.message || 'Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-[#3B82F6] animate-spin" />
      </div>
    );
  }

  const planName = subscription?.plan?.name || 'Free';
  const planTier = subscription?.plan?.tier || 'free';
  const status = subscription?.status || 'active';
  const periodEnd = subscription?.current_period_end;

  return (
    <div className="space-y-6">
      <div className="bg-[#1A1A24] rounded-lg border border-white/[0.06] p-6">
        <h2 className="text-lg font-medium text-[#E8E8ED] mb-4">Current Plan</h2>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xl font-medium text-[#E8E8ED] capitalize">{planName}</p>
            <p className="text-sm text-[#8A8F98] mt-0.5">
              {planTier === 'free' ? 'Free forever' : `€${(subscription?.plan?.price_monthly_cents || 0) / 100}/month`}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            status === 'active' ? 'bg-[#00D26A]/10 text-[#00D26A] border border-[#00D26A]/20' :
            status === 'cancelled' ? 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20' :
            'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20'
          }`}>
            {status === 'active' ? 'Active' : status === 'cancelled' ? 'Cancelled' : status}
          </span>
        </div>

        {periodEnd && (
          <p className="text-sm text-[#5A5E66] mb-4">
            Current period ends: {new Date(periodEnd).toLocaleDateString()}
          </p>
        )}

        {planTier !== 'free' && status === 'active' && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="px-4 py-2 border border-[#EF4444]/30 text-[#EF4444] rounded-md text-sm font-medium hover:bg-[#EF4444]/10 transition-colors disabled:opacity-50"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
          </button>
        )}

        {planTier === 'free' && (
          <a
            href="/pricing"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#3B82F6] hover:bg-[#60A5FA] text-white rounded-md text-sm font-medium transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          >
            Upgrade Plan <ArrowRight className="w-3.5 h-3.5" />
          </a>
        )}

        {message && (
          <p className={`text-sm mt-4 flex items-center gap-2 ${message.includes('cancelled') || message.includes('success') ? 'text-[#00D26A]' : 'text-[#EF4444]'}`}>
            {message.includes('cancelled') || message.includes('success') ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {message}
          </p>
        )}
      </div>

      {/* Usage */}
      <div className="bg-[#1A1A24] rounded-lg border border-white/[0.06] p-6">
        <h2 className="text-lg font-medium text-[#E8E8ED] mb-4">Usage This Period</h2>
        {usage?.features?.length ? (
          <div className="space-y-4">
            {usage.features.map((f: any) => (
              <div key={f.feature}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-[#8A8F98]">{f.display_name}</span>
                  <span className="text-[#E8E8ED]">
                    {f.unlimited ? 'Unlimited' : `${f.used} / ${f.total}`}
                  </span>
                </div>
                {!f.unlimited && (
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#3B82F6] rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((f.used / f.total) * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#5A5E66]">No usage data available</p>
        )}
      </div>
    </div>
  );
}

/* ========== Preferences Tab ========== */
function PreferencesTab() {
  const [notifications, setNotifications] = useState({
    jobAlerts: true,
    weeklyDigest: true,
    productUpdates: false,
  });

  return (
    <div className="bg-[#1A1A24] rounded-lg border border-white/[0.06] p-6 space-y-5">
      <h2 className="text-lg font-medium text-[#E8E8ED]">Notification Preferences</h2>

      {[
        { key: 'jobAlerts' as const, label: 'Job Alerts', desc: 'Get notified when new matching jobs are found' },
        { key: 'weeklyDigest' as const, label: 'Weekly Digest', desc: 'Weekly summary of your application activity' },
        { key: 'productUpdates' as const, label: 'Product Updates', desc: 'New features and improvements from Hunt-X' },
      ].map((item) => (
        <div key={item.key} className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-[#E8E8ED]">{item.label}</p>
            <p className="text-xs text-[#5A5E66] mt-0.5">{item.desc}</p>
          </div>
          <button
            onClick={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
            className={`w-11 h-6 rounded-full transition-colors duration-200 relative ${
              notifications[item.key] ? 'bg-[#3B82F6]' : 'bg-white/[0.08]'
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                notifications[item.key] ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      ))}

      <p className="text-xs text-[#5A5E66] pt-2 border-t border-white/[0.06]">
        Preferences are stored locally for now. Server-side sync coming soon.
      </p>
    </div>
  );
}

/* ========== Data Tab ========== */
function DataTab() {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-[#1A1A24] rounded-lg border border-white/[0.06] p-6 space-y-5">
        <h2 className="text-lg font-medium text-[#E8E8ED]">Export Data</h2>
        <p className="text-sm text-[#8A8F98]">
          Download a copy of all your data including resumes, evaluations, CVs, cover letters, and application history.
        </p>
        <button
          onClick={() => alert('Export feature coming soon')}
          className="px-4 py-2.5 border border-white/[0.10] text-[#E8E8ED] rounded-md text-sm font-medium hover:bg-white/[0.04] hover:border-white/[0.14] transition-all"
        >
          Request Data Export
        </button>
      </div>

      <div className="bg-[#1A1A24] rounded-lg border border-[#EF4444]/20 p-6 space-y-5">
        <h2 className="text-lg font-medium text-[#EF4444]">Danger Zone</h2>
        <p className="text-sm text-[#8A8F98]">
          Deleting your account will permanently remove all your data. This action cannot be undone.
        </p>

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="px-4 py-2.5 border border-[#EF4444]/30 text-[#EF4444] rounded-md text-sm font-medium hover:bg-[#EF4444]/10 transition-colors"
          >
            Delete Account
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-[#EF4444]">Are you absolutely sure? This will delete all your data permanently.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2.5 border border-white/[0.10] text-[#E8E8ED] rounded-md text-sm font-medium hover:bg-white/[0.04] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => alert('Account deletion coming soon')}
                className="px-4 py-2.5 bg-[#EF4444] hover:bg-[#EF4444]/80 text-white rounded-md text-sm font-medium transition-colors"
              >
                Yes, Delete Everything
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
