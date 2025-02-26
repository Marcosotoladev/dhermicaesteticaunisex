// app/(admin)/admin/layout.tsx
'use client'

import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Clock, Users, Settings } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const pathname = usePathname()

  if (!user) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 mt-8 text-center">
        <p className="text-dhermica-primary/70">Debes iniciar sesión como administrador para acceder a esta página</p>
      </div>
    )
  }

  const navigation = [
    {
      name: 'Turnos',
      href: '/admin/appointments',
      icon: Calendar,
      current: pathname === '/admin/appointments'
    },
    {
      name: 'Horarios',
      href: '/admin/time-slots',
      icon: Clock,
      current: pathname === '/admin/time-slots'
    },
    {
      name: 'Profesionales',
      href: '/admin/professionals',
      icon: Users,
      current: pathname === '/admin/professionals'
    },
  ]

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar */}
      <div className="bg-white md:w-64 p-4 md:fixed md:inset-y-0 md:flex md:flex-col">
        <div className="flex items-center h-16 justify-center md:justify-start">
          <h2 className="text-xl font-bold text-dhermica-primary">Admin</h2>
        </div>
        
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center px-2 py-2 text-sm font-medium rounded-md
                ${item.current 
                  ? 'bg-dhermica-success/10 text-dhermica-success' 
                  : 'text-dhermica-primary hover:bg-gray-50'}
              `}
            >
              <item.icon 
                className={`
                  mr-3 flex-shrink-0 h-6 w-6
                  ${item.current ? 'text-dhermica-success' : 'text-dhermica-primary/70'}
                `}
              />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </div>
  )
}