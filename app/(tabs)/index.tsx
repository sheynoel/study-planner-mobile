import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useApiHealth } from '@/hooks/use-api-health';

type ConnectionState = 'checking' | 'connected' | 'unavailable' | 'unknown';

const CONNECTION_LABELS: Record<ConnectionState, string> = {
  checking: 'Checking...',
  connected: 'Connected',
  unavailable: 'Unavailable',
  unknown: 'Unknown',
};

const CONNECTION_COLORS: Record<ConnectionState, string> = {
  checking: '#ca8a04',
  connected: '#15803d',
  unavailable: '#b91c1c',
  unknown: '#64748b',
};

function StatusRow({ label, state }: { label: string; state: ConnectionState }) {
  const color = CONNECTION_COLORS[state];

  return (
    <View style={styles.statusRow}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <ThemedText style={styles.statusLabel}>{label}</ThemedText>
      <ThemedText type="defaultSemiBold" style={{ color }}>
        {CONNECTION_LABELS[state]}
      </ThemedText>
    </View>
  );
}

export default function HealthScreen() {
  const { status, health, error, retry } = useApiHealth();
  const isLoading = status === 'loading';
  const apiState: ConnectionState = isLoading
    ? 'checking'
    : health?.api.status === 'up'
      ? 'connected'
      : 'unavailable';
  const databaseState: ConnectionState = isLoading
    ? 'checking'
    : health
      ? health.database.status === 'up'
        ? 'connected'
        : 'unavailable'
      : 'unknown';

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.heading}>
            <ThemedText type="title">Backend connection</ThemedText>
            <ThemedText>
              Temporary development check for the Study Planner API and PostgreSQL.
            </ThemedText>
          </View>

          <ThemedView style={styles.card} lightColor="#f8fafc" darkColor="#1e293b">
            <StatusRow label="API" state={apiState} />
            <View style={styles.divider} />
            <StatusRow label="Database" state={databaseState} />
            <View style={styles.divider} />
            <View style={styles.timestampRow}>
              <ThemedText style={styles.statusLabel}>Server timestamp</ThemedText>
              <ThemedText type="defaultSemiBold" selectable style={styles.timestamp}>
                {health?.timestamp ?? 'Not available'}
              </ThemedText>
            </View>
          </ThemedView>

          {isLoading ? (
            <View style={styles.messageRow}>
              <ActivityIndicator />
              <ThemedText>Checking API connection...</ThemedText>
            </View>
          ) : null}

          {error ? (
            <ThemedView style={styles.errorBox} lightColor="#fef2f2" darkColor="#450a0a">
              <ThemedText type="defaultSemiBold" lightColor="#991b1b" darkColor="#fecaca">
                Connection failed
              </ThemedText>
              <ThemedText lightColor="#991b1b" darkColor="#fecaca">
                {error}
              </ThemedText>
            </ThemedView>
          ) : null}

          {health?.database.status === 'down' ? (
            <ThemedView style={styles.warningBox} lightColor="#fffbeb" darkColor="#422006">
              <ThemedText type="defaultSemiBold" lightColor="#92400e" darkColor="#fde68a">
                The API is reachable, but PostgreSQL is unavailable.
              </ThemedText>
            </ThemedView>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={isLoading}
            onPress={retry}
            style={({ pressed }) => [
              styles.retryButton,
              isLoading && styles.retryButtonDisabled,
              pressed && !isLoading && styles.retryButtonPressed,
            ]}>
            <ThemedText type="defaultSemiBold" lightColor="#ffffff" darkColor="#ffffff">
              {isLoading ? 'Checking...' : 'Retry connection'}
            </ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: 20,
    padding: 24,
  },
  heading: {
    gap: 8,
  },
  card: {
    borderRadius: 16,
    gap: 16,
    padding: 20,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  statusDot: {
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  statusLabel: {
    flex: 1,
  },
  divider: {
    backgroundColor: '#94a3b8',
    height: StyleSheet.hairlineWidth,
    opacity: 0.5,
  },
  timestampRow: {
    gap: 8,
  },
  timestamp: {
    fontSize: 14,
  },
  messageRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  errorBox: {
    borderRadius: 12,
    gap: 6,
    padding: 16,
  },
  warningBox: {
    borderRadius: 12,
    padding: 16,
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    marginTop: 'auto',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  retryButtonDisabled: {
    opacity: 0.55,
  },
  retryButtonPressed: {
    opacity: 0.8,
  },
});
