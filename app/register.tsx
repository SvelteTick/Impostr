import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Surface, Text, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { register as registerUser } from '@/services/api';
import { saveToken, saveUser } from '@/services/auth';

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmEntry, setSecureConfirmEntry] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Password validation
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
  const canSubmit = displayName.trim() && email.trim() && isPasswordValid && passwordsMatch;

  const handleRegister = async () => {
    if (!canSubmit) return;

    setLoading(true);
    setError('');

    try {
      const response = await registerUser({
        email: email.trim().toLowerCase(),
        password,
        name: displayName.trim(),
        nickname: displayName.trim(), // Using displayName for both name and nickname
      });

      // Save token and user data
      await saveToken(response.accessToken);
      await saveUser(response.user);

      // Navigate to home
      router.replace('/home');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.surface} elevation={4}>
          <Text variant="headlineLarge" style={styles.title}>
            Create Account
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Join us today
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              label="Display Name"
              value={displayName}
              onChangeText={setDisplayName}
              mode="outlined"
              autoCapitalize="words"
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
            />

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

            {password.length > 0 && (
              <View style={styles.requirementsContainer}>
                <HelperText type="info" visible={true}>
                  Password must contain:
                </HelperText>
                <HelperText type={hasMinLength ? 'info' : 'error'} visible={true}>
                  {hasMinLength ? '✓' : '✗'} At least 8 characters
                </HelperText>
                <HelperText type={hasUpperCase ? 'info' : 'error'} visible={true}>
                  {hasUpperCase ? '✓' : '✗'} One uppercase letter
                </HelperText>
                <HelperText type={hasLowerCase ? 'info' : 'error'} visible={true}>
                  {hasLowerCase ? '✓' : '✗'} One lowercase letter
                </HelperText>
                <HelperText type={hasNumber ? 'info' : 'error'} visible={true}>
                  {hasNumber ? '✓' : '✗'} One number
                </HelperText>
              </View>
            )}

            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry={secureConfirmEntry}
              autoCapitalize="none"
              style={styles.input}
              left={<TextInput.Icon icon="lock-check" />}
              right={
                <TextInput.Icon
                  icon={secureConfirmEntry ? 'eye' : 'eye-off'}
                  onPress={() => setSecureConfirmEntry(!secureConfirmEntry)}
                />
              }
            />

            {confirmPassword.length > 0 && (
              <HelperText type={passwordsMatch ? 'info' : 'error'} visible={true}>
                {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
              </HelperText>
            )}
          </View>

          {error ? (
            <HelperText type="error" visible={true} style={styles.errorText}>
              {error}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={handleRegister}
            style={styles.button}
            contentStyle={styles.buttonContent}
            disabled={!canSubmit || loading}
            loading={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <Button
            mode="text"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            Already have an account? Sign In
          </Button>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
    marginBottom: 8,
  },
  requirementsContainer: {
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
  backButton: {
    alignSelf: 'center',
  },
});
