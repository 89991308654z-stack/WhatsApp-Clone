import { Chat, Message, User, Group } from '@/types';

class ChatService {
  private chats: Chat[] = [
    {
      id: '1',
      name: 'Анна Петрова',
      isGroup: false,
      participants: ['1', '2'],
      unreadCount: 2,
      createdAt: new Date(Date.now() - 86400000),
      lastMessage: {
        id: '1',
        chatId: '1',
        senderId: '2',
        content: 'Привет! Как дела?',
        type: 'text',
        timestamp: new Date(Date.now() - 3600000),
        isRead: false
      }
    },
    {
      id: '2',
      name: 'Рабочая группа',
      isGroup: true,
      participants: ['1', '3', '4', '5'],
      unreadCount: 0,
      createdAt: new Date(Date.now() - 172800000),
      lastMessage: {
        id: '2',
        chatId: '2',
        senderId: '3',
        content: 'Встреча в 15:00',
        type: 'text',
        timestamp: new Date(Date.now() - 7200000),
        isRead: true
      }
    }
  ];

  private messages: Message[] = [
    {
      id: '1',
      chatId: '1',
      senderId: '2',
      content: 'Привет! Как дела?',
      type: 'text',
      timestamp: new Date(Date.now() - 3600000),
      isRead: false
    },
    {
      id: '2',
      chatId: '1',
      senderId: '1',
      content: 'Привет! Всё отлично, спасибо!',
      type: 'text',
      timestamp: new Date(Date.now() - 3300000),
      isRead: true
    }
  ];

  async getChats(): Promise<Chat[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.chats;
  }

  async getMessages(chatId: string): Promise<Message[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.messages.filter(msg => msg.chatId === chatId);
  }

  async sendMessage(chatId: string, content: string, type: 'text' | 'image' | 'video' | 'audio' | 'voice' = 'text'): Promise<Message> {
    const newMessage: Message = {
      id: Date.now().toString(),
      chatId,
      senderId: '1',
      content,
      type,
      timestamp: new Date(),
      isRead: false
    };
    
    this.messages.push(newMessage);
    
    // Обновляем последнее сообщение в чате
    const chatIndex = this.chats.findIndex(chat => chat.id === chatId);
    if (chatIndex !== -1) {
      this.chats[chatIndex].lastMessage = newMessage;
    }
    
    return newMessage;
  }

  async createGroup(name: string, participants: string[], description?: string): Promise<Group> {
    const newGroup: Group = {
      id: Date.now().toString(),
      name,
      isGroup: true,
      participants: ['1', ...participants],
      unreadCount: 0,
      createdAt: new Date(),
      description,
      admins: ['1'],
      settings: {
        onlyAdminsCanMessage: false,
        onlyAdminsCanEditGroup: true
      }
    };
    
    this.chats.push(newGroup);
    return newGroup;
  }
}

export const chatService = new ChatService();