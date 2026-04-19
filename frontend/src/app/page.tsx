export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Hero */}
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Hunt-X
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 mb-4 max-w-2xl mx-auto">
          AI-Powered Job Search. Auto-find jobs, generate tailored CVs, land interviews.
        </p>
        <p className="text-lg text-slate-400 mb-12">
          Upload your resume. Get optimized CVs for every job. Track everything.
        </p>
        
        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="/upload" 
            className="px-8 py-4 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold text-lg transition"
          >
            Get Started — €49
          </a>
          <a 
            href="#features" 
            className="px-8 py-4 border border-slate-500 hover:border-slate-400 rounded-lg font-semibold text-lg transition"
          >
            See How It Works
          </a>
        </div>
      </div>

      {/* Features */}
      <div id="features" className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-slate-800/50 rounded-xl">
            <div className="text-3xl mb-4">📝</div>
            <h3 className="text-xl font-bold mb-2">AI Resume Analysis</h3>
            <p className="text-slate-400">Upload your resume. AI identifies your strengths and suggests improvements.</p>
          </div>
          <div className="p-6 bg-slate-800/50 rounded-xl">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2">Tailored CVs</h3>
            <p className="text-slate-400">Paste any job description. Get an ATS-optimized CV in seconds.</p>
          </div>
          <div className="p-6 bg-slate-800/50 rounded-xl">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Track Applications</h3>
            <p className="text-slate-400">Dashboard to manage all your applications in one place.</p>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-8">Simple Pricing</h2>
        <div className="max-w-md mx-auto p-8 bg-slate-800 rounded-xl border border-blue-500/50">
          <div className="text-sm text-blue-400 mb-2">One-Time Purchase</div>
          <div className="text-5xl font-bold mb-4">€49</div>
          <ul className="text-left text-slate-300 space-y-2 mb-8">
            <li>✓ Unlimited CV generations</li>
            <li>✓ AI resume analysis</li>
            <li>✓ Application tracker</li>
            <li>✓ Lifetime updates</li>
            <li>✓ No subscription</li>
          </ul>
          <a 
            href="/upload"
            className="block w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition"
          >
            Buy Now
          </a>
        </div>
      </div>
    </main>
  )
}