import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, Spacing } from '@/constants/Colors';

export default function ProfileScreen() {
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [status, setStatus] = useState(user?.status || '');
  const insets = useSafeAreaInsets();

  const handleSave = async () => {
    try {
      await updateProfile({ firstName, lastName, status });
      setIsEditing(false);
      Alert.alert('Успех', 'Профиль обновлен');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось обновить профиль');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Выйти', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          }
        }
      ]
    );
  };

  if (!user) {
    return null;
  }

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <MaterialIcons name="person" size={60} color={Colors.textSecondary} />
        </View>
        
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <MaterialIcons 
            name={isEditing ? 'close' : 'edit'} 
            size={24} 
            color={Colors.primary} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {isEditing ? (
          <View style={styles.editForm}>
            <Input
              label="Имя"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Введите имя"
            />
            
            <Input
              label="Фамилия"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Введите фамилию"
            />
            
            <Input
              label="Статус"
              value={status}
              onChangeText={setStatus}
              placeholder="Ваш статус"
            />
            
            <View style={styles.buttonContainer}>
              <Button
                title="Сохранить"
                onPress={handleSave}
                variant="primary"
              />
              <Button
                title="Отмена"
                onPress={() => {
                  setIsEditing(false);
                  setFirstName(user.firstName);
                  setLastName(user.lastName);
                  setStatus(user.status);
                }}
                variant="outline"
              />
            </View>
          </View>
        ) : (
          <View style={styles.profileInfo}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Имя</Text>
              <Text style={styles.value}>{user.firstName}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.label}>Фамилия</Text>
              <Text style={styles.value}>{user.lastName}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user.email}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.label}>Статус</Text>
              <Text style={styles.value}>{user.status}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.label}>Последняя активность</Text>
              <Text style={styles.value}>
                {user.isOnline ? 'В сети' : `Был в сети ${user.lastSeen.toLocaleString('ru-RU')}`}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionItem}>
            <MaterialIcons name="notifications" size={24} color={Colors.text} />
            <Text style={styles.actionText}>Уведомления</Text>
            <MaterialIcons name="chevron-right" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <MaterialIcons name="privacy-tip" size={24} color={Colors.text} />
            <Text style={styles.actionText}>Приватность</Text>
            <MaterialIcons name="chevron-right" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <MaterialIcons name="storage" size={24} color={Colors.text} />
            <Text style={styles.actionText}>Данные и хранилище</Text>
            <MaterialIcons name="chevron-right" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem} onPress={handleLogout}>
            <MaterialIcons name="logout" size={24} color={Colors.error} />
            <Text style={[styles.actionText, { color: Colors.error }]}>Выйти</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    position: 'relative',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  editButton: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    padding: Spacing.sm,
  },
  content: {
    padding: Spacing.lg,
  },
  editForm: {
    marginBottom: Spacing.xl,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  profileInfo: {
    marginBottom: Spacing.xl,
  },
  infoItem: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  value: {
    fontSize: 16,
    color: Colors.text,
  },
  actions: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.lg,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: Spacing.md,
  },
});