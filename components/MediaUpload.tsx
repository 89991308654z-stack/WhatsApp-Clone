import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Colors, Spacing } from '@/constants/Colors';

interface MediaUploadProps {
  onMediaSelected: (file: File | Blob, type: 'image' | 'video' | 'audio' | 'voice' | 'file') => void;
  disabled?: boolean;
}

export function MediaUpload({ onMediaSelected, disabled }: MediaUploadProps) {
  const [isRecording, setIsRecording] = useState(false);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Необходимо разрешение для доступа к галерее');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        if (Platform.OS === 'web') {
          // For web, we need to fetch the URI and convert to blob
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          onMediaSelected(blob, 'image');
        } else {
          // For mobile, we need to convert to blob/file
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          onMediaSelected(blob, 'image');
        }
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось выбрать изображение');
    }
  };

  const pickVideo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Необходимо разрешение для доступа к галерее');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        onMediaSelected(blob, 'video');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось выбрать видео');
    }
  };

  const takePhoto = async () => {
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

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        onMediaSelected(blob, 'image');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сделать фото');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        onMediaSelected(blob, 'file');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось выбрать файл');
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
        { text: 'Фото из галереи', onPress: pickImage },
        { text: 'Видео из галереи', onPress: pickVideo },
        { text: 'Сделать фото', onPress: takePhoto },
        { text: 'Файл', onPress: pickDocument },
        { text: 'Отмена', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={showMediaOptions}
        disabled={disabled}
      >
        <MaterialIcons name="attach-file" size={24} color={Colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          disabled && styles.buttonDisabled,
          isRecording && styles.recordingButton
        ]}
        onPress={handleVoiceRecord}
        disabled={disabled}
      >
        <MaterialIcons 
          name={isRecording ? 'stop' : 'mic'} 
          size={24} 
          color={isRecording ? 'white' : Colors.textSecondary} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    padding: Spacing.sm,
    marginHorizontal: Spacing.xs,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  recordingButton: {
    backgroundColor: Colors.error,
    borderRadius: 20,
  },
});