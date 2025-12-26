import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const role = params.role as string;
  const word = params.word as string;

  return (
    <View style={styles.container}>
      <Surface style={styles.surface} elevation={4}>
        <Text variant="headlineMedium" style={styles.title}>
          Game Started
        </Text>
        
        <View style={styles.roleContainer}>
          <Text variant="titleMedium">Your Role:</Text>
          <Text variant="displaySmall" style={[
            styles.roleText,
            { color: role === 'IMPOSTOR' ? '#f44336' : '#4CAF50' }
          ]}>
            {role}
          </Text>
        </View>

        {role !== 'IMPOSTOR' && word && (
          <View style={styles.secretContainer}>
            <Text variant="titleMedium">Secret Word:</Text>
            <Text variant="headlineLarge" style={styles.secretText}>
              {word}
            </Text>
          </View>
        )}

        <Button 
          mode="contained" 
          onPress={() => router.replace('/home')}
          style={styles.button}
        >
          Exit to Home
        </Button>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  surface: {
    padding: 30,
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    alignItems: 'center',
    gap: 30,
  },
  title: {
    fontWeight: 'bold',
  },
  roleContainer: {
    alignItems: 'center',
    gap: 10,
  },
  roleText: {
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  secretContainer: {
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 12,
    width: '100%',
  },
  secretText: {
    fontWeight: 'bold',
  },
  button: {
    marginTop: 20,
    width: '100%',
  },
});
