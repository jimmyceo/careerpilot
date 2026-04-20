'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  CreditCard,
  AlertCircle,
  ChevronDown,
  Sparkles
} from 'lucide-react';

interface Credit {
  feature: string;
  display_name: string;
  used: number;
  total: number;
  remaining: number;
  unlimited: boolean;
  reset_date?: string;
}

interface CreditIndicatorProps {
  credits: Credit[];
  tier: string;
  planName: string;
}

export function CreditIndicator({ credits, tier, planName }: CreditIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get primary credit (CV generation)
  const primaryCredit = credits.find(c => c.feature === 'cv.generate') || credits[0];
  const isLow = primaryCredit && !primaryCredit.unlimited && primaryCredit.remaining <= 2;
  const isEmpty = primaryCredit && !primaryCredit.unlimited && primaryCredit.remaining === 0;

  return (
    <div className="relative">
      {/* Main indicator */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
          isEmpty
            ? 'bg-red-500/20 border border-red-500/30'
            : isLow
            ? 'bg-amber-500/20 border border-amber-500/30'
            : tier === 'pro'
            ? 'bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30'
            : 'bg-slate-800 border border-slate-700'
        }`}
      >
        <div className="flex items-center gap-1.5">
          {primaryCredit?.unlimited ? (
            <>
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-medium text-cyan-400">Unlimited</span>
            </>
          ) : (
            <>
              <CreditCard className={`w-3.5 h-3.5 ${isLow ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className={`text-xs font-medium ${isLow ? 'text-amber-400' : 'text-slate-300'}`}>
                {primaryCredit?.remaining} left
              </span>
            </>
          )}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded dropdown */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">{planName}</span>
              <span className="text-xs text-slate-500 ml-2">Plan</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              tier === 'pro'
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'bg-slate-800 text-slate-400'
            }`}>
              {tier}
            </span>
          </div>

          {/* Credits list */}
          <div className="p-4 space-y-3">
            {credits.map((credit) => (
              <div key={credit.feature} className="flex items-center justify-between">
                <span className="text-sm text-slate-400">{credit.display_name}</span>
                <div className="flex items-center gap-2">
                  {credit.unlimited ? (
                    <span className="text-xs text-cyan-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Unlimited
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            credit.remaining / credit.total <= 0.2
                              ? 'bg-red-500'
                              : credit.remaining / credit.total <= 0.5
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${(credit.remaining / credit.total) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs ${
                        credit.remaining / credit.total <= 0.2 ? 'text-red-400' : 'text-slate-400'
                      }`}>
                        {credit.remaining}/{credit.total}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Low credit warning */}
          {isLow && (
            <div className="px-4 py-3 bg-amber-500/10 border-t border-amber-500/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-amber-400">Running low on credits</p>
                  <a
                    href="/pricing"
                    className="text-xs text-amber-400/80 hover:text-amber-400 underline"
                  >
                    Upgrade for more
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Upgrade CTA */}
          {tier !== 'pro' && tier !== 'team' && (
            <div className="p-4 border-t border-slate-800">
              <a
                href="/pricing"
                className="block w-full py-2 text-center text-sm font-medium bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white rounded-lg transition-colors"
              >
                Upgrade to Pro
              </a>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export function CreditBar({ credits }: { credits: Credit[] }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold">Your Credits</h3>
          <p className="text-sm text-slate-400">Track your monthly usage</p>
        </div>
      </div>

      <div className="space-y-4">
        {credits.map((credit) => (
          <div key={credit.feature} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">{credit.display_name}</span>
              {credit.unlimited ? (
                <span className="text-sm text-cyan-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  Unlimited
                </span>
              ) : (
                <span className={`text-sm ${
                  credit.remaining / credit.total <= 0.2 ? 'text-red-400' : 'text-slate-400'
                }`}>
                  {credit.remaining} of {credit.total} remaining
                </span>
              )}
            </div>

            {!credit.unlimited && (
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    credit.remaining / credit.total <= 0.2
                      ? 'bg-red-500'
                      : credit.remaining / credit.total <= 0.5
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${(credit.used / credit.total) * 100}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
