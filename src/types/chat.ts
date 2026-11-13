export type ConversationMode = 'ai' | 'support' | 'seller';

export type ConversationStatus = 'bot_active' | 'queued' | 'assigned' | 'resolved' | 'closed';

export type MessageSenderType = 'customer' | 'guest' | 'ai' | 'agent' | 'system';

export type ContextCardType = 'product' | 'order';

export interface ChatProductCardData {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images?: Array<{ url: string; altText?: string }>;
  brand?: string;
  status?: string;
  quantity?: number;
}

export interface ChatOrderCardData {
  _id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  shippingMethod: string;
  total: number;
  createdAt: string;
}

export interface ChatContextCard {
  _id?: string;
  cardType: ContextCardType;
  product?: ChatProductCardData;
  order?: ChatOrderCardData;
  note?: string;
}

export interface ConversationUser {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role?: string;
  email?: string;
}

export interface Conversation {
  _id: string;
  user?: ConversationUser;
  guestId?: string;
  assignedAgent?: ConversationUser;
  mode: ConversationMode;
  status: ConversationStatus;
  subject?: string;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  unreadCountCustomer: number;
  unreadCountAgent: number;
  handoffReason?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  conversation: string;
  senderType: MessageSenderType;
  senderUser?: ConversationUser;
  content: string;
  contextCards: ChatContextCard[];
  isRead: boolean;
  readAt?: string;
  aiMetadata?: {
    model?: string;
    toolCalls?: string[];
  };
  createdAt: string;
  updatedAt?: string;
}

export interface ConversationQueryFilters {
  status?: ConversationStatus;
  mode?: ConversationMode;
  assignedAgent?: string;
  page?: number;
  limit?: number;
}
