import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Documents',
  robots: { index: false, follow: false },
}

export default function DocumentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
