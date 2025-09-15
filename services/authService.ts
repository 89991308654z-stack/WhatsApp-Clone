import { User } from '@/types';

class AuthService {
  private currentUser: User | null = null;

  async register(email: string, password: string, firstName: string, lastName: string): Promise<User> {
    // Симуляция регистрации
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: Date.now().toString(),
      email,
      firstName,
      lastName,
      status: 'Доступен',
      isOnline: true,
      lastSeen: new Date()
    };
    
    this.currentUser = newUser;
    return newUser;
  }

  async login(email: string, password: string): Promise<User> {
    // Симуляция входа
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user: User = {
      id: '1',
      email,
      firstName: 'Иван',
      lastName: 'Иванов',
      status: 'Доступен',
      isOnline: true,
      lastSeen: new Date()
    };
    
    this.currentUser = user;
    return user;
  }

  async logout(): Promise<void> {
    this.currentUser = null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    if (!this.currentUser) throw new Error('Пользователь не авторизован');
    
    this.currentUser = { ...this.currentUser, ...updates };
    return this.currentUser;
  }
}

export const authService = new AuthService();