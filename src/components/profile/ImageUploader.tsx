// components/profile/ImageUploader.tsx
'use client'

import { useState, useRef } from 'react'
import { updateProfileImage } from '@/lib/firebase/profile';
import { Button } from '@/components/ui/Button'
import Image from 'next/image'

interface ImageUploaderProps {
  userId: string;
  currentPhotoURL?: string | null;
  onUploadSuccess: (url: string) => void;
  onClose: () => void;
}

export function ImageUploader({ userId, currentPhotoURL, onUploadSuccess, onClose }: ImageUploaderProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoURL || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.includes('image/')) {
      setError('Por favor selecciona una imagen válida')
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB')
      return
    }

    setSelectedImage(file)
    setError(null)

    // Crear URL para preview
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
  }

// Función handleUpload actualizada
const handleUpload = async () => {
  if (!selectedImage) return;

  setUploading(true);
  setError(null);

  try {
    const { url, error } = await updateProfileImage(selectedImage);
    
    if (error) {
      setError(error);
      setUploading(false);
      return;
    }

    if (url) {
      onUploadSuccess(url);
    }
  } catch (err) {
    setError('Error al subir la imagen');
    console.error(err);
  } finally {
    setUploading(false);
  }
};

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h3 className="text-lg font-medium text-dhermica-primary mb-4">Cambiar foto de perfil</h3>
        
        {error && (
          <div className="bg-dhermica-error/10 text-dhermica-error p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center space-y-4">
          {previewUrl ? (
            <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-dhermica-success">
              <Image
                src={previewUrl}
                alt="Vista previa"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Sin imagen</span>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="flex flex-col w-full space-y-2">
            <Button
              onClick={triggerFileInput}
              variant="secondary"
              disabled={uploading}
            >
              Seleccionar imagen
            </Button>
            
            <div className="flex space-x-2">
              <Button
                onClick={handleUpload}
                loading={uploading}
                disabled={!selectedImage || uploading}
                className="flex-1"
              >
                Guardar
              </Button>
              
              <Button
                onClick={onClose}
                variant="secondary"
                disabled={uploading}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}