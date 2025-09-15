import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useChat } from '@/hooks/useChat';
import { Colors, Spacing } from '@/constants/Colors';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onSendMedia?: (type: 'image' | 'video' | 'audio' | 'voice') => void;
}

export function MessageInput({ onSendMessage, onSendMedia }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { uploadMedia, sendMessage, selectedChatId } = useChat();

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Необходимо разрешение для доступа к галерее');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0] && selectedChatId) {
        setIsUploading(true);
        const asset = result.assets[0];
        
        try {
          // Convert URI to blob for upload
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          
          // Determine media type
          const mediaType = asset.type === 'video' ? 'video' : 'image';
          
          // Upload media
          const mediaUrl = await uploadMedia(blob, mediaType);
          
          // Send message with media
          await sendMessage(selectedChatId, mediaType === 'video' ? 'Видео' : 'Фото', mediaType, mediaUrl);
          
        } catch (error) {
          Alert.alert('Ошибка', 'Не удалось отправить медиафайл');
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось выбрать медиафайл');
      setIsUploading(false);
    }
  };

  const handleCameraPicker = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Необходимо разрешение для доступа к камере');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0] && selectedChatId) {
        setIsUploading(true);
        const asset = result.assets[0];
        
        try {
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          
          const mediaUrl = await uploadMedia(blob, 'image');
          await sendMessage(selectedChatId, 'Фото', 'image', mediaUrl);
          
        } catch (error) {
          Alert.alert('Ошибка', 'Не удалось отправить фото');
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сделать фото');
      setIsUploading(false);
    }
  };

  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0] && selectedChatId) {
        setIsUploading(true);
        const asset = result.assets[0];
        
        try {
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          
          const mediaUrl = await uploadMedia(blob, 'file');
          await sendMessage(selectedChatId, asset.name || 'Файл', 'file', mediaUrl);
          
        } catch (error) {
          Alert.alert('Ошибка', 'Не удалось отправить файл');
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось выбрать файл');
      setIsUploading(false);
    }
  };

  const handleVoiceRecord = async () => {
    if (isRecording) {
      setIsRecording(false);
      // TODO: Implement voice recording stop and upload
      Alert.alert('Голосовое сообщение', 'Функция записи голоса будет реализована позже');
    } else {
      setIsRecording(true);
      // TODO: Implement voice recording start
      Alert.alert('Голосовое сообщение', 'Функция записи голоса будет реализована позже');
    }
  };

  const showMediaOptions = () => {
    Alert.alert(
      'Выберите медиа',
      'Что вы хотите отправить?',
      [
        { text: 'Фото/Видео из галереи', onPress: handleImagePicker },
        { text: 'Сделать фото', onPress: handleCameraPicker },
        { text: 'Файл', onPress: handleDocumentPicker },
        { text: 'Отмена', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.attachButton}
          onPress={showMediaOptions}
          disabled={isUploading}
        >
          <MaterialIcons 
            name="attach-file" 
            size={24} 
            color={isUploading ? Colors.textSecondary : Colors.textSecondary} 
          />
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
          onPress={handleCameraPicker}
          disabled={isUploading}
        >
          <MaterialIcons 
            name="camera-alt" 
            size={24} 
            color={isUploading ? Colors.textSecondary : Colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.sendButton,
          message.trim() ? styles.sendButtonActive : styles.voiceButton,
          isRecording && styles.recordingButton,
          isUploading && styles.uploadingButton
        ]}
        onPress={message.trim() ? handleSend : handleVoiceRecord}
        disabled={isUploading}
      >
        <MaterialIcons
          name={
            isUploading ? 'hourglass-empty' :
            message.trim() ? 'send' : 
            (isRecording ? 'stop' : 'mic')
          }
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
  uploadingButton: {
    backgroundColor: Colors.textSecondary,
  },
});