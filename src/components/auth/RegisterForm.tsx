'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerWithEmail, loginWithGoogle } from '@/lib/firebase/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    // Validación de contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/
    if (!passwordRegex.test(password)) {
      setError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número')
      return
    }

    setLoading(true)
    setError(null)

    const { user, error } = await registerWithEmail(email, password)
    
    if (error) {
      setError(error)
      setLoading(false)
      return
    }

    if (user) {
      router.push('/dashboard')
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)

    const { user, error } = await loginWithGoogle()

    if (error) {
      setError(error)
      setLoading(false)
      return
    }

    if (user) {
      router.push('/dashboard')
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-xl bg-dhermica-error/10 text-dhermica-error text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />

          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            required
          />

          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmar Contraseña"
            required
          />
        </div>

        <div className="space-y-4">
          <Button 
            type="submit" 
            loading={loading}
            variant="primary"
          >
            Crear cuenta
          </Button>

          <Button 
            type="button"
            onClick={handleGoogleLogin} 
            loading={loading}
            variant="google"
          >
            Continuar con Google
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-dhermica-primary/70">
            ¿Ya tienes cuenta?{' '}
            <Link 
              href="/login" 
              className="font-medium text-dhermica-success hover:text-dhermica-info transition-colors"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}