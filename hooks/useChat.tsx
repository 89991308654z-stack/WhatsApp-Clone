import { useContext } from 'react';
import { ChatContext } from '@/contexts/ChatContext';

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat должен использоваться внутри ChatProvider');
  }
  return context;
}