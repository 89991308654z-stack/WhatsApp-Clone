import { supabase } from './supabase';
import { Chat, Message, ChatParticipant, MessageReaction, Call, User } from '@/types';

class ChatService {
  async getChats(userId: string): Promise<Chat[]> {
    try {
      const { data, error } = await supabase
        .from('chat_participants')
        .select(`
          chat:chats (
            id,
            name,
            is_group,
            avatar_url,
            description,
            created_by,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      const chats = data?.map(item => item.chat).filter(Boolean) || [];

      // Get last message and unread count for each chat
      const chatsWithDetails = await Promise.all(
        chats.map(async (chat) => {
          const [lastMessage, unreadCount, participants] = await Promise.all([
            this.getLastMessage(chat.id),
            this.getUnreadCount(chat.id, userId),
            this.getChatParticipants(chat.id)
          ]);

          return {
            ...chat,
            last_message: lastMessage,
            unread_count: unreadCount,
            participants
          };
        })
      );

      return chatsWithDetails.sort((a, b) => {
        const aTime = a.last_message?.created_at || a.created_at;
        const bTime = b.last_message?.created_at || b.created_at;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });
    } catch (error: any) {
      throw new Error(error.message || 'Ошибка при загрузке чатов');
    }
  }

  async getMessages(chatId: string, limit: number = 50): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          chat_id,
          sender_id,
          content,
          message_type,
          media_url,
          reply_to,
          created_at,
          updated_at,
          sender:users (
            id,
            first_name,
            last_name,
            avatar_url
          ),
          reactions:message_reactions (
            id,
            emoji,
            user_id,
            user:users (
              id,
              first_name,
              last_name
            )
          ),
          reply_message:messages (
            id,
            content,
            message_type,
            sender:users (
              first_name,
              last_name
            )
          )
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Ошибка при загрузке сообщений');
    }
  }

  async sendMessage(
    chatId: string,
    senderId: string,
    content: string,
    messageType: 'text' | 'image' | 'video' | 'audio' | 'voice' | 'file' = 'text',
    mediaUrl?: string,
    replyTo?: string
  ): Promise<Message> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: senderId,
          content,
          message_type: messageType,
          media_url: mediaUrl,
          reply_to: replyTo,
        })
        .select(`
          id,
          chat_id,
          sender_id,
          content,
          message_type,
          media_url,
          reply_to,
          created_at,
          updated_at,
          sender:users (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      // Mark message as delivered for other participants
      await this.markMessageAsDelivered(data.id, chatId, senderId);

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Ошибка при отправке сообщения');
    }
  }

  async createChat(participantIds: string[], isGroup: boolean = false, name?: string): Promise<Chat> {
    try {
      const currentUser = await supabase.auth.getUser();
      if (!currentUser.data.user) throw new Error('Пользователь не авторизован');

      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .insert({
          name,
          is_group: isGroup,
          created_by: currentUser.data.user.id,
        })
        .select()
        .single();

      if (chatError) throw chatError;

      // Add participants
      const participants = [currentUser.data.user.id, ...participantIds];
      const participantData = participants.map(userId => ({
        chat_id: chatData.id,
        user_id: userId,
        role: userId === currentUser.data.user.id ? 'admin' : 'member',
      }));

      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert(participantData);

      if (participantsError) throw participantsError;

      return chatData;
    } catch (error: any) {
      throw new Error(error.message || 'Ошибка при создании чата');
    }
  }

  async addReaction(messageId: string, userId: string, emoji: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('message_reactions')
        .upsert({
          message_id: messageId,
          user_id: userId,
          emoji,
        });

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Ошибка при добавлении реакции');
    }
  }

  async removeReaction(messageId: string, userId: string, emoji: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', userId)
        .eq('emoji', emoji);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Ошибка при удалении реакции');
    }
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('message_status')
        .upsert({
          message_id: messageId,
          user_id: userId,
          status: 'read',
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error marking message as read:', error);
    }
  }

  async uploadMedia(file: File | Blob, userId: string, messageType: string): Promise<string> {
    try {
      const fileExt = file.type.split('/')[1] || 'bin';
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('chat-media')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error: any) {
      throw new Error(error.message || 'Ошибка при загрузке файла');
    }
  }

  async createCall(chatId: string, callerId: string, callType: 'audio' | 'video'): Promise<Call> {
    try {
      const { data, error } = await supabase
        .from('calls')
        .insert({
          caller_id: callerId,
          chat_id: chatId,
          call_type: callType,
          status: 'calling',
        })
        .select(`
          id,
          caller_id,
          chat_id,
          call_type,
          status,
          started_at,
          ended_at,
          duration,
          caller:users (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Ошибка при создании звонка');
    }
  }

  async getCalls(chatId: string): Promise<Call[]> {
    try {
      const { data, error } = await supabase
        .from('calls')
        .select(`
          id,
          caller_id,
          chat_id,
          call_type,
          status,
          started_at,
          ended_at,
          duration,
          caller:users (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('chat_id', chatId)
        .order('started_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Ошибка при загрузке звонков');
    }
  }

  async searchUsers(query: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, avatar_url, status, is_online')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(20);

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Ошибка при поиске пользователей');
    }
  }

  // Real-time subscriptions
  subscribeToMessages(chatId: string, callback: (message: Message) => void) {
    return supabase
      .channel(`messages:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        async (payload) => {
          // Get full message data with relations
          const { data } = await supabase
            .from('messages')
            .select(`
              id,
              chat_id,
              sender_id,
              content,
              message_type,
              media_url,
              reply_to,
              created_at,
              updated_at,
              sender:users (
                id,
                first_name,
                last_name,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            callback(data);
          }
        }
      )
      .subscribe();
  }

  subscribeToChats(userId: string, callback: (chat: Chat) => void) {
    return supabase
      .channel(`chats:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats',
        },
        (payload) => {
          callback(payload.new as Chat);
        }
      )
      .subscribe();
  }

  subscribeToUserStatus(callback: (user: User) => void) {
    return supabase
      .channel('user-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
        },
        (payload) => {
          callback(payload.new as User);
        }
      )
      .subscribe();
  }

  // Helper methods
  private async getLastMessage(chatId: string): Promise<Message | null> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          message_type,
          created_at,
          sender:users (
            first_name,
            last_name
          )
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return null;

      return data;
    } catch (error) {
      return null;
    }
  }

  private async getUnreadCount(chatId: string, userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .eq('chat_id', chatId)
        .neq('sender_id', userId)
        .not('id', 'in', `(
          SELECT message_id FROM message_status 
          WHERE user_id = '${userId}' AND status = 'read'
        )`);

      if (error) return 0;

      return count || 0;
    } catch (error) {
      return 0;
    }
  }

  private async getChatParticipants(chatId: string): Promise<ChatParticipant[]> {
    try {
      const { data, error } = await supabase
        .from('chat_participants')
        .select(`
          id,
          chat_id,
          user_id,
          role,
          joined_at,
          user:users (
            id,
            first_name,
            last_name,
            avatar_url,
            is_online,
            last_seen
          )
        `)
        .eq('chat_id', chatId);

      if (error) throw error;

      return data || [];
    } catch (error) {
      return [];
    }
  }

  private async markMessageAsDelivered(messageId: string, chatId: string, senderId: string): Promise<void> {
    try {
      // Get all participants except sender
      const { data: participants } = await supabase
        .from('chat_participants')
        .select('user_id')
        .eq('chat_id', chatId)
        .neq('user_id', senderId);

      if (participants && participants.length > 0) {
        const statusData = participants.map(p => ({
          message_id: messageId,
          user_id: p.user_id,
          status: 'delivered' as const,
        }));

        await supabase
          .from('message_status')
          .insert(statusData);
      }
    } catch (error) {
      console.error('Error marking message as delivered:', error);
    }
  }
}

export const chatService = new ChatService();