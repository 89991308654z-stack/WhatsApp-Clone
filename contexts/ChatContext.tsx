import React, { createContext, ReactNode, useState, useEffect } from 'react';
import { Chat, Message } from '@/types';
import { chatService } from '@/services/chatService';
import { useAuth } from '@/hooks/useAuth';

interface ChatContextType {
  chats: Chat[];
  messages: Message[];
  isLoading: boolean;
  selectedChatId: string | null;
  loadChats: () => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, content: string, type?: 'text' | 'image' | 'video' | 'audio' | 'voice') => Promise<void>;
  selectChat: (chatId: string) => void;
  createGroup: (name: string, participants: string[], description?: string) => Promise<void>;
  createChat: (participantIds: string[]) => Promise<Chat>;
  uploadMedia: (file: File | Blob, messageType: string) => Promise<string>;
  addMessageReaction: (messageId: string, emoji: string) => Promise<void>;
  removeMessageReaction: (messageId: string, emoji: string) => Promise<void>;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadChats();
    } else {
      setChats([]);
      setMessages([]);
    }
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    let messageSubscription: any;
    let chatSubscription: any;

    // Subscribe to chat updates
    chatSubscription = chatService.subscribeToChats(user.id, (updatedChat) => {
      setChats(prev => {
        const existingIndex = prev.findIndex(c => c.id === updatedChat.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = updatedChat;
          return updated;
        }
        return [updatedChat, ...prev];
      });
    });

    // Subscribe to messages for selected chat
    if (selectedChatId) {
      messageSubscription = chatService.subscribeToMessages(selectedChatId, (newMessage) => {
        setMessages(prev => {
          // Check if message already exists
          if (prev.some(m => m.id === newMessage.id)) {
            return prev;
          }
          return [newMessage, ...prev];
        });

        // Update chat's last message
        setChats(prev => prev.map(chat => 
          chat.id === selectedChatId 
            ? { ...chat, last_message: newMessage }
            : chat
        ));
      });
    }

    return () => {
      if (messageSubscription) {
        messageSubscription.unsubscribe();
      }
      if (chatSubscription) {
        chatSubscription.unsubscribe();
      }
    };
  }, [user, selectedChatId]);

  const loadChats = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const chatList = await chatService.getChats(user.id);
      setChats(chatList);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    setIsLoading(true);
    try {
      const messageList = await chatService.getMessages(chatId);
      setMessages(messageList.reverse()); // Reverse to show newest at bottom
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (
    chatId: string, 
    content: string, 
    type: 'text' | 'image' | 'video' | 'audio' | 'voice' = 'text'
  ) => {
    if (!user) throw new Error('Пользователь не авторизован');

    try {
      const newMessage = await chatService.sendMessage(chatId, user.id, content, type);
      
      // Message will be added via real-time subscription
      // But we can optimistically update for better UX
      setMessages(prev => [newMessage, ...prev]);
      
      // Update chat's last message
      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, last_message: newMessage, updated_at: newMessage.created_at }
          : chat
      ));
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const selectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    loadMessages(chatId);
  };

  const createGroup = async (name: string, participants: string[], description?: string) => {
    if (!user) throw new Error('Пользователь не авторизован');

    try {
      const newChat = await chatService.createChat(participants, true, name);
      setChats(prev => [newChat, ...prev]);
      return newChat;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  };

  const createChat = async (participantIds: string[]): Promise<Chat> => {
    if (!user) throw new Error('Пользователь не авторизован');

    try {
      const newChat = await chatService.createChat(participantIds, false);
      setChats(prev => [newChat, ...prev]);
      return newChat;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  };

  const uploadMedia = async (file: File | Blob, messageType: string): Promise<string> => {
    if (!user) throw new Error('Пользователь не авторизован');

    try {
      const mediaUrl = await chatService.uploadMedia(file, user.id, messageType);
      return mediaUrl;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  };

  const addMessageReaction = async (messageId: string, emoji: string) => {
    if (!user) throw new Error('Пользователь не авторизован');

    try {
      await chatService.addReaction(messageId, user.id, emoji);
      
      // Optimistically update messages
      setMessages(prev => prev.map(message => {
        if (message.id === messageId) {
          const existingReactions = message.reactions || [];
          const hasReaction = existingReactions.some(r => r.user_id === user.id && r.emoji === emoji);
          
          if (!hasReaction) {
            return {
              ...message,
              reactions: [...existingReactions, { 
                id: `temp-${Date.now()}`,
                message_id: messageId,
                user_id: user.id,
                emoji,
                created_at: new Date().toISOString(),
                user: user
              }]
            };
          }
        }
        return message;
      }));
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  };

  const removeMessageReaction = async (messageId: string, emoji: string) => {
    if (!user) throw new Error('Пользователь не авторизован');

    try {
      await chatService.removeReaction(messageId, user.id, emoji);
      
      // Optimistically update messages
      setMessages(prev => prev.map(message => {
        if (message.id === messageId) {
          return {
            ...message,
            reactions: (message.reactions || []).filter(r => 
              !(r.user_id === user.id && r.emoji === emoji)
            )
          };
        }
        return message;
      }));
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  };

  return (
    <ChatContext.Provider value={{
      chats,
      messages,
      isLoading,
      selectedChatId,
      loadChats,
      loadMessages,
      sendMessage,
      selectChat,
      createGroup,
      createChat,
      uploadMedia,
      addMessageReaction,
      removeMessageReaction
    }}>
      {children}
    </ChatContext.Provider>
  );
}