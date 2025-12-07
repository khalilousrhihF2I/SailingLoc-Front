import { IUserDocumentService, UserDocument } from '../interfaces/IUserDocumentService';
import { apiClient } from '../../lib/apiClient';
import { logApiOperation } from '../../config/apiMode';

export class ApiUserDocumentService implements IUserDocumentService {
  private readonly endpoint = '/user-documents';

  async uploadDocument(form: FormData): Promise<UserDocument> {
    logApiOperation('user-documents', 'uploadDocument');
    const response = await apiClient.postForm<UserDocument>(`${this.endpoint}/upload`, form);
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to upload document');
    }
    return response.data;
  }

  async getMyDocuments(): Promise<UserDocument[]> {
    logApiOperation('user-documents', 'getMyDocuments');
    const resp = await apiClient.get<UserDocument[]>(`${this.endpoint}/me`);
    if (resp.error) {
      console.error('Error fetching user documents:', resp.error);
      return [];
    }
    return resp.data || [];
  }

  async getDocumentById(id: number): Promise<UserDocument | null> {
    logApiOperation('user-documents', 'getDocumentById', { id });
    const resp = await apiClient.get<UserDocument>(`${this.endpoint}/${id}`);
    if (resp.error) {
      console.error(`Error fetching document ${id}:`, resp.error);
      return null;
    }
    return resp.data || null;
  }

  async getDocumentsByUser(userId: string): Promise<UserDocument[]> {
    logApiOperation('user-documents', 'getDocumentsByUser', { userId });
    const resp = await apiClient.get<UserDocument[]>(`${this.endpoint}/user/${encodeURIComponent(userId)}`);
    if (resp.error) {
      console.error('Error fetching user documents:', resp.error);
      return [];
    }
    return resp.data || [];
  }

  async verifyDocument(id: number, verify: boolean): Promise<void> {
    logApiOperation('user-documents', 'verifyDocument', { id, verify });
    const resp = await apiClient.patch<any>(`${this.endpoint}/${id}/verify?verify=${encodeURIComponent(String(verify))}`, {});
    if (resp.error) throw new Error(resp.error);
    // Accept empty successful responses (some APIs return 204 No Content)
    if (resp.status >= 200 && resp.status < 300) return;
    throw new Error(`Unexpected response status ${resp.status}`);
  }
}
