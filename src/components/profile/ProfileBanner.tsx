// components/profile/ProfileBanner.tsx
'use client'

import { Button } from '@/components/ui/Button'

interface ProfileBannerProps {
  isComplete: boolean;
  onStartChat: () => void;
}

export function ProfileBanner({ isComplete, onStartChat }: ProfileBannerProps) {
  if (isComplete) {
    return null;
  }

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