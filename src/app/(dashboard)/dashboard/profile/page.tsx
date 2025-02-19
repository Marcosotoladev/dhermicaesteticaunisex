// app/(dashboard)/profile/page.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ProfileBanner } from '@/components/profile/ProfileBanner'
import Image from 'next/image'

export default function ProfilePage() {
  const { user } = useAuth()
  const [isProfileComplete] = useState(false) // Esto luego vendrá de Firestore

  const handleStartChat = () => {
    // Aquí iniciaremos el chatbot
    console.log('Iniciando chat...')
  }

  return (
    <div>
      <ProfileBanner 
        isComplete={isProfileComplete} 
        onStartChat={handleStartChat} 
      />

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header con foto de perfil */}
        <div className="bg-gradient-to-r from-dhermica-success to-dhermica-info p-6">
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 mb-4">
              {user?.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt="Foto de perfil"
                  fill
                  className="rounded-full object-cover border-4 border-white"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <span className="text-3xl text-dhermica-primary">
                    {user?.email?.[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <h2 className="text-white text-xl font-medium">
              {user?.displayName || 'Usuario'}
            </h2>
            <p className="text-white/80">{user?.email}</p>
          </div>
        </div>

        {/* Información del perfil */}
        <div className="p-6">
          {!isProfileComplete ? (
            <div className="text-center text-dhermica-primary/70">
              No has completado tu perfil aún
            </div>
          ) : (
            <div className="space-y-4">
              {/* Aquí irá la información del perfil cuando esté completo */}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}