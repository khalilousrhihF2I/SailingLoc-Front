import { apiClient } from '../../lib/apiClient';
import { logApiOperation } from '../../config/apiMode';
import { ContactDto, SendMessageDto, IMessageService } from '../interfaces/IMessageService';

export class ApiMessageService implements IMessageService {
  private readonly endpoint = '/messages';

  async contact(dto: ContactDto): Promise<{ success: boolean; message?: string }> {
    logApiOperation('messages', 'contact', dto);
    const resp = await apiClient.post<any>(`${this.endpoint}/contact`, dto);
    if (resp.error) return { success: false, message: resp.error };
    return { success: true, message: resp.data?.message };
  }

  async renterToOwner(dto: SendMessageDto): Promise<{ success: boolean; message?: string }> {
    logApiOperation('messages', 'renterToOwner', dto);
    const resp = await apiClient.post<any>(`${this.endpoint}/renter/to-owner`, dto);
    if (resp.error) return { success: false, message: resp.error };
    return { success: true, message: resp.data?.message };
  }

  async ownerToRenter(dto: SendMessageDto): Promise<{ success: boolean; message?: string }> {
    logApiOperation('messages', 'ownerToRenter', dto);
    const resp = await apiClient.post<any>(`${this.endpoint}/owner/to-renter`, dto);
    if (resp.error) return { success: false, message: resp.error };
    return { success: true, message: resp.data?.message };
  }

  async getMessagesByBookingAndUser(bookingId: string, userId: string): Promise<Array<any>> {
    logApiOperation('messages', 'getMessagesByBookingAndUser', { bookingId, userId });
    const resp = await apiClient.get<any>(`${this.endpoint}/booking/${bookingId}/user/${userId}`);
    if (resp.error) {
      console.error('Error fetching messages:', resp.error);
      return [];
    }
    return resp.data || [];
  }
}

export default ApiMessageService;
