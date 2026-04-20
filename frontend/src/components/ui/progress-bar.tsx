'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'warning' | 'danger' | 'success';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = true,
  label,
  className
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const variants = {
    default: 'bg-indigo-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    success: 'bg-emerald-500'
  };

  // Auto-switch variant based on percentage
  const getVariant = () => {
    if (variant !== 'default') return variants[variant];
    if (percentage >= 90) return variants.danger;
    if (percentage >= 75) return variants.warning;
    return variants.default;
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-2">
          <span className="text-sm text-slate-400">{label || 'Progress'}</span>
          <span className={cn(
            'text-sm font-medium',
            percentage >= 90 ? 'text-red-400' :
            percentage >= 75 ? 'text-amber-400' : 'text-slate-300'
          )}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className={cn('w-full bg-slate-800 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', getVariant())}
          style={{ width: `${percentage}%` }}
        >
          {/* Shimmer effect */}
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
