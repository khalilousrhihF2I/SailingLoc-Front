export interface UserDocument {
  id: number;
  userId: string | number;
  boatId?: number | null;
  documentType: string;
  documentUrl: string;
  fileName: string;
  fileSize: number;
  isVerified: boolean;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  uploadedAt: string;
}

export interface IUserDocumentService {
  uploadDocument(form: FormData): Promise<UserDocument>;
  getMyDocuments(): Promise<UserDocument[]>;
  getDocumentById(id: number): Promise<UserDocument | null>;
  getDocumentsByUser(userId: string): Promise<UserDocument[]>;
  verifyDocument(id: number, verify: boolean): Promise<void>;
}
