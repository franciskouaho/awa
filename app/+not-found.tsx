import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function NotFoundScreen() {
  const colorScheme = useColorScheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Page non trouvée' }} />
      <View
        style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
      >
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          Cette page n&apos;existe pas.
        </Text>
        <Link href="/intro" style={styles.link}>
          <Text style={[styles.linkText, { color: Colors[colorScheme ?? 'light'].primary }]}>
            Retourner à l&apos;application AWA
          </Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: 'rgba(45, 90, 74, 0.1)',
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
