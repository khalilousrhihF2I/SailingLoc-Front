import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Save, X, Info } from 'lucide-react';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { availabilityService } from '../../services/ServiceFactory';
import { UnavailablePeriod } from '../../services/interfaces/IAvailabilityService';

interface AvailabilityCalendarProps {
  boatId: number;
  onUpdate?: () => void;
}

interface DayCell {
  date: Date;
  dateString: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  isBlocked: boolean;
  isBooked: boolean;
  isSelected: boolean;
  isInRange: boolean;
  period?: UnavailablePeriod;
}

export function AvailabilityCalendar({ boatId, onUpdate }: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [unavailablePeriods, setUnavailablePeriods] = useState<UnavailablePeriod[]>([]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState('Maintenance');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [mode, setMode] = useState<'block' | 'unblock'>('block');

  // Charger les périodes indisponibles
  useEffect(() => {
    loadUnavailablePeriods();
  }, [boatId, currentDate]);

  const loadUnavailablePeriods = async () => {
    try {
      const periods = await availabilityService.getUnavailablePeriods(boatId);
      setUnavailablePeriods(periods);
    } catch (error) {
      console.error('Erreur lors du chargement des disponibilités:', error);
    }
  };

  const getDaysInMonth = (date: Date): DayCell[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: DayCell[] = [];

    // Jours du mois précédent pour compléter la première semaine
    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Lundi = 0
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const dateObj = new Date(year, month - 1, day);
      const dateString = formatDateString(dateObj);
      
      days.push({
        date: dateObj,
        dateString,
        isCurrentMonth: false,
        isToday: false,
        isPast: dateObj < today,
        isBlocked: isDateBlocked(dateString),
        isBooked: isDateBooked(dateString),
        isSelected: selectedDates.includes(dateString),
        isInRange: isDateInRange(dateString),
        period: getPeriodForDate(dateString)
      });
    }

    // Jours du mois actuel
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateObj = new Date(year, month, day);
      const dateString = formatDateString(dateObj);
      const isTodayDate = dateObj.getTime() === today.getTime();
      
      days.push({
        date: dateObj,
        dateString,
        isCurrentMonth: true,
        isToday: isTodayDate,
        isPast: dateObj < today && !isTodayDate,
        isBlocked: isDateBlocked(dateString),
        isBooked: isDateBooked(dateString),
        isSelected: selectedDates.includes(dateString),
        isInRange: isDateInRange(dateString),
        period: getPeriodForDate(dateString)
      });
    }

    // Jours du mois suivant pour compléter la dernière semaine
    const remainingDays = 42 - days.length; // 6 semaines de 7 jours
    for (let day = 1; day <= remainingDays; day++) {
      const dateObj = new Date(year, month + 1, day);
      const dateString = formatDateString(dateObj);
      
      days.push({
        date: dateObj,
        dateString,
        isCurrentMonth: false,
        isToday: false,
        isPast: dateObj < today,
        isBlocked: isDateBlocked(dateString),
        isBooked: isDateBooked(dateString),
        isSelected: selectedDates.includes(dateString),
        isInRange: isDateInRange(dateString),
        period: getPeriodForDate(dateString)
      });
    }

    return days;
  };

  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isDateBlocked = (dateString: string): boolean => {
    return unavailablePeriods.some(period => 
      period.type === 'blocked' && 
      dateString >= period.startDate && 
      dateString <= period.endDate
    );
  };

  const isDateBooked = (dateString: string): boolean => {
    return unavailablePeriods.some(period => 
      period.type === 'booking' && 
      dateString >= period.startDate && 
      dateString <= period.endDate
    );
  };

  const getPeriodForDate = (dateString: string): UnavailablePeriod | undefined => {
    return unavailablePeriods.find(period => 
      dateString >= period.startDate && dateString <= period.endDate
    );
  };

  const isDateInRange = (dateString: string): boolean => {
    if (!rangeStart || !rangeEnd) return false;
    return dateString >= rangeStart && dateString <= rangeEnd;
  };

  const handleDayClick = (day: DayCell) => {
    if (day.isPast || day.isBooked) return; // Ne peut pas modifier le passé ou les réservations

    if (mode === 'block') {
      // Mode blocage : sélection de plage
      if (!rangeStart) {
        setRangeStart(day.dateString);
        setRangeEnd(null);
      } else if (!rangeEnd) {
        if (day.dateString < rangeStart) {
          setRangeEnd(rangeStart);
          setRangeStart(day.dateString);
        } else {
          setRangeEnd(day.dateString);
        }
      } else {
        // Réinitialiser la sélection
        setRangeStart(day.dateString);
        setRangeEnd(null);
      }
    } else {
      // Mode déblocage : sélection individuelle
      if (day.isBlocked) {
        if (selectedDates.includes(day.dateString)) {
          setSelectedDates(selectedDates.filter(d => d !== day.dateString));
        } else {
          setSelectedDates([...selectedDates, day.dateString]);
        }
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'block' && rangeStart && rangeEnd) {
        // Bloquer une période
        await availabilityService.addUnavailablePeriod(boatId, {
          startDate: rangeStart,
          endDate: rangeEnd,
          type: 'blocked',
          reason: blockReason
        });
        setMessage({ type: 'success', text: 'Période bloquée avec succès' });
        setRangeStart(null);
        setRangeEnd(null);
      } else if (mode === 'unblock' && selectedDates.length > 0) {
        // Débloquer des dates
        for (const dateString of selectedDates) {
          const period = getPeriodForDate(dateString);
          if (period && period.type === 'blocked') {
            await availabilityService.removeUnavailablePeriod(boatId, period.startDate);
          }
        }
        setMessage({ type: 'success', text: `${selectedDates.length} jour(s) débloqué(s)` });
        setSelectedDates([]);
      }

      await loadUnavailablePeriods();
      onUpdate?.();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Erreur lors de la mise à jour' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setRangeStart(null);
    setRangeEnd(null);
    setSelectedDates([]);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="space-y-6">
      {/* Mode selection */}
      <div className="flex gap-4">
        <button
          onClick={() => {
            setMode('block');
            setSelectedDates([]);
            setRangeStart(null);
            setRangeEnd(null);
          }}
          className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
            mode === 'block'
              ? 'border-ocean-600 bg-ocean-50 text-ocean-700'
              : 'border-gray-300 hover:border-ocean-300'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <X size={20} />
            <span>Bloquer une période</span>
          </div>
        </button>
        <button
          onClick={() => {
            setMode('unblock');
            setSelectedDates([]);
            setRangeStart(null);
            setRangeEnd(null);
          }}
          className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
            mode === 'unblock'
              ? 'border-ocean-600 bg-ocean-50 text-ocean-700'
              : 'border-gray-300 hover:border-ocean-300'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <CalendarIcon size={20} />
            <span>Débloquer des dates</span>
          </div>
        </button>
      </div>

      {/* Reason input for blocking */}
      {mode === 'block' && (
        <div>
          <label className="block text-sm text-gray-700 mb-2">Raison du blocage</label>
          <select
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-ocean-500"
          >
            <option value="Maintenance">Maintenance</option>
            <option value="Entretien">Entretien</option>
            <option value="Réparations">Réparations</option>
            <option value="Usage personnel">Usage personnel</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
      )}

      {/* Messages */}
      {message && (
        <Alert type={message.type}>
          {message.text}
        </Alert>
      )}

      {/* Calendar header */}
      <div className="flex items-center justify-between">
        <button
          onClick={previousMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h3 className="text-gray-900 capitalize">{monthName}</h3>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Week days header */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {weekDays.map((day) => (
            <div
              key={day}
              className="py-3 text-center text-sm text-gray-600"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const isSelectable = !day.isPast && !day.isBooked;
            const canClick = mode === 'block' ? isSelectable : (day.isBlocked && isSelectable);

            return (
              <button
                key={index}
                onClick={() => canClick && handleDayClick(day)}
                disabled={!canClick}
                className={`
                  aspect-square p-2 border-b border-r border-gray-100 relative
                  transition-all
                  ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                  ${day.isToday ? 'ring-2 ring-ocean-400 ring-inset' : ''}
                  ${day.isPast ? 'bg-gray-50 cursor-not-allowed' : ''}
                  ${day.isBooked ? 'bg-orange-100 cursor-not-allowed' : ''}
                  ${day.isBlocked && !day.isSelected ? 'bg-red-50' : ''}
                  ${day.isInRange ? 'bg-ocean-100' : ''}
                  ${day.isSelected ? 'bg-ocean-200' : ''}
                  ${canClick ? 'hover:bg-ocean-50 cursor-pointer' : ''}
                `}
              >
                <div className="text-sm">{day.date.getDate()}</div>
                
                {day.isBooked && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  </div>
                )}
                
                {day.isBlocked && !day.isSelected && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-100 border border-orange-200 rounded"></div>
          <span className="text-gray-600">Réservé</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
          <span className="text-gray-600">Bloqué</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
          <span className="text-gray-600">Passé</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-ocean-100 border border-ocean-200 rounded"></div>
          <span className="text-gray-600">Sélection en cours</span>
        </div>
      </div>

      {/* Action buttons */}
      {((mode === 'block' && rangeStart) || (mode === 'unblock' && selectedDates.length > 0)) && (
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={handleCancel}
            disabled={loading}
            fullWidth
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={loading || (mode === 'block' && !rangeEnd)}
            fullWidth
          >
            {loading ? 'Enregistrement...' : (
              <>
                <Save size={20} />
                {mode === 'block' 
                  ? 'Bloquer la période' 
                  : `Débloquer ${selectedDates.length} jour(s)`
                }
              </>
            )}
          </Button>
        </div>
      )}

      {/* Instructions */}
      <Alert type="info">
        <div className="flex items-start gap-2">
          <Info size={20} className="shrink-0 mt-0.5" />
          <div className="text-sm">
            {mode === 'block' ? (
              <>
                <p className="mb-1">Mode blocage :</p>
                <p>Cliquez sur une date de début, puis sur une date de fin pour bloquer une période.</p>
              </>
            ) : (
              <>
                <p className="mb-1">Mode déblocage :</p>
                <p>Cliquez sur les dates bloquées que vous souhaitez débloquer.</p>
              </>
            )}
          </div>
        </div>
      </Alert>

      {/* Unavailable periods list */}
      {unavailablePeriods.length > 0 && (
        <Card className="p-4">
          <h4 className="text-gray-900 mb-3">Périodes indisponibles ({unavailablePeriods.length})</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {unavailablePeriods.map((period, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    period.type === 'booking' ? 'bg-orange-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <div className="text-sm text-gray-900">
                      {new Date(period.startDate).toLocaleDateString('fr-FR')} - {new Date(period.endDate).toLocaleDateString('fr-FR')}
                    </div>
                    {period.reason && (
                      <div className="text-xs text-gray-600">{period.reason}</div>
                    )}
                  </div>
                </div>
                <Badge variant={period.type === 'booking' ? 'warning' : 'default'}>
                  {period.type === 'booking' ? 'Réservation' : 'Bloqué'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
