import { Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    <div className="min-h-svh bg-slate-950 flex flex-col">
      <main className="flex-1 pb-16 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          style: { background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' },
        }}
      />
    </div>
  )
}
