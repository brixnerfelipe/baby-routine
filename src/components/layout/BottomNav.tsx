import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Milk, Heart } from 'lucide-react'

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav shadow-[0_-4px_24px_rgba(0,0,0,0.05)] safe-area-bottom max-w-md mx-auto" role="navigation" aria-label="Navegação principal">
      <div className="flex items-center justify-around h-[72px] px-2 pb-safe">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-300 ${isActive ? 'text-baby-500 scale-105' : 'text-[var(--text-secondary)] opacity-70 hover:opacity-100'}`}
          id="nav-home"
        >
          {({ isActive }) => (
            <>
              <Home size={26} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-0 translate-y-1'}` + ' transition-all duration-300'}>Rotina</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/pumping"
          className={({ isActive }) => `flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-300 ${isActive ? 'text-baby-500 scale-105' : 'text-[var(--text-secondary)] opacity-70 hover:opacity-100'}`}
          id="nav-pumping"
        >
          {({ isActive }) => (
            <>
              <Milk size={26} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-0 translate-y-1'}` + ' transition-all duration-300'}>Ordenha</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/health"
          className={({ isActive }) => `flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-300 ${isActive ? 'text-baby-500 scale-105' : 'text-[var(--text-secondary)] opacity-70 hover:opacity-100'}`}
          id="nav-health"
        >
          {({ isActive }) => (
            <>
              <Heart size={26} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-0 translate-y-1'}` + ' transition-all duration-300'}>Saúde</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  )
}
