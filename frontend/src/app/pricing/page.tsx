'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Check,
  X,
  Users,
  Sparkles,
  ArrowRight,
  CreditCard,
  FileText,
  Brain,
  Shield
} from 'lucide-react';

// ============ PRICING PAGE ============

interface PricingTier {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  notIncluded?: string[];
  highlighted?: boolean;
  badge?: string;
  cta: string;
  icon: React.ReactNode;
}

const pricingTiers: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Perfect for trying out Hunt-X',
    features: [
      '1 CV generation/month',
      '2 resume uploads',
      'Basic AI analysis',
      'Watermarked PDF exports',
      'Email support'
    ],
    cta: 'Get Started',
    icon: <Sparkles className="w-5 h-5" />
  },
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 9,
    yearlyPrice: 90,
    description: 'For active job seekers',
    features: [
      '10 CV generations/month',
      '10 resume uploads',
      'Full AI analysis',
      'No watermarks',
      'DOCX export',
      'Priority email support'
    ],
    cta: 'Start with Starter',
    icon: <FileText className="w-5 h-5" />
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 29,
    yearlyPrice: 290,
    description: 'For serious job hunters',
    highlighted: true,
    badge: 'Most Popular',
    features: [
      'Unlimited CV generations',
      'Unlimited resume uploads',
      'Cover letter generation',
      'Interview prep AI',
      'Analytics dashboard',
      'API access (1,000 req/month)',
      'Priority processing'
    ],
    cta: 'Go Pro',
    icon: <Zap className="w-5 h-5" />
  },
  {
    id: 'team',
    name: 'Team',
    monthlyPrice: 49,
    yearlyPrice: 490,
    description: 'For career coaches & agencies',
    features: [
      'Everything in Pro',
      'Client management',
      'White-label exports',
      'Team collaboration',
      'Admin analytics',
      'Dedicated support',
      'API access (10,000 req/month)'
    ],
    cta: 'Contact Sales',
    icon: <Users className="w-5 h-5" />
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

export function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">Hunt-X</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-slate-400">
          <a href="/features" className="hover:text-white transition-colors">Features</a>
          <a href="/pricing" className="text-white">Pricing</a>
          <a href="/about" className="hover:text-white transition-colors">About</a>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-16 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Simple Pricing
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
            Choose the plan that fits your job search. Upgrade or downgrade anytime.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-center gap-4"
        >
          <span className={`text-sm transition-colors ${!isYearly ? 'text-white' : 'text-slate-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative w-14 h-7 bg-slate-800 rounded-full p-1 transition-colors"
          >
            <motion.div
              className="w-5 h-5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"
              animate={{ x: isYearly ? 28 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <span className={`text-sm transition-colors ${isYearly ? 'text-white' : 'text-slate-500'}`}>
            Yearly
          </span>
          {isYearly && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-400 rounded-full"
            >
              Save 2 months
            </motion.span>
          )}
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="relative z-10 px-6 pb-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
        >
          {pricingTiers.map((tier) => (
            <motion.div
              key={tier.id}
              variants={itemVariants}
              onMouseEnter={() => setHoveredTier(tier.id)}
              onMouseLeave={() => setHoveredTier(null)}
              className={`relative rounded-2xl p-6 transition-all duration-300 ${
                tier.highlighted
                  ? 'bg-gradient-to-b from-indigo-500/20 to-slate-900/50 border-2 border-indigo-500/50 scale-105'
                  : 'bg-slate-900/50 border border-slate-800 hover:border-slate-700'
              } ${hoveredTier === tier.id ? 'transform -translate-y-1' : ''}`}
            >
              {/* Badge */}
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full">
                    {tier.badge}
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                  tier.highlighted
                    ? 'bg-gradient-to-br from-indigo-500 to-cyan-500'
                    : 'bg-slate-800'
                }`}>
                  {tier.icon}
                </div>
                <h3 className="text-xl font-semibold mb-1">{tier.name}</h3>
                <p className="text-sm text-slate-400">{tier.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    €{isYearly ? Math.round(tier.yearlyPrice / 12) : tier.monthlyPrice}
                  </span>
                  <span className="text-slate-400">/mo</span>
                </div>
                {isYearly && tier.yearlyPrice > 0 && (
                  <p className="text-sm text-slate-400 mt-1">
                    €{tier.yearlyPrice} billed yearly
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
                {tier.notIncluded?.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm opacity-50">
                    <X className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-500">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                  tier.highlighted
                    ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-lg shadow-indigo-500/25'
                    : tier.id === 'free'
                    ? 'bg-slate-800 hover:bg-slate-700 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                {tier.cta}
              </button>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Comparison Table */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Compare Plans</h2>
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-5 gap-4 p-4 bg-slate-800/50 border-b border-slate-700 text-sm font-medium">
              <div className="text-left">Feature</div>
              <div className="text-center">Free</div>
              <div className="text-center">Starter</div>
              <div className="text-center text-indigo-400">Pro</div>
              <div className="text-center">Team</div>
            </div>

            {/* Table Rows */}
            {[
              ['CV Generations', '1/mo', '10/mo', 'Unlimited', 'Unlimited'],
              ['Resume Uploads', '2', '10', 'Unlimited', 'Unlimited'],
              ['AI Analysis', 'Basic', 'Full', 'Full + Insights', 'Full + Insights'],
              ['Cover Letters', '—', '—', '✓', '✓'],
              ['Interview Prep', '—', '—', '✓', '✓'],
              ['Analytics', '—', '—', '✓', '✓ + Admin'],
              ['White-label', '—', '—', '—', '✓'],
              ['Support', 'Email', 'Priority', 'Priority', 'Dedicated'],
            ].map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-5 gap-4 p-4 border-b border-slate-800/50 text-sm hover:bg-slate-800/30 transition-colors"
              >
                <div className="text-slate-300">{row[0]}</div>
                {row.slice(1).map((cell, cellIdx) => (
                  <div key={cellIdx} className={`text-center ${cellIdx === 2 ? 'text-indigo-400' : 'text-slate-400'}`}>
                    {cell === '✓' ? <Check className="w-4 h-4 mx-auto text-emerald-400" /> :
                     cell === '—' ? <span className="text-slate-600">—</span> : cell}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "Can I upgrade or downgrade anytime?",
                a: "Yes, you can change your plan at any time. When upgrading, you'll get immediate access to new features. When downgrading, changes take effect at the end of your billing period."
              },
              {
                q: "What happens if I exceed my monthly CV limit?",
                a: "You'll see an upgrade prompt with a preview of the feature. You can purchase additional CV credits or upgrade to a higher tier."
              },
              {
                q: "Is there a free trial for paid plans?",
                a: "The Free tier lets you try all basic features. For paid plans, we offer a 14-day money-back guarantee, no questions asked."
              },
              {
                q: "Do you offer refunds?",
                a: "Yes, we offer a 14-day money-back guarantee for all paid plans. Contact support@hunt-x.app for assistance."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-slate-400 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">Hunt-X</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2026 Hunt-X. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
