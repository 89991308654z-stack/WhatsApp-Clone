import React, { useEffect, useState } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { MessageBubble } from '@/components/MessageBubble';
import { MessageInput } from '@/components/MessageInput';
import { Colors, Spacing } from '@/constants/Colors';

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { messages, sendMessage, selectChat, chats, addMessageReaction } = useChat();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [currentChat, setCurrentChat] = useState<any>(null);

  useEffect(() => {
    if (chatId) {
      selectChat(chatId);
      // Find current chat info
      const chat = chats.find(c => c.id === chatId);
      setCurrentChat(chat);
    } else {
      router.back();
    }
  }, [chatId, chats]);

  const handleSendMessage = async (content: string) => {
    if (chatId && content.trim()) {
      try {
        await sendMessage(chatId, content);
      } catch (error) {
        Alert.alert('Ошибка', 'Не удалось отправить сообщение');
      }
    }
  };

  const handleMessageReaction = async (messageId: string, emoji: string) => {
    try {
      await addMessageReaction(messageId, emoji);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const renderMessage = ({ item }: { item: any }) => (
    <MessageBubble
      message={item}
      isOwn={item.sender_id === user?.id}
      onReact={handleMessageReaction}
    />
  );

  const getChatName = () => {
    if (!currentChat) return 'Чат';
    
    if (currentChat.is_group) {
      return currentChat.name || 'Группа';
    }
    
    // For direct chats, show other participant's name
    if (currentChat.participants) {
      const otherParticipant = currentChat.participants.find(
        (p: any) => p.user_id !== user?.id
      );
      if (otherParticipant?.user) {
        return `${otherParticipant.user.first_name} ${otherParticipant.user.last_name}`;
      }
    }
    
    return 'Чат';
  };

  const getOnlineStatus = () => {
    if (!currentChat || currentChat.is_group) return null;
    
    const otherParticipant = currentChat.participants?.find(
      (p: any) => p.user_id !== user?.id
    );
    
    if (otherParticipant?.user) {
      return otherParticipant.user.is_online ? 'в сети' : 'не в сети';
    }
    
    return null;
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen 
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: 'white',
          headerTitle: () => (
            <View style={styles.headerContainer}>
              <TouchableOpacity style={styles.headerContent}>
                <View style={styles.avatarContainer}>
                  <MaterialIcons 
                    name={currentChat?.is_group ? 'group' : 'person'} 
                    size={24} 
                    color="white" 
                  />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.headerTitle}>{getChatName()}</Text>
                  {getOnlineStatus() && (
                    <Text style={styles.headerSubtitle}>{getOnlineStatus()}</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => {
                  // TODO: Implement video call
                  Alert.alert('Видеозвонок', 'Функция будет реализована позже');
                }}
              >
                <MaterialIcons name="videocam" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => {
                  // TODO: Implement audio call
                  Alert.alert('Аудиозвонок', 'Функция будет реализована позже');
                }}
              >
                <MaterialIcons name="call" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => {
                  // TODO: Implement chat settings
                  Alert.alert('Настройки чата', 'Функция будет реализована позже');
                }}
              >
                <MaterialIcons name="more-vert" size={24} color="white" />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        inverted
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: Spacing.sm }}
      />
      
      <MessageInput
        onSendMessage={handleSendMessage}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
  },
  headerContainer: {
    flex: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.xs,
  },
});