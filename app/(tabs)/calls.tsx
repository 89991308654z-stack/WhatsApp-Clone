import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/Colors';

interface CallItem {
  id: string;
  name: string;
  type: 'incoming' | 'outgoing' | 'missed';
  callType: 'audio' | 'video';
  timestamp: Date;
}

const mockCalls: CallItem[] = [
  {
    id: '1',
    name: 'Анна Петрова',
    type: 'incoming',
    callType: 'video',
    timestamp: new Date(Date.now() - 3600000)
  },
  {
    id: '2',
    name: 'Рабочая группа',
    type: 'outgoing',
    callType: 'audio',
    timestamp: new Date(Date.now() - 7200000)
  },
];

export default function CallsScreen() {
  const insets = useSafeAreaInsets();

  const renderCallItem = ({ item }: { item: CallItem }) => (
    <TouchableOpacity style={styles.callItem}>
      <View style={styles.callInfo}>
        <View style={styles.callHeader}>
          <Text style={styles.callerName}>{item.name}</Text>
          <MaterialIcons
            name={item.type === 'incoming' ? 'call-received' : 
                  item.type === 'outgoing' ? 'call-made' : 'call-received'}
            size={16}
            color={item.type === 'missed' ? Colors.error : Colors.success}
          />
        </View>
        <Text style={styles.callTime}>
          {item.timestamp.toLocaleString('ru-RU')}
        </Text>
      </View>
      
      <TouchableOpacity style={styles.callButton}>
        <MaterialIcons
          name={item.callType === 'video' ? 'videocam' : 'phone'}
          size={24}
          color={Colors.primary}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={mockCalls}
        renderItem={renderCallItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="phone" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>Нет звонков</Text>
          </View>
        }
      />
      
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 80 }]}
      >
        <MaterialIcons name="add-call" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  callItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  callInfo: {
    flex: 1,
  },
  callHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  callerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginRight: Spacing.sm,
  },
  callTime: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  callButton: {
    padding: Spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});