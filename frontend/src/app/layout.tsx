import './globals.css'

export const metadata = {
  title: 'Hunt-X - AI-Powered Job Search',
  description: 'Upload your resume. Generate tailored CVs for every job. Track applications. Land interviews faster.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white text-[#061b31] antialiased" style={{ fontFamily: 'sohne-var, SF Pro Display, system-ui, -apple-system, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
