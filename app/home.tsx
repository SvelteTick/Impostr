import { StyleSheet, View } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { getUser, clearAuth, type User } from '@/services/auth';

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await getUser();
    setUser(userData);
    setLoading(false);
  };

  const handleLogout = async () => {
    await clearAuth();
    router.replace('/login');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineLarge" style={styles.title}>
          Welcome{user?.name ? `, ${user.name}` : ''}!
        </Text>
        {user?.nickname && (
          <Text variant="bodyLarge" style={styles.subtitle}>
            @{user.nickname}
          </Text>
        )}
        <Text variant="bodyMedium" style={styles.email}>
          {user?.email || 'You are logged in'}
        </Text>

        <View style={styles.gameActions}>
          <Button
            mode="contained"
            onPress={() => router.push('/create-game')}
            style={styles.gameButton}
            contentStyle={styles.gameButtonContent}
            icon="plus-circle"
          >
            Host Game
          </Button>

          <Button
            mode="outlined"
            onPress={() => router.push('/join')}
            style={styles.gameButton}
            contentStyle={styles.gameButtonContent}
            icon="login"
          >
            Join Game
          </Button>
        </View>

        <Button mode="text" onPress={handleLogout} style={styles.logoutButton}>
          Logout
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 8,
    textAlign: 'center',
    opacity: 0.7,
  },
  email: {
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.6,
  },
  gameActions: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  gameButton: {
    width: '100%',
  },
  gameButtonContent: {
    paddingVertical: 12,
  },
  logoutButton: {
    marginTop: 16,
  },
});
