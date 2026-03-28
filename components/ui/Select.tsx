

import { useId } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = '', id: externalId, ...props }: SelectProps) {
  const generatedId = useId();
  const selectId = externalId || generatedId;
  const errorId = `${selectId}-error`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block mb-2 text-gray-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        aria-required={props.required}
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
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
