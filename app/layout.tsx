import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import Navigation from '@/components/Navigation'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Jilo.ai - AI视频内容自动化工厂',
  description: '通过AI技术自动发现爆款视频、生成原创内容并自动发布到YouTube',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <Navigation />
        <main>{children}</main>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
