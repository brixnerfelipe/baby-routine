import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { Header } from './components/layout/Header'
import { BottomNav } from './components/layout/BottomNav'
import { Home } from './pages/Home'
import { Pumping } from './pages/Pumping'
import { Health } from './pages/Health'
import { Login } from './pages/Login'
import { Onboarding } from './pages/Onboarding'
import { Analytics } from '@vercel/analytics/react'
import './styles/global.css'

function AppContent() {
  const { session, baby, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 bg-[var(--bg-base)]">
        <div className="text-5xl animate-bounce text-blue-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
        </div>
      </div>
    )
  }

  if (!session) return <Login />
  if (!baby) return <Onboarding />

  return (
    <div className="flex flex-col min-h-[100dvh] w-full max-w-md mx-auto relative bg-[var(--bg-base)] shadow-xl border-x border-[var(--border-color)]">
      <Header />
      <main className="flex-1 overflow-y-auto pb-24">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pumping" element={<Pumping />} />
          <Route path="/health" element={<Health />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
          <Analytics />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
