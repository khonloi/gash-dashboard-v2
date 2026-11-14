import { create } from 'zustand';
import { Conversation, ChatMessage, ConversationStatus } from '@/types/chat';
import { supportChatService } from '@/services/chatService';
import { getSupportSocket } from '@/lib/socketClient';
import { useAuthStore } from './useAuthStore';

export type SupportFilterTab = 'all' | 'queued' | 'assigned' | 'resolved';

interface SupportChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: ChatMessage[];
  activeFilter: SupportFilterTab;
  searchQuery: string;
  isLoading: boolean;
  isSending: boolean;
  isCustomerTyping: boolean;

  // Actions
  setActiveFilter: (filter: SupportFilterTab) => void;
  setSearchQuery: (query: string) => void;
  fetchConversations: () => Promise<void>;
  syncActiveState: () => Promise<void>;
  selectConversation: (conv: Conversation) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  assignToMe: () => Promise<void>;
  updateStatus: (status: ConversationStatus) => Promise<void>;
  connectSocket: () => () => void;
}

function isPopulatedPerson(
  val: unknown
): val is { _id: string; firstName: string; lastName: string; email?: string; avatar?: string } {
  return Boolean(
    val &&
    typeof val === 'object' &&
    'firstName' in val &&
    typeof (val as { firstName?: unknown }).firstName === 'string'
  );
}

function mergeConversation(
  prev: Conversation | null | undefined,
  next: Conversation
): Conversation {
  if (!prev) return next;
  return {
    ...prev,
    ...next,
    user: isPopulatedPerson(next.user)
      ? next.user
      : isPopulatedPerson(prev.user)
        ? prev.user
        : undefined,
    assignedAgent: isPopulatedPerson(next.assignedAgent)
      ? next.assignedAgent
      : isPopulatedPerson(prev.assignedAgent)
        ? prev.assignedAgent
        : undefined,
  };
}

export const useSupportChatStore = create<SupportChatState>((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  activeFilter: 'queued',
  searchQuery: '',
  isLoading: false,
  isSending: false,
  isCustomerTyping: false,

  setActiveFilter: (filter) => {
    set({ activeFilter: filter });
    get().fetchConversations();
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  fetchConversations: async () => {
    set({ isLoading: true });
    try {
      const { activeFilter } = get();
      const statusParam = activeFilter === 'all' ? undefined : (activeFilter as ConversationStatus);

      const res = await supportChatService.getConversations({
        status: statusParam,
      });

      const visible = res.conversations.filter((c) => c.status !== 'closed');
      const { activeConversation, selectConversation } = get();
      const updatedActive = activeConversation
        ? visible.find((c) => c._id === activeConversation._id)
        : undefined;
      const shouldClearClosedActive =
        activeConversation &&
        !updatedActive &&
        (activeConversation.status === 'closed' || activeFilter === 'all');

      set({
        conversations: visible,
        ...(updatedActive
          ? { activeConversation: mergeConversation(activeConversation, updatedActive) }
          : shouldClearClosedActive
            ? { activeConversation: visible[0] || null, messages: [] }
            : {}),
      });

      // If no active conversation is selected yet, select the first one
      if (!activeConversation && visible.length > 0) {
        selectConversation(visible[0]);
      } else if (shouldClearClosedActive && visible[0]) {
        selectConversation(visible[0]);
      }
    } catch {
      // Offline fallback dummy list
      const dummyConv: Conversation = {
        _id: 'conv_demo_queue_1',
        mode: 'support',
        status: 'queued',
        subject: 'Delivery issue for order GS-260914-ABC',
        unreadCountCustomer: 0,
        unreadCountAgent: 2,
        lastMessageAt: new Date().toISOString(),
        lastMessagePreview: 'Can you please check why my delivery is delayed?',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set({ conversations: [dummyConv] });
    } finally {
      set({ isLoading: false });
    }
  },

  syncActiveState: async () => {
    try {
      const { activeFilter } = get();
      const statusParam = activeFilter === 'all' ? undefined : (activeFilter as ConversationStatus);
      const res = await supportChatService.getConversations({
        status: statusParam,
      });

      const visible = res.conversations.filter((c) => c.status !== 'closed');

      set((state) => {
        const currentActive = state.activeConversation;
        const matched = currentActive
          ? visible.find((c) => c._id === currentActive._id)
          : undefined;
        const removedClosed =
          currentActive &&
          !matched &&
          (currentActive.status === 'closed' || activeFilter === 'all');

        return {
          conversations: visible,
          ...(currentActive && matched
            ? { activeConversation: mergeConversation(currentActive, matched) }
            : removedClosed
              ? { activeConversation: visible[0] || null, messages: [] }
              : {}),
        };
      });

      const currentActive = get().activeConversation;
      if (currentActive && !currentActive._id.startsWith('conv_demo_')) {
        const latestMsgs = await supportChatService.getMessages(currentActive._id);
        set((state) => {
          if (state.activeConversation?._id !== currentActive._id) return state;
          const pendingTemps = state.messages.filter((m) => m._id.startsWith('temp_agent_'));
          const merged = [...latestMsgs];
          for (const temp of pendingTemps) {
            if (!merged.some((m) => m.content === temp.content && m.senderType === 'agent')) {
              merged.push(temp);
            }
          }
          if (
            merged.length === state.messages.length &&
            merged.every((m, idx) => m._id === state.messages[idx]?._id)
          ) {
            return state;
          }
          return { messages: merged };
        });
      }
    } catch {
      // Ignore transient background sync errors
    }
  },

  selectConversation: async (conv) => {
    set({ activeConversation: conv, messages: [], isCustomerTyping: false });
    try {
      const msgs = await supportChatService.getMessages(conv._id);
      set({ messages: msgs });
      supportChatService.markRead(conv._id).catch(() => {});

      // Clear unread count on conversation
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c._id === conv._id ? { ...c, unreadCountAgent: 0 } : c
        ),
      }));

      // Join socket room
      const socket = getSupportSocket(useAuthStore.getState().accessToken);
      if (socket) {
        socket.emit('chat:join', { conversationId: conv._id });
      }
    } catch {
      // Fallback message
      set({
        messages: [
          {
            _id: 'msg_initial',
            conversation: conv._id,
            senderType: 'customer',
            content: 'Hello, I need help with my recent order delivery.',
            contextCards: [],
            isRead: true,
            createdAt: new Date().toISOString(),
          },
        ],
      });
    }
  },

  sendMessage: async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const { activeConversation, messages } = get();
    if (!activeConversation) return;

    if (
      activeConversation.status === 'bot_active' ||
      activeConversation.status === 'resolved' ||
      activeConversation.status === 'closed'
    ) {
      return;
    }

    set({ isSending: true });

    // Optimistic message
    const tempId = `temp_agent_${Date.now()}`;
    const optimistic: ChatMessage = {
      _id: tempId,
      conversation: activeConversation._id,
      senderType: 'agent',
      content: trimmed,
      contextCards: [],
      isRead: true,
      createdAt: new Date().toISOString(),
    };

    set({ messages: [...messages, optimistic] });

    try {
      const savedMsg = await supportChatService.sendMessage(activeConversation._id, trimmed);
      set((state) => {
        const withoutTemp = state.messages.filter((m) => m._id !== tempId);
        const exists = withoutTemp.some((m) => m._id === savedMsg._id);
        return {
          messages: exists ? withoutTemp : withoutTemp.concat(savedMsg),
        };
      });
    } catch {
      // Keep optimistic message
    } finally {
      set({ isSending: false });
    }
  },

  assignToMe: async () => {
    const { activeConversation, conversations } = get();
    if (!activeConversation) return;

    try {
      const updated = await supportChatService.assignConversation(activeConversation._id);
      const mergedConv = mergeConversation(activeConversation, updated);
      const { activeFilter } = get();
      set({
        activeConversation: mergedConv,
        conversations: conversations.map((c) =>
          c._id === mergedConv._id ? mergeConversation(c, mergedConv) : c
        ),
        ...(activeFilter === 'queued' ? { activeFilter: 'assigned' } : {}),
      });
      await get().fetchConversations();
      const msgs = await supportChatService.getMessages(activeConversation._id);
      set({ messages: msgs });
    } catch {
      // Fallback
      const currentUser = useAuthStore.getState().user;
      set((state) => ({
        activeConversation: state.activeConversation
          ? {
              ...state.activeConversation,
              status: 'assigned',
              assignedAgent: currentUser
                ? {
                    _id: currentUser._id,
                    firstName: currentUser.firstName,
                    lastName: currentUser.lastName,
                    avatar: currentUser.avatar,
                  }
                : undefined,
            }
          : null,
      }));
    }
  },

  updateStatus: async (status) => {
    const { activeConversation, conversations } = get();
    if (!activeConversation) return;

    const targetId = activeConversation._id;

    try {
      const updated = await supportChatService.updateStatus(targetId, status);

      if (status === 'closed') {
        const remaining = conversations.filter((c) => c._id !== targetId);
        const nextActive = remaining[0] || null;
        set({
          conversations: remaining,
          activeConversation: nextActive,
          messages: [],
        });
        if (nextActive) {
          await get().selectConversation(nextActive);
        }
        await get().fetchConversations();
        return;
      }

      const mergedConv = mergeConversation(activeConversation, updated);
      set({
        activeConversation: mergedConv,
        conversations: conversations.map((c) =>
          c._id === mergedConv._id ? mergeConversation(c, mergedConv) : c
        ),
      });
      const msgs = await supportChatService.getMessages(targetId);
      set({ messages: msgs });
      await get().fetchConversations();
    } catch {
      if (status === 'closed') {
        const remaining = conversations.filter((c) => c._id !== targetId);
        set({
          conversations: remaining,
          activeConversation: remaining[0] || null,
          messages: [],
        });
        return;
      }
      set((state) => ({
        activeConversation: state.activeConversation
          ? { ...state.activeConversation, status }
          : null,
      }));
    }
  },

  connectSocket: () => {
    const token = useAuthStore.getState().accessToken;
    const socket = getSupportSocket(token);

    if (!socket) return () => {};

    const joinActiveRoom = () => {
      const convId = get().activeConversation?._id;
      if (convId) {
        socket.emit('chat:join', { conversationId: convId });
      }
    };

    const handleNewMessage = (data: { conversationId: string; message: ChatMessage }) => {
      const { activeConversation, conversations } = get();
      if (!data?.message) return;

      const isKnownConv = conversations.some((c) => c._id === data.conversationId);

      // Update message list if this conversation is active (deduplicating against optimistic messages)
      if (activeConversation?._id === data.conversationId) {
        set((state) => {
          if (state.messages.some((m) => m._id === data.message._id)) {
            return state;
          }
          const filtered = state.messages.filter(
            (m) =>
              !(
                m._id.startsWith('temp_agent_') &&
                m.content === data.message.content &&
                data.message.senderType === 'agent'
              )
          );
          return { messages: [...filtered, data.message] };
        });
        supportChatService.markRead(data.conversationId).catch(() => {});
      }

      // Update conversation lastMessage preview and unread counters
      set((state) => ({
        conversations: state.conversations.map((c) => {
          if (c._id === data.conversationId) {
            return {
              ...c,
              lastMessageAt: data.message.createdAt,
              lastMessagePreview: data.message.content.slice(0, 100),
              unreadCountAgent:
                state.activeConversation?._id === data.conversationId ? 0 : c.unreadCountAgent + 1,
            };
          }
          return c;
        }),
      }));

      if (!isKnownConv) {
        get().fetchConversations();
      }
    };

    const handleQueueUpdated = () => {
      get().fetchConversations();
    };

    const handleCustomerTyping = (data: {
      conversationId?: string;
      senderRole: string;
      isTyping: boolean;
    }) => {
      const activeId = get().activeConversation?._id;
      if (data?.conversationId && activeId && data.conversationId !== activeId) {
        return;
      }
      if (data?.senderRole === 'customer' || data?.senderRole === 'guest') {
        set({ isCustomerTyping: Boolean(data.isTyping) });
      }
    };

    const handleStatusUpdated = (data: {
      conversationId: string;
      status: ConversationStatus;
      mode?: Conversation['mode'];
    }) => {
      if (data.status === 'closed') {
        set((state) => {
          const remaining = state.conversations.filter((c) => c._id !== data.conversationId);
          const wasActive = state.activeConversation?._id === data.conversationId;
          return {
            conversations: remaining,
            activeConversation: wasActive ? remaining[0] || null : state.activeConversation,
            messages: wasActive ? [] : state.messages,
          };
        });
        return;
      }

      set((state) => ({
        activeConversation:
          state.activeConversation?._id === data.conversationId
            ? {
                ...state.activeConversation,
                status: data.status,
                mode: data.mode || state.activeConversation.mode,
              }
            : state.activeConversation,
        conversations: state.conversations.map((c) =>
          c._id === data.conversationId
            ? { ...c, status: data.status, mode: data.mode || c.mode }
            : c
        ),
      }));
    };

    const handleAssigned = (data: {
      conversationId: string;
      status?: ConversationStatus;
      mode?: Conversation['mode'];
      assignedAgent?: Conversation['assignedAgent'];
    }) => {
      set((state) => ({
        activeConversation:
          state.activeConversation?._id === data.conversationId
            ? {
                ...state.activeConversation,
                status: data.status || 'assigned',
                mode: data.mode || 'support',
                assignedAgent: data.assignedAgent ?? state.activeConversation.assignedAgent,
              }
            : state.activeConversation,
        conversations: state.conversations.map((c) =>
          c._id === data.conversationId
            ? {
                ...c,
                status: data.status || 'assigned',
                mode: data.mode || 'support',
                assignedAgent: data.assignedAgent ?? c.assignedAgent,
              }
            : c
        ),
      }));
    };

    socket.on('connect', joinActiveRoom);
    socket.on('chat:message', handleNewMessage);
    socket.on('support:queue_updated', handleQueueUpdated);
    socket.on('chat:typing', handleCustomerTyping);
    socket.on('chat:status_updated', handleStatusUpdated);
    socket.on('chat:assigned', handleAssigned);

    // Join active conversation room immediately if one is selected
    joinActiveRoom();

    return () => {
      socket.off('connect', joinActiveRoom);
      socket.off('chat:message', handleNewMessage);
      socket.off('support:queue_updated', handleQueueUpdated);
      socket.off('chat:typing', handleCustomerTyping);
      socket.off('chat:status_updated', handleStatusUpdated);
      socket.off('chat:assigned', handleAssigned);
    };
  },
}));
