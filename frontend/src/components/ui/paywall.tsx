'use client';

import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  currentTier: string;
  requiredTier: string;
}

export function PaywallModal({
  isOpen,
  onClose,
  feature,
  currentTier,
  requiredTier
}: PaywallModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon */}
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h2 className="text-xl font-bold text-center mb-2">
                Upgrade to Unlock {feature}
              </h2>
              <p className="text-slate-400 text-center text-sm mb-6">
                You're currently on the {currentTier} plan.
                {feature} is available on {requiredTier} and above.
              </p>

              {/* Feature preview */}
              <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-medium mb-2">What you'll get:</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    {feature} with AI
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    Priority processing
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    No watermarks
                  </li>
                </ul>
              </div>

              {/* CTA */}
              <button className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group">
                Upgrade Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-center text-xs text-slate-500 mt-4">
                14-day money-back guarantee. Cancel anytime.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface FeatureGateProps {
  children: ReactNode;
  feature: string;
  fallback?: ReactNode;
  tier?: string;
}

export function FeatureGate({ children, feature, fallback, tier = 'pro' }: FeatureGateProps) {
  const [showPaywall, setShowPaywall] = useState(false);
  const hasAccess = false; // Would come from context

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Blurred preview */}
      <div className="relative">
        <div className={cn('blur-sm select-none pointer-events-none')}>{children}</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={() => setShowPaywall(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Upgrade to {tier}
          </button>
        </div>
      </div>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature={feature}
        currentTier="free"
        requiredTier={tier}
      />
    </>
  );
}
