import { authService } from '../services/ServiceFactory';

// Calls API logout and then invokes the client-side onLogout callback.
export async function handleLogout(onLogout: () => void) {
  try {
    await authService.logout();
  } catch (err) {
    console.warn('Logout API call failed', err);
  }
  try {
    onLogout();
  } catch (err) {
    console.warn('onLogout callback threw', err);
  }
}
