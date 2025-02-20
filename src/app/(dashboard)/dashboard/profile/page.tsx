// app/(dashboard)/profile/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ProfileBanner } from '@/components/profile/ProfileBanner'
import { ChatBot } from '@/components/profile/ChatBot'
import { getProfile, saveProfile } from '@/lib/firebase/profile'
import type { ProfileData } from '@/types/profile'
import Image from 'next/image'

export default function ProfilePage() {
  const { user } = useAuth()
  const [isProfileComplete, setIsProfileComplete] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    const { profile, error } = await getProfile(user.uid)
    if (error) {
      console.error('Error loading profile:', error)
      return
    }

    if (profile) {
      setProfileData(profile as ProfileData)
      setIsProfileComplete(true)
    }
    setLoading(false)
  }

  const handleStartChat = () => {
    setShowChat(true)
  }

  const handleChatComplete = async (data: ProfileData) => {
    if (!user) return

    const { error } = await saveProfile(user.uid, data)
    if (error) {
      console.error('Error saving profile:', error)
      return
    }

    setProfileData(data)
    setIsProfileComplete(true)
    setShowChat(false)
    loadProfile() // Recargar los datos para asegurar consistencia
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-dhermica-primary">Cargando...</div>
    </div>
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
              {profileData?.personalInfo.fullName || user?.displayName || 'Usuario'}
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
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-dhermica-primary mb-4">Información Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-dhermica-primary/70">Teléfono</p>
                    <p>{profileData?.personalInfo.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-dhermica-primary/70">Dirección</p>
                    <p>{profileData?.personalInfo.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-dhermica-primary/70">Fecha de Nacimiento</p>
                    <p>{profileData?.personalInfo.birthDate}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-dhermica-primary mb-4">Información Médica</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-dhermica-primary/70">Tatuajes</p>
                    <p>{profileData?.medicalInfo.tattoos.has ? 'Sí' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-dhermica-primary/70">Problemas de Piel</p>
                    <p>{profileData?.medicalInfo.skinProblems.join(', ') || 'Ninguno'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-dhermica-primary/70">Alergias</p>
                    <p>{profileData?.medicalInfo.allergies || 'Ninguna'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-dhermica-primary/70">Medicamentos Actuales</p>
                    <p>{profileData?.medicalInfo.currentMedications || 'Ninguno'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-dhermica-primary/70">Tratamientos Previos</p>
                    <p>{profileData?.medicalInfo.previousTreatments.join(', ') || 'Ninguno'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showChat && (
        <ChatBot 
          onComplete={handleChatComplete}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  )
}