import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, Landmark, Tag, Target } from 'lucide-react'

const links = [
  { to: '/',            label: 'Dashboard',  Icon: LayoutDashboard },
  { to: '/operacoes',   label: 'Operações',  Icon: ArrowLeftRight  },
  { to: '/contas',      label: 'Contas',     Icon: Landmark        },
  { to: '/categorias',  label: 'Categorias', Icon: Tag             },
  { to: '/metas',       label: 'Metas',      Icon: Target          },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 safe-area-pb z-50">
      {links.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-xs px-3 py-1 transition-colors ${
              isActive ? 'text-indigo-600' : 'text-gray-400'
            }`
          }
        >
          <Icon size={22} strokeWidth={1.8} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
