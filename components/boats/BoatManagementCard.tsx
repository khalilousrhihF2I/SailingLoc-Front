import  { useState } from 'react';
import { useModal } from '../../hooks/useModal';
import { Edit, Eye, Trash2, MoreVertical, Calendar } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import type { Boat } from '../../services/interfaces/IBoatService';

interface BoatManagementCardProps {
  boat: Boat;
  onEdit: (boatId: number) => void;
  onView: (boatId: number) => void;
  onDelete?: (boatId: number) => void;
  onManageCalendar?: (boatId: number) => void;
  stats?: {
    bookings: number;
    revenue: number;
    occupancyRate: number;
  };
}

export function BoatManagementCard({
  boat,
  onEdit,
  onView,
  onDelete,
  onManageCalendar,
  stats
}: BoatManagementCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { showConfirm } = useModal();

  return (
    <Card hover className="overflow-hidden">
      <div className="relative h-48">
        <ImageWithFallback
          src={boat.image}
          alt={boat.name}
          className="w-full h-full object-cover"
        />
        <Badge variant="success">
          Actif
        </Badge>
        {typeof boat.rating === 'number' && boat.rating > 0 && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
            <span className="text-sm">⭐ {boat.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="text-gray-900 mb-1">{boat.name}</h4>
            <p className="text-sm text-gray-600">{boat.location}</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical size={18} className="text-gray-600" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[150px]">
                <button
                  onClick={() => {
                    onEdit(boat.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                >
                  <Edit size={16} />
                  Modifier
                </button>
                <button
                  onClick={() => {
                    onView(boat.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                >
                  <Eye size={16} />
                  Voir l'annonce
                </button>
                {onManageCalendar && (
                  <button
                    onClick={() => {
                      onManageCalendar(boat.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                  >
                    <Calendar size={16} />
                    Calendrier
                  </button>
                )}
                {onDelete && (
                  <>
                    <div className="border-t border-gray-200 my-1" />
                    <button
                      onClick={() => {
                        showConfirm({
                          title: 'Supprimer le bateau',
                          message: `Êtes-vous sûr de vouloir supprimer "${boat.name}" ?`,
                          confirmLabel: 'Supprimer',
                          cancelLabel: 'Annuler',
                          onConfirm: async () => {
                            try {
                              onDelete(boat.id);
                            } catch (e) {
                              // swallow
                            }
                          }
                        });
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-sm text-red-600"
                    >
                      <Trash2 size={16} />
                      Supprimer
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-ocean-600">{boat.price}€/jour</div>
          <div className="text-sm text-gray-600">{boat.reviews} avis</div>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-900">{stats.bookings}</div>
              <div className="text-xs text-gray-600">Rés.</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-900">{stats.revenue}€</div>
              <div className="text-xs text-gray-600">Revenus</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-900">{stats.occupancyRate}%</div>
              <div className="text-xs text-gray-600">Taux</div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            onClick={() => onView(boat.id)}
          >
            <Eye size={16} />
            Voir
          </Button>
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={() => onEdit(boat.id)}
          >
            <Edit size={16} />
            Modifier
          </Button>
        </div>
      </div>
    </Card>
  );
}
