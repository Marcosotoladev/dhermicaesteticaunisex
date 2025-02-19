// app/(auth)/layout.tsx
import Image from "next/image";
export default function AuthLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <div className="min-h-screen bg-dhermica-back">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {/* Logo centrado */}
          <div className="flex justify-center mb-8">
            <Image
              src="/logo.png" 
              alt="Dhermica" 
              width={200}
              height={200}
              className="h-12 w-auto rounded-md"
            />
          </div>
          
          {/* Contenedor principal */}
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    )
  }