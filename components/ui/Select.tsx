

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-2 text-gray-700">
          {label}
        </label>
      )}
      <select
        className={`
          w-full h-12 px-4 rounded-lg border border-gray-300 
          focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          text-gray-900 bg-white
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
