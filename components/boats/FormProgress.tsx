

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export function FormProgress({ currentStep, totalSteps, labels }: FormProgressProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                currentStep >= step ? 'bg-ocean-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step}
            </div>
            {step < totalSteps && (
              <div
                className={`w-full h-1 transition-colors ${
                  currentStep > step ? 'bg-ocean-600' : 'bg-gray-200'
                }`}
                style={{ width: '60px' }}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs md:text-sm">
        {labels.map((label, index) => (
          <span
            key={index}
            className={`transition-colors ${
              currentStep >= index + 1 ? 'text-ocean-600' : 'text-gray-500'
            }`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
