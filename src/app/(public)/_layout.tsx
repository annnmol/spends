import { Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "onboarding",
};

export default function PublicLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="sign-in" />
    </Stack>
  );
}
