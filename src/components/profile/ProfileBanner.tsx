// components/profile/ProfileBanner.tsx
'use client'

import { Button } from '@/components/ui/Button'
import { Edit } from 'lucide-react'

interface ProfileBannerProps {
  isComplete: boolean;
  onStartChat: () => void;
}

export function ProfileBanner({ isComplete, onStartChat }: ProfileBannerProps) {
  if (!isComplete) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-dhermica-primary font-medium">Completa tu perfil</h3>
            <p className="text-sm text-dhermica-primary/70">
              Necesitamos algunos datos importantes para brindarte una mejor atención
            </p>
          </div>
          <Button onClick={onStartChat} variant="primary">
            Completar Ahora
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-dhermica-primary font-medium">Perfil completado</h3>
          <p className="text-sm text-dhermica-primary/70">
            Puedes editar tu información cuando lo necesites
          </p>
        </div>
        <Button onClick={onStartChat} variant="secondary">
          <Edit className="w-4 h-4 mr-2" />
          Editar Perfil
        </Button>
      </div>
    </div>
  )
}