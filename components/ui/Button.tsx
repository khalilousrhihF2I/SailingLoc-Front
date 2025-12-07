

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'default' | 'size-7' | 'size-8' | 'size-9';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  children,
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-ocean-600 text-white hover:bg-ocean-700 active:bg-ocean-800 shadow-md hover:shadow-lg',
    secondary: 'bg-turquoise-500 text-white hover:bg-turquoise-600 active:bg-turquoise-700 shadow-md hover:shadow-lg',
    ghost: 'bg-transparent text-ocean-600 hover:bg-ocean-50 active:bg-ocean-100 border border-ocean-300 hover:border-ocean-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-md hover:shadow-lg'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm h-9',
    md: 'px-5 py-2.5 text-base h-10',
    lg: 'px-6 py-3 text-base h-12',
    icon: 'size-7 inline-flex items-center justify-center px-2',
    default: 'px-4 py-2'
  } as Record<string, string>;
  
  const widthStyle = fullWidth ? { width: '100%' } : {};
  
  return (
    <button
      style={widthStyle}
      className={`${baseStyles} ${variants[variant as keyof typeof variants] ?? ''} ${sizes[size as string] ?? ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function buttonVariants({ variant = 'primary', size = 'md' } = {}) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants: Record<string, string> = {
    primary: 'bg-ocean-600 text-white hover:bg-ocean-700 active:bg-ocean-800 shadow-md hover:shadow-lg',
    secondary: 'bg-turquoise-500 text-white hover:bg-turquoise-600 active:bg-turquoise-700 shadow-md hover:shadow-lg',
    ghost: 'bg-transparent text-ocean-600 hover:bg-ocean-50 active:bg-ocean-100 border border-ocean-300 hover:border-ocean-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-md hover:shadow-lg',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50',
  };

  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm h-9',
    md: 'px-5 py-2.5 text-base h-10',
    lg: 'px-6 py-3 text-base h-12',
    icon: 'size-7 inline-flex items-center justify-center px-2',
    default: 'px-4 py-2',
    'size-8': 'size-8',
    'size-7': 'size-7',
    'size-9': 'size-9',
  };

  return [baseStyles, variants[variant] ?? '', sizes[size as string] ?? ''].filter(Boolean).join(' ');
}
