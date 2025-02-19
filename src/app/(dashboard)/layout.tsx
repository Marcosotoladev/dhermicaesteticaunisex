'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { logOut } from '@/lib/firebase/auth'
import Link from 'next/link'
import Image from 'next/image'
import { Home, Calendar, User, LogOut } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    const { error } = await logOut()
    if (!error) {
      router.push('/login')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dhermica-back flex items-center justify-center">
        <div className="text-dhermica-primary">Cargando...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-dhermica-back flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/logo.png"
              alt="Dhermica"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-dhermica-error hover:bg-dhermica-error/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* Main Content - con padding inferior para la navegación */}
      <main className="flex-1 p-4 pb-20">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom Navigation para móvil */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-dhermica-primary/10">
        <div className="max-w-md mx-auto">
          <div className="flex justify-around py-2">
            <Link 
              href="/dashboard" 
              className="flex flex-col items-center p-2 text-dhermica-primary/70 hover:text-dhermica-success"
            >
              <Home size={24} />
              <span className="text-xs mt-1">Inicio</span>
            </Link>

            <Link 
              href="/dashboard/appointments" 
              className="flex flex-col items-center p-2 text-dhermica-primary/70 hover:text-dhermica-success"
            >
              <Calendar size={24} />
              <span className="text-xs mt-1">Turnos</span>
            </Link>

            <Link 
              href="/dashboard/profile" 
              className="flex flex-col items-center p-2 text-dhermica-primary/70 hover:text-dhermica-success"
            >
              <User size={24} />
              <span className="text-xs mt-1">Perfil</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  )
}