import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SupportClientView } from './SupportClientView';
import { useSupportChatStore } from '@/store/useSupportChatStore';
import { Conversation } from '@/types/chat';

vi.mock('@/lib/socketClient', () => ({
  getSupportSocket: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    connected: true,
  })),
  disconnectSupportSocket: vi.fn(),
}));

describe('SupportClientView Component', () => {
  const mockConversation: Conversation = {
    _id: 'conv_123',
    user: {
      _id: 'usr_1',
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
    },
    mode: 'support',
    status: 'queued',
    subject: 'Refund request',
    unreadCountCustomer: 0,
    unreadCountAgent: 1,
    lastMessagePreview: 'I would like to request a refund.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    useSupportChatStore.setState({
      conversations: [mockConversation],
      activeConversation: mockConversation,
      messages: [
        {
          _id: 'msg_1',
          conversation: 'conv_123',
          senderType: 'customer',
          content: 'I would like to request a refund.',
          contextCards: [],
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ],
      activeFilter: 'queued',
      searchQuery: '',
      isLoading: false,
      isSending: false,
      isCustomerTyping: false,
    });
  });

  it('renders support queue and active customer chat', () => {
    render(<SupportClientView />);

    expect(screen.getByPlaceholderText(/Search conversations.../i)).toBeDefined();
    expect(screen.getByRole('tab', { name: /Queued/i })).toBeDefined();
    expect(screen.getAllByText(/Alice Smith/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/I would like to request a refund./i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Claim Ticket/i })).toBeDefined();
  });

  it('allows agent to send a reply', async () => {
    render(<SupportClientView />);

    const input = screen.getByPlaceholderText(/Type your response to the customer.../i);
    fireEvent.change(input, { target: { value: 'Hello Alice, I can help!' } });

    const sendBtn = screen.getByRole('button', { name: /Send reply/i });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(
        useSupportChatStore
          .getState()
          .messages.some((m) => m.content.includes('Hello Alice, I can help!'))
      ).toBe(true);
    });
  });

  it('claims ticket when clicking Claim Ticket', async () => {
    render(<SupportClientView />);

    const claimBtn = screen.getByRole('button', { name: /Claim Ticket/i });
    fireEvent.click(claimBtn);

    await waitFor(() => {
      expect(useSupportChatStore.getState().activeConversation?.status).toBe('assigned');
    });
  });

  it('disables staff reply and hides Claim Ticket when conversation is bot_active', () => {
    useSupportChatStore.setState({
      conversations: [{ ...mockConversation, mode: 'ai', status: 'bot_active' }],
      activeConversation: { ...mockConversation, mode: 'ai', status: 'bot_active' },
      activeFilter: 'all',
    });

    render(<SupportClientView />);

    expect(screen.queryByRole('button', { name: /Claim Ticket/i })).toBeNull();
    const input = screen.getByPlaceholderText(
      /Waiting for customer to request human support.../i
    ) as HTMLInputElement;
    expect(input.disabled).toBe(true);
    expect(screen.getByText(/Staff interaction unlocks when the customer requests human support/i)).toBeDefined();
  });

  it('removes conversation from queue and view when closed', async () => {
    render(<SupportClientView />);

    const closeBtn = screen.getByRole('button', { name: /^Close$/i });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(
        useSupportChatStore.getState().conversations.some((c) => c._id === 'conv_123')
      ).toBe(false);
    });
  });
});
