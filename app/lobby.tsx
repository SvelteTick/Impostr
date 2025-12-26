import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Text, Button, Surface, IconButton, ActivityIndicator } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { getSession, type GameSession } from '@/services/api';
import { getToken } from '@/services/auth';

import { socketService } from '@/services/socket';

export default function LobbyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<GameSession | null>(null);
  const [codeVisible, setCodeVisible] = useState(true);
  const [error, setError] = useState('');

  const roomCode = params.roomCode as string;
  const isHost = params.isHost === 'true';

  useEffect(() => {
    if (roomCode) {
      loadSession();
      setupSocket();
    } else {
      setError('No room code provided');
      setLoading(false);
    }

    return () => {
      socketService.disconnect();
    };
  }, [roomCode]);

  const setupSocket = async () => {
    console.log('Setting up socket...over here');
    try {
      const socket = await socketService.connect();
      if (socket) {
        console.log('Socket initialized:', socket);
        // Join the room
        socketService.emit('join-room', { roomCode }, (response: any) => {
            console.log('Join room response:', response);
        });

        // Listen for player updates
        socketService.on('player-joined', (data: any) => {
          console.log('Player joined raw data:', data);
          if (data.session) {
            setSession(data.session);
          } else if (data.players) {
             // Assuming data IS the session if it has players array
             setSession(data);
          }
        });

        socketService.on('player-left', (data: { session: GameSession }) => {
          console.log('Player left:', data);
          if (data.session) {
            setSession(data.session);
          }
        });
        
        socketService.on('session-updated', (data: { session: GameSession }) => {
           console.log('Session updated:', data);
           if (data.session) {
             setSession(data.session);
           }
        });

        socketService.on('game-started', (data: any) => {
            console.log('Game started:', data);
            
            // Navigate to game screen with role info
            // Data structure depends on backend, assuming: { role: 'IMPOSTOR' | 'PLAYER', secretWord?: string }
            router.replace({
              pathname: '/game',
              params: {
                role: data.role || (data.yourRole ? data.yourRole : 'PLAYER'), 
                word: data.secretWord || data.word || ''
              }
            });
        });
        
        socketService.on('error', (err: any) => {
            console.error('Socket error:', err);
        });
      }
    } catch (err) {
      console.error('Failed to setup socket:', err);
    }
  };

  const loadSession = async () => {
    setLoading(true);
    setError('');

    try {
      const token = await getToken();
      if (!token) {
        router.replace('/login');
        return;
      }

      const sessionData = await getSession(token, roomCode);
      setSession(sessionData);
    } catch (err: any) {
      console.error('Load session error:', err);
      setError(err.message || 'Failed to load session');
      Alert.alert('Error', err.message || 'Failed to load session', [
        { text: 'Go Back', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (session?.roomCode) {
      await Clipboard.setStringAsync(session.roomCode);
      Alert.alert('Copied!', 'Room code copied to clipboard');
    }
  };

  const startGame = () => {
    if (session?.roomCode) {
      socketService.emit('start-game', { roomCode: session.roomCode }, (response: any) => {
        console.log('Start game response:', response);
      });
    }
  };

  const leaveGame = () => {
    socketService.emit('leave-room', { roomCode });
    socketService.disconnect();
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading lobby...</Text>
      </View>
    );
  }

  if (error || !session) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="headlineSmall">Failed to load lobby</Text>
        <Button mode="contained" onPress={() => router.back()} style={styles.errorButton}>
          Go Back
        </Button>
      </View>
    );
  }

  const canStartGame = session.players.length >= 3 && isHost;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.surface} elevation={4}>
          <Text variant="headlineMedium" style={styles.title}>
            Game Lobby
          </Text>

          <View style={styles.codeContainer}>
            <Text variant="titleMedium" style={styles.codeLabel}>
              Room Code
            </Text>
            <View style={styles.codeRow}>
              <Surface style={styles.codeSurface} elevation={2}>
                <Text variant="displaySmall" style={styles.codeText}>
                  {codeVisible ? session.roomCode : '•••••'}
                </Text>
              </Surface>
              <View style={styles.codeActions}>
                <IconButton
                  icon={codeVisible ? 'eye-off' : 'eye'}
                  size={24}
                  onPress={() => setCodeVisible(!codeVisible)}
                />
                <IconButton icon="content-copy" size={24} onPress={copyCode} />
              </View>
            </View>
          </View>

          <View style={styles.playersContainer}>
            <Text variant="titleMedium" style={styles.playersTitle}>
              Players ({session.players.length}/{session.config.maxPlayers})
            </Text>
            {session.players.map((player) => (
              <Surface key={player.userId} style={styles.playerCard} elevation={1}>
                <View style={styles.playerInfo}>
                  <IconButton icon="account" size={24} />
                  <Text variant="bodyLarge">{player.nickname}</Text>
                </View>
                {player.isHost && (
                  <Surface style={styles.hostBadge} elevation={0}>
                    <Text variant="labelSmall" style={styles.hostBadgeText}>
                      HOST
                    </Text>
                  </Surface>
                )}
              </Surface>
            ))}
          </View>

          {!canStartGame && session.players.length < 3 && (
            <Text variant="bodyMedium" style={styles.waitingText}>
              Waiting for at least 3 players to start...
            </Text>
          )}

          <View style={styles.actions}>
            {isHost && (
              <Button
                mode="contained"
                onPress={startGame}
                style={styles.startButton}
                contentStyle={styles.buttonContent}
                disabled={!canStartGame}
              >
                Start Game
              </Button>
            )}

            <Button mode="outlined" onPress={leaveGame} style={styles.leaveButton}>
              Leave Lobby
            </Button>
          </View>
        </Surface>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  errorButton: {
    marginTop: 16,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  surface: {
    padding: 24,
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  codeContainer: {
    marginBottom: 32,
  },
  codeLabel: {
    marginBottom: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  codeSurface: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  codeText: {
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  codeActions: {
    flexDirection: 'row',
  },
  playersContainer: {
    marginBottom: 24,
  },
  playersTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hostBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hostBadgeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  waitingText: {
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.7,
  },
  actions: {
    gap: 12,
  },
  startButton: {
    marginBottom: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  leaveButton: {
    borderColor: '#f44336',
  },
});
