import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="email" />
      <Stack.Screen name="name" />
      <Stack.Screen name="affirmation" />
      <Stack.Screen name="time" />
      <Stack.Screen name="notification" />
      <Stack.Screen name="personalize" />
      <Stack.Screen name="calculating" />
      <Stack.Screen name="plan" />
    </Stack>
  );
}
