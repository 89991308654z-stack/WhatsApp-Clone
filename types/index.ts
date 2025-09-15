export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phoneNumber?: string;
  status: string;
  isOnline: boolean;
  lastSeen: Date;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'voice';
  timestamp: Date;
  isRead: boolean;
  reactions?: Reaction[];
  replyTo?: string;
}

export interface Reaction {
  userId: string;
  emoji: string;
}

export interface Chat {
  id: string;
  name?: string;
  isGroup: boolean;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  avatar?: string;
  createdAt: Date;
}

export interface Group extends Chat {
  description?: string;
  admins: string[];
  settings: {
    onlyAdminsCanMessage: boolean;
    onlyAdminsCanEditGroup: boolean;
  };
}

export interface Call {
  id: string;
  callerId: string;
  receiverId: string;
  type: 'audio' | 'video';
  status: 'calling' | 'active' | 'ended' | 'missed';
  startTime: Date;
  endTime?: Date;
}