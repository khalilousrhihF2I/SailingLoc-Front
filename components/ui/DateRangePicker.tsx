import  { useState, useEffect } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { Input } from './Input';
import { Alert } from './Alert';
import { 
  validateBookingDates, 
  getMinDate, 
  getMinEndDate,
  checkDateRangeOverlap,
  formatDateForDisplay
} from '../../utils/dateValidation';
import { UnavailablePeriod } from '../../services/interfaces/IAvailabilityService';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  unavailablePeriods?: UnavailablePeriod[];
  disabled?: boolean;
  showValidation?: boolean;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  unavailablePeriods = [],
  disabled = false,
  showValidation = true
}: DateRangePickerProps) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  // Valider les dates à chaque changement
  useEffect(() => {
    if (!startDate || !endDate) {
      setValidationError(null);
      setAvailabilityError(null);
      return;
    }

    // Validation des contraintes de dates
    const validation = validateBookingDates(startDate, endDate);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Dates invalides');
      setAvailabilityError(null);
      return;
    }

    setValidationError(null);

    // Vérifier les conflits avec les périodes indisponibles
    if (unavailablePeriods.length > 0) {
      const { hasOverlap, conflictingPeriods } = checkDateRangeOverlap(
        startDate,
        endDate,
        unavailablePeriods
      );

      if (hasOverlap) {
        const period = conflictingPeriods[0];
        const message = period.type === 'booking'
          ? `Période déjà réservée (${formatDateForDisplay(period.startDate)} - ${formatDateForDisplay(period.endDate)})`
          : `Bateau indisponible (${period.reason})`;
        setAvailabilityError(message);
      } else {
        setAvailabilityError(null);
      }
    }
  }, [startDate, endDate, unavailablePeriods]);

  const hasError = validationError || availabilityError;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="date"
          label="Date de départ"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          min={getMinDate()}
          disabled={disabled}
          icon={<Calendar size={20} />}
          required
        />
        <Input
          type="date"
          label="Date de retour"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          min={startDate ? getMinEndDate(startDate) : getMinDate()}
          disabled={disabled}
          icon={<Calendar size={20} />}
          required
        />
      </div>

      {showValidation && hasError && (
        <Alert type="error">
          <div className="flex items-start gap-2">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div>
              <p>{validationError || availabilityError}</p>
              {availabilityError && !validationError && (
                <p className="text-sm mt-1 opacity-90">
                  Veuillez choisir d'autres dates
                </p>
              )}
            </div>
          </div>
        </Alert>
      )}

      {!hasError && startDate && endDate && showValidation && (
        <Alert type="success">
          ✓ Ces dates sont disponibles
        </Alert>
      )}

      {unavailablePeriods.length > 0 && (
        <div className="text-sm text-gray-600">
          <p className="mb-2">Périodes indisponibles :</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {unavailablePeriods.slice(0, 5).map((period, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${
                  period.type === 'booking' ? 'bg-orange-500' : 'bg-gray-500'
                }`}></span>
                <span>
                  {formatDateForDisplay(period.startDate)} - {formatDateForDisplay(period.endDate)}
                  {period.reason && ` (${period.reason})`}
                </span>
              </div>
            ))}
            {unavailablePeriods.length > 5 && (
              <p className="text-xs text-gray-500 pl-4">
                ... et {unavailablePeriods.length - 5} autres périodes
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
