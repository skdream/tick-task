
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/contexts/AppContext'
import LayoutWrapper from '@/components/LayoutWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '家庭目标管理系统',
  description: '帮助家庭管理日常任务和奖励系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <AppProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </AppProvider>
      </body>
    </html>
  )
}
