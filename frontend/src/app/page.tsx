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
} from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#061b31]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#e5edf5]">
        <div className="max-w-[1080px] mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-normal tracking-tight" style={{ fontFamily: 'sohne-var, SF Pro Display, system-ui, sans-serif' }}>
            Hunt-X
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-[#64748d]">
            <a href="#features" className="hover:text-[#061b31] transition">Features</a>
            <a href="#how-it-works" className="hover:text-[#061b31] transition">How It Works</a>
            <a href="/pricing" className="hover:text-[#061b31] transition">Pricing</a>
            <a href="#faq" className="hover:text-[#061b31] transition">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth" className="text-sm px-4 py-2 text-[#061b31] hover:bg-[#f6f9fc] rounded transition">
              Sign In
            </Link>
            <Link href="/upload" className="text-sm px-4 py-2 bg-[#533afd] text-white rounded hover:bg-[#4338ca] transition">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 text-center">
        <div className="max-w-[1080px] mx-auto px-4">
          <span className="inline-block px-3 py-1 text-xs text-[#64748d] bg-[#f6f9fc] rounded-full mb-6">
            AI-Powered Job Search
          </span>
          <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-6" style={{ letterSpacing: '-1.4px', fontFamily: 'sohne-var, SF Pro Display, system-ui, sans-serif' }}>
            Land Your Dream Job, Faster.
          </h1>
          <p className="text-lg md:text-xl text-[#64748d] max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Upload your resume, get AI-optimized CVs, discover matching jobs, and track every application — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/upload"
              className="px-8 py-3 bg-[#533afd] text-white rounded font-normal hover:bg-[#4338ca] transition"
            >
              Start Free
            </Link>
            <Link
              href="#how-it-works"
              className="px-8 py-3 border border-[#b9b9f9] text-[#533afd] rounded hover:bg-[#f6f9fc] transition"
            >
              View Demo
            </Link>
          </div>

          {/* Dashboard mockup */}
          <div className="max-w-4xl mx-auto rounded-xl border border-[#e5edf5] bg-white shadow-[0_30px_45px_-30px_rgba(50,50,93,0.25),0_18px_36px_-18px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="p-8 md:p-12 bg-[#f6f9fc]">
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-white rounded-lg border border-[#e5edf5]">
                  <div className="text-2xl font-light text-[#061b31]">24</div>
                  <div className="text-sm text-[#64748d]">Jobs Applied</div>
                </div>
                <div className="p-4 bg-white rounded-lg border border-[#e5edf5]">
                  <div className="text-2xl font-light text-[#061b31]">5</div>
                  <div className="text-sm text-[#64748d]">Interviews</div>
                </div>
                <div className="p-4 bg-white rounded-lg border border-[#e5edf5]">
                  <div className="text-2xl font-light text-[#15be53]">87%</div>
                  <div className="text-sm text-[#64748d]">Match Score</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-[#e5edf5]">
                  <div className="w-10 h-10 rounded-full bg-[#f6f9fc] flex items-center justify-center text-[#64748d]">S</div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-normal text-[#061b31]">Senior Frontend Engineer</div>
                    <div className="text-xs text-[#64748d]">Stripe — Remote</div>
                  </div>
                  <span className="px-2 py-1 text-xs bg-[rgba(21,190,83,0.2)] text-[#108c3d] rounded">94%</span>
                </div>
                <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-[#e5edf5]">
                  <div className="w-10 h-10 rounded-full bg-[#f6f9fc] flex items-center justify-center text-[#64748d]">V</div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-normal text-[#061b31]">Product Designer</div>
                    <div className="text-xs text-[#64748d]">Vercel — Remote</div>
                  </div>
                  <span className="px-2 py-1 text-xs bg-[rgba(83,58,253,0.08)] text-[#533afd] rounded">89%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-[#e5edf5] py-8">
        <div className="max-w-[1080px] mx-auto px-4 text-center">
          <p className="text-sm text-[#64748d] mb-4">Trusted by job seekers at</p>
          <div className="flex items-center justify-center gap-8 opacity-50 grayscale">
            {['Stripe', 'Vercel', 'Linear', 'Figma', 'Notion'].map((company) => (
              <span key={company} className="text-lg font-light text-[#64748d]">{company}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-[1080px] mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-xs text-[#64748d] uppercase tracking-wider">Features</span>
            <h2 className="text-3xl font-light mt-2 text-[#061b31]">Everything You Need to Win the Job Hunt</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: FileSearch, title: 'AI Resume Analysis', desc: 'Upload your resume and get instant AI feedback on structure, keywords, and ATS compatibility.' },
              { icon: FilePlus, title: 'Tailored CV Generation', desc: 'Generate ATS-optimized CVs tailored to any job description in seconds.' },
              { icon: Search, title: 'Smart Job Discovery', desc: 'AI scans LinkedIn, Indeed, and 50+ portals to find jobs that actually match your profile.' },
              { icon: LayoutDashboard, title: 'Application Tracker', desc: 'Never lose track of an application. Visual pipeline from applied to offer.' },
              { icon: MessagesSquare, title: 'Interview Prep', desc: 'AI-generated interview questions and answers based on your target role.' },
              { icon: Mail, title: 'Cover Letters', desc: 'Personalized cover letters that match the job and highlight your strengths.' },
            ].map((feature) => (
              <div key={feature.title} className="p-6 bg-white rounded-lg border border-[#e5edf5] shadow-[0_15px_35px_rgba(23,23,23,0.08)] hover:shadow-[0_20px_40px_rgba(23,23,23,0.12)] transition">
                <div className="w-10 h-10 rounded-lg bg-[rgba(83,58,253,0.08)] flex items-center justify-center mb-3">
                  <feature.icon className="w-5 h-5 text-[#533afd]" />
                </div>
                <h3 className="text-lg font-light text-[#061b31] mb-2">{feature.title}</h3>
                <p className="text-sm text-[#64748d] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-[#f6f9fc]">
        <div className="max-w-[1080px] mx-auto px-4 text-center">
          <h2 className="text-3xl font-light text-[#061b31] mb-12">How Hunt-X Works</h2>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[16.67%] right-[16.67%] h-px border-t border-dashed border-[#b9b9f9]" />
            {[
              { step: '1', title: 'Upload', desc: 'Upload your resume in PDF, DOCX, or TXT format.' },
              { step: '2', title: 'Analyze', desc: 'Our AI analyzes your skills, experience, and gaps.' },
              { step: '3', title: 'Apply &amp; Track', desc: 'Generate tailored CVs and track applications.' },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-dashed border-[#b9b9f9] flex items-center justify-center text-[#533afd] font-light text-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-light text-[#061b31] mb-2">{item.title}</h3>
                <p className="text-sm text-[#64748d]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-[1080px] mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-xs text-[#64748d] uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl font-light mt-2 text-[#061b31]">Loved by Job Seekers</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
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
              <div key={t.name} className="p-6 bg-white rounded-xl border border-[#e5edf5] shadow-[0_15px_35px_rgba(23,23,23,0.08)]">
                <Quote className="w-8 h-8 text-[#533afd] mb-4 opacity-20" />
                <p className="text-[#061b31] mb-4 leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#9b6829] fill-[#9b6829]" />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#061b31]">{t.name}</p>
                  <p className="text-xs text-[#64748d]">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-20">
        <div className="max-w-[1080px] mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-[#061b31] mb-2">Simple, Transparent Pricing</h2>
            <p className="text-[#64748d]">Start free. Upgrade when you are ready to accelerate your job search.</p>
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
                className={`p-6 rounded-lg border ${plan.featured ? 'border-t-4 border-t-[#533afd] border-[#e5edf5] shadow-[0_30px_45px_-30px_rgba(50,50,93,0.25)]' : 'border-[#e5edf5]'} bg-white flex flex-col`}
              >
                <div className={`text-sm mb-2 ${plan.featured ? 'text-[#533afd]' : 'text-[#64748d]'}`}>{plan.name}</div>
                <div className="text-4xl font-light text-[#061b31] mb-1">{plan.price}</div>
                <div className="text-sm text-[#64748d] mb-4">{plan.period}</div>
                <p className="text-sm text-[#64748d] mb-6 flex-1">{plan.desc}</p>
                <Link
                  href={plan.name === 'Free' ? '/upload' : '/pricing'}
                  className={`block w-full py-2 text-center rounded text-sm font-normal transition ${
                    plan.featured
                      ? 'bg-[#533afd] text-white hover:bg-[#4338ca]'
                      : 'border border-[#b9b9f9] text-[#533afd] hover:bg-[#f6f9fc]'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/pricing" className="text-sm text-[#533afd] hover:underline">
              View Full Pricing
              <ArrowRight className="w-3.5 h-3.5 inline ml-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-[#f6f9fc]">
        <div className="max-w-[1080px] mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-xs text-[#64748d] uppercase tracking-wider">FAQ</span>
            <h2 className="text-3xl font-light mt-2 text-[#061b31]">Frequently Asked Questions</h2>
          </div>
          <div className="max-w-2xl mx-auto space-y-4">
            {[
              { q: 'Can I cancel anytime?', a: 'Yes. You can cancel your subscription at any time from your account settings. Your access continues until the end of your billing period.' },
              { q: 'What happens when I hit my free limit?', a: 'You will be prompted to upgrade to a paid plan. Your existing data (resumes, evaluations) remains accessible even on the free tier.' },
              { q: 'Is there a free trial for paid plans?', a: 'We offer a generous free tier so you can try core features before upgrading. There is no separate trial period for paid plans.' },
              { q: 'Can I change plans later?', a: 'Absolutely. You can upgrade or downgrade at any time. Upgrades take effect immediately; downgrades apply at the next billing cycle.' },
              { q: 'Do you offer refunds?', a: 'If you are not satisfied, contact us within 14 days of your first paid subscription for a full refund.' },
            ].map((faq) => (
              <details key={faq.q} className="group border-b border-[#e5edf5] pb-4 bg-white rounded-lg px-6 py-2">
                <summary className="flex items-center justify-between cursor-pointer list-none py-2">
                  <span className="text-base font-normal text-[#061b31]">{faq.q}</span>
                  <span className="text-[#64748d] group-open:rotate-180 transition">&#9662;</span>
                </summary>
                <p className="text-base text-[#64748d] pt-2 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#1c1e54]">
        <div className="max-w-[1080px] mx-auto px-4 text-center">
          <h2 className="text-3xl font-light text-white mb-4">Ready to Supercharge Your Job Search?</h2>
          <p className="text-base text-white/70 mb-8 max-w-xl mx-auto">
            Join thousands of job seekers who landed offers faster with Hunt-X.
          </p>
          <Link
            href="/upload"
            className="inline-block px-8 py-3 bg-white text-[#533afd] rounded hover:bg-gray-100 transition"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#e5edf5]">
        <div className="max-w-[1080px] mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-sm font-normal text-[#061b31] mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-[#64748d]">
                <li><a href="#features" className="hover:text-[#061b31]">Features</a></li>
                <li><Link href="/pricing" className="hover:text-[#061b31]">Pricing</Link></li>
                <li><Link href="/upload" className="hover:text-[#061b31]">Upload Resume</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-normal text-[#061b31] mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-[#64748d]">
                <li><a href="#" className="hover:text-[#061b31]">Blog</a></li>
                <li><a href="#" className="hover:text-[#061b31]">Guides</a></li>
                <li><a href="#" className="hover:text-[#061b31]">API Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-normal text-[#061b31] mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-[#64748d]">
                <li><a href="#" className="hover:text-[#061b31]">About</a></li>
                <li><a href="#" className="hover:text-[#061b31]">Careers</a></li>
                <li><a href="#" className="hover:text-[#061b31]">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-normal text-[#061b31] mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-[#64748d]">
                <li><a href="#" className="hover:text-[#061b31]">Privacy</a></li>
                <li><a href="#" className="hover:text-[#061b31]">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-[#e5edf5] text-center text-sm text-[#64748d]">
            &copy; 2026 Hunt-X. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}
