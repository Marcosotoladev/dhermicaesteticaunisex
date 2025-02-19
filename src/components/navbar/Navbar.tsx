'use client'

import Link from 'next/link'

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-white text-2xl font-bold">
          <Link href="/">Inicio</Link>
        </div>
        <div className="space-x-4">
          <Link href="/login" className="text-white hover:text-gray-300">
            Iniciar sesión
          </Link>
          <Link href="/dashboard" className="text-white hover:text-gray-300">
            Mi cuenta
          </Link>
          <Link href="/catalog" className="text-white hover:text-gray-300">
            Catálogo
          </Link>
          <Link href="/treatments" className="text-white hover:text-gray-300">
            Tratamientos
          </Link>
          <Link href="/treatments-load" className="text-white hover:text-gray-300">
            Cargar
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
