import { ReactNode } from 'react'
import { Sidebar } from '@/components/shared/Sidebar'
import { Navbar } from '@/components/shared/Navbar'

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:ml-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
