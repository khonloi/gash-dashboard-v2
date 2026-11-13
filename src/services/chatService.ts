import { request } from '@/lib/apiClient';
import {
  Conversation,
  ChatMessage,
  ConversationStatus,
  ConversationQueryFilters,
} from '@/types/chat';

export interface ApiResponseWrapper<T> {
  status: 'success' | 'fail' | 'error';
  data: T;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
  };
}

export const supportChatService = {
  /**
   * Lists conversations in queue or history with filters.
   */
  async getConversations(
    filters?: ConversationQueryFilters
  ): Promise<{ conversations: Conversation[]; total: number }> {
    const res = await request<ApiResponseWrapper<{ conversations: Conversation[] }>>(
      '/chat/conversations',
      {
        params: filters as Record<string, string | number | undefined>,
      }
    );
    return {
      conversations: res.data.conversations || [],
      total: res.pagination?.totalResults || (res.data.conversations || []).length,
    };
  },

  /**
   * Retrieves single conversation metadata.
   */
  async getConversation(id: string): Promise<Conversation> {
    const res = await request<ApiResponseWrapper<{ conversation: Conversation }>>(
      `/chat/conversations/${id}`
    );
    return res.data.conversation;
  },

  /**
   * Retrieves messages for a conversation.
   */
  async getMessages(conversationId: string, page = 1, limit = 50): Promise<ChatMessage[]> {
    const res = await request<ApiResponseWrapper<{ messages: ChatMessage[] }>>(
      `/chat/conversations/${conversationId}/messages`,
      {
        params: { page, limit },
      }
    );
    return res.data.messages || [];
  },

  /**
   * Sends an agent response message.
   */
  async sendMessage(conversationId: string, content: string): Promise<ChatMessage> {
    const res = await request<ApiResponseWrapper<{ message: ChatMessage }>>(
      `/chat/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({ content }),
      }
    );
    return res.data.message;
  },

  /**
   * Assigns current agent to a conversation.
   */
  async assignConversation(conversationId: string): Promise<Conversation> {
    const res = await request<ApiResponseWrapper<{ conversation: Conversation }>>(
      `/chat/conversations/${conversationId}/assign`,
      {
        method: 'PATCH',
      }
    );
    return res.data.conversation;
  },

  /**
   * Updates conversation status (e.g. resolved, closed).
   */
  async updateStatus(conversationId: string, status: ConversationStatus): Promise<Conversation> {
    const res = await request<ApiResponseWrapper<{ conversation: Conversation }>>(
      `/chat/conversations/${conversationId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
    return res.data.conversation;
  },

  /**
   * Marks unread customer messages as read.
   */
  async markRead(conversationId: string): Promise<void> {
    await request(`/chat/conversations/${conversationId}/read`, {
      method: 'PATCH',
    });
  },
};
