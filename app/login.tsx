import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, Spacing } from '@/constants/Colors';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { login, register, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Некорректный email';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Пароль обязателен';
    } else if (password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }
    
    if (!isLogin) {
      if (!firstName.trim()) {
        newErrors.firstName = 'Имя обязательно';
      }
      if (!lastName.trim()) {
        newErrors.lastName = 'Фамилия обязательна';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, firstName, lastName);
      }
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Ошибка', 'Произошла ошибка при входе. Попробуйте еще раз.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MaterialIcons name="chat" size={60} color={Colors.primary} />
          </View>
          <Text style={styles.title}>WhatsApp Clone</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
          </Text>
        </View>

        <View style={styles.form}>
          {!isLogin && (
            <>
              <Input
                label="Имя"
                value={firstName}
                onChangeText={setFirstName}
                error={errors.firstName}
                placeholder="Введите ваше имя"
              />
              
              <Input
                label="Фамилия"
                value={lastName}
                onChangeText={setLastName}
                error={errors.lastName}
                placeholder="Введите вашу фамилию"
              />
            </>
          )}
          
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            placeholder="example@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <Input
            label="Пароль"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            placeholder="Введите пароль"
            secureTextEntry
          />

          <Button
            title={isLogin ? 'Войти' : 'Зарегистрироваться'}
            onPress={handleSubmit}
            loading={isLoading}
            size="large"
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.switchText}>
            {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
          </Text>
          <Button
            title={isLogin ? 'Зарегистрироваться' : 'Войти'}
            onPress={() => {
              setIsLogin(!isLogin);
              setErrors({});
            }}
            variant="outline"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  logoContainer: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: Spacing.xl,
  },
  footer: {
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
});