import  { useState } from 'react';
import { AlertTriangle, Loader, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { Boat } from '../../services/interfaces/IBoatService';

interface DeleteBoatDialogProps {
  boat: Boat;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (boatId: number) => Promise<void>;
}

export function DeleteBoatDialog({ boat, isOpen, onClose, onConfirm }: DeleteBoatDialogProps) {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (confirmText.toLowerCase() !== 'supprimer') {
      setError('Veuillez taper "supprimer" pour confirmer');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onConfirm(boat.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setConfirmText('');
      setError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className=" w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-gray-900">Supprimer l'annonce</h3>
              <p className="text-sm text-gray-600">Cette action est irréversible</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <p className="text-sm text-red-800 mb-2">
              Vous êtes sur le point de supprimer définitivement :
            </p>
            <p className="text-red-900">
              <strong>{boat.name}</strong>
            </p>
            <p className="text-sm text-red-700 mt-2">
              {boat.location}
            </p>
          </div>

          <div className="space-y-3 text-sm text-gray-700 mb-4">
            <p className="flex items-start gap-2">
              <span className="text-red-600 mt-0.5">•</span>
              <span>L'annonce sera définitivement supprimée</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-red-600 mt-0.5">•</span>
              <span>Les réservations en cours seront affectées</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-red-600 mt-0.5">•</span>
              <span>Cette action ne peut pas être annulée</span>
            </p>
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-700">
              Pour confirmer, tapez <strong>"supprimer"</strong> :
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                setError('');
              }}
              placeholder="Tapez supprimer"
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            fullWidth
            onClick={handleClose}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={handleConfirm}
            disabled={loading || confirmText.toLowerCase() !== 'supprimer'}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? (
              <>
                <Loader className="animate-spin mr-2" size={16} />
                Suppression...
              </>
            ) : (
              'Supprimer définitivement'
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
