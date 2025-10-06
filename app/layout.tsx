import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cloudflare Edge Latency Tester',
  description: 'Test and visualize Cloudflare edge latency performance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
