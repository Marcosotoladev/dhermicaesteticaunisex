// components/ui/Input.tsx
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface InputProps {
  id: string;
  type: 'text' | 'email' | 'password';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}

export function Input({ 
  id, 
  type, 
  value, 
  onChange, 
  placeholder, 
  required = false 
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false)

  const togglePassword = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="relative">
      <input
        id={id}
        type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 rounded-xl border border-dhermica-secondary/20 
                 focus:border-dhermica-success focus:ring-2 focus:ring-dhermica-success/20
                 bg-white placeholder-dhermica-primary/50"
      />
      {type === 'password' && (
        <button
          type="button"
          onClick={togglePassword}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-dhermica-primary/50 
                   hover:text-dhermica-primary transition-colors"
        >
          {showPassword ? 
            <EyeOff size={20} /> : 
            <Eye size={20} />
          }
        </button>
      )}
    </div>
  )
}