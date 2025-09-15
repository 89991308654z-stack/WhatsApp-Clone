import React, { createContext, ReactNode, useState, useEffect } from 'react';
import { Chat, Message, Group } from '@/types';
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
  selectChat: (chatId: string | null) => void;
  createGroup: (name: string, participants: string[], description?: string) => Promise<void>;
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
    }
  }, [user]);

  const loadChats = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const chatList = await chatService.getChats();
      setChats(chatList);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    setIsLoading(true);
    try {
      const messageList = await chatService.getMessages(chatId);
      setMessages(messageList);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (chatId: string, content: string, type: 'text' | 'image' | 'video' | 'audio' | 'voice' = 'text') => {
    const newMessage = await chatService.sendMessage(chatId, content, type);
    setMessages(prev => [...prev, newMessage]);
    
    // Обновляем список чатов
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, lastMessage: newMessage }
        : chat
    ));
  };

  const selectChat = (chatId: string | null) => {
    setSelectedChatId(chatId);
    if (chatId) {
      loadMessages(chatId);
    }
  };

  const createGroup = async (name: string, participants: string[], description?: string) => {
    const newGroup = await chatService.createGroup(name, participants, description);
    setChats(prev => [newGroup, ...prev]);
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
      createGroup
    }}>
      {children}
    </ChatContext.Provider>
  );
}