import { NavLink, Outlet } from 'react-router-dom'

const tabs = [
  { to: '/', label: '单词', emoji: '📚' },
  { to: '/sentences', label: '句子', emoji: '💬' },
  { to: '/games', label: '游戏', emoji: '🎮' },
  { to: '/review', label: '复习', emoji: '📅' },
  { to: '/progress', label: '进度', emoji: '⭐' },
]

export function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 pb-20">
      <Outlet />
      <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-100 z-[2000] flex justify-around items-end px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_16px_rgba(0,0,0,0.06)]">
        {tabs.map(t => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-3 min-w-[56px] transition-all duration-200 ${
                isActive
                  ? 'text-indigo-600 scale-110'
                  : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            <span className="text-2xl leading-none mb-0.5">{t.emoji}</span>
            <span className="text-[11px] font-semibold">{t.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
