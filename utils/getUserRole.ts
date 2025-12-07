export type UserRole = 'renter' | 'owner' | 'admin';

// Accepts a user object that may have a `roles` array (e.g. ['Admin']).
// Returns one of 'renter'|'owner'|'admin'. Optional fallbackEmail used for demo admin detection.
export function getUserRole(user: any, fallbackEmail?: string): UserRole {
  if (user && Array.isArray(user.roles) && user.roles.length > 0) {
    const first = String(user.roles[0]).toLowerCase();
    if (first === 'admin') return 'admin';
    if (first === 'owner') return 'owner';
    return 'renter';
  }

  if (fallbackEmail && String(fallbackEmail).toLowerCase() === 'admin@sailingloc.com') {
    return 'admin';
  }

  return 'renter';
}
