export interface ContactDto {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface SendMessageDto {
  receiverId: string; // GUID as string
  bookingId?: string | null;
  boatId?: number | null;
  subject: string;
  content: string;
}

export interface IMessageService {
  contact(dto: ContactDto): Promise<{ success: boolean; message?: string }>;
  renterToOwner(dto: SendMessageDto): Promise<{ success: boolean; message?: string }>;
  ownerToRenter(dto: SendMessageDto): Promise<{ success: boolean; message?: string }>;
  getMessagesByBookingAndUser(bookingId: string, userId: string): Promise<Array<any>>;
}

export default IMessageService;
