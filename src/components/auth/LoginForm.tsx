'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginWithEmail, loginWithGoogle } from '@/lib/firebase/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { user, error } = await loginWithEmail(email, password)
    
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
        </div>

        <div className="space-y-4">
          <Button 
            type="submit" 
            loading={loading}
            variant="primary"
          >
            Iniciar sesión
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
            ¿No tienes cuenta?{' '}
            <Link 
              href="/register" 
              className="font-medium text-dhermica-success hover:text-dhermica-info transition-colors"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}