/**
 * Utilitaires de validation des dates pour les réservations
 */

export interface DateValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Valide que la date de fin est postérieure à la date de début
 */
export function validateDateRange(startDate: string, endDate: string): DateValidationResult {
  if (!startDate || !endDate) {
    return {
      isValid: false,
      error: 'Les dates de début et de fin sont obligatoires'
    };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) {
    return {
      isValid: false,
      error: 'La date de fin doit être postérieure à la date de début'
    };
  }

  return { isValid: true };
}

/**
 * Valide que les dates ne sont pas dans le passé
 */
export function validateNotPastDates(startDate: string, endDate: string): DateValidationResult {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start < today) {
    return {
      isValid: false,
      error: 'La date de début ne peut pas être dans le passé'
    };
  }

  if (end < today) {
    return {
      isValid: false,
      error: 'La date de fin ne peut pas être dans le passé'
    };
  }

  return { isValid: true };
}

/**
 * Valide toutes les contraintes de dates
 */
export function validateBookingDates(startDate: string, endDate: string): DateValidationResult {
  // Vérifier que les dates ne sont pas vides
  if (!startDate || !endDate) {
    return {
      isValid: false,
      error: 'Veuillez sélectionner les dates de début et de fin'
    };
  }

  // Vérifier que les dates ne sont pas dans le passé
  const pastValidation = validateNotPastDates(startDate, endDate);
  if (!pastValidation.isValid) {
    return pastValidation;
  }

  // Vérifier que la date de fin est postérieure à la date de début
  const rangeValidation = validateDateRange(startDate, endDate);
  if (!rangeValidation.isValid) {
    return rangeValidation;
  }

  return { isValid: true };
}

/**
 * Calcule le nombre de jours entre deux dates
 */
export function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Formate une date au format ISO (YYYY-MM-DD)
 */
export function formatDateToISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Obtient la date minimum pour le sélecteur de dates (aujourd'hui)
 */
export function getMinDate(): string {
  return formatDateToISO(new Date());
}

/**
 * Obtient la date minimum pour la date de fin (jour après la date de début)
 */
export function getMinEndDate(startDate: string): string {
  if (!startDate) return getMinDate();
  
  const start = new Date(startDate);
  start.setDate(start.getDate() + 1);
  return formatDateToISO(start);
}

/**
 * Vérifie si une date est dans une période indisponible
 */
export function isDateUnavailable(
  date: Date,
  unavailablePeriods: Array<{ startDate: string; endDate: string }>
): boolean {
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  return unavailablePeriods.some(period => {
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    return checkDate >= start && checkDate <= end;
  });
}

/**
 * Vérifie si une plage de dates chevauche des périodes indisponibles
 */
export function checkDateRangeOverlap(
  startDate: string,
  endDate: string,
  unavailablePeriods: Array<{ startDate: string; endDate: string; type?: string; reason?: string }>
): { hasOverlap: boolean; conflictingPeriods: Array<{ startDate: string; endDate: string; type?: string; reason?: string }> } {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const conflictingPeriods = unavailablePeriods.filter(period => {
    const periodStart = new Date(period.startDate);
    const periodEnd = new Date(period.endDate);
    periodStart.setHours(0, 0, 0, 0);
    periodEnd.setHours(0, 0, 0, 0);

    // Vérifie si les périodes se chevauchent
    return (
      (start >= periodStart && start <= periodEnd) ||
      (end >= periodStart && end <= periodEnd) ||
      (start <= periodStart && end >= periodEnd)
    );
  });

  return {
    hasOverlap: conflictingPeriods.length > 0,
    conflictingPeriods
  };
}

/**
 * Génère un tableau de dates désactivées pour un calendrier
 */
export function getDisabledDates(
  unavailablePeriods: Array<{ startDate: string; endDate: string }>
): Date[] {
  const disabledDates: Date[] = [];

  unavailablePeriods.forEach(period => {
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    
    const current = new Date(start);
    while (current <= end) {
      disabledDates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
  });

  return disabledDates;
}

/**
 * Formate une date pour l'affichage (ex: "Lundi 15 janvier 2025")
 */
export function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Formate une date pour l'affichage court (ex: "15/01/2025")
 */
export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR');
}
