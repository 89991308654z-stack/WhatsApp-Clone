import { supabase } from './supabase';
import { User, AuthUser, DatabaseError } from '@/types';

class AuthService {
  async register(email: string, password: string, firstName: string, lastName: string): Promise<User> {
    try {
      // Register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Ошибка при создании пользователя');

      // Create user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          status: 'Доступен',
          is_online: true,
        })
        .select()
        .single();

      if (userError) throw userError;

      return userData;
    } catch (error: any) {
      throw new Error(error.message || 'Ошибка при регистрации');
    }
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Ошибка при входе');

      // Update online status
      await this.updateOnlineStatus(authData.user.id, true);

      // Get user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError) throw userError;

      return userData;
    } catch (error: any) {
      throw new Error(error.message || 'Ошибка при входе');
    }
  }

  async logout(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await this.updateOnlineStatus(user.id, false);
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Ошибка при выходе');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) return null;

      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) return null;

      return userData;
    } catch (error) {
      return null;
    }
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Пользователь не авторизован');

      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authUser.id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Ошибка при обновлении профиля');
    }
  }

  async updateOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    try {
      await supabase
        .from('users')
        .update({
          is_online: isOnline,
          last_seen: new Date().toISOString(),
        })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  }

  async uploadAvatar(userId: string, file: File | Blob): Promise<string> {
    try {
      const fileExt = file.type.split('/')[1];
      const fileName = `${userId}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('chat-media')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error: any) {
      throw new Error(error.message || 'Ошибка при загрузке аватара');
    }
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userData = await this.getCurrentUser();
        callback(userData);
      } else {
        callback(null);
      }
    });
  }
}

export const authService = new AuthService();