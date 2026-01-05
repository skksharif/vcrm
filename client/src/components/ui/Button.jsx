import React from 'react';

export default function Button({
  children,
  className = '',
  loading = false,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  ...props
}){
  const variants = {
    primary: 'bg-[#026c8a] hover:bg-[#025f78] text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
    outline: 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'bg-transparent text-[#026c8a] hover:bg-[#026c8a]/10',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  const cls = `inline-flex items-center gap-2 rounded ${sizes[size]} ${variants[variant] || variants.primary} ${loading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`;

  return (
    <button className={cls} disabled={loading} aria-busy={loading} {...props}>
      {loading ? (
        <svg className="h-4 w-4 mr-2 animate-spin text-white" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : (
        leftIcon
      )}

      <span>{children}</span>

      {!loading && rightIcon}
    </button>
  )
}
