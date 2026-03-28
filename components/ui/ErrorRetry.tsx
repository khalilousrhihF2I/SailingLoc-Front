interface ErrorRetryProps {
  message?: string;
  onRetry: () => void;
}

export function ErrorRetry({ message = 'Une erreur est survenue.', onRetry }: ErrorRetryProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center" role="alert">
      <div className="text-red-500 text-4xl mb-4" aria-hidden="true">⚠</div>
      <p className="text-gray-700 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:ring-offset-2"
      >
        Réessayer
      </button>
    </div>
  );
}
