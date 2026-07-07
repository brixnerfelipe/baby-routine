import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  icon?: React.ReactNode
  iconRight?: React.ReactNode
  loading?: boolean
  fullWidth?: boolean
  active?: boolean
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading,
  fullWidth,
  active,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-bold transition-all duration-200 outline-none select-none rounded-xl disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-baby-500 min-h-[48px]'
  
  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 min-h-[36px]',
    md: 'text-sm px-4 py-2 min-h-[44px]',
    lg: 'text-base px-6 py-3 min-h-[48px]',
    xl: 'text-lg px-8 py-4 min-h-[56px]',
  }

  const variantClasses = {
    primary: 'bg-baby-500 text-white hover:bg-baby-600 active:bg-baby-700 shadow-sm border border-transparent',
    secondary: 'bg-baby-100 text-baby-700 hover:bg-baby-200 active:bg-baby-300 dark:bg-baby-900 dark:text-baby-300 dark:hover:bg-baby-800 border border-transparent',
    ghost: 'bg-transparent text-baby-600 hover:bg-baby-50 dark:text-baby-400 dark:hover:bg-baby-900 border border-transparent',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 border border-transparent',
    success: 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 border border-transparent',
  }

  const activeClasses = {
    primary: 'ring-2 ring-baby-500 ring-offset-2',
    secondary: 'ring-2 ring-baby-300 ring-offset-1',
    ghost: 'bg-baby-100 dark:bg-baby-800',
    danger: 'ring-2 ring-red-500 ring-offset-1',
    success: 'ring-2 ring-green-500 ring-offset-1',
  }

  return (
    <button
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${active ? activeClasses[variant] : ''}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          {icon && <span className={`flex items-center ${children ? 'mr-2' : ''}`}>{icon}</span>}
          {children && <span>{children}</span>}
          {iconRight && <span className={`flex items-center ${children ? 'ml-2' : ''}`}>{iconRight}</span>}
        </>
      )}
    </button>
  )
}
