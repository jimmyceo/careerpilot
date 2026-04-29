'use client'

import { useState } from 'react'
import { Star, Send, Check, Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/api'

export default function FeedbackSection() {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [text, setText] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      setStatus('error')
      setMessage('Please select a rating')
      return
    }
    setLoading(true)
    setStatus('idle')
    try {
      const data = await apiClient.submitFeedback(rating, text || undefined, name || undefined, role || undefined)
      if (data.status === 'success') {
        setStatus('success')
        setMessage(data.message || 'Thank you for your feedback!')
        setRating(0)
        setText('')
        setName('')
        setRole('')
      }
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message || 'Failed to submit feedback')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4">
      <div className="max-w-xl mx-auto text-center">
        <span className="text-xs text-[#5A5E66] uppercase tracking-wider">Feedback</span>
        <h2 className="text-3xl md:text-4xl font-medium mt-3 mb-2" style={{ letterSpacing: '-0.8px', lineHeight: 1.1 }}>
          How is Hunt-X working for you?
        </h2>
        <p className="text-[#8A8F98] mb-8">
          Your feedback helps us improve the AI agent for everyone.
        </p>

        {status === 'success' ? (
          <div className="p-6 bg-[#1A1A24] rounded-lg border border-[#00D26A]/20 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#00D26A]/10 flex items-center justify-center">
              <Check className="w-6 h-6 text-[#00D26A]" />
            </div>
            <p className="text-[#00D26A] font-medium">{message}</p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-4 text-sm text-[#60A5FA] hover:text-[#3B82F6] transition-colors"
            >
              Submit another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#1A1A24] rounded-lg border border-white/[0.06] p-6 text-left space-y-4">
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium text-[#8A8F98] mb-2">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-colors duration-150"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= (hoverRating || rating)
                          ? 'text-[#F59E0B] fill-[#F59E0B]'
                          : 'text-[#5A5E66]'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-[#5A5E66]">
                  {rating > 0 ? ['Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating - 1] : 'Select a rating'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Name (optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-2.5 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Role (optional)</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Software Engineer"
                className="w-full px-4 py-2.5 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8A8F98] mb-1.5">Feedback (optional)</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                placeholder="What do you like? What can we improve?"
                className="w-full px-4 py-2.5 rounded-md bg-white/[0.02] border border-white/[0.08] text-[#E8E8ED] placeholder:text-[#5A5E66] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] transition-colors duration-150 text-sm resize-none"
              />
            </div>

            {status === 'error' && (
              <p className="text-sm text-[#EF4444]">{message}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#3B82F6] hover:bg-[#60A5FA] text-white rounded-md font-medium transition-all duration-150 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Feedback
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
