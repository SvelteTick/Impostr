import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Surface, Text, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { joinSession } from '@/services/api';
import { getToken } from '@/services/auth';

export default function JoinGameScreen() {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleJoin = async () => {
    if (roomCode.trim().length !== 5) {
      setError('Room code must be 5 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = await getToken();
      if (!token) {
        router.replace('/login');
        return;
      }

      // Join the session
      const session = await joinSession(token, {
        roomCode: roomCode.trim(),
      });

      console.log('Joined session:', session);

      // Navigate to lobby with session data
      router.replace({
        pathname: '/lobby',
        params: {
          roomCode: session.roomCode,
          isHost: 'false',
        },
      });
    } catch (err: any) {
      console.error('Join error:', err);
      
      // Handle specific error messages
      let errorMessage = err.message || 'Failed to join game. Please try again.';
      
      if (err.statusCode === 404) {
        errorMessage = 'Room not found. Please check the code.';
      } else if (err.statusCode === 400) {
        if (err.message?.includes('full')) {
          errorMessage = 'This room is full. Try another one.';
        } else if (err.message?.includes('started')) {
          errorMessage = 'Game in progress. Can\'t join now.';
        }
      } else if (err.statusCode === 409) {
        errorMessage = 'You are already in a session.';
      }
      
      setError(errorMessage);
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
          Join Game
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Enter the 5-character room code
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            label="Room Code"
            value={roomCode}
            onChangeText={(text) => setRoomCode(text.toUpperCase())}
            mode="outlined"
            autoCapitalize="characters"
            maxLength={5}
            style={styles.input}
            textAlign="center"
            placeholder=""
            autoFocus
          />

          {error ? (
            <HelperText type="error" visible={true}>
              {error}
            </HelperText>
          ) : null}
        </View>

        <Button
          mode="contained"
          onPress={handleJoin}
          style={styles.button}
          contentStyle={styles.buttonContent}
          disabled={loading || roomCode.trim().length !== 5}
          loading={loading}
        >
          {loading ? 'Joining...' : 'Join Game'}
        </Button>

        <Button
          mode="text"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          Back to Home
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
    fontSize: 24,
    letterSpacing: 8,
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
