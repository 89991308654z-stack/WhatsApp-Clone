import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChat } from '@/hooks/useChat';
import { MessageBubble } from '@/components/MessageBubble';
import { MessageInput } from '@/components/MessageInput';
import { Colors } from '@/constants/Colors';

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { messages, sendMessage, loadMessages } = useChat();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (chatId) {
      loadMessages(chatId);
    } else {
      router.back();
    }
  }, [chatId]);

  const handleSendMessage = async (content: string) => {
    if (chatId) {
      await sendMessage(chatId, content);
    }
  };

  const handleSendMedia = async (type: 'image' | 'video' | 'audio' | 'voice') => {
    if (chatId) {
      const mediaLabels = {
        image: 'Фото отправлено',
        video: 'Видео отправлено', 
        audio: 'Аудиофайл отправлен',
        voice: 'Голосовое сообщение'
      };
      await sendMessage(chatId, mediaLabels[type], type);
    }
  };

  const renderMessage = ({ item }: { item: any }) => (
    <MessageBubble
      message={item}
      isOwn={item.senderId === '1'}
      onReact={(messageId, emoji) => {
        // TODO: Implement message reactions
      }}
    />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        inverted
        showsVerticalScrollIndicator={false}
      />
      
      <MessageInput
        onSendMessage={handleSendMessage}
        onSendMedia={handleSendMedia}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  messagesList: {
    flex: 1,
    paddingVertical: 8,
  },
});