'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Search,
  FileText,
  FilePlus,
  Mail,
  MessagesSquare,
  Kanban,
  Settings,
  Menu,
  X,
  ChevronRight,
  Bot,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useSubscription } from '@/lib/subscription-context';

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Job Search', href: '/jobs', icon: Search },
  { label: 'My Resumes', href: '/upload', icon: FileText },
  { label: 'CV Generator', href: '/generate', icon: FilePlus },
  { label: 'Cover Letters', href: '/cover-letters', icon: Mail },
  { label: 'Interview Prep', href: '/interview', icon: MessagesSquare },
  { label: 'AI Career Coach', href: '/chat', icon: Bot },
  { label: 'Application Tracker', href: '/applications', icon: Kanban },
  { label: 'My Documents', href: '/documents', icon: FileText },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pathname, setPathname] = useState('');
  const [user, setUser] = useState<{ name?: string; email: string } | null>(null);
  const { usage, isLoading } = useSubscription();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
    apiClient.getCurrentUser().then((u) => {
      if (u?.email) setUser(u);
    }).catch(() => {});
  }, []);

  const initials = useMemo(() => {
    if (!user) return '?';
    const name = user.name || user.email;
    return name
      .split(/\s+/)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [user]);

  const creditFeature = usage?.features?.find((f) => f.feature === 'cv.generate');
  const creditsUsed = creditFeature?.used ?? 0;
  const creditsTotal = creditFeature?.unlimited ? 999 : (creditFeature?.total ?? 0);
  const creditsPercent = creditFeature?.unlimited ? 100 : creditsTotal > 0 ? (creditsUsed / creditsTotal) * 100 : 0;

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-2">
        <Link href="/" className="text-xl font-medium tracking-tight text-[#E8E8ED]">
          Hunt-X
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-[#3B82F6]/[0.12] text-[#60A5FA] shadow-[0_0_16px_rgba(59,130,246,0.12)]'
                  : 'text-[#8A8F98] hover:text-[#E8E8ED] hover:bg-white/[0.04]'
              }`}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              <span className="truncate">{item.label}</span>
              {active && <ChevronRight className="w-4 h-4 ml-auto shrink-0 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-4 pb-4 space-y-3">
        {/* Credit Indicator */}
        {!isLoading && usage && (
          <div className="p-3 bg-[#1A1A24] rounded-lg border border-white/[0.06]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#5A5E66]">Credits</span>
              <span className="text-xs text-[#E8E8ED] font-medium">
                {creditFeature?.unlimited ? 'Unlimited' : `${creditsUsed}/${creditsTotal}`}
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3B82F6] rounded-full transition-all"
                style={{ width: `${Math.min(creditsPercent, 100)}%` }}
              />
            </div>
            <Link
              href="/pricing"
              className="text-xs text-[#60A5FA] hover:text-[#3B82F6] mt-1.5 inline-flex items-center gap-0.5 transition-colors duration-150"
            >
              Upgrade <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* User Profile */}
        {user && (
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.04] transition-colors duration-150">
            <div className="w-9 h-9 rounded-full bg-[#3B82F6] text-white flex items-center justify-center text-xs font-medium shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-[#E8E8ED] truncate">{user.name || user.email}</p>
              <p className="text-xs text-[#5A5E66] truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Hamburger */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-10 h-10 bg-[#1A1A24] border border-white/[0.06] rounded-md flex items-center justify-center text-[#E8E8ED] hover:bg-white/[0.04] transition-colors duration-150"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[260px] lg:fixed lg:inset-y-0 lg:left-0 bg-[#12121A] border-r border-white/[0.06] z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-[260px] bg-[#12121A] border-r border-white/[0.06] z-50 flex flex-col lg:hidden">
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <Link href="/" className="text-xl font-medium text-[#E8E8ED]">Hunt-X</Link>
              <button onClick={() => setMobileOpen(false)} className="p-1 text-[#8A8F98] hover:text-[#E8E8ED]">
                <X className="w-5 h-5" />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
