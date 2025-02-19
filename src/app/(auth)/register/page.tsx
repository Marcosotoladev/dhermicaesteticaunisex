import RegisterForm from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <div>
      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Crear cuenta
      </h2>
      <div className="mt-8">
        <RegisterForm />
      </div>
    </div>
  )
}