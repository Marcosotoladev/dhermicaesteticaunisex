import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div>
      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Iniciar sesión
      </h2>
      <div className="mt-8">
        <LoginForm />
      </div>
    </div>
  )
}