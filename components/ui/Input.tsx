

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className = '', ...props }: InputProps) {
  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label className="block mb-2 text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          style={{ width: '100%' }}
          className={`
            h-12 px-4 rounded-lg border border-gray-300 
            focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            text-gray-900 placeholder:text-gray-400
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
