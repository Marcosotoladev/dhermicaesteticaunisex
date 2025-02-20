// components/ui/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'google';
  loading?: boolean;
  type?: 'button' | 'submit';
  onClick?: () => void;
  className?: string;
  disabled?: boolean; // Agregamos esta línea
}

export function Button({ 
  children, 
  variant = 'primary', 
  loading = false,
  type = 'button',
  onClick,
  className = '',
  disabled = false  // Agregamos esta línea
}: ButtonProps) {
  const styles = {
    primary: `w-full py-3 px-4 rounded-xl bg-gradient-to-r 
              from-dhermica-success to-dhermica-info
              text-white font-medium shadow-lg
              hover:from-dhermica-info hover:to-dhermica-success
              transition-all duration-300`,
    secondary: `w-full py-3 px-4 rounded-xl border border-dhermica-primary/20
                text-dhermica-primary font-medium
                hover:bg-dhermica-primary/5 transition-all duration-300`,
    google: `w-full py-3 px-4 rounded-xl border border-dhermica-primary/20
             text-dhermica-primary font-medium
             hover:bg-dhermica-primary/5 transition-all duration-300`
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled} // Modificamos esta línea
      className={`${styles[variant]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? 'Cargando...' : children}
    </button>
  )
}