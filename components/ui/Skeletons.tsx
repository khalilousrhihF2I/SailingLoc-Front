import { Skeleton } from './skeleton';

export function BoatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md" aria-hidden="true">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    </div>
  );
}

export function BoatGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="status" aria-label="Chargement des bateaux">
      {Array.from({ length: count }).map((_, i) => (
        <BoatCardSkeleton key={i} />
      ))}
      <span className="sr-only">Chargement en cours...</span>
    </div>
  );
}

export function BoatDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6" role="status" aria-label="Chargement du bateau">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-64 w-full rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>
      <Skeleton className="h-32 w-full rounded-lg" />
      <span className="sr-only">Chargement en cours...</span>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6" role="status" aria-label="Chargement du tableau de bord">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
      </div>
      <Skeleton className="h-64 rounded-lg" />
      <span className="sr-only">Chargement en cours...</span>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 text-center shadow-sm" aria-hidden="true">
      <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
      <Skeleton className="h-5 w-3/4 mx-auto mb-2" />
      <Skeleton className="h-4 w-1/2 mx-auto" />
    </div>
  );
}

export function CategoryGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6" role="status" aria-label="Chargement des catégories">
      {Array.from({ length: count }).map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
      <span className="sr-only">Chargement en cours...</span>
    </div>
  );
}

export function DestinationCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm" aria-hidden="true">
      <Skeleton className="h-48 w-full rounded-none" />
    </div>
  );
}

export function DestinationGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" role="status" aria-label="Chargement des destinations">
      {Array.from({ length: count }).map((_, i) => (
        <DestinationCardSkeleton key={i} />
      ))}
      <span className="sr-only">Chargement en cours...</span>
    </div>
  );
}
