import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Message } from '@/types';
import { Colors, Spacing } from '@/constants/Colors';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onReact?: (messageId: string, emoji: string) => void;
}

export function MessageBubble({ message, isOwn, onReact }: MessageBubbleProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const handleReact = () => {
    onReact?.(message.id, '👍');
  };

  return (
    <View style={[styles.container, isOwn ? styles.ownMessage : styles.otherMessage]}>
      <TouchableOpacity
        style={[
          styles.bubble,
          isOwn ? styles.ownBubble : styles.otherBubble
        ]}
        onLongPress={handleReact}
      >
        {message.type === 'text' ? (
          <Text style={[styles.messageText, isOwn ? styles.ownText : styles.otherText]}>
            {message.content}
          </Text>
        ) : (
          <View style={styles.mediaContainer}>
            <MaterialIcons 
              name={getMediaIcon(message.type)} 
              size={24} 
              color={isOwn ? Colors.textSecondary : Colors.primary} 
            />
            <Text style={[styles.mediaText, isOwn ? styles.ownText : styles.otherText]}>
              {getMediaLabel(message.type)}
            </Text>
          </View>
        )}
        
        <View style={styles.messageFooter}>
          {message.reactions && message.reactions.length > 0 && (
            <View style={styles.reactions}>
              {message.reactions.map((reaction, index) => (
                <Text key={index} style={styles.reactionEmoji}>
                  {reaction.emoji}
                </Text>
              ))}
            </View>
          )}
          
          <Text style={[styles.timestamp, isOwn ? styles.ownTimestamp : styles.otherTimestamp]}>
            {formatTime(message.timestamp)}
          </Text>
          
          {isOwn && (
            <MaterialIcons
              name={message.isRead ? 'done-all' : 'done'}
              size={16}
              color={message.isRead ? Colors.primary : Colors.textSecondary}
            />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const getMediaIcon = (type: string) => {
  switch (type) {
    case 'image': return 'photo';
    case 'video': return 'videocam';
    case 'audio': return 'audiotrack';
    case 'voice': return 'mic';
    default: return 'attachment';
  }
};

const getMediaLabel = (type: string) => {
  switch (type) {
    case 'image': return 'Фото';
    case 'video': return 'Видео';
    case 'audio': return 'Аудио';
    case 'voice': return 'Голосовое сообщение';
    default: return 'Файл';
  }
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: Spacing.md,
  },
  ownBubble: {
    backgroundColor: Colors.messageOwn,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: Colors.messageOther,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownText: {
    color: Colors.text,
  },
  otherText: {
    color: Colors.text,
  },
  mediaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mediaText: {
    marginLeft: Spacing.sm,
    fontSize: 14,
    fontStyle: 'italic',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  reactions: {
    flexDirection: 'row',
    marginRight: Spacing.sm,
  },
  reactionEmoji: {
    fontSize: 16,
    marginRight: Spacing.xs,
  },
  timestamp: {
    fontSize: 12,
    marginRight: Spacing.xs,
  },
  ownTimestamp: {
    color: Colors.textSecondary,
  },
  otherTimestamp: {
    color: Colors.textSecondary,
  },
});