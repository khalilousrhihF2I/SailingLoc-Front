import { HomeResponse, IHomeService } from '../interfaces/IHomeService';
import { apiClient } from '../../lib/apiClient';
import { logApiOperation } from '../../config/apiMode';

export class ApiHomeService implements IHomeService {
  private readonly endpoint = '/home';

  async getHome(): Promise<HomeResponse> {
    logApiOperation('home', 'getHome');
    const response = await apiClient.get<HomeResponse>(this.endpoint);
    return response.data ?? { topBoatTypes: [], popularBoats: [], popularDestinations: [] };
  }

  async getTopBoatTypes() {
    const home = await this.getHome();
    return home.topBoatTypes;
  }

  async getPopularBoats() {
    const home = await this.getHome();
    return home.popularBoats;
  }
}
