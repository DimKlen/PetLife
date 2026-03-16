import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <Stack>
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
          <Stack.Screen name="add-pet" options={{ title: "Add Pet" }} />
          <Stack.Screen name="pet-hub/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="edit-pet/[id]" options={{ title: "Edit Pet" }} />
        </Stack>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
