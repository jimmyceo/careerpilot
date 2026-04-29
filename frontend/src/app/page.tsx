import Link from 'next/link'
import {
  FileSearch,
  FilePlus,
  Search,
  LayoutDashboard,
  MessagesSquare,
  Mail,
  ArrowRight,
  Star,
  Quote,
  Sparkles,
  Zap,
  Activity,
} from 'lucide-react'

import { Metadata } from 'next'
import FeedbackSection from '@/components/landing/FeedbackSection'

export const metadata: Metadata = {
  title: 'Hunt-X — Autonomous AI Career Agent',
  description: 'Upload your resume. Let AI find, analyze, and apply to jobs for you. ATS-optimized CVs, cover letters, interview prep, and real-time job discovery.',
  alternates: { canonical: 'https://hunt-x.app/' },
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B0B0F] text-[#E8E8ED]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#0B0B0F]/80 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-medium tracking-tight text-[#E8E8ED]">
            Hunt-X
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-[#8A8F98]">
            <a href="#features" className="hover:text-[#E8E8ED] transition-colors duration-150">Features</a>
            <a href="#how-it-works" className="hover:text-[#E8E8ED] transition-colors duration-150">How It Works</a>
            <a href="/pricing" className="hover:text-[#E8E8ED] transition-colors duration-150">Pricing</a>
            <a href="#faq" className="hover:text-[#E8E8ED] transition-colors duration-150">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth" className="text-sm px-4 py-2 text-[#E8E8ED] hover:bg-white/[0.04] rounded-md transition-colors duration-150">
              Sign In
            </Link>
            <Link href="/upload" className="text-sm px-4 py-2 bg-[#3B82F6] text-white rounded-md hover:bg-[#60A5FA] transition-all duration-150 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 text-center relative overflow-hidden">
        {/* Subtle gradient glow behind hero */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3B82F6]/[0.07] rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-[1200px] mx-auto px-4 relative">
          {/* AI Activity Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#3B82F6]/[0.12] border border-[#3B82F6]/[0.25] rounded-full mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B82F6] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3B82F6]" />
            </span>
            <span className="text-xs text-[#60A5FA] font-medium">AI Agent Active</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight mb-6" style={{ letterSpacing: '-2px', lineHeight: 1.0 }}>
            Your Career Agent,<br />Always On.
          </h1>
          <p className="text-lg md:text-xl text-[#8A8F98] max-w-2xl mx-auto mb-10 leading-relaxed">
            An autonomous AI that finds, analyzes, and applies to jobs for you.
            Upload your resume. Let the agent do the rest.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/upload"
              className="px-8 py-3 bg-[#3B82F6] text-white rounded-md font-medium hover:bg-[#60A5FA] transition-all duration-150 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-[0.98]"
            >
              Start Free
            </Link>
            <Link
              href="#how-it-works"
              className="px-8 py-3 border border-white/[0.10] text-[#E8E8ED] rounded-md hover:bg-white/[0.04] hover:border-white/[0.14] transition-all duration-150"
            >
              View Demo
            </Link>
          </div>

          {/* AI Activity Panel */}
          <div className="max-w-3xl mx-auto rounded-xl border border-white/[0.06] bg-[#12121A] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#00D26A]/60" />
              </div>
              <span className="text-xs text-[#5A5E66] ml-2 font-mono">agent.log</span>
            </div>
            <div className="p-6 text-left font-mono text-sm space-y-2">
              <div className="flex items-start gap-3 animate-fade-in">
                <span className="text-[#5A5E66] shrink-0">10:42:03</span>
                <span className="text-[#8A8F98]">Scanning <span className="text-[#3B82F6]">12,421</span> active job postings...</span>
              </div>
              <div className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <span className="text-[#5A5E66] shrink-0">10:42:05</span>
                <span className="text-[#8A8F98]">Filtering low-fit matches with ML classifier</span>
              </div>
              <div className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <span className="text-[#5A5E66] shrink-0">10:42:07</span>
                <span className="text-[#8A8F98]">Ranked <span className="text-[#00D26A]">847</span> high-probability opportunities</span>
              </div>
              <div className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <span className="text-[#5A5E66] shrink-0">10:42:09</span>
                <span className="text-[#8A8F98]">Optimizing CV for <span className="text-[#E8E8ED]">Senior Frontend Engineer @ Stripe</span></span>
              </div>
              <div className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: '0.8s' }}>
                <span className="text-[#5A5E66] shrink-0">10:42:11</span>
                <span className="text-[#8A8F98]">Match score: <span className="text-[#00D26A]">94%</span> — generating tailored application...</span>
              </div>
              {/* Animated scan line */}
              <div className="relative h-px mt-4 overflow-hidden">
                <div className="absolute inset-0 bg-[#3B82F6]/[0.4] animate-scan-line" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-white/[0.06] py-8 bg-[#12121A]">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <p className="text-sm text-[#5A5E66] mb-4 uppercase tracking-wider">Trusted by job seekers at</p>
          <div className="flex items-center justify-center gap-8 opacity-40">
            {['Stripe', 'Vercel', 'Linear', 'Figma', 'Notion'].map((company) => (
              <span key={company} className="text-lg font-medium text-[#8A8F98]">{company}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-xs text-[#5A5E66] uppercase tracking-wider">Features</span>
            <h2 className="text-3xl md:text-4xl font-medium mt-3" style={{ letterSpacing: '-0.8px', lineHeight: 1.1 }}>
              Everything You Need to Win
            </h2>
            <p className="text-[#8A8F98] mt-4 max-w-lg mx-auto">
              A complete autonomous career agent — not just another job board.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: FileSearch, title: 'AI Resume Analysis', desc: 'Upload your resume and get instant AI feedback on structure, keywords, and ATS compatibility.' },
              { icon: FilePlus, title: 'Tailored CV Generation', desc: 'Generate ATS-optimized CVs tailored to any job description in seconds.' },
              { icon: Search, title: 'Smart Job Discovery', desc: 'AI scans LinkedIn, Indeed, and 50+ portals to find jobs that actually match your profile.' },
              { icon: LayoutDashboard, title: 'Application Tracker', desc: 'Never lose track of an application. Visual pipeline from applied to offer.' },
              { icon: MessagesSquare, title: 'Interview Prep', desc: 'AI-generated interview questions and answers based on your target role.' },
              { icon: Mail, title: 'Cover Letters', desc: 'Personalized cover letters that match the job and highlight your strengths.' },
            ].map((feature) => (
              <div key={feature.title} className="p-6 bg-[#1A1A24] rounded-lg border border-white/[0.06] hover:border-white/[0.10] transition-colors duration-150 group">
                <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/[0.12] flex items-center justify-center mb-4 group-hover:shadow-[0_0_16px_rgba(59,130,246,0.2)] transition-all duration-150">
                  <feature.icon className="w-5 h-5 text-[#60A5FA]" />
                </div>
                <h3 className="text-lg font-medium text-[#E8E8ED] mb-2">{feature.title}</h3>
                <p className="text-sm text-[#8A8F98] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Evaluation Showcase */}
      <section className="py-24 bg-[#12121A] border-y border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs text-[#5A5E66] uppercase tracking-wider">Evaluation</span>
              <h2 className="text-3xl md:text-4xl font-medium mt-3 mb-4" style={{ letterSpacing: '-0.8px', lineHeight: 1.1 }}>
                AI-Powered Job Match Analysis
              </h2>
              <p className="text-[#8A8F98] mb-6 leading-relaxed">
                Upload your resume and a job description. Hunt-X evaluates your fit in seconds — highlighting skill gaps, keyword matches, and ATS compatibility.
              </p>
              <ul className="space-y-3 text-sm text-[#8A8F98]">
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#00D26A] shrink-0" />
                  Match score from 0-100%
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#00D26A] shrink-0" />
                  Identifies missing skills and keywords
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#00D26A] shrink-0" />
                  Suggests specific improvements
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-[#3B82F6]/[0.05] rounded-xl blur-[60px]" />
              <div className="relative bg-[#1A1A24] rounded-lg border border-white/[0.06] p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-[#5A5E66] mb-1">Match Score</p>
                    <p className="text-4xl font-medium text-[#00D26A]" style={{ textShadow: '0 0 20px rgba(0,210,106,0.3)' }}>87%</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-[#00D26A]/[0.12] border border-[#00D26A]/[0.25] text-[#00D26A] text-xs font-medium">
                    High Fit
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  {[
                    { skill: 'React / Next.js', status: 'match' },
                    { skill: 'TypeScript', status: 'match' },
                    { skill: 'GraphQL', status: 'gap' },
                    { skill: 'AWS Lambda', status: 'gap' },
                    { skill: 'System Design', status: 'match' },
                  ].map((item) => (
                    <div key={item.skill} className="flex items-center justify-between text-sm">
                      <span className="text-[#E8E8ED]">{item.skill}</span>
                      <span className={item.status === 'match' ? 'text-[#00D26A] text-xs' : 'text-[#F59E0B] text-xs'}>
                        {item.status === 'match' ? 'Matched' : 'Gap'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/[0.06] pt-4">
                  <p className="text-xs text-[#5A5E66] mb-2">AI Suggestion</p>
                  <p className="text-sm text-[#8A8F98]">Add GraphQL experience and AWS certification to boost match to 94%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-[#0B0B0F]">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <span className="text-xs text-[#5A5E66] uppercase tracking-wider">Process</span>
          <h2 className="text-3xl md:text-4xl font-medium mt-3 mb-16" style={{ letterSpacing: '-0.8px', lineHeight: 1.1 }}>
            Three Steps to Your Next Offer
          </h2>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[16.67%] right-[16.67%] h-px border-t border-dashed border-white/[0.08]" />
            {[
              { step: '1', title: 'Upload', desc: 'Upload your resume and target job description.' },
              { step: '2', title: 'Evaluate', desc: 'AI analyzes your fit, gaps, and ATS compatibility.' },
              { step: '3', title: 'Generate', desc: 'Get a tailored CV, cover letter, and interview prep.' },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-dashed border-[#3B82F6]/40 flex items-center justify-center text-[#3B82F6] font-medium text-lg bg-[#0B0B0F]">
                  {item.step}
                </div>
                <h3 className="text-xl font-medium text-[#E8E8ED] mb-2">{item.title}</h3>
                <p className="text-sm text-[#8A8F98]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-xs text-[#5A5E66] uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-medium mt-3" style={{ letterSpacing: '-0.8px', lineHeight: 1.1 }}>
              Loved by Job Seekers
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                name: 'Sarah K.',
                role: 'Product Designer',
                quote: 'Hunt-X helped me land 3 interviews in my first week. The AI-generated CVs are incredible.',
                rating: 5,
              },
              {
                name: 'Michael R.',
                role: 'Senior Frontend Engineer',
                quote: 'I went from 0 callbacks to 5 interviews in two weeks. The tailored CVs really make a difference.',
                rating: 5,
              },
              {
                name: 'Emily T.',
                role: 'Data Scientist',
                quote: 'The interview prep feature saved me. I walked into every interview knowing exactly what to expect.',
                rating: 5,
              },
            ].map((t) => (
              <div key={t.name} className="p-6 bg-[#1A1A24] rounded-lg border border-white/[0.06]">
                <Quote className="w-8 h-8 text-[#3B82F6] mb-4 opacity-30" />
                <p className="text-[#E8E8ED] mb-4 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#E8E8ED]">{t.name}</p>
                  <p className="text-xs text-[#8A8F98]">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-24 bg-[#12121A] border-y border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-xs text-[#5A5E66] uppercase tracking-wider">Pricing</span>
            <h2 className="text-3xl md:text-4xl font-medium mt-3 mb-2" style={{ letterSpacing: '-0.8px', lineHeight: 1.1 }}>
              Simple, Transparent Pricing
            </h2>
            <p className="text-[#8A8F98]">Start free. Upgrade when you are ready to accelerate your job search.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { name: 'Free', price: '€0', period: '/mo', desc: '5 job scans, 1 CV/month', cta: 'Get Started', featured: false },
              { name: 'Starter', price: '€9', period: '/mo', desc: '20 job scans, 5 CVs/month', cta: 'Start Starter', featured: false },
              { name: 'Pro', price: '€29', period: '/mo', desc: 'Unlimited scans, unlimited CVs, interview prep', cta: 'Start Pro', featured: true },
              { name: 'Team', price: '€49', period: '/mo', desc: 'Everything in Pro + team collaboration', cta: 'Contact Sales', featured: false },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`p-6 rounded-lg border flex flex-col ${plan.featured ? 'border-[#3B82F6]/[0.4] shadow-[0_0_30px_rgba(59,130,246,0.15)]' : 'border-white/[0.06]'} bg-[#1A1A24]`}
              >
                <div className={`text-sm mb-2 ${plan.featured ? 'text-[#60A5FA]' : 'text-[#8A8F98]'}`}>{plan.name}</div>
                <div className="text-4xl font-medium text-[#E8E8ED] mb-1">{plan.price}</div>
                <div className="text-sm text-[#8A8F98] mb-4">{plan.period}</div>
                <p className="text-sm text-[#8A8F98] mb-6 flex-1">{plan.desc}</p>
                <Link
                  href={plan.name === 'Free' ? '/upload' : '/pricing'}
                  className={`block w-full py-2.5 text-center rounded-md text-sm font-medium transition-all duration-150 active:scale-[0.98] ${
                    plan.featured
                      ? 'bg-[#3B82F6] text-white hover:bg-[#60A5FA] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                      : 'border border-white/[0.10] text-[#E8E8ED] hover:bg-white/[0.04] hover:border-white/[0.14]'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/pricing" className="text-sm text-[#60A5FA] hover:text-[#3B82F6] transition-colors duration-150 inline-flex items-center gap-1">
              View Full Pricing
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-xs text-[#5A5E66] uppercase tracking-wider">FAQ</span>
            <h2 className="text-3xl md:text-4xl font-medium mt-3" style={{ letterSpacing: '-0.8px', lineHeight: 1.1 }}>
              Frequently Asked Questions
            </h2>
          </div>
          <div className="max-w-2xl mx-auto space-y-3">
            {[
              { q: 'Can I cancel anytime?', a: 'Yes. You can cancel your subscription at any time from your account settings. Your access continues until the end of your billing period.' },
              { q: 'What happens when I hit my free limit?', a: 'You will be prompted to upgrade to a paid plan. Your existing data (resumes, evaluations) remains accessible even on the free tier.' },
              { q: 'Is there a free trial for paid plans?', a: 'We offer a generous free tier so you can try core features before upgrading. There is no separate trial period for paid plans.' },
              { q: 'Can I change plans later?', a: 'Absolutely. You can upgrade or downgrade at any time. Upgrades take effect immediately; downgrades apply at the next billing cycle.' },
              { q: 'Do you offer refunds?', a: 'If you are not satisfied, contact us within 14 days of your first paid subscription for a full refund.' },
            ].map((faq) => (
              <details key={faq.q} className="group bg-[#1A1A24] rounded-lg border border-white/[0.06] overflow-hidden">
                <summary className="flex items-center justify-between cursor-pointer list-none px-6 py-4 hover:bg-white/[0.02] transition-colors duration-150">
                  <span className="text-sm font-medium text-[#E8E8ED]">{faq.q}</span>
                  <span className="text-[#8A8F98] group-open:rotate-180 transition-transform duration-150">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </summary>
                <p className="text-sm text-[#8A8F98] px-6 pb-4 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Feedback */}
      <section className="py-24 bg-[#12121A] border-t border-white/[0.06]">
        <FeedbackSection />
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#12121A] border-t border-white/[0.06] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#3B82F6]/[0.08] rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-4 text-center relative">
          <h2 className="text-3xl md:text-4xl font-medium text-[#E8E8ED] mb-4" style={{ letterSpacing: '-0.8px', lineHeight: 1.1 }}>
            Ready to Supercharge Your Job Search?
          </h2>
          <p className="text-base text-[#8A8F98] mb-8 max-w-xl mx-auto">
            Join thousands of job seekers who landed offers faster with Hunt-X.
          </p>
          <Link
            href="/upload"
            className="inline-block px-8 py-3 bg-[#3B82F6] text-white rounded-md font-medium hover:bg-[#60A5FA] transition-all duration-150 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] active:scale-[0.98]"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-sm font-medium text-[#E8E8ED] mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-[#8A8F98]">
                <li><a href="#features" className="hover:text-[#E8E8ED] transition-colors duration-150">Features</a></li>
                <li><Link href="/pricing" className="hover:text-[#E8E8ED] transition-colors duration-150">Pricing</Link></li>
                <li><Link href="/upload" className="hover:text-[#E8E8ED] transition-colors duration-150">Upload Resume</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#E8E8ED] mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-[#8A8F98]">
                <li><a href="#" className="hover:text-[#E8E8ED] transition-colors duration-150">Blog</a></li>
                <li><a href="#" className="hover:text-[#E8E8ED] transition-colors duration-150">Guides</a></li>
                <li><a href="#" className="hover:text-[#E8E8ED] transition-colors duration-150">API Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#E8E8ED] mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-[#8A8F98]">
                <li><a href="#" className="hover:text-[#E8E8ED] transition-colors duration-150">About</a></li>
                <li><a href="#" className="hover:text-[#E8E8ED] transition-colors duration-150">Careers</a></li>
                <li><a href="#" className="hover:text-[#E8E8ED] transition-colors duration-150">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#E8E8ED] mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-[#8A8F98]">
                <li><a href="#" className="hover:text-[#E8E8ED] transition-colors duration-150">Privacy</a></li>
                <li><a href="#" className="hover:text-[#E8E8ED] transition-colors duration-150">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/[0.06] text-center text-sm text-[#5A5E66]">
            &copy; 2026 Hunt-X. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}
