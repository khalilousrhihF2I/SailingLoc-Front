
import { MapPin, Users, Star} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface BoatCardProps {
  boat: {
    id: number;
    name: string;
    type: string;
    location: string;
    price: number;
    capacity: number;
    image: string;
    rating: number;
    reviews: number;
  };
  onClick: () => void;
}

export function BoatCard({ boat, onClick }: BoatCardProps) {
  const typeLabels: Record<string, string> = {
    sailboat: 'Voilier',
    catamaran: 'Catamaran',
    motor: 'Moteur',
    semirigid: 'Semi-rigide'
  };

  const handleClick = () => {
    onClick();
  };

  return (
    <Card hover className="cursor-pointer" onClick={handleClick}>
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={boat.image}
          alt={boat.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="info">{typeLabels[boat.type] || boat.type}</Badge>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-gray-900 mb-2">{boat.name}</h3>
        
        <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin size={16} aria-hidden="true" />
            <span>{boat.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={16} aria-hidden="true" />
            <span>{boat.capacity} pers.</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm" aria-label={`Note ${boat.rating} sur 5, ${boat.reviews} avis`}>
            <Star size={16} className="text-orange-500 fill-orange-500" aria-hidden="true" />
            <span className="text-gray-900" aria-hidden="true">{boat.rating}</span>
            <span className="text-gray-500" aria-hidden="true">({boat.reviews})</span>
          </div>
          
          <div className="text-right" aria-label={`${boat.price} euros par jour`}>
            <div className="text-ocean-600">
              <span className="text-xl">{boat.price}€</span>
              <span className="text-sm text-gray-500">/jour</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
