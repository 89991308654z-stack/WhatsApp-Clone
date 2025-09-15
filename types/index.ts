export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  phone_number?: string;
  status: string;
  is_online: boolean;
  last_seen: string;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: string;
  name?: string;
  is_group: boolean;
  avatar_url?: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  participants?: ChatParticipant[];
  last_message?: Message;
  unread_count?: number;
}

export interface ChatParticipant {
  id: string;
  chat_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  user?: User;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content?: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'voice' | 'file';
  media_url?: string;
  reply_to?: string;
  created_at: string;
  updated_at: string;
  sender?: User;
  reactions?: MessageReaction[];
  status?: MessageStatus[];
  reply_message?: Message;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  user?: User;
}

export interface MessageStatus {
  id: string;
  message_id: string;
  user_id: string;
  status: 'sent' | 'delivered' | 'read';
  created_at: string;
}

export interface Call {
  id: string;
  caller_id: string;
  chat_id: string;
  call_type: 'audio' | 'video';
  status: 'calling' | 'active' | 'ended' | 'missed' | 'declined';
  started_at: string;
  ended_at?: string;
  duration: number;
  caller?: User;
  participants?: CallParticipant[];
}

export interface CallParticipant {
  id: string;
  call_id: string;
  user_id: string;
  joined_at: string;
  left_at?: string;
  user?: User;
}

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
  };
}

export interface DatabaseError {
  message: string;
  code?: string;
}