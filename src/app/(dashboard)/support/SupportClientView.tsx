'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Headphones,
  Send,
  UserCheck,
  CheckCircle,
  Archive,
  Search,
  Package,
  ShoppingBag,
  Lock,
  Info,
} from 'lucide-react';
import { Button, Input, Badge, StatusBadge, EmptyState } from '@/components/ui';
import { useSupportChatStore, SupportFilterTab } from '@/store/useSupportChatStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Conversation } from '@/types/chat';
import clsx from 'clsx';
import styles from './Support.module.css';

function getCustomerDisplayName(conv: Conversation): string {
  if (conv.user && typeof conv.user === 'object' && (conv.user.firstName || conv.user.lastName)) {
    return `${conv.user.firstName || ''} ${conv.user.lastName || ''}`.trim();
  }
  if (conv.user && typeof conv.user === 'object' && conv.user.email) {
    return conv.user.email;
  }
  if (conv.guestId) {
    return `Guest (${conv.guestId.slice(-6)})`;
  }
  return 'Customer';
}

function getCustomerInitial(conv: Conversation): string {
  if (conv.user && typeof conv.user === 'object' && conv.user.firstName) {
    return conv.user.firstName.charAt(0).toUpperCase();
  }
  return 'G';
}

function getAgentDisplayName(agent: Conversation['assignedAgent']): string | null {
  if (!agent || typeof agent !== 'object') return null;
  const full = `${agent.firstName || ''} ${agent.lastName || ''}`.trim();
  return full || agent.email || null;
}

export function SupportClientView() {
  const [inputContent, setInputContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const accessToken = useAuthStore((s) => s.accessToken);

  const {
    conversations,
    activeConversation,
    messages,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    fetchConversations,
    syncActiveState,
    selectConversation,
    sendMessage,
    assignToMe,
    updateStatus,
    isSending,
    isCustomerTyping,
    connectSocket,
  } = useSupportChatStore();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations, accessToken]);

  useEffect(() => {
    const cleanup = connectSocket();
    return () => {
      cleanup();
    };
  }, [connectSocket, accessToken]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') return;
    const interval = setInterval(() => {
      syncActiveState();
    }, 3000);
    return () => clearInterval(interval);
  }, [syncActiveState]);

  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isCustomerTyping]);

  const canStaffInteract =
    activeConversation?.status === 'queued' || activeConversation?.status === 'assigned';

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim() || isSending || !canStaffInteract) return;

    const text = inputContent;
    setInputContent('');
    await sendMessage(text);
  };

  const visibleConversations = conversations.filter((c) => c.status !== 'closed');

  const filteredConversations = visibleConversations.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const customerName = getCustomerDisplayName(c).toLowerCase();
    const subject = c.subject?.toLowerCase() || '';
    const preview = c.lastMessagePreview?.toLowerCase() || '';
    return customerName.includes(q) || subject.includes(q) || preview.includes(q);
  });

  return (
    <div className={styles.supportContainer}>
      {/* Left Panel: Conversation Queue & Filters */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Input
            id="supportSearch"
            size="sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            leftIcon={<Search size={14} />}
            aria-label="Search conversations"
          />

          <div className={styles.filterTabs} role="tablist">
            {(['queued', 'assigned', 'all', 'resolved'] as SupportFilterTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeFilter === tab}
                onClick={() => setActiveFilter(tab)}
                className={clsx(styles.filterTab, activeFilter === tab && styles.filterTabActive)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.conversationList}>
          {filteredConversations.length === 0 ? (
            <EmptyState
              variant="ghost"
              size="sm"
              icon={<Headphones size={28} />}
              title="Queue is empty"
              description="No conversations found in this queue."
              className={styles.sidebarEmptyState}
            />
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = activeConversation?._id === conv._id;
              const customerDisplay = getCustomerDisplayName(conv);

              return (
                <button
                  type="button"
                  key={conv._id}
                  onClick={() => selectConversation(conv)}
                  className={clsx(
                    styles.conversationItem,
                    isSelected && styles.conversationItemActive
                  )}
                >
                  <div className={styles.itemAvatar}>{getCustomerInitial(conv)}</div>
                  <div className={styles.itemBody}>
                    <div className={styles.itemHeader}>
                      <span className={styles.customerName}>{customerDisplay}</span>
                      <span className={styles.itemTime}>
                        {conv.lastMessageAt
                          ? new Date(conv.lastMessageAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </span>
                    </div>
                    <div className={styles.itemPreview}>
                      {conv.lastMessagePreview || conv.subject || 'No preview'}
                    </div>
                    <div className={styles.itemFooter}>
                      <StatusBadge status={conv.status} />
                      {conv.unreadCountAgent > 0 && (
                        <Badge variant="destructive" size="sm">
                          {conv.unreadCountAgent}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Center Panel: Active Chat Desk */}
      {activeConversation ? (
        <main className={styles.chatArea}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <div className={styles.chatCustomerInfo}>
              <div className={styles.customerAvatarLarge}>
                {getCustomerInitial(activeConversation)}
              </div>
              <div>
                <h3 className={styles.chatCustomerName}>
                  {getCustomerDisplayName(activeConversation)}
                </h3>
                <div className={styles.chatCustomerSub}>
                  <StatusBadge status={activeConversation.status} />
                  <span>•</span>
                  <span>
                    Mode: <strong>{activeConversation.mode}</strong>
                  </span>
                  {getAgentDisplayName(activeConversation.assignedAgent) && (
                    <>
                      <span>•</span>
                      <span>
                        Agent:{' '}
                        <strong>{getAgentDisplayName(activeConversation.assignedAgent)}</strong>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.headerActions}>
              {activeConversation.status === 'queued' && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={assignToMe}
                  leftIcon={<UserCheck size={14} />}
                >
                  Claim Ticket
                </Button>
              )}

              {canStaffInteract && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updateStatus('resolved')}
                  leftIcon={<CheckCircle size={14} />}
                >
                  Resolve
                </Button>
              )}

              {activeConversation.status !== 'bot_active' &&
                activeConversation.status !== 'closed' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => updateStatus('closed')}
                    leftIcon={<Archive size={14} />}
                  >
                    Close
                  </Button>
                )}
            </div>
          </div>

          {activeConversation.status === 'bot_active' && (
            <div className={styles.interactionNotice} role="status">
              <Lock size={14} />
              <span>
                Handled by GASH AI Assistant — Staff interaction unlocks when the customer requests
                human support.
              </span>
            </div>
          )}

          {activeConversation.status === 'resolved' && (
            <div className={styles.interactionNotice} role="status">
              <Info size={14} />
              <span>
                This conversation is resolved. Staff replies stay locked unless the customer
                re-escalates to support.
              </span>
            </div>
          )}

          {/* Messages */}
          <div className={styles.messagesContainer}>
            {messages.map((msg) => {
              if (msg.senderType === 'system') {
                return (
                  <div key={msg._id} className={styles.systemNoticeRow}>
                    <div className={styles.systemNoticePill}>
                      <Info size={12} />
                      <span>{msg.content}</span>
                    </div>
                  </div>
                );
              }

              const isAgent = msg.senderType === 'agent';
              const isAi = msg.senderType === 'ai';

              return (
                <div
                  key={msg._id}
                  className={clsx(
                    styles.messageRow,
                    isAgent ? styles.messageRowAgent : styles.messageRowCustomer
                  )}
                >
                  <div
                    className={clsx(
                      styles.bubble,
                      isAgent ? styles.bubbleAgent : isAi ? styles.bubbleAi : styles.bubbleCustomer
                    )}
                  >
                    <div>{msg.content}</div>

                    {/* Context Cards */}
                    {msg.contextCards && msg.contextCards.length > 0 && (
                      <div className={styles.cardsList}>
                        {msg.contextCards.map((card, idx) => (
                          <div
                            key={card._id || `desk_card_${idx}`}
                            className={styles.contextCardItem}
                          >
                            <div className={styles.cardIconBox}>
                              {card.cardType === 'product' ? (
                                <Package size={18} />
                              ) : (
                                <ShoppingBag size={18} />
                              )}
                            </div>
                            <div>
                              <div className={styles.cardTitle}>
                                {card.product?.name ||
                                  `Order #${card.order?.orderNumber || 'Reference'}`}
                              </div>
                              <div className={styles.cardSubtitle}>
                                {card.product
                                  ? `$${card.product.price.toFixed(2)}`
                                  : `Status: ${card.order?.status || 'Unknown'}`}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className={styles.messageMeta}>
                      <span>
                        {isAgent
                          ? 'You'
                          : isAi
                            ? 'AI Assistant'
                            : msg.senderUser?.firstName || 'Customer'}
                      </span>
                      <span>•</span>
                      <span>
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {isCustomerTyping && (
              <div className={styles.typingNotice}>
                <span>Customer is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Composer */}
          <div className={styles.composerArea}>
            <form onSubmit={handleSendMessage} className={styles.composerForm}>
              <div className={styles.composerInputWrap}>
                <Input
                  type="text"
                  size="md"
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  placeholder={
                    canStaffInteract
                      ? 'Type your response to the customer...'
                      : 'Waiting for customer to request human support...'
                  }
                  disabled={isSending || !canStaffInteract}
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="icon"
                disabled={!canStaffInteract || !inputContent.trim() || isSending}
                aria-label="Send reply"
              >
                <Send size={18} />
              </Button>
            </form>
          </div>
        </main>
      ) : (
        <div className={styles.noConversationSelected}>
          <EmptyState
            variant="card"
            icon={<Headphones size={40} />}
            title="No Active Conversation"
            description="Select a queued or assigned customer conversation to start messaging."
          />
        </div>
      )}
    </div>
  );
}
