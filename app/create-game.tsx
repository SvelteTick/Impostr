import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Button, Surface, Switch } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { createSession } from '@/services/api';
import { getToken } from '@/services/auth';

// Simple slider component using TouchableOpacity and View
const SimpleSlider = ({
  value,
  onValueChange,
  minimumValue,
  maximumValue,
  step,
}: {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue: number;
  maximumValue: number;
  step: number;
}) => {
  const increment = () => {
    const newValue = Math.min(value + step, maximumValue);
    onValueChange(newValue);
  };

  const decrement = () => {
    const newValue = Math.max(value - step, minimumValue);
    onValueChange(newValue);
  };

  return (
    <View style={sliderStyles.container}>
      <Button mode="outlined" onPress={decrement} disabled={value <= minimumValue}>
        -
      </Button>
      <View style={sliderStyles.valueContainer}>
        <Text variant="titleLarge">{value}</Text>
      </View>
      <Button mode="outlined" onPress={increment} disabled={value >= maximumValue}>
        +
      </Button>
    </View>
  );
};

const sliderStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  valueContainer: {
    flex: 1,
    alignItems: 'center',
  },
});

export default function CreateGameScreen() {
  const router = useRouter();
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [imposterCount, setImposterCount] = useState(2);
  const [hasTimeLimit, setHasTimeLimit] = useState(false);
  const [timeLimit, setTimeLimit] = useState(300);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateSession = async () => {
    setLoading(true);
    setError('');

    try {
      const token = await getToken();
      if (!token) {
        router.replace('/login');
        return;
      }

      const sessionData = await createSession(token, {
        maxPlayers,
        imposterCount,
        ...(hasTimeLimit && { timeLimit }),
      });

      // Navigate to lobby with session data
      router.replace({
        pathname: '/lobby',
        params: {
          roomCode: sessionData.roomCode,
          isHost: 'true',
        },
      });
    } catch (err: any) {
      console.error('Create session error:', err);
      setError(err.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.surface} elevation={4}>
          <Text variant="headlineMedium" style={styles.title}>
            Create Game
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Configure your game settings
          </Text>

          <View style={styles.settingsContainer}>
            {/* Max Players */}
            <View style={styles.setting}>
              <View style={styles.settingHeader}>
                <Text variant="titleMedium">Max Players</Text>
                <Text variant="titleLarge" style={styles.settingValue}>
                  {maxPlayers}
                </Text>
              </View>
              <SimpleSlider
                value={maxPlayers}
                onValueChange={setMaxPlayers}
                minimumValue={3}
                maximumValue={20}
                step={1}
              />
              <Text variant="bodySmall" style={styles.settingHint}>
                Minimum 3, Maximum 20
              </Text>
            </View>

            {/* Imposter Count */}
            <View style={styles.setting}>
              <View style={styles.settingHeader}>
                <Text variant="titleMedium">Imposters</Text>
                <Text variant="titleLarge" style={styles.settingValue}>
                  {imposterCount}
                </Text>
              </View>
              <SimpleSlider
                value={imposterCount}
                onValueChange={setImposterCount}
                minimumValue={1}
                maximumValue={Math.min(3, Math.floor(maxPlayers / 2))}
                step={1}
              />
              <Text variant="bodySmall" style={styles.settingHint}>
                1 to {Math.min(3, Math.floor(maxPlayers / 2))} imposters
              </Text>
            </View>

            {/* Time Limit */}
            <View style={styles.setting}>
              <View style={styles.settingHeader}>
                <Text variant="titleMedium">Time Limit</Text>
                <Switch value={hasTimeLimit} onValueChange={setHasTimeLimit} />
              </View>
              {hasTimeLimit && (
                <>
                  <View style={styles.settingHeader}>
                    <Text variant="bodyMedium">Duration</Text>
                    <Text variant="titleMedium" style={styles.settingValue}>
                      {Math.floor(timeLimit / 60)}:{(timeLimit % 60).toString().padStart(2, '0')}
                    </Text>
                  </View>
                  <SimpleSlider
                    value={timeLimit}
                    onValueChange={setTimeLimit}
                    minimumValue={30}
                    maximumValue={600}
                    step={30}
                  />
                  <Text variant="bodySmall" style={styles.settingHint}>
                    30 seconds to 10 minutes
                  </Text>
                </>
              )}
            </View>
          </View>

          {error ? (
            <Text variant="bodyMedium" style={styles.errorText}>
              {error}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={handleCreateSession}
              style={styles.createButton}
              contentStyle={styles.buttonContent}
              disabled={loading}
              loading={loading}
            >
              {loading ? 'Creating Session...' : 'Create Session'}
            </Button>

            <Button mode="text" onPress={() => router.back()} disabled={loading}>
              Cancel
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
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  settingsContainer: {
    marginBottom: 24,
  },
  setting: {
    marginBottom: 32,
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingValue: {
    fontWeight: 'bold',
  },
  settingHint: {
    opacity: 0.6,
    textAlign: 'center',
  },
  errorText: {
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  actions: {
    gap: 12,
  },
  createButton: {
    marginBottom: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
