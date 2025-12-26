import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Surface, Text, useTheme, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { login as loginUser } from '@/services/api';
import { saveToken } from '@/services/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const theme = useTheme();

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await loginUser({
        email: email.trim().toLowerCase(),
        password,
      });

      // Save token
      await saveToken(response.token);

      // Navigate to home
      router.replace('/home');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Surface style={styles.surface} elevation={4}>
        <Text variant="headlineLarge" style={styles.title}>
          Welcome Back
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Sign in to continue
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={styles.input}
            left={<TextInput.Icon icon="email" />}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={secureTextEntry}
            autoCapitalize="none"
            autoComplete="password"
            style={styles.input}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={secureTextEntry ? 'eye' : 'eye-off'}
                onPress={() => setSecureTextEntry(!secureTextEntry)}
              />
            }
          />
          </View>

          {error ? (
            <HelperText type="error" visible={true} style={styles.errorText}>
              {error}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.button}
            contentStyle={styles.buttonContent}
            disabled={loading}
            loading={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>

        <Button
          mode="outlined"
          onPress={() => router.push('/register')}
          style={styles.registerButton}
        >
          Register Now
        </Button>

        <Button
          mode="text"
          onPress={() => console.log('Forgot password')}
          style={styles.forgotButton}
        >
          Forgot Password?
        </Button>
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  surface: {
    padding: 30,
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    marginBottom: 12,
  },
  button: {
    marginBottom: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  registerButton: {
    marginBottom: 12,
  },
  forgotButton: {
    alignSelf: 'center',
  },
});
