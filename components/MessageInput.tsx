import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/Colors';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onSendMedia?: (type: 'image' | 'video' | 'audio' | 'voice') => void;
}

export function MessageInput({ onSendMessage, onSendMedia }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleVoiceRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      onSendMedia?.('voice');
    } else {
      setIsRecording(true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.attachButton}
          onPress={() => onSendMedia?.('image')}
        >
          <MaterialIcons name="attach-file" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="Сообщение"
          placeholderTextColor={Colors.textSecondary}
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={1000}
        />

        <TouchableOpacity
          style={styles.cameraButton}
          onPress={() => onSendMedia?.('image')}
        >
          <MaterialIcons name="camera-alt" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.sendButton,
          message.trim() ? styles.sendButtonActive : styles.voiceButton,
          isRecording && styles.recordingButton
        ]}
        onPress={message.trim() ? handleSend : handleVoiceRecord}
      >
        <MaterialIcons
          name={message.trim() ? 'send' : (isRecording ? 'stop' : 'mic')}
          size={20}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.inputBackground,
    borderRadius: 24,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? Spacing.sm : 0,
    marginRight: Spacing.sm,
  },
  attachButton: {
    padding: Spacing.xs,
    marginRight: Spacing.xs,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: Platform.OS === 'ios' ? Spacing.sm : Spacing.md,
    color: Colors.text,
  },
  cameraButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: Colors.primary,
  },
  voiceButton: {
    backgroundColor: Colors.primary,
  },
  recordingButton: {
    backgroundColor: Colors.error,
  },
});