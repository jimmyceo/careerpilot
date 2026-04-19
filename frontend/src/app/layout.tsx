export const metadata = {
  title: 'Hunt-X - AI-Powered Job Search',
  description: 'Upload your resume. Generate tailored CVs for every job. Land interviews faster.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-white">{children}</body>
    </html>
  )
}
