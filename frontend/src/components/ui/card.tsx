'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'highlighted' | 'glass';
  hover?: boolean;
}

export function Card({ children, className, variant = 'default', hover = true }: CardProps) {
  const variants = {
    default: 'bg-slate-900/50 border border-slate-800',
    highlighted: 'bg-gradient-to-b from-indigo-500/20 to-slate-900/50 border-2 border-indigo-500/50',
    glass: 'bg-slate-900/30 backdrop-blur-sm border border-slate-700/50'
  };

  return (
    <motion.div
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={cn(
        'rounded-2xl p-6 transition-all duration-300',
        variants[variant],
        className
      )}
    >
      {children}
    </motion.div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}

export function CardHeader({ title, subtitle, icon }: CardHeaderProps) {
  return (
    <div className="flex items-start gap-4 mb-4">
      {icon && (
        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
          {icon}
        </div>
      )}
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
}
