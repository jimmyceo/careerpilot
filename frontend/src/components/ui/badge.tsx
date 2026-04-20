'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className
}: BadgeProps) {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
    info: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    purple: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

interface TierBadgeProps {
  tier: 'free' | 'starter' | 'pro' | 'team';
  className?: string;
}

export function TierBadge({ tier, className }: TierBadgeProps) {
  const tierStyles = {
    free: 'bg-slate-800 text-slate-400 border-slate-700',
    starter: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    pro: 'bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-indigo-400 border-indigo-500/30',
    team: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  };

  return (
    <Badge variant="default" className={cn(tierStyles[tier], className)}>
      {tier.charAt(0).toUpperCase() + tier.slice(1)}
    </Badge>
  );
}
