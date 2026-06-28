import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function Layout() {
  return (
    // min-h-svh garante que o conteúdo ocupa a tela inteira no Safari/iPhone
    <div className="min-h-svh bg-gray-50 flex flex-col">
      <main className="flex-1 pb-16 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
