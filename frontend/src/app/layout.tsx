import './globals.css'
import { SubscriptionProvider } from '@/lib/subscription-context'

export const metadata = {
  title: 'Hunt-X - AI-Powered Job Search',
  description: 'Upload your resume. Generate tailored CVs for every job. Track applications. Land interviews faster.',
  keywords: ['job search', 'AI resume', 'CV generator', 'ATS resume', 'job application tracker'],
  authors: [{ name: 'Hunt-X' }],
  openGraph: {
    title: 'Hunt-X - AI-Powered Job Search',
    description: 'Upload your resume. Generate tailored CVs for every job. Track applications. Land interviews faster.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hunt-X - AI-Powered Job Search',
    description: 'Upload your resume. Generate tailored CVs for every job. Track applications. Land interviews faster.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white text-[#061b31] antialiased" style={{ fontFamily: 'sohne-var, SF Pro Display, system-ui, -apple-system, sans-serif' }}>
        <SubscriptionProvider>
          {children}
        </SubscriptionProvider>
      </body>
    </html>
  )
}
