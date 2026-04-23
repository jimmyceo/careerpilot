export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Simple Pricing</h1>
        <p className="text-slate-400 mb-12">One-time purchase. No subscription.</p>

        <div className="max-w-md mx-auto p-8 bg-slate-800 rounded-xl border border-blue-500/50">
          <div className="text-sm text-blue-400 mb-2">Full Access</div>
          <div className="text-5xl font-bold mb-4">€49</div>
          <ul className="text-left text-slate-300 space-y-2 mb-8">
            <li>✓ Unlimited CV generations</li>
            <li>✓ AI resume analysis</li>
            <li>✓ Application tracker</li>
            <li>✓ Lifetime updates</li>
            <li>✓ No subscription</li>
          </ul>
          <a
            href="/auth"
            className="block w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition"
          >
            Get Started
          </a>
        </div>
      </div>
    </main>
  );
}
